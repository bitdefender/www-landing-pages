import {
  sampleRUM,
  buildBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
} from './lib-franklin.js';

import {
  sendAnalyticsPageEvent, sendAnalyticsUserInfo, sendAnalyticsProducts, sendAnalyticsPageLoadedEvent,
} from './adobeDataLayer.js';
import {
  addScript,
  getDefaultLanguage,
  getInstance,
  isZuoraForNetherlandsLangMode,
  productsList,
  showLoaderSpinner,
  showPrices,
  GLOBAL_EVENTS,
  adobeMcAppendVisitorId,
} from './utils.js';

const DEFAULT_LANGUAGE = getDefaultLanguage();
window.DEFAULT_LANGUAGE = DEFAULT_LANGUAGE;
window.ADOBE_MC_EVENT_LOADED = false;

const defaultBuyLinks = {};

export function productAliases(name) {
  let newName = name.trim();
  if (newName === 'elite') {
    newName = 'elite_1000';
  } else if (newName === 'bs') {
    newName = 'bus-security';
  }

  return newName;
}

// TODO: use the function from adobeDataLayer.js
export function getParam(param) {
  const gUrlParams = {};
  try {
    (() => {
      let e;
      const a = /\+/g;
      const r = /([^&=]+)=?([^&]*)/g;
      const d = (s) => decodeURIComponent(s.replace(a, ' '));
      const q = window.location.search.substring(1);

      // eslint-disable-next-line no-cond-assign
      while (e = r.exec(q)) gUrlParams[d(e[1])] = d(e[2]);
    })();

    if (typeof gUrlParams[param] || gUrlParams[param] !== '') {
      return gUrlParams[param];
    }
    return false;
  } catch (ex) { return false; }
}

const LCP_BLOCKS = []; // add your LCP blocks to the list

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  // decorateIcons2(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await waitForLCP(LCP_BLOCKS);
  }
}

/**
 * Adds the favicon.
 * @param {string} href The favicon URL
 */
function addFavIcon(href) {
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/svg+xml';
  link.href = href;
  const existingLink = document.querySelector('head link[rel="icon"]');
  if (existingLink) {
    existingLink.parentElement.replaceChild(link, existingLink);
  } else {
    document.getElementsByTagName('head')[0].appendChild(link);
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */

export function loadTrackers() {
  const isPageNotInDraftsFolder = window.location.pathname.indexOf('/drafts/') === -1;

  if (isPageNotInDraftsFolder) {
    addScript(getInstance() === 'prod'
      ? 'https://assets.adobedtm.com/8a93f8486ba4/5492896ad67e/launch-b1f76be4d2ee.min.js'
      : 'https://assets.adobedtm.com/8a93f8486ba4/5492896ad67e/launch-3e7065dd10db-staging.min.js', {}, 'async', () => {
      document.dispatchEvent(new Event(GLOBAL_EVENTS.ADOBE_MC_LOADED));
      window.ADOBE_MC_EVENT_LOADED = true;
    });

    addScript('https://www.googletagmanager.com/gtm.js?id=GTM-PLJJB3', {}, 'async');
  }
}

export async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    'gtm.start': new Date().getTime(),
    event: 'gtm.js',
  });

  await sendAnalyticsPageEvent();
  await sendAnalyticsUserInfo();

  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  addFavIcon('https://www.bitdefender.com/favicon.ico');

  adobeMcAppendVisitorId('main');

  loadTrackers();

  sendAnalyticsPageLoadedEvent();

  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

/**
 * Loads a fragment.
 * @param {string} path The path to the fragment
 * @returns {HTMLElement} The root element of the fragment
 */
export async function loadFragment(path) {
  if (path && path.startsWith('/')) {
    const resp = await fetch(`${path}.plain.html`);
    if (resp.ok) {
      const main = document.createElement('main');
      main.innerHTML = await resp.text();
      decorateMain(main);
      await loadBlocks(main);
      return main;
    }
  }
  return null;
}

// trigger for VPN checkbox click - not for ZuoraNL
function changeCheckboxVPN(checkboxId, pid) {
  const parentDiv = document.getElementById(checkboxId).closest('div.prod_box');
  const comparativeDiv = document.querySelector('.c-top-comparative-with-text');
  const productId = checkboxId.split('-')[1];
  const prodVariation = checkboxId.split('-')[2];
  const onSelectorClass = `${productId}-${prodVariation}`;
  const discPriceClass = `.newprice-${onSelectorClass}`;
  const priceClass = `.oldprice-${onSelectorClass}`;
  const saveClass = `.save-${onSelectorClass}`;
  let fullPrice = '';
  const selectedUsers = document.querySelector(`.users_${onSelectorClass}_fake`).value;
  const selectedYears = document.querySelector(`.years_${onSelectorClass}_fake`).value;
  const selectedVariation = StoreProducts.product[productId].variations[selectedUsers][selectedYears];

  // buy btn
  const buyClass = `.buylink-${onSelectorClass}`;
  let buyLink = '';
  if (typeof defaultBuyLinks[onSelectorClass] === 'undefined') {
    defaultBuyLinks[onSelectorClass] = parentDiv.querySelector(buyClass).href;
  }
  const buyLinkDefault = defaultBuyLinks[onSelectorClass];

  // vpn
  const vpnId = 'vpn';
  const showVpnBox = document.querySelector(`.show_vpn-${onSelectorClass}`);
  const savevpnClass = `savevpn-${vpnId}`;
  const vpnObj = StoreProducts.product[vpnId].variations[10][1];
  const priceVpn = vpnObj.price;
  let linkRef = '';

  // missing params
  let currency = 'USD';
  let save = '';
  let justVpn = '';
  let newPrice = '';
  let ref = '';

  let promoPid = pid;
  if (promoPid) {
    promoPid = promoPid.split('_PGEN')[0];
  }

  let pidUrlBundle = `/pid.${promoPid}`;
  if (pid === 'ignore') {
    pidUrlBundle = '';
  }

  let renewLps = false;
  if (getParam('renew_lps') || (pid && pid.toLowerCase().indexOf('renew') !== -1)) {
    renewLps = true;
  }
  // const v = StoreProducts.getBundleProductsInfo(selectedVariation, vpnObj);

  // if is checked
  if (document.getElementById(checkboxId).checked) {
    if (showVpnBox) {
      showVpnBox.style.display = 'block';
    }

    const saveVpnEl = parentDiv.querySelector(`.${savevpnClass}`);
    if (saveVpnEl) {
      saveVpnEl.style.display = 'block';
    }

    if (productId === 'av') {
      if (DEFAULT_LANGUAGE === 'uk') {
        linkRef = 'WEBSITE_UK_AVBUNDLE';
      } else if (DEFAULT_LANGUAGE === 'de') {
        linkRef = 'WEBSITE_DE_AVBUNDLE';
      } else if (DEFAULT_LANGUAGE === 'ro') {
        linkRef = 'WEBSITE_RO_AVBUNDLE';
      } else if (DEFAULT_LANGUAGE === 'es') {
        linkRef = 'WEBSITE_ES_AVBUNDLE';
      } else if (DEFAULT_LANGUAGE === 'fr') {
        linkRef = 'WEBSITE_FR_AVBUNDLE';
      } else {
        linkRef = 'WEBSITE_COM_AVBUNDLE';
      }
    }
    if (productId === 'is') {
      if (DEFAULT_LANGUAGE === 'uk') {
        linkRef = 'WEBSITE_UK_ISBUNDLE';
      } else if (DEFAULT_LANGUAGE === 'de') {
        linkRef = 'WEBSITE_DE_ISBUNDLE';
      } else if (DEFAULT_LANGUAGE === 'ro') {
        linkRef = 'WEBSITE_RO_ISBUNDLE';
      } else if (DEFAULT_LANGUAGE === 'es') {
        linkRef = 'WEBSITE_ES_ISBUNDLE';
      } else if (DEFAULT_LANGUAGE === 'fr') {
        linkRef = 'WEBSITE_FR_ISBUNDLE';
      } else {
        linkRef = 'WEBSITE_COM_ISBUNDLE';
      }
    }
    if (productId === 'tsmd') {
      if (DEFAULT_LANGUAGE === 'uk') {
        linkRef = 'WEBSITE_UK_TSMULTIBUNDLE';
      } else if (DEFAULT_LANGUAGE === 'de') {
        linkRef = 'WEBSITE_DE_TSMULTIBUNDLE';
      } else if (DEFAULT_LANGUAGE === 'ro') {
        linkRef = 'WEBSITE_RO_TSMULTIBUNDLE';
      } else if (DEFAULT_LANGUAGE === 'es') {
        linkRef = 'WEBSITE_ES_TSMULTIBUNDLE';
      } else if (DEFAULT_LANGUAGE === 'fr') {
        linkRef = 'WEBSITE_FR_TSMULTIBUNDLE';
      } else {
        linkRef = 'WEBSITE_COM_TSMULTIBUNDLE';
      }
    }
    if (productId === 'fp') {
      if (DEFAULT_LANGUAGE === 'uk') {
        linkRef = 'WEBSITE_UK_TSMULTIBUNDLE';
      } else if (DEFAULT_LANGUAGE === 'de') {
        linkRef = 'WEBSITE_DE_TSMULTIBUNDLE';
      } else if (DEFAULT_LANGUAGE === 'ro') {
        linkRef = 'WEBSITE_RO_TSMULTIBUNDLE';
      } else if (DEFAULT_LANGUAGE === 'es') {
        linkRef = 'WEBSITE_ES_TSMULTIBUNDLE';
      } else if (DEFAULT_LANGUAGE === 'fr') {
        linkRef = 'WEBSITE_FR_TSMULTIBUNDLE';
      } else {
        linkRef = 'WEBSITE_COM_TSMULTIBUNDLE';
      }
    }
    if (productId === 'soho') {
      if (DEFAULT_LANGUAGE === 'uk') {
        linkRef = 'WEBSITE_UK_TSMULTIBUNDLE';
      } else if (DEFAULT_LANGUAGE === 'de') {
        linkRef = 'WEBSITE_DE_TSMULTIBUNDLE';
      } else if (DEFAULT_LANGUAGE === 'ro') {
        linkRef = 'WEBSITE_RO_TSMULTIBUNDLE';
      } else if (DEFAULT_LANGUAGE === 'es') {
        linkRef = 'WEBSITE_ES_TSMULTIBUNDLE';
      } else if (DEFAULT_LANGUAGE === 'fr') {
        linkRef = 'WEBSITE_FR_TSMULTIBUNDLE';
      } else {
        linkRef = 'WEBSITE_COM_TSMULTIBUNDLE';
      }
    }
    if (linkRef.length > 0) ref = `/REF.${linkRef}`;
    if (DEFAULT_LANGUAGE === 'au') currency = 'AUD';
    else currency = selectedVariation.currency_iso;

    const coupon = renewLps ? {
      8: {
        USD: ['RENEW_UPGRADE_ADN2'],
        CAD: ['RENEW_UPGRADE_ADN2'],
        EUR: ['RENEW_UPGRADE_ADN'],
        ZAR: ['RENEW_UPGRADE_ADN'],
        MXN: ['RENEW_UPGRADE_ADN'],
        ALL: ['RENEW_UPGRADE_ADN'],
      },
      2: {
        USD: ['RENEW_UPGRADE_ADN2'],
        CAD: ['RENEW_UPGRADE_ADN2'],
        EUR: ['RENEW_UPGRADE_ADN'],
        ZAR: ['RENEW_UPGRADE_ADN'],
        MXN: ['RENEW_UPGRADE_ADN'],
        ALL: ['RENEW_UPGRADE_ADN'],
      },
      16: {
        USD: ['RENEW_UPGRADE_ADN'],
        CAD: ['RENEW_UPGRADE_ADN'],
        EUR: ['RENEW_UPGRADE_ADN'],
        ZAR: ['RENEW_UPGRADE_ADN'],
        MXN: ['RENEW_UPGRADE_ADN'],
        ALL: ['RENEW_UPGRADE_ADN'],
      },
      10: {
        CAD: ['RENEW_UPGRADE_ADN'],
        ALL: ['RENEW_UPGRADE_ADN'],
      },
      4: {
        AUD: ['RENEW_UPGRADE_ADN'],
        NZD: ['RENEW_UPGRADE_ADN'],
      },
      3: {
        GBP: ['RENEW_UPGRADE_ADN'],
        EUR: ['RENEW_UPGRADE_ADN'],
      },
      14: {
        EUR: ['RENEW_UPGRADE_ADN'],
        ALL: ['RENEW_UPGRADE_ADN'],
      },
      22: {
        EUR: ['RENEW_UPGRADE_ADN'],
      },
      9: {
        EUR: ['RENEW_UPGRADE_ADN'],
      },
      7: {
        EUR: ['RENEW_UPGRADE_ADN'],
      },
      6: {
        RON: ['RENEW_UPGRADE_ADN'],
        ALL: ['RENEW_UPGRADE_ADN'],
      },
      13: { BRL: ['RENEW_UPGRADE_ADN'] },
      5: { EUR: ['63372958410'], CHF: ['63372958410'] },
      12: { EUR: ['RENEW_UPGRADE_ADN'] },
      19: {
        ZAR: ['RENEW_UPGRADE_ADN'],
      },
      17: { EUR: ['63372958410'], CHF: ['63372958410'] },
      72: {
        JPY: ['RENEW_UPGRADE_ADN'],
      },
      26: {
        SEK: ['RENEW_UPGRADE_ADN'],
      },
      28: {
        HUF: ['RENEW_UPGRADE_ADN'],
      },
      20: {
        MXN: ['RENEW_UPGRADE_ADN'],
      },
    } : {
      8: {
        USD: ['VPN_XNA2'],
        CAD: ['VPN_XNA2'],
        EUR: ['VPN_XNA'],
        ZAR: ['VPN_XNA'],
        MXN: ['VPN_XNA'],
        ALL: ['VPN_XNA'],
      },
      2: {
        USD: ['VPN_XNA2'],
        CAD: ['VPN_XNA2'],
        EUR: ['VPN_XNA'],
        ZAR: ['VPN_XNA'],
        MXN: ['VPN_XNA'],
        ALL: ['VPN_XNA'],
      },
      16: {
        USD: ['VPN_XNA'],
        CAD: ['VPN_XNA'],
        EUR: ['VPN_XNA'],
        ZAR: ['VPN_XNA'],
        MXN: ['VPN_XNA'],
        ALL: ['VPN_XNA'],
      },
      10: {
        CAD: ['VPN_XNA'],
        ALL: ['VPN_XNA'],
      },
      4: {
        AUD: ['VPN_XNA'],
        NZD: ['VPN_XNA'],
      },
      3: {
        GBP: ['VPN_XNA'],
        EUR: ['VPN_XNA'],
      },
      14: {
        EUR: ['VPN_XNA'],
        ALL: ['VPN_XNA'],
      },
      22: {
        EUR: ['VPN_XNA'],
      },
      9: {
        EUR: ['VPN_XNA'],
      },
      7: {
        EUR: ['VPN_XNA'],
      },
      6: {
        RON: ['VPN_XNA'],
        ALL: ['VPN_XNA'],
      },
      13: { BRL: ['VPN_XNA'] },
      5: { EUR: ['63372958210'], CHF: ['63372958210'] },
      12: { EUR: ['VPN_XNA'] },
      17: { EUR: ['63372958210'], CHF: ['63372958210'] },
      72: { JPY: ['VPN_XNA'] },
      // alea multe
      11: { INR: ['VPN_XNA'] },
      23: { KRW: ['VPN_XNA'] },
      19: { ZAR: ['VPN_XNA'] },
      20: { MXN: ['VPN_XNA'] },
      21: { MXN: ['VPN_XNA'] },
      25: { SGD: ['VPN_XNA'] },
      26: { SEK: ['VPN_XNA'] },
      27: { DKK: ['VPN_XNA'] },
      28: { HUF: ['VPN_XNA'] },
      29: { BGN: ['VPN_XNA'] },
      31: { NOK: ['VPN_XNA'] },
      36: { SAR: ['VPN_XNA'] },
      38: { AED: ['VPN_XNA'] },
      39: { ILS: ['VPN_XNA'] },
      41: { HKD: ['VPN_XNA'] },
      46: { PLN: ['VPN_XNA'] },
      47: { CZK: ['VPN_XNA'] },
      49: { TRY: ['VPN_XNA'] },
      50: { IDR: ['VPN_XNA'] },
      51: { PHP: ['VPN_XNA'] },
      52: { TWD: ['VPN_XNA'] },
      54: { CLP: ['VPN_XNA'] },
      55: { MYR: ['VPN_XNA'] },
      57: { PEN: ['VPN_XNA'] },
      59: { HRK: ['VPN_XNA'] },
      66: { THB: ['VPN_XNA'] },
    };

    if (DEFAULT_LANGUAGE === 'de') {
      if (typeof coupon[selectedVariation.region_id] !== 'undefined' && coupon[selectedVariation.region_id][currency] !== 'undefined') {
        buyLink = `${StoreProducts.product[productId].base_uri}/Store/buybundle/${productId}/${selectedUsers}/${selectedYears}/platform.${selectedVariation.platform_id}/region.${selectedVariation.region_id}${ref}${pidUrlBundle}/force.2`;
        buyLink += `/${vpnId}/${10}/${1}/OfferID.${coupon[selectedVariation.region_id][currency]}/platform.${selectedVariation.platform_id}/region.${selectedVariation.region_id}/CURRENCY.${currency}/DCURRENCY.${currency}`;
        // buyLink += '/' + product_vpn + '/' + 10 + '/' + 1 + '/platform.' + s_variation.platform_id + '/region.' + s_variation.region_id + '/CURRENCY.' + currency + '/DCURRENCY.' + currency;
      } else if (typeof coupon[selectedVariation.region_id] !== 'undefined' && coupon[selectedVariation.region_id].ALL !== 'undefined') {
        buyLink = `${StoreProducts.product[productId].base_uri}/Store/buybundle/${productId}/${selectedUsers}/${selectedYears}/platform.${selectedVariation.platform_id}/region.${selectedVariation.region_id}${ref}${pidUrlBundle}/force.2`;
        buyLink += `/${vpnId}/${10}/${1}/OfferID.${coupon[selectedVariation.region_id].ALL}/platform.${selectedVariation.platform_id}/region.${selectedVariation.region_id}/CURRENCY.${currency}/DCURRENCY.${currency}`;
        // buyLink += '/' + product_vpn + '/' + 10 + '/' + 1 + '/platform.' + s_variation.platform_id + '/region.' + s_variation.region_id + '/CURRENCY.' + currency + '/DCURRENCY.' + currency;
      } else {
        buyLink = `${StoreProducts.product[productId].base_uri}/Store/buybundle/${productId}/${selectedUsers}/${selectedYears}/platform.${selectedVariation.platform_id}/region.${selectedVariation.region_id}${ref}${pidUrlBundle}/force.2`;
        buyLink += `/${vpnId}/${10}/${1}/platform.${selectedVariation.platform_id}/region.${selectedVariation.region_id}/CURRENCY.${currency}/DCURRENCY.${currency}`;
      }
    } else if (coupon[selectedVariation.region_id][currency] !== 'undefined') {
      buyLink = `${StoreProducts.product[productId].base_uri}/Store/buybundle/${productId}/${selectedUsers}/${selectedYears}/platform.${selectedVariation.platform_id}/region.${selectedVariation.region_id}${ref}${pidUrlBundle}/force.2`;
      buyLink += `/${vpnId}/${10}/${1}/COUPON.${coupon[selectedVariation.region_id][currency]}/platform.${selectedVariation.platform_id}/region.${selectedVariation.region_id}/CURRENCY.${currency}/DCURRENCY.${currency}`;
      // buylink_vpn += '/' + product_vpn + '/' + 10 + '/' + 1 + '/platform.' + s_variation.platform_id + '/region.' + s_variation.region_id + '/CURRENCY.' + currency + '/DCURRENCY.' + currency;
    } else if (coupon[selectedVariation.region_id].ALL !== 'undefined') {
      buyLink = `${StoreProducts.product[productId].base_uri}/Store/buybundle/${productId}/${selectedUsers}/${selectedYears}/platform.${selectedVariation.platform_id}/region.${selectedVariation.region_id}${ref}${pidUrlBundle}/force.2`;
      buyLink += `/${vpnId}/${10}/${1}/COUPON.${coupon[selectedVariation.region_id].ALL}/platform.${selectedVariation.platform_id}/region.${selectedVariation.region_id}/CURRENCY.${currency}/DCURRENCY.${currency}`;
      // buylink_vpn += '/' + product_vpn + '/' + 10 + '/' + 1 + '/platform.' + s_variation.platform_id + '/region.' + s_variation.region_id + '/CURRENCY.' + currency + '/DCURRENCY.' + currency;
    } else {
      buyLink = `${StoreProducts.product[productId].base_uri}/Store/buybundle/${productId}/${selectedUsers}/${selectedYears}/platform.${selectedVariation.platform_id}/region.${selectedVariation.region_id}${ref}${pidUrlBundle}/force.2`;
      buyLink += `/${vpnId}/${10}/${1}/platform.${selectedVariation.platform_id}/region.${selectedVariation.region_id}/CURRENCY.${currency}/DCURRENCY.${currency}`;
    }

    /* this is a hack */
    if (pidUrlBundle === '') {
      const regex = /COUPON\.[^/]+\//gi;
      buyLink = buyLink.replace(regex, '');
    }

    if (selectedVariation.discount && vpnObj.discount) {
      fullPrice = Math.round((parseFloat(selectedVariation.price) + parseFloat(priceVpn)) * 100) / 100;
      newPrice = Math.round((parseFloat(selectedVariation.discount.discounted_price) + parseFloat(vpnObj.discount.discounted_price)) * 100) / 100;
      save = Math.round(parseFloat(fullPrice) - parseFloat(priceVpn));
      justVpn = parseFloat(
        vpnObj.discount.discounted_price
          .replace('$', '')
          .replace('â‚¬', '')
          .replace('Â£', '')
          .replace('R$', '')
          .replace('AUD', ''),
      );
    } else if (vpnObj.discount) {
      fullPrice = Math.round((parseFloat(selectedVariation.price) + parseFloat(vpnObj.price)) * 100) / 100;
      newPrice = Math.round((parseFloat(selectedVariation.price) + parseFloat(vpnObj.discount.discounted_price)) * 100) / 100;
      save = Math.round(parseFloat(fullPrice) - parseFloat(priceVpn));
      justVpn = parseFloat(
        vpnObj.discount.discounted_price
          .replace('$', '')
          .replace('â‚¬', '')
          .replace('Â£', '')
          .replace('R$', '')
          .replace('AUD', ''),
      );

      if (parentDiv.querySelector(`.show_save_${onSelectorClass}`)) {
        parentDiv.querySelector(`.show_save_${onSelectorClass}`).style.display = 'block';
      }
    } else {
      justVpn = parseFloat(
        vpnObj.price
          .replace('$', '')
          .replace('â‚¬', '')
          .replace('Â£', '')
          .replace('R$', '')
          .replace('AUD', ''),
      );
      fullPrice = Math.round((parseFloat(selectedVariation.price) + parseFloat(justVpn)) * 100) / 100;
      save = Math.round(parseFloat(fullPrice) - parseFloat(priceVpn));
      if (selectedVariation.discount) {
        newPrice = Math.round((parseFloat(selectedVariation.discount.discounted_price) + justVpn) * 100) / 100;
      } else {
        newPrice = Math.round((parseFloat(selectedVariation.price) + justVpn) * 100) / 100;
      }
    }

    if (parentDiv.querySelector(discPriceClass)) {
      parentDiv.querySelector(discPriceClass).innerHTML = newPrice;
    }

    if (parentDiv.querySelector(`.price_vpn-${onSelectorClass}`)) {
      parentDiv.querySelector(`.price_vpn-${onSelectorClass}`).innerHTML = justVpn;
    }
  } else {
    // not checked
    if (showVpnBox) {
      showVpnBox.style.display = 'none';
    }

    if (selectedVariation.discount) {
      fullPrice = Math.round(parseFloat(selectedVariation.price) * 100) / 100;
      newPrice = Math.round(parseFloat(selectedVariation.discount.discounted_price) * 100) / 100;
      save = Math.round(parseFloat(fullPrice) - parseFloat(newPrice));
      if (parentDiv.querySelector(`.show_save_${onSelectorClass}`)) {
        parentDiv.querySelector(`.show_save_${onSelectorClass}`).style.display = 'block';
        /*
        document.querySelectorAll(`.show_save_${onSelectorClass}`).forEach(item => {
          item.style.display = 'block';
        });
        */
      }
    } else {
      fullPrice = Math.round(parseFloat(selectedVariation.price) * 100) / 100;
      newPrice = fullPrice;
      save = 0;

      if (parentDiv.querySelector(`.show_save_${onSelectorClass}`)) {
        parentDiv.querySelector(`.show_save_${onSelectorClass}`).style.display = 'none';
      }
    }

    buyLink = buyLinkDefault;
  }

  fullPrice = StoreProducts.formatPrice(fullPrice, selectedVariation.currency_label, selectedVariation.region_id, selectedVariation.currency_iso);
  save = StoreProducts.formatPrice(save, selectedVariation.currency_label, selectedVariation.region_id, selectedVariation.currency_iso);
  newPrice = StoreProducts.formatPrice(newPrice, selectedVariation.currency_label, selectedVariation.region_id, selectedVariation.currency_iso);

  if (parentDiv.querySelector(buyClass)) {
    parentDiv.querySelector(buyClass).setAttribute('href', buyLink);
    if (comparativeDiv && comparativeDiv.querySelector(buyClass)) {
      comparativeDiv.querySelector(buyClass).setAttribute('href', buyLink);
    }
  }

  if (parentDiv.querySelector(priceClass)) {
    parentDiv.querySelector(priceClass).innerHTML = fullPrice;
    if (comparativeDiv && comparativeDiv.querySelector(priceClass)) {
      comparativeDiv.querySelector(priceClass).innerHTML = fullPrice;
    }
  }

  if (parentDiv.querySelector(discPriceClass)) {
    parentDiv.querySelector(discPriceClass).innerHTML = newPrice;
    if (comparativeDiv && comparativeDiv.querySelector(discPriceClass)) {
      comparativeDiv.querySelector(discPriceClass).innerHTML = newPrice;
    }
  }

  if (parentDiv.querySelector(saveClass)) {
    parentDiv.querySelector(saveClass).innerHTML = save;
    if (comparativeDiv && comparativeDiv.querySelector(saveClass)) {
      comparativeDiv.querySelector(saveClass).innerHTML = save;
    }
  }
}

function initSelectors(pid) {
  showLoaderSpinner(false);
  const productsExistsOnPage = productsList.length;

  if (productsExistsOnPage) {
    const fakeSelectorsBottom = document.createElement('div');
    fakeSelectorsBottom.id = 'fakeSelectors_bottom';
    document.querySelector('footer').before(fakeSelectorsBottom);
    productsList.forEach((prod) => {
      const prodSplit = prod.split('/');
      const prodAlias = productAliases(prodSplit[0].trim());
      const prodUsers = prodSplit[1].trim();
      const prodYears = prodSplit[2].trim();
      const onSelectorClass = `${prodAlias}-${prodUsers}${prodYears}`;

      ['u', 'y'].forEach((prefix) => {
        const selectorId = `${prefix}_${onSelectorClass}`;
        const prefixAlias = prefix === 'u' ? 'users' : 'years';
        if (!document.getElementById(selectorId)) {
          fakeSelectorsBottom.innerHTML += `<label for="${selectorId}">Fake ${prefix === 'u' ? 'Devices' : 'Years'} for ${onSelectorClass}: </label>`;
          const createSelect = document.createElement('select');
          createSelect.id = selectorId;
          createSelect.name = selectorId;
          createSelect.classList.add(`${prefixAlias}_${prodAlias}`, `${prefixAlias}_${onSelectorClass}_fake`);
          document.getElementById('fakeSelectors_bottom').append(createSelect);
        }
      });

      const initSelectorConfig = {
        product_id: prodAlias,
        full_price_class: `oldprice-${onSelectorClass}`,
        discounted_price_class: `newprice-${onSelectorClass}`,
        price_class: `price-${onSelectorClass}`,
        buy_class: `buylink-${onSelectorClass}`,
        save_class: `save-${onSelectorClass}`,
        percent_class: `percent-${onSelectorClass}`,
        selected_users: prodUsers,
        selected_years: prodYears,
        users_class: `users_${onSelectorClass}_fake`,
        years_class: `years_${onSelectorClass}_fake`,
        method: 'GET',

        ...(pid === 'ignore' ? { ignore_promotions: true } : {}),
        ...(pid !== false && pid !== 'ignore' ? { extra_params: { pid } } : {}),

        onSelectorLoad() {
          sendAnalyticsProducts(this);
          try {
            const fp = this;
            showPrices(fp);
            adobeMcAppendVisitorId('main');
            showLoaderSpinner(true, onSelectorClass);
          } catch (ex) { /* empty */ }
        },
      };

      StoreProducts.initSelector(initSelectorConfig);
    });
  }
}

function addIdsToEachSection() {
  document.querySelectorAll('main .section > div:first-of-type').forEach((item) => {
    const getIdentity = item.className.split('-wrapper')[0];
    item.parentElement.id = document.getElementById(getIdentity) ? `${getIdentity}-2` : getIdentity;
  });
}

function addEventListenersOnVpnCheckboxes(pid) {
  if (document.querySelector('.checkboxVPN')) {
    document.querySelectorAll('.checkboxVPN').forEach((item) => {
      item.addEventListener('click', (e) => {
        const checkboxId = e.target.getAttribute('id');
        if (isZuoraForNetherlandsLangMode() && window.StoreProducts.product) {
          const prodxId = e.target.getAttribute('id').split('-')[1];
          const storeObjprod = window.StoreProducts.product[prodxId] || {};
          showPrices(storeObjprod, e.target.checked, checkboxId);
        } else {
          changeCheckboxVPN(checkboxId, pid);
        }
      });
    });
  }
}

async function initZuoraProductPriceLogic(campaign) {
  import('./zuora.js').then(async (module) => {
    const ZuoraNLClass = module.default;
    // window.config = ZuoraNLClass.config();
    showLoaderSpinner(false);

    if (productsList.length) {
      try {
        await Promise.all(
          productsList.map(async (item) => {
            const prodSplit = item.split('/');
            const prodAlias = prodSplit[0].trim();
            const prodUsers = prodSplit[1].trim();
            const prodYears = prodSplit[2].trim();
            const onSelectorClass = `${prodAlias}-${prodUsers}${prodYears}`;

            const zuoraResult = await ZuoraNLClass.loadProduct(item, campaign);
            showPrices(zuoraResult);
            adobeMcAppendVisitorId('main');
            showLoaderSpinner(true, onSelectorClass);
            sendAnalyticsProducts(zuoraResult, 'nl');

            return zuoraResult;
          }),
        );

        // results is an array of the resolved promises
        // console.log(results);
      } catch (error) {
        console.error(error);
      }
    }
  });
}

async function initializeProductsPriceLogic() {
  let pid = getParam('pid');
  let campaign = getParam('campaign');

  try {
    /* global adobe */
    if (window.adobe?.target) {
      const targetResponse = await adobe.target.getOffers({
        request: {
          execute: {
            mboxes: [{ index: 0, name: 'initSelector-mbox' }],
          },
        },
      });

      const mboxOptions = targetResponse?.execute?.mboxes[0]?.options;
      const content = mboxOptions?.[0]?.content;

      if (content) {
        pid = content.pid ?? pid;
        campaign = content.campaign ?? campaign;
        const promotionID = content.pid || content.campaign;

        if (promotionID) {
          window.adobeDataLayer.push({
            page: { attributes: { promotionID } },
          });
        }
      }
    }
  } catch (ex) { /* empty */ }

  // skip Zuora if specific pids are applied
  const skipZuora = window.skipZuoraFor && window.skipZuoraFor.includes(pid);

  if (!isZuoraForNetherlandsLangMode() || skipZuora) {
    addScript('/scripts/vendor/store2015.js', {}, 'async', () => {
      initSelectors(pid);
    });
  } else {
    initZuoraProductPriceLogic(campaign);
  }

  addEventListenersOnVpnCheckboxes(pid);
}

function eventOnDropdownSlider() {
  document.querySelectorAll('.dropdownSlider').forEach((slider) => {
    const titles = slider.querySelectorAll('.title');
    const loadingBars = slider.querySelectorAll('.loading-bar');
    let activeIndex = 0;
    let interval;

    function showLoadingBar(index) {
      const loadingBar = loadingBars[index];
      loadingBar.style.width = '0';
      let width = 0;
      const interval2 = setInterval(() => {
        width += 1;
        loadingBar.style.width = `${width}%`;
        if (width >= 100) {
          clearInterval(interval2);
        }
      }, 30); // Adjust the interval for smoother animation
    }

    function moveToNextItem() {
      titles.forEach((title, index) => {
        if (index === activeIndex) {
          title.parentNode.classList.add('active');
          title.closest('.dropdownSlider').setAttribute('style', `min-height: ${title.parentNode.querySelector('.description').offsetHeight + 50}px`);
          showLoadingBar(index);
        } else {
          title.parentNode.classList.remove('active');
        }
      });

      activeIndex = (activeIndex + 1) % titles.length; // Move to the next item and handle wrapping
    }

    function startAutomaticMovement() {
      interval = setInterval(moveToNextItem, 4000); // Set the interval
    }

    function stopAutomaticMovement() {
      clearInterval(interval); // Clear the interval
    }

    // Set the initial active item
    moveToNextItem();

    // Start automatic movement after the loading is complete
    setTimeout(() => {
      startAutomaticMovement();
    }, 1000);

    // Click event listener on titles
    titles.forEach((title, index) => {
      title.addEventListener('click', () => {
        stopAutomaticMovement();
        activeIndex = index;
        showLoadingBar(index);
        moveToNextItem();
        startAutomaticMovement();
      });
    });
  });
}

function appendMetaReferrer() {
  const metaTag = document.createElement('meta');
  metaTag.name = 'referrer';
  metaTag.content = 'no-referrer-when-downgrade';

  const head = document.head || document.getElementsByTagName('head')[0];

  head.appendChild(metaTag);
}

function appendIBMplex() {
  const head = document.head || document.getElementsByTagName('head')[0];
  const link1 = document.createElement('link');
  const link2 = document.createElement('link');
  const link3 = document.createElement('link');
  const metaTag = document.createElement('meta');

  link1.rel = 'preconnect';
  link1.href = 'https://fonts.googleapis.com';

  link2.rel = 'preconnect';
  link2.href = 'https://fonts.gstatic.com';
  link2.crossOrigin = '';

  link3.rel = 'stylesheet';
  link3.href = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;600&display=swap';

  metaTag.name = 'referrer';
  metaTag.content = 'no-referrer-when-downgrade';

  head.appendChild(metaTag);
  head.appendChild(link1);
  head.appendChild(link2);
  head.appendChild(link3);
}

function counterFlipClock() {
  const flipdownBox = document.getElementById('flipdown');
  if (flipdownBox) {
    const blackFridayElement = document.getElementById('blackFriday');
    const cyberMondayElement = document.getElementById('cyberMonday');

    blackFridayElement.style.display = 'block';
    const counterSwitchOn = flipdownBox.getAttribute('data-switchOn');
    const counterTheme = flipdownBox.getAttribute('data-theme');
    const counterHeadings = flipdownBox.getAttribute('data-headings');

    // config
    const flipConfig = {
      theme: counterTheme,
      headings: counterHeadings ? counterHeadings.split(',') : ['Days', 'Hours', 'Minutes', 'Seconds'],
    };

    // eslint-disable-next-line no-undef
    const firstCounter = new FlipDown(Number(counterSwitchOn), flipConfig);
    firstCounter.start()
      .ifEnded(() => {
        // switch images:
        blackFridayElement.style.display = 'none';
        cyberMondayElement.style.display = 'block';

        // The initial counter has ended; start a new one 48 hours from now
        flipdownBox.innerHTML = '';
        const currentDate = new Date();
        currentDate.setHours(currentDate.getHours() + 48);
        const newTime = currentDate.getTime() / 1000;

        // eslint-disable-next-line no-undef
        const secondCounter = new FlipDown(newTime, flipConfig);
        secondCounter.start().ifEnded(() => {});
      });
  }
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);

  addIdsToEachSection();

  if (window.ADOBE_MC_EVENT_LOADED) {
    initializeProductsPriceLogic();
  } else {
    document.addEventListener(GLOBAL_EVENTS.ADOBE_MC_LOADED, () => {
      initializeProductsPriceLogic();
    });
  }

  addScript('/scripts/vendor/bootstrap/bootstrap.bundle.min.js', {}, 'defer');

  eventOnDropdownSlider();

  appendMetaReferrer();

  if (window.location.href.indexOf('spurs')) {
    appendIBMplex();
  }

  counterFlipClock();

  loadDelayed();
}

/*
* @viewport: 'mobile' | 'tablet' | 'desktop'
* */
function initMobileDetector(viewport) {
  const mobileDetectorDiv = document.createElement('div');
  mobileDetectorDiv.setAttribute(`data-${viewport}-detector`, '');
  document.body.prepend(mobileDetectorDiv);
}

/*
* @viewport: 'mobile' | 'tablet' | 'desktop'
* */
export function isView(viewport) {
  const element = document.querySelectorAll(`[data-${viewport}-detector]`)[0];
  return !!(element && getComputedStyle(element).display !== 'none');
}

function initBaseUri() {
  const domainName = 'bitdefender';
  const domainExtension = window.location.hostname.split('.').pop(); // com | ro | other

  window.BASE_URI = ['com', 'ro'].includes(domainExtension) ? `${window.location.protocol}//www.${domainName}.${domainExtension}/site` : `https://www.${domainName}.com/site`;
}

initMobileDetector('mobile');
initMobileDetector('tablet');
initMobileDetector('desktop');

initBaseUri();

loadPage();

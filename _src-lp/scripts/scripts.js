import Launch from '@repobit/dex-launch';
import { targetPromise, getDefaultLanguage } from './target.js';
// import { VisitorIdEvent, AdobeDataLayerService } from '@repobit/dex-data-layer';
import pagePromise from './page.js';
import {
  sampleRUM,
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
  getMetadata,
  decorateTags,
} from './lib-franklin.js';
import {
  sendAnalyticsPageEvent, sendAnalyticsUserInfo, sendAnalyticsProducts, sendAnalyticsPageLoadedEvent,
  sendTrialDownloadedEvent,
  sendAnalyticsErrorEvent,
} from './adobeDataLayer.js';
import {
  addScript,
  getDefaultSection,
  isZuoraForNetherlandsLangMode,
  checkIfLocaleCanSupportInitSelector,
  productsList,
  showLoaderSpinner,
  setDataOnBuyLinks,
  showPrices,
  GLOBAL_EVENTS,
  adobeMcAppendVisitorId,
  formatPrice,
  getInstance,
} from './utils.js';

const page = await pagePromise;
const target = await targetPromise;
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

export function productAliasesNames(name) {
  let newName = name.trim();
  if (newName === 'ps_f') {
    newName = 'Bitdefender Premium Security Family';
  } else if (newName === 'ps_i') {
    newName = 'Bitdefender Premium Security Individual';
  } else if (newName === 'ts_i') {
    newName = 'Bitdefender Total Security Individual';
  } else if (newName === 'ts_f') {
    newName = 'Bitdefender Total Security Family';
  } else if (newName === 'us_i') {
    newName = 'Bitdefender Ultimate Security Individual';
  } else if (newName === 'us_f') {
    newName = 'Bitdefender Ultimate Security Family';
  } else if (newName === 'us_pf') {
    newName = 'Bitdefender Ultimate Security Plus Family Standard';
  } else if (newName === 'us_pfe') {
    newName = 'Bitdefender Ultimate Security Plus Family Extended';
  } else if (newName === 'av') {
    newName = 'Bitdefender Antivirus Plus';
  } else if (newName === 'is') {
    newName = 'Bitdefender Internet Security';
  } else if (newName === 'tsmd') {
    newName = 'Bitdefender Total Security';
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

const LCP_BLOCKS = ['banner', 'b-banner', 'c-banner']; // add your LCP blocks to the list

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
  decorateTags(main);
  decorateSections(main);
  decorateBlocks(main);
}

export async function createModal(path, template) {
  const modalContainer = document.createElement('div');
  modalContainer.classList.add('modal-container');

  const modalContent = document.createElement('div');
  modalContent.classList.add('modal-content');

  // this makes fragments work on the www.bitdefender.com/pages domain
  if (path.includes('www.bitdefender.com') && !path.includes('www.bitdefender.com/pages')) {
    // eslint-disable-next-line no-param-reassign
    path = path.replace('www.bitdefender.com', 'www.bitdefender.com/pages');

    // sometime the path might have a query string,
    // we need to remove it in order to get the correct path,
    // so the modal content can be fetched
    // eslint-disable-next-line no-param-reassign
    path = path.split('?')[0];
  }

  // fetch modal content
  const resp = await fetch(`${path}.plain.html`);

  if (!resp.ok) {
    // eslint-disable-next-line no-console
    console.error(`modal url cannot be loaded: ${path}`);
    return modalContainer;
  }

  const html = await resp.text();
  modalContent.innerHTML = html;

  decorateMain(modalContent);
  await loadBlocks(modalContent);
  modalContainer.append(modalContent);

  // add class to modal container for opportunity to add custom modal styling
  if (template) modalContainer.classList.add(template);

  const closeModal = () => modalContainer.remove();
  const close = document.createElement('div');
  close.classList.add('modal-close');
  close.addEventListener('click', closeModal);
  modalContent.append(close);
  return modalContainer;
}

export async function detectModalButtons(element) {
  element.querySelectorAll('a.button.button--modal').forEach((link) => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      document.body.append(await createModal(link.href));
    });
  });
}

export async function go2Anchor() {
  if (window.location.hash) {
    const hash = window.location.hash.substring(1);
    const element = document.getElementById(hash);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = DEFAULT_LANGUAGE === 'se' ? 'sv' : DEFAULT_LANGUAGE;
  decorateTemplateAndTheme();

  const templateMetadata = getMetadata('template');
  const hasTemplate = getMetadata('template') !== '';
  if (hasTemplate) {
    loadCSS(`${window.hlx.codeBasePath}/scripts/template-factories/${templateMetadata}/${templateMetadata}.css`);
    addScript(`${window.hlx.codeBasePath}/scripts/template-factories/${templateMetadata}/${templateMetadata}.js`, {}, 'defer', undefined, undefined, 'module');
  }

  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    detectModalButtons(main);
    document.body.classList.add('appear');
    await waitForLCP(LCP_BLOCKS);
  }

  if (getInstance() === 'prod' && Math.random() < 0.01) {
    window.sentryOnLoad = () => {
      /* eslint-disable-next-line no-undef */
      Sentry.init({
        tracesSampleRate: 1.0,
        allowUrls: ['www.bitdefender.com'],
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
      });
    };

    const script = document.createElement('script');
    script.src = 'https://js.sentry-cdn.com/31155ca43cab4235b06e5da92992eef0.min.js';
    script.crossOrigin = 'anonymous';
    script.async = true;
    document.head.appendChild(script);
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */

export async function loadTrackers() {
  const isPageNotInDraftsFolder = window.location.pathname.indexOf('/drafts/') === -1;

  const onAdobeMcLoaded = () => {
    document.dispatchEvent(new Event(GLOBAL_EVENTS.ADOBE_MC_LOADED));
    window.ADOBE_MC_EVENT_LOADED = true;
  };

  if (isPageNotInDraftsFolder) {
    try {
      await Launch.load(page.environment);
    } catch {
      target.abort();
    }

    onAdobeMcLoaded();
  } else {
    onAdobeMcLoaded();
  }
}

export async function loadLazy(doc) {
  // eslint-disable-next-line import/no-unresolved
  // const fpPromise = import('https://fpjscdn.net/v3/V9XgUXnh11vhRvHZw4dw')
  //   .then((FingerprintJS) => FingerprintJS.load({
  //     region: 'eu',
  //   }));
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));

  loadTrackers();
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    'gtm.start': new Date().getTime(),
    event: 'gtm.js',
  });

  await sendAnalyticsPageEvent();
  await sendAnalyticsUserInfo();

  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);

  adobeMcAppendVisitorId('main');
  go2Anchor();

  if (getMetadata('free-product')) {
    sendTrialDownloadedEvent();
  }
  // Get the visitorId when you need it.
  // await fpPromise
  //   .then((fp) => fp.get())
  //   .then((result) => {
  //     const { visitorId } = result;
  //     AdobeDataLayerService.push(new VisitorIdEvent(visitorId));
  //   });

  await sendAnalyticsErrorEvent();
  sendAnalyticsPageLoadedEvent();

  window.sentryOnLoad = () => {
    /* eslint-disable-next-line no-undef */
    Sentry.init({
      tracesSampleRate: 1.0,
      allowUrls: ['www.bitdefender.com'],
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
  };

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
    /**
     * this makes fragments work on the www.bitdefender.com domain
     * once we move everything to www, we sghould remove this
     */
    if (window.location.hostname === 'www.bitdefender.com' && !path.startsWith('/pages')) {
      // eslint-disable-next-line no-param-reassign
      path = `/pages${path}`;
    }

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
  const percentClass = `.percent-${onSelectorClass}`;
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
  let percentageVal = '';
  let ref = '';

  const paramCoupon = getParam('coupon');

  let promoPid = pid;
  if (promoPid) {
    promoPid = promoPid.split('_PGEN')[0];
  }

  let pidUrlBundle = `/pid.${promoPid}`;
  if (pid === 'ignore' || paramCoupon) {
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

    // DEX-17862 - add new coupon based on param
    let couponValue = '';
    if (coupon[selectedVariation.region_id][currency] !== undefined) couponValue = coupon[selectedVariation.region_id][currency];
    if (coupon[selectedVariation.region_id].ALL !== undefined) couponValue = coupon[selectedVariation.region_id].ALL;

    if (paramCoupon) {
      couponValue = `${paramCoupon},${couponValue}`;
    }

    if (DEFAULT_LANGUAGE === 'de') {
      if (typeof coupon[selectedVariation.region_id] !== 'undefined' && coupon[selectedVariation.region_id][currency] !== 'undefined') {
        buyLink = `${StoreProducts.product[productId].base_uri}/Store/buybundle/${productId}/${selectedUsers}/${selectedYears}/platform.${selectedVariation.platform_id}/region.${selectedVariation.region_id}${ref}${pidUrlBundle}/force.2`;
        buyLink += `/${vpnId}/${10}/${1}/OfferID.${couponValue}/platform.${selectedVariation.platform_id}/region.${selectedVariation.region_id}/CURRENCY.${currency}/DCURRENCY.${currency}`;
        // buyLink += '/' + product_vpn + '/' + 10 + '/' + 1 + '/platform.' + s_variation.platform_id + '/region.' + s_variation.region_id + '/CURRENCY.' + currency + '/DCURRENCY.' + currency;
      } else if (typeof coupon[selectedVariation.region_id] !== 'undefined' && coupon[selectedVariation.region_id].ALL !== 'undefined') {
        buyLink = `${StoreProducts.product[productId].base_uri}/Store/buybundle/${productId}/${selectedUsers}/${selectedYears}/platform.${selectedVariation.platform_id}/region.${selectedVariation.region_id}${ref}${pidUrlBundle}/force.2`;
        buyLink += `/${vpnId}/${10}/${1}/OfferID.${couponValue}/platform.${selectedVariation.platform_id}/region.${selectedVariation.region_id}/CURRENCY.${currency}/DCURRENCY.${currency}`;
        // buyLink += '/' + product_vpn + '/' + 10 + '/' + 1 + '/platform.' + s_variation.platform_id + '/region.' + s_variation.region_id + '/CURRENCY.' + currency + '/DCURRENCY.' + currency;
      } else {
        buyLink = `${StoreProducts.product[productId].base_uri}/Store/buybundle/${productId}/${selectedUsers}/${selectedYears}/platform.${selectedVariation.platform_id}/region.${selectedVariation.region_id}${ref}${pidUrlBundle}/force.2`;
        buyLink += `/${vpnId}/${10}/${1}/platform.${selectedVariation.platform_id}/region.${selectedVariation.region_id}/CURRENCY.${currency}/DCURRENCY.${currency}`;
      }
    } else if (coupon[selectedVariation.region_id][currency] !== 'undefined') {
      buyLink = `${StoreProducts.product[productId].base_uri}/Store/buybundle/${productId}/${selectedUsers}/${selectedYears}/platform.${selectedVariation.platform_id}/region.${selectedVariation.region_id}${ref}${pidUrlBundle}/force.2`;
      buyLink += `/${vpnId}/${10}/${1}/COUPON.${couponValue}/platform.${selectedVariation.platform_id}/region.${selectedVariation.region_id}/CURRENCY.${currency}/DCURRENCY.${currency}`;
      // buylink_vpn += '/' + product_vpn + '/' + 10 + '/' + 1 + '/platform.' + s_variation.platform_id + '/region.' + s_variation.region_id + '/CURRENCY.' + currency + '/DCURRENCY.' + currency;
    } else if (coupon[selectedVariation.region_id].ALL !== 'undefined') {
      buyLink = `${StoreProducts.product[productId].base_uri}/Store/buybundle/${productId}/${selectedUsers}/${selectedYears}/platform.${selectedVariation.platform_id}/region.${selectedVariation.region_id}${ref}${pidUrlBundle}/force.2`;
      buyLink += `/${vpnId}/${10}/${1}/COUPON.${couponValue}/platform.${selectedVariation.platform_id}/region.${selectedVariation.region_id}/CURRENCY.${currency}/DCURRENCY.${currency}`;
      // buylink_vpn += '/' + product_vpn + '/' + 10 + '/' + 1 + '/platform.' + s_variation.platform_id + '/region.' + s_variation.region_id + '/CURRENCY.' + currency + '/DCURRENCY.' + currency;
    } else {
      buyLink = `${StoreProducts.product[productId].base_uri}/Store/buybundle/${productId}/${selectedUsers}/${selectedYears}/platform.${selectedVariation.platform_id}/region.${selectedVariation.region_id}${ref}${pidUrlBundle}/force.2`;
      buyLink += `/${vpnId}/${10}/${1}/platform.${selectedVariation.platform_id}/region.${selectedVariation.region_id}/CURRENCY.${currency}/DCURRENCY.${currency}`;
    }

    /* this is a hack */
    if (pidUrlBundle === '' && !paramCoupon) {
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

  percentageVal = (((fullPrice - newPrice) / fullPrice) * 100).toFixed(0);
  fullPrice = formatPrice(fullPrice, selectedVariation.currency_iso, selectedVariation.region_id);
  save = formatPrice(save, selectedVariation.currency_iso, selectedVariation.region_id);
  newPrice = formatPrice(newPrice, selectedVariation.currency_iso, selectedVariation.region_id);

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

  if (parentDiv.querySelector(percentClass)) {
    parentDiv.querySelector(percentClass).innerHTML = `${percentageVal}%`;
    if (comparativeDiv && comparativeDiv.querySelector(percentClass)) {
      comparativeDiv.querySelector(percentClass).innerHTML = `${percentageVal}%`;
    }
  }

  const dataInfo = {
    buyLinkSelector: `buylink-${onSelectorClass}`,
    variation: {
      discounted_price: newPrice.replace(selectedVariation.currency_label, '').trim(),
      price: fullPrice.replace(selectedVariation.currency_label, '').trim(),
    },
  };

  setDataOnBuyLinks(dataInfo);
}

const createFakeSelectors = () => {
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
  });
};

function initSelectors(pid) {
  showLoaderSpinner();
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

      const metaPID = getMetadata('pid');
      // eslint-disable-next-line no-param-reassign
      if (metaPID && metaPID !== '') pid = metaPID;

      const initSelectorConfig = {
        product_id: prodAlias,
        full_price_class: `oldprice-${onSelectorClass}`,
        full_price_monthly_class: `oldprice-${onSelectorClass}-monthly`,
        discounted_price_class: `newprice-${onSelectorClass}`,
        discounted_price_monthly_class: `newprice-${onSelectorClass}-monthly`,
        price_class: `price-${onSelectorClass}`,
        buy_class: `buylink-${onSelectorClass}`,
        save_class: `save-${onSelectorClass}`,
        percent_class: `percent-${onSelectorClass}`,
        selected_users: prodUsers,
        selected_years: prodYears,
        users_class: `users_${onSelectorClass}_fake`,
        years_class: `years_${onSelectorClass}_fake`,
        method: 'POST',

        ...(pid === 'ignore' ? { ignore_promotions: true } : {}),
        ...(pid !== false && pid !== 'ignore' ? { extra_params: { pid } } : {}),

        onSelectorLoad() {
          sendAnalyticsProducts(this);
          try {
            const checkoutLinks = {
              ultsec: 'https://checkout.bitdefender.com/index.html:step=login?theme=truesubs&product_id=com.bitdefender.ultimatesecurityus&payment_period=10d1y&language=en_EN&country=US&provider=verifone&campaign=summermc-2024-subscription-ultsec',
              ps: 'https://checkout.bitdefender.com/index.html:step=login?theme=truesubs&product_id=com.bitdefender.premiumsecurity&payment_period=10d1y&language=en_EN&country=US&provider=verifone&campaign=summermc-2024-subscription-ps',
              av: 'https://checkout.bitdefender.com/index.html:step=login?theme=truesubs&product_id=com.bitdefender.cl.av&payment_period=3d1y&language=en_EN&country=US&provider=verifone&campaign=summermc-2024-subscription-av',
              tsmd: 'https://checkout.bitdefender.com/index.html:step=login?theme=truesubs&product_id=com.bitdefender.cl.tsmd&payment_period=5d1y&language=en_EN&country=US&provider=verifone&campaign=summermc-2024-subscription-ts',
            };

            if (window.location.href.includes('/lp-brand-4pr-1/')) {
              this.buy_link = checkoutLinks[this.config.product_id];
            }

            const fp = this;
            const paramCoupon = getParam('coupon');

            // DEX-17703 - replacing VAT INFO text for en regions
            showPrices(fp, false, null, onSelectorClass, paramCoupon);
            adobeMcAppendVisitorId('main');
            showLoaderSpinner(false, onSelectorClass);
          } catch (ex) { console.log(ex); }
        },
        onChangeUsers() {
          sendAnalyticsProducts(this);
          try {
            const fp = this;
            showPrices(fp, false, null, onSelectorClass);
            adobeMcAppendVisitorId('main');
            showLoaderSpinner(false, onSelectorClass);
          } catch (ex) { console.log(ex); }
        },
        onChangeYears() {
          sendAnalyticsProducts(this);
          try {
            const fp = this;
            showPrices(fp, false, null, onSelectorClass);
            adobeMcAppendVisitorId('main');
            showLoaderSpinner(false, onSelectorClass);
          } catch (ex) { console.log(ex); }
        },
      };

      StoreProducts.initSelector(initSelectorConfig);
    });
  }
}

function addIdsToEachSection() {
  document.querySelectorAll('main .section > div:first-of-type').forEach((item) => {
    // Find the first sibling that is not a default-content-wrapper
    let componentWrapper = item;
    while (componentWrapper && componentWrapper.classList.contains('default-content-wrapper')) {
      if (!componentWrapper.nextElementSibling) {
        return;
      }

      componentWrapper = componentWrapper.nextElementSibling;
    }

    const getIdentity = componentWrapper.className.split('-wrapper')[0];
    componentWrapper.parentElement.id = document.getElementById(getIdentity) ? `${getIdentity}-2` : getIdentity;
  });
}

function addEventListenersOnVpnCheckboxes(pid) {
  if (document.querySelector('.checkboxVPN')) {
    document.querySelectorAll('.prod_box').forEach((item) => {
      item.addEventListener('click', (e) => {
        if (e.target.tagName === 'INPUT' && e.target.classList.contains('checkboxVPN')) {
          const checkboxId = e.target.getAttribute('id');

          if ((window.isVlaicu || isZuoraForNetherlandsLangMode()) && window.StoreProducts.product) {
            const prodxId = e.target.getAttribute('id').split('-')[1];
            const storeObjprod = window.StoreProducts.product[prodxId] || {};
            showPrices(storeObjprod, e.target.checked, checkboxId);
          } else {
            changeCheckboxVPN(checkboxId, pid);
          }
        }
      });
    });
  }
}

async function initVlaicuProductPriceLogic(campaign = undefined, targetBuylinks = {}) {
  import('./vendor/product.js').then(async (module) => {
    const ProductPrice = module.default;
    showLoaderSpinner();

    if (productsList.length) {
      try {
        await Promise.all(
          productsList.map(async (item) => {
            const prodSplit = item.split('/');
            const prodAlias = prodSplit[0].trim();
            const prodUsers = prodSplit[1].trim();
            const prodYears = prodSplit[2].trim();
            const onSelectorClass = `${prodAlias}-${prodUsers}${prodYears}`;

            const productPrice = new ProductPrice(item, campaign, targetBuylinks);
            const vlaicuResult = await productPrice.getPrices();
            const vlaicuVariation = productPrice.getVariation();
            if (vlaicuVariation) {
              showPrices(vlaicuVariation);
              adobeMcAppendVisitorId('main');
              showLoaderSpinner(false, onSelectorClass);
            }
            sendAnalyticsProducts(vlaicuResult);

            return vlaicuResult;
          }),
        );
      } catch (error) {
        console.error(error);
      }
    }
  });
}

/**
 * Price logic should start only after adobe target is loaded.
 */
async function initializeProductsPriceLogic() {
  let targetBuyLinkMappings = {};
  const parameterPid = getParam('pid');
  let targetPid;
  let campaign = getParam('campaign');
  let vlaicuCampaign = getParam('vcampaign') || getMetadata('vcampaign');

  try {
    const configMbox = await target.configMbox;
    targetBuyLinkMappings = configMbox?.products ?? {};
    if (configMbox) {
      targetPid = configMbox?.promotion;
      vlaicuCampaign = configMbox?.promotion || vlaicuCampaign;
      campaign = configMbox?.promotion ?? campaign;
      const promotionID = configMbox?.promotion;

      if (promotionID) {
        window.adobeDataLayer.push({
          page: { attributes: { promotionID } },
        });
      }
    }
  } catch (ex) { /* empty */ }

  const metaPID = getMetadata('pid');
  const pid = targetPid || parameterPid || campaign || metaPID;

  if ((!parameterPid || !checkIfLocaleCanSupportInitSelector()) && getDefaultSection() === 'consumer') {
    window.isVlaicu = true;
    initVlaicuProductPriceLogic(vlaicuCampaign || pid, targetBuyLinkMappings);
    createFakeSelectors();
  } else {
    addScript('/_src-lp/scripts/vendor/store2015.js', {}, 'async', () => {
      initSelectors(pid);
    }, {}, 'module');
  }

  addEventListenersOnVpnCheckboxes(pid);
}

function eventOnDropdownSlider() {
  document.querySelectorAll('.dropdownSlider').forEach((slider) => {
    const titles = slider.querySelectorAll('.title');
    const loadingBars = slider.querySelectorAll('.loading-bar');
    let activeIndex = 0;
    let interval;
    let loadingInterval;

    function showLoadingBar(index) {
      clearInterval(loadingInterval); // Clear any existing loading animation
      const loadingBar = loadingBars[index];
      if (loadingBar) {
        loadingBar.style.width = '0';
        let width = 0;
        loadingInterval = setInterval(() => {
          width += 1;
          loadingBar.style.width = `${width}%`;
          if (width >= 100) {
            clearInterval(loadingInterval);
          }
        }, 30); // Adjust the interval for smoother animation
      }
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
      clearInterval(interval);
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

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);

  addIdsToEachSection();

  // in the drafts folder adobe target is not loaded, so the price logic should be executed
  const isPageNotInDraftsFolder = window.location.pathname.indexOf('/drafts/') === -1;
  if (!isPageNotInDraftsFolder) {
    target.abort();
  }
  initializeProductsPriceLogic();

  addScript('/_src-lp/scripts/vendor/bootstrap/bootstrap.bundle.min.js', {}, 'defer');

  eventOnDropdownSlider();

  appendMetaReferrer();

  loadDelayed();

  go2Anchor();
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

import { Target, adobeMcAppendVisitorId, getDefaultLanguage } from './target.js';
import { getMetadata } from './lib-franklin.js';
import { Bundle } from './vendor/product.js';

export const IANA_BY_REGION_MAP = new Map([
  [3, { locale: 'en-GB', label: 'united kingdom' }],
  [4, { locale: 'au-AU', label: 'australia' }],
  [5, { locale: 'de-DE', label: 'germany' }],
  [6, { locale: 'ro-RO', label: 'romania' }],
  [7, { locale: 'es-ES', label: 'spain' }],
  [8, { locale: 'en-US', label: 'com' }],
  [9, { locale: 'it-IT', label: 'italy' }],
  [10, { locale: 'en-CA', label: 'canada' }],
  [12, { locale: 'pt-PT', label: 'portugal' }],
  [13, { locale: 'br-BR', label: 'brazil' }],
  [14, { locale: 'fr-FR', label: 'france' }],
  [15, { locale: 'en-GB', label: 'united kingdom' }],
  [16, { locale: 'en-US', label: 'rest of the world EU countries' }],
  [17, { locale: 'de-CH', label: 'germany-switzerland' }],
  [19, { locale: 'en-ZA', label: 'en south africa' }],
  [22, { locale: 'nl-NL', label: 'netherlands' }],
  [24, { locale: 'en-VN', label: 'en vietnam' }],
  [20, { locale: 'en-MX', label: 'en es mexico' }],
  [21, { locale: 'en-CO', label: 'en es columbia' }],
  [25, { locale: 'en-SG', label: 'en singapore' }],
  [26, { locale: 'en-SE', label: 'en sweden' }],
  [27, { locale: 'en-DK', label: 'en denmark' }],
  [28, { locale: 'en-HU', label: 'en hungary' }],
  [29, { locale: 'en-BG', label: 'en bulgaria' }],
  [30, { locale: 'en-HR', label: 'en croatia' }],
  [31, { locale: 'en-NO', label: 'en norway' }],
  [32, { locale: 'en-MD', label: 'en moldova' }],
  [33, { locale: 'en-RS', label: 'en serbia' }],
  [34, { locale: 'en-RU', label: 'en russia' }],
  [35, { locale: 'en-EG', label: 'en egypt' }],
  [36, { locale: 'en-SA', label: 'en saudi arabia' }],
  [37, { locale: 'fr-DZ', label: 'en Algeria' }],
  [38, { locale: 'en-AE', label: 'en united arab emirates' }],
  [39, { locale: 'en-PS', label: 'en palestinia' }],
  [40, { locale: 'en-CN', label: 'en china' }],
  [41, { locale: 'en-HK', label: 'en hong kong' }],
  [42, { locale: 'en-CK', label: 'Cook Islands' }],
  [43, { locale: 'en-KE', label: 'en kenya' }],
  [44, { locale: 'en-NG', label: 'en nigeria' }],
  [45, { locale: 'fr-TN', label: 'en Tunisia' }],
  [46, { locale: 'en-PL', label: 'en poland' }],
  [47, { locale: 'en-CZ', label: 'en Czech' }],
  [48, { locale: 'es-VE', label: 'en Venezuela' }],
  [49, { locale: 'en-TR', label: 'en turkey' }],
  [50, { locale: 'en-ID', label: 'en Indonesia' }],
  [51, { locale: 'en-PH', label: 'en Philippines' }],
  [52, { locale: 'en-TW', label: 'en taiwan' }],
  [53, { locale: 'en-UA', label: 'en Ukraine' }],
  [54, { locale: 'es-CL', label: 'en Chile' }],
  [55, { locale: 'en-MY', label: 'en Malaysia' }],
  [56, { locale: 'es-AR', label: 'en Argentina' }],
  [57, { locale: 'es-PE', label: 'en Peru' }],
  [59, { locale: 'hr-HR', label: 'Croatia' }],
  [60, { locale: 'ma-MA', label: 'Morocco' }],
  [61, { locale: 'pk-PK', label: 'Pakistan' }],
  [62, { locale: 'bo-BO', label: 'Bolivia' }],
  [63, { locale: 'do-DO', label: 'Dominican Republic' }],
  [64, { locale: 'kw-KW', label: 'Kuwait' }],
  [65, { locale: 'jo-JO', label: 'Jordan' }],
  [66, { locale: 'th-TH', label: 'Thailand' }],
  [67, { locale: 'en-BD', label: 'en Bangladesh' }],
  [68, { locale: 'en-LK', label: 'en Sri Lanka' }],
  [69, { locale: 'en-PY', label: 'en Paraguay' }],
  [70, { locale: 'en-UY', label: 'en Uruguay' }],
  [72, { locale: 'en-JP', label: 'en Japan' }],
]);

/**
 * Returns the instance name based on the hostname
 * @returns {String}
 */
export function getInstance() {
  const hostToInstance = {
    'bitdefender.com': 'prod',
    'hlx.page': 'stage',
    'hlx.live': 'stage',
  };

  // eslint-disable-next-line no-restricted-syntax
  for (const [host, inst] of Object.entries(hostToInstance)) {
    if (window.location.hostname.includes(host)) return inst;
  }

  return 'dev';
}

/**
 * Returns the geoIP country code. Very costly on performance, use with caution.
 * @returns {String}
 */

/**
let cachedIpCountry;
export const getIpCountry = async () => {
  if (cachedIpCountry) {
    return cachedIpCountry;
  }

  try {
    const response = await fetch('https://pages.bitdefender.com/ip.json');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      const ipCountry = response.headers.get('X-Cf-Ipcountry').toLowerCase();

      if (ipCountry) {
        cachedIpCountry = ipCountry;
        return ipCountry;
      }
      throw new Error('X-Cf-Ipcountry header not found');
    }
  } catch (error) {
    console.log(`There has been a problem with your fetch operation: ${error.message}`);
    return null;
  }
};
*/

export const GLOBAL_EVENTS = {
  ADOBE_MC_LOADED: 'adobe_mc::loaded',
  PAGE_LOADED: 'page::loaded',
  COUNTER_LOADED: 'counter::loaded',
  GEOIPINFO_LOADED: 'geoipinfo::loaded',
};

const LOCALISATIONS = {
  au: 'en-au',
  be: 'en-us',
  br: 'pt-br',
  de: 'de-de',
  en: 'en-us',
  es: 'es-es',
  fr: 'fr-fr',
  it: 'it-it',
  nl: 'nl-nl',
  pt: 'pt-pt',
  ro: 'ro-ro',
  se: 'sv-se',
  uk: 'en-gb',
  'zh-tw': 'zh-tw',
};
const DEFAULT_LANGUAGE = 'en';

// add new script file
export function addScript(src, data = {}, loadStrategy = undefined, onLoadCallback = undefined, onErrorCallback = undefined, type = undefined) {
  const s = document.createElement('script');

  s.setAttribute('src', src);

  if (loadStrategy) {
    s.setAttribute(loadStrategy, true);
  }

  if (type) {
    s.setAttribute('type', type);
  }

  if (typeof data === 'object' && data !== null) {
    // eslint-disable-next-line no-restricted-syntax
    for (const key in data) {
      // eslint-disable-next-line no-prototype-builtins
      if (data.hasOwnProperty(key)) {
        s.dataset[key] = data[key];
      }
    }
  }

  if (onLoadCallback) {
    s.onload = onLoadCallback;
  }

  if (onErrorCallback) {
    s.onerror = onErrorCallback;
  }

  document.body.appendChild(s);
}

export function getLocale(lang) {
  return LOCALISATIONS[lang] || LOCALISATIONS[DEFAULT_LANGUAGE];
}

export function getDefaultSection() {
  const currentPathUrl = window.location.pathname;
  return currentPathUrl.indexOf('/business/') !== -1 ? 'business' : 'consumer';
}

export function appendAdobeMcLinks(selector) {
  try {
    const wrapperSelector = document.querySelector(selector);
    const hrefSelector = '[href*=".bitdefender."]';

    wrapperSelector.querySelectorAll(hrefSelector).forEach(async (link) => {
      console.log('link ', link)
      const isAdobeMcAlreadyAdded = link.href.includes('adobe_mc');
      if (isAdobeMcAlreadyAdded) {
        return;
      }

      const destinationURLWithVisitorIDs = await Target.appendVisitorIDsTo(link.href);
      link.href = destinationURLWithVisitorIDs.replace(/MCAID%3D.*%7CMCORGID/, 'MCAID%3D%7CMCORGID');
    });
  } catch (e) {
    console.error(e);
  }
}

export function adobeMcAppendVisitorId(selector) {
  // https://experienceleague.adobe.com/docs/id-service/using/id-service-api/methods/appendvisitorid.html?lang=en

  if (window.ADOBE_MC_EVENT_LOADED) {
    appendAdobeMcLinks(selector);
  } else {
    document.addEventListener(GLOBAL_EVENTS.ADOBE_MC_LOADED, () => {
      appendAdobeMcLinks(selector);
    });
  }
}

export const productsList = [];

export function updateProductsList(product) {
  const productTrim = product.trim();
  if (productsList.indexOf(productTrim) === -1) {
    productsList.push(productTrim);
  }
  window.productsListCount = productsList.length;
}

// DEX-14692 - set data on buy links
export function setDataOnBuyLinks(dataInfo) {
  try {
    const { buyLinkSelector, productId, variation } = dataInfo;
    const btnElelemts = document.querySelectorAll(`.${buyLinkSelector}`);

    if (btnElelemts !== undefined && btnElelemts.length > 0) {
      Array.from(btnElelemts).forEach((element) => {
        if (productId) element.dataset.product = productId;

        element.dataset.buyPrice = variation.discounted_price || variation.price || 0;

        if (variation.price) element.dataset.oldPrice = variation.price;
        if (variation.currency_label) element.dataset.dataCurrency = variation.currency_label;
        if (variation.region_id) element.dataset.dataRegion = variation.region_id;
        if (variation.variation_name) element.dataset.variation = variation.variation_name;
      });
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

export function checkIfLocaleCanSupportInitSelector() {
  const urlParams = new URLSearchParams(window.location.search);
  const forceLocale = urlParams.get('locale');

  if (forceLocale && ['de-de', 'de-at', 'nl-nl', 'nl-be'].some((locale) => forceLocale.toLowerCase() === locale)) {
    return false;
  }

  if (!forceLocale && getDefaultLanguage() === 'nl') {
    return false;
  }

  return true;
}

export function isZuoraForNetherlandsLangMode() {
  return getDefaultLanguage() === 'nl' && getDefaultSection() === 'consumer';
}

// showLoaderSpinner
export function showLoaderSpinner(showSpinner = true, pid = null) {
  if (showSpinner) {
    const prodLoadBox = document.querySelectorAll('.prodload');
    prodLoadBox.forEach((item) => {
      item.classList.add('await-loader');
    });
    document.querySelectorAll('.checkboxVPN').forEach((checkbox) => {
      checkbox.setAttribute('disabled', 'true');
    });
  } else {
    const prodLoadBox = document.querySelectorAll(pid ? `.prodload-${pid}` : '.prodload');
    prodLoadBox.forEach((item) => {
      item.classList.remove('await-loader');
    });
    document.querySelectorAll('.checkboxVPN').forEach((checkbox) => {
      checkbox.removeAttribute('disabled');
    });
  }
}

// DEX-17703 - replacing VAT INFO text for en regions
export function updateVATinfo(countryCode, selector) {
  const skipVATinfo = getMetadata('skip-vatinfo-logic');
  if ((skipVATinfo && skipVATinfo === 'true') || getDefaultSection() === 'business') {
    return;
  }

  const prodloadElements = document.querySelectorAll(selector);
  prodloadElements.forEach((element) => {
    const prodloadElement = element.closest('[data-testid="prod_box"]') || element.closest('.prices_box') || element.closest('.prod_box') || element.closest('.hasProds');

    if (prodloadElement) {
      const vat2replace = [
        'Taxes not included',
        'Sales tax included',
        'Plus applicable sales tax',
        'Tax included',
      ];

      vat2replace.forEach((text) => {
        let taxText = 'Sales tax included';
        if (countryCode === 8) taxText = 'Plus applicable sales tax';

        if (prodloadElement.innerHTML.includes(text)) {
          const currentText = prodloadElement.innerHTML;
          const newText = currentText.replace(text, taxText);
          // before replacing check if the text is already correct
          if (currentText !== newText) {
            prodloadElement.innerHTML = newText;
          }
        }
      });
    }
  });
}

export function formatPrice(price, currency) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price);
}

// get max discount
function maxDiscount() {
  const discountAmounts = [];
  if (document.querySelector('.percent')) {
    document.querySelectorAll('.percent').forEach((item) => {
      const discountAmount = parseInt(item.textContent, 10);
      if (!Number.isNaN(discountAmount)) {
        discountAmounts.push(discountAmount);
      }
    });
  }

  const maxDiscountValue = Math.max(...discountAmounts);
  const maxDiscountBox = document.querySelector('.max-discount');
  if (maxDiscountBox && maxDiscountValue) {
    const discountText = `${maxDiscountValue.toString()}%`;
    document.querySelectorAll('.max-discount').forEach((item) => {
      item.textContent = discountText;
      const closestEm = item.closest('em');
      if (closestEm) closestEm.style.display = 'inline-block';
    });

    const closestDiv = maxDiscountBox.closest('div');
    if (closestDiv) closestDiv.style.visibility = 'visible';
  } else {
    document.querySelectorAll('.max-discount').forEach((item) => {
      const closestEm = item.closest('em');
      if (closestEm) closestEm.style.display = 'none';
    });
  }
}

// display prices
export async function showPrices(storeObj, triggerVPN = false, checkboxId = '', defaultSelector = '', paramCoupon = '') {
  const { currency_label: currencyLabel, currency_iso: currencyIso } = storeObj.selected_variation;
  const { region_id: regionId } = storeObj.selected_variation;
  const { selected_users: prodUsers, selected_years: prodYears } = storeObj;
  const { product_id: productId } = storeObj.config;
  const comparativeTextBox = document.querySelector('.c-top-comparative-with-text');
  const onSelectorClass = `${productId}-${prodUsers}${prodYears}`;

  if (getDefaultLanguage() === 'en' && regionId) updateVATinfo(Number(regionId), `.buylink-${onSelectorClass}`);

  let parentDiv = '';

  // DEX-17862 - add new coupon based on param
  let buyLink = paramCoupon ? `${storeObj.buy_link}?COUPON=${paramCoupon}` : storeObj.buy_link;
  let selectedVarPrice = storeObj.selected_variation.price;
  let selectedVarDiscount = storeObj.selected_variation.discount?.discounted_price;
  const selectedVarDiscountValue = storeObj.selected_variation.discount?.discount_value;

  const showVpnBox = document.querySelector(`.show_vpn_${productId}`) || document.querySelector(`.show_vpn-${productId}`) || document.querySelector(`.show_vpn-${productId}-${prodUsers}${prodYears}`);
  if (showVpnBox) showVpnBox.style.display = 'none';

  const storeObjVPN = StoreProducts.product.vpn;
  if (triggerVPN) {
    parentDiv = document.getElementById(checkboxId).closest('div.prod_box');
    buyLink += '&bundle_id=com.bitdefender.vpn&bundle_payment_period=10d1y';
    selectedVarPrice += storeObjVPN.selected_variation.discount.discounted_price || storeObjVPN.selected_variation.price;
    selectedVarPrice = selectedVarPrice.toFixed(2);

    if (window.isVlaicu) {
      showLoaderSpinner(true);
      const bundles = new Bundle(storeObj, storeObjVPN);
      const bundleBuyLinkBody = await bundles.getBuyLink();
      if (bundleBuyLinkBody) {
        buyLink = bundleBuyLinkBody.buyLink;
      }
      showLoaderSpinner(false);
    }

    if (showVpnBox) showVpnBox.style.display = 'block';
  }

  const fullPrice = formatPrice(selectedVarPrice, currencyIso, regionId);
  const fullPriceMonthly = formatPrice((selectedVarPrice / 12).toFixed(2), currencyIso, regionId);
  const fullPriceYearly = formatPrice((selectedVarPrice * 12).toFixed(2), currencyIso, regionId);

  const oldPriceClass = `.oldprice-${onSelectorClass}`;
  if (document.querySelector(oldPriceClass)) {
    const allOldPriceBox = document.querySelectorAll(oldPriceClass);
    if (triggerVPN) {
      if (parentDiv) parentDiv.querySelector(oldPriceClass).innerHTML = fullPrice;
      if (comparativeTextBox) {
        allOldPriceBox.forEach((item) => {
          item.innerHTML = fullPrice;
        });
      }
    } else {
      allOldPriceBox.forEach((item) => {
        if (item.classList.contains('calculate_monthly')) {
          item.innerHTML = fullPriceMonthly;
        } else if (item.classList.contains('calculate_yearly')) {
          item.innerHTML = fullPriceYearly;
        } else {
          item.innerHTML = fullPrice;
        }
      });
    }
  }

  if (storeObj.selected_variation.discount && storeObj.selected_variation.discount?.discount_value) {
    if (triggerVPN) {
      selectedVarDiscount += storeObjVPN.selected_variation.discount.discounted_price || 0;
      selectedVarDiscount = selectedVarDiscount.toFixed(2);
    }

    const offerPrice = formatPrice(selectedVarDiscount, currencyIso, regionId);
    const offerPriceMonthly = formatPrice((selectedVarDiscount / 12).toFixed(2), currencyIso, regionId);
    const offerPriceYearly = formatPrice((selectedVarDiscount * 12).toFixed(2), currencyIso, regionId);
    const savingsPrice = selectedVarPrice - selectedVarDiscount;
    const savings = formatPrice(savingsPrice.toFixed(0), currencyIso, regionId);
    const percentageSticker = (((selectedVarPrice - selectedVarDiscount) / selectedVarPrice) * 100).toFixed(0);

    const onewPriceClass = `.newprice-${onSelectorClass}`;
    if (document.querySelector(onewPriceClass)) {
      const allNewPriceBox = document.querySelectorAll(onewPriceClass);
      if (triggerVPN) {
        if (parentDiv) parentDiv.querySelector(onewPriceClass).innerHTML = offerPrice;
        if (comparativeTextBox) {
          allNewPriceBox.forEach((item) => {
            if (item.classList.contains('calculate_monthly')) {
              item.innerHTML = offerPriceMonthly;
            } else {
              item.innerHTML = offerPrice;
            }
          });
        }
      } else {
        allNewPriceBox.forEach((item) => {
          if (item.classList.contains('calculate_monthly')) {
            item.innerHTML = offerPriceMonthly;
          } else if (item.classList.contains('calculate_yearly')) {
            item.innerHTML = offerPriceYearly;
          } else {
            item.innerHTML = offerPrice;
          }
        });
      }
    }

    const oldPriceMonthlyClass = `.oldprice-${onSelectorClass}-monthly`;
    if (document.querySelector(oldPriceMonthlyClass)) {
      const allOldPriceBox = document.querySelectorAll(oldPriceMonthlyClass);
      if (triggerVPN) {
        if (parentDiv) parentDiv.querySelector(oldPriceMonthlyClass).innerHTML = fullPriceMonthly;
        if (comparativeTextBox) {
          allOldPriceBox.forEach((item) => {
            item.innerHTML = fullPriceMonthly;
          });
        }
      } else {
        allOldPriceBox.forEach((item) => {
          item.innerHTML = fullPriceMonthly;
        });
      }
    }

    const onewPriceMonthlyClass = `.newprice-${onSelectorClass}-monthly`;
    if (document.querySelector(onewPriceMonthlyClass)) {
      const allNewPriceBox = document.querySelectorAll(onewPriceMonthlyClass);
      if (triggerVPN) {
        if (parentDiv) parentDiv.querySelector(onewPriceMonthlyClass).innerHTML = offerPriceMonthly;
        if (comparativeTextBox) {
          allNewPriceBox.forEach((item) => {
            item.innerHTML = offerPriceMonthly;
          });
        }
      } else {
        allNewPriceBox.forEach((item) => {
          item.innerHTML = offerPriceMonthly;
        });
      }
    }

    const saveClass = document.querySelector(`.save-${onSelectorClass}`);
    if (saveClass) {
      if (triggerVPN) {
        const parentSaveBox = parentDiv?.querySelector(`.save-${onSelectorClass}`);
        if (parentSaveBox) {
          parentSaveBox.innerHTML = savings;
          parentSaveBox.style.visibility = 'visible';
          const saveElement = parentSaveBox.closest('.save');
          if (saveElement) saveElement.style.visibility = 'visible';
        }
      } else {
        document.querySelectorAll(`.save-${onSelectorClass}`).forEach((item) => {
          item.innerHTML = savings;
          item.style.visibility = 'visible';
          const saveElement = item.closest('.save');
          if (saveElement) saveElement.style.visibility = 'visible';
        });
      }
    }

    if (document.querySelector(`.percent-${onSelectorClass}`)) {
      if (triggerVPN) {
        const parentPercentBox = parentDiv?.querySelector(`.percent-${onSelectorClass}`);
        if (parentPercentBox) {
          parentPercentBox.innerHTML = `${percentageSticker}%`;
          parentPercentBox.parentNode.style.visibility = 'visible';
        }
      } else {
        document.querySelectorAll(`.percent-${onSelectorClass}`).forEach((item) => {
          item.innerHTML = `${percentageSticker}%`;
          item.style.visibility = 'visible';
          item.parentNode.style.visibility = 'visible';
        });
      }
    }

    if (document.querySelector(`.bulina-${onSelectorClass}`)) {
      const bulinaElement = document.querySelector(`.bulina-${onSelectorClass}`);
      bulinaElement.closest('div').style.visibility = 'visible';
    }

    const showSaveBox = document.querySelector(`.show_save_${onSelectorClass}`);
    if (showSaveBox) {
      showSaveBox.style.visibility = 'visible';
    }
  } else {
    let vpnHasDiscount = false;
    let offerPrice = 0;
    let percentageSticker = 0;

    if (productId === 'vpn' && storeObj.selected_variation.discount) {
      vpnHasDiscount = true;
      if (storeObj.selected_variation.discount) {
        if (triggerVPN) {
          selectedVarDiscount += storeObjVPN.selected_variation.discount.discounted_price || 0;
        }
        offerPrice = formatPrice(selectedVarDiscount, currencyIso, regionId);
        percentageSticker = (((selectedVarPrice - selectedVarDiscount) / selectedVarPrice) * 100).toFixed(0);
      }
    }

    const newPriceBox = document.querySelector(`.newprice-${onSelectorClass}`);
    if (newPriceBox) {
      newPriceBox.innerHTML = fullPrice;
      if (vpnHasDiscount) {
        document.querySelectorAll(`.newprice-${onSelectorClass}`).forEach((item) => {
          item.innerHTML = offerPrice;
        });
      } else {
        document.querySelectorAll(`.newprice-${onSelectorClass}`).forEach((item) => {
          item.innerHTML = fullPrice;
        });
      }
    }

    const oldPriceBox = document.querySelector(`.oldprice-${onSelectorClass}`);
    if (oldPriceBox) {
      if (productId === 'vpn') {
        document.querySelectorAll(`.oldprice-${onSelectorClass}`).forEach((item) => {
          item.innerHTML = fullPrice;
        });
      }

      document.querySelectorAll(`.oldprice-${onSelectorClass}`).forEach((item) => {
        const parent = item.parentNode;
        const sibling = parent.querySelector(`.oldprice-${onSelectorClass}`);
        if (item.closest('p') && !item.closest('label') && item.closest('p')) item.closest('p').style.display = 'none';
        if (sibling && !parent.classList.contains('billed')) {
          item.style.display = 'none';
          sibling.style.display = 'none';
        } else if (!parent.classList.contains('billed')) parent.style.display = 'none';
      });
    }

    const saveBox = document.querySelector(`.save-${onSelectorClass}`);
    if (saveBox) {
      if (selectedVarDiscountValue === 0 && !saveBox.closest('label') && saveBox.closest('p')) saveBox.closest('p').style.display = 'none';
      const siblingElements = saveBox.parentNode.querySelectorAll('div');
      siblingElements.forEach((element) => {
        element.style.visibility = 'hidden';
      });
      if (saveBox.closest('.prod-save')) {
        saveBox.closest('.prod-save').style.setProperty('display', 'none', 'important');
        if (saveBox.parentNode.nodeName === 'P') {
          saveBox.parentNode.style.display = 'none';
        }
      }
    }

    const percentBox = document.querySelector(`.percent-${onSelectorClass}`);
    if (percentBox) {
      if (vpnHasDiscount) {
        if (triggerVPN) {
          const parentPercentBox = parentDiv.querySelector(`.percent-${onSelectorClass}`);
          parentPercentBox.innerHTML = `${percentageSticker}%`;
          parentPercentBox.parentNode.style.visibility = 'visible';
        } else {
          document.querySelectorAll(`.percent-${onSelectorClass}`).forEach((item) => {
            item.innerHTML = `${percentageSticker}%`;
            item.parentNode.style.visibility = 'visible';
          });
        }
      }
    }

    const showSaveBox = document.querySelector(`.show_save_${onSelectorClass}`);
    if (showSaveBox) {
      showSaveBox.style.visibility = 'hidden';
    }

    const bulinaBox = document.querySelector(`.bulina-${onSelectorClass}`);
    if (bulinaBox) {
      bulinaBox.style.display = 'none';
      // bulinaBox.parentNode.style.visibility = 'hidden';
    }
  }

  if (document.querySelector(`.buylink-${onSelectorClass}`)) {
    const allBuyLinkBox = document.querySelectorAll(`.buylink-${onSelectorClass}`);
    if (triggerVPN) {
      parentDiv.querySelector(`.buylink-${onSelectorClass}`).href = buyLink;
      if (comparativeTextBox) {
        allBuyLinkBox.forEach((item) => {
          item.href = buyLink;
        });
      }
    } else {
      allBuyLinkBox.forEach((item) => {
        item.href = buyLink;
      });
    }
  }

  const dataInfo = {
    buyLinkSelector: `${defaultSelector ? `buylink-${defaultSelector}` : `buylink-${onSelectorClass}`}`,
    productId,
    variation: {
      price: selectedVarPrice,
      discounted_price: selectedVarDiscount,
      variation_name: `${prodUsers}u-${prodYears}y`,
      currency_label: currencyLabel,
      region_id: regionId,
    },
  };

  setDataOnBuyLinks(dataInfo);
  maxDiscount();
}

export function getDatasetFromSection(block) {
  const parentSelector = block.closest('.section');
  return parentSelector.dataset;
}

export function getLocalizedResourceUrl(resourceName) {
  const { pathname } = window.location;
  const lastCharFromUrl = pathname.charAt(pathname.length - 1);
  const lpIsInFolder = lastCharFromUrl === '/';

  let pathnameAsArray = pathname.split('/');

  if (lpIsInFolder) {
    return `${pathnameAsArray.join('/')}${resourceName}`;
  }

  const basePathIndex = pathname.startsWith('/pages/') ? 3 : 2;
  pathnameAsArray = pathnameAsArray.slice(0, basePathIndex + 1); // "/consumer/en";

  return `${pathnameAsArray.join('/')}/${resourceName}`;
}

export function generateUuidv4() {
  // eslint-disable-next-line no-bitwise,no-mixed-operators
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
}

export function getDefaultBaseUrl() {
  return 'https://www.bitdefender.com/';
}

/**
 * Get cookie
 * @param {String} name - cookie name
 */
export function getCookie(name) {
  const cookie = {};
  document.cookie.split(';').forEach((el) => {
    const [key, value] = el.split('=');
    cookie[key.trim()] = value;
  });
  return cookie[name];
}

/**
 * Fetches geoip data from the /geoip endpoint and dispatches a custom event with the received information.
 *
 * This function makes an asynchronous call to the /geoip endpoint. If the call is successful, it parses
 * the JSON response and dispatches a custom event named 'geoipinfo' with the received data. In case of an error
 * during the fetch process, it logs the error to the console.
 */
export async function fetchGeoIP() {
  try {
    const response = await fetch('/geoip');

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    window.geoip = data;

    const event = new CustomEvent(GLOBAL_EVENTS.GEOIPINFO_LOADED, { detail: data });
    window.dispatchEvent(event);
  } catch (error) {
    console.error('Failed to fetch geoip data:', error);
  }
}

export function getOperatingSystem(userAgent) {
  const systems = [
    ['Windows NT 10.0', 'Windows 10'],
    ['Windows NT 6.2', 'Windows 8'],
    ['Windows NT 6.1', 'Windows 7'],
    ['Windows NT 6.0', 'Windows Vista'],
    ['Windows NT 5.1', 'Windows XP'],
    ['Windows NT 5.0', 'Windows 2000'],
    ['X11', 'X11'],
    ['Linux', 'Linux'],
    ['Android', 'Android'],
    ['iPhone', 'iOS'],
    ['iPod', 'iOS'],
    ['iPad', 'iOS'],
    ['Mac', 'MacOS'],
  ];

  return systems.find(([substr]) => userAgent.includes(substr))?.[1] || 'Unknown';
}

export function openUrlForOs(urlMacos, urlWindows, urlAndroid, urlIos) {
  // Get user's operating system
  const { userAgent } = navigator;
  const userOS = getOperatingSystem(userAgent);

  // Open the appropriate URL based on the OS
  let openUrl;
  switch (userOS) {
    case 'MacOS':
      openUrl = urlMacos;
      break;
    case 'Windows 10':
    case 'Windows 8':
    case 'Windows 7':
    case 'Windows Vista':
    case 'Windows XP':
    case 'Windows 2000':
      openUrl = urlWindows;
      break;
    case 'Android':
      openUrl = urlAndroid;
      break;
    case 'iOS':
      openUrl = urlIos;
      break;
    default:
      openUrl = null; // Fallback or 'Unknown' case
  }

  if (openUrl) {
    window.open(openUrl, '_self');
  }
}

// Debounce function to limit the rate at which a function is executed.
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// General function to match the height of elements based on a selector
export async function matchHeights(targetNode, selector) {
  const resetHeights = () => {
    const elements = targetNode.querySelectorAll(selector);
    elements.forEach((element) => {
      element.style.minHeight = '';
    });
  };

  const adjustHeights = () => {
    if (window.innerWidth >= 768) {
      resetHeights();
      const elements = targetNode.querySelectorAll(selector);
      const elementsHeight = Array.from(elements).map((element) => element.offsetHeight);
      const maxHeight = Math.max(...elementsHeight);

      elements.forEach((element) => {
        element.style.minHeight = `${maxHeight}px`;
      });
    } else {
      resetHeights();
    }
  };

  const matchHeightsCallback = (mutationsList) => {
    Array.from(mutationsList).forEach((mutation) => {
      if (mutation.type === 'childList') {
        adjustHeights();
      }
    });
  };

  const observer = new MutationObserver(matchHeightsCallback);
  const resizeObserver = new ResizeObserver(debounce((entries) => {
    // eslint-disable-next-line no-unused-vars
    entries.forEach((entry) => {
      adjustHeights();
    });
  }), 100);

  if (targetNode) {
    observer.observe(targetNode, { childList: true, subtree: true });
  }

  window.addEventListener('resize', () => {
    adjustHeights();
  });

  const elements = targetNode.querySelectorAll(selector);
  elements.forEach((element) => {
    resizeObserver.observe(element);
  });

  adjustHeights();
}

/**
 * /**
 * @typedef {{
 *  auds: string,
 *  [key: string]: string
 * }} CdpData
 *
 * @param {string} mcID
 * @returns {Promise<CdpData>}
*/
export async function getCdpData(mcID) {
  try {
    const cdpDataCall = await fetch(`https://www.bitdefender.com/cdp/${mcID}`);

    /** @type {{auds: string[], mdl: {key: string, value: string}[], ub: any[] vid: string}} */
    const receivedCdpData = await cdpDataCall.json();
    let cdpData = {
      auds: receivedCdpData?.auds[0] || '',
    };

    if (receivedCdpData.mdl) {
      cdpData = receivedCdpData?.mdl.reduce((acc, mdlValue) => {
        acc[mdlValue.key] = mdlValue.value;
        return acc;
      }, cdpData);
    }

    window.adobeDataLayer.push({
      event: 'cdp data',
      parameters: cdpData,
    });

    return cdpData;
  } catch (e) {
    console.warn(e);
  }

  return {};
}

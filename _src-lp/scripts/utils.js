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
  [20, { locale: 'en-es-MX', label: 'en es mexico' }],
  [21, { locale: 'en-es-CO', label: 'en es columbia' }],
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
  [42, { locale: 'en-au-CK', label: 'Cook Islands' }],
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

export function getDefaultLanguage() {
  const localisationList = ['au', 'be', 'br', 'de', 'en', 'es', 'fr', 'it', 'nl', 'pt', 'ro', 'se', 'uk', 'zh-tw'];
  const currentPathUrl = window.location.pathname;
  const foundLanguage = localisationList.find((item) => currentPathUrl.indexOf(`/${item}/`) !== -1);
  return foundLanguage || 'en';
}

export function getDefaultSection() {
  const currentPathUrl = window.location.pathname;
  return currentPathUrl.indexOf('/business/') !== -1 ? 'business' : 'consumer';
}

export const GLOBAL_EVENTS = {
  ADOBE_MC_LOADED: 'adobe_mc::loaded',
  PAGE_LOADED: 'page::loaded',
};

export function appendAdobeMcLinks(selector) {
  try {
    const visitor = Visitor.getInstance('0E920C0F53DA9E9B0A490D45@AdobeOrg', {
      trackingServer: 'sstats.bitdefender.com',
      trackingServerSecure: 'sstats.bitdefender.com',
      marketingCloudServer: 'sstats.bitdefender.com',
      marketingCloudServerSecure: 'sstats.bitdefender.com',
    });
    const wrapperSelector = document.querySelector(selector);
    const hrefSelector = '[href*=".bitdefender."]';
    wrapperSelector.querySelectorAll(hrefSelector).forEach((link) => {
      const destinationURLWithVisitorIDs = visitor.appendVisitorIDsTo(link.href);
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
    const btnElelemts = document.getElementsByClassName(buyLinkSelector);

    if (btnElelemts !== null && btnElelemts !== '') {
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
    const prodLoadBox = document.querySelectorAll(`.prodload-${pid}`);
    prodLoadBox.forEach((item) => {
      item.classList.remove('await-loader');
    });
    document.querySelectorAll('.checkboxVPN').forEach((checkbox) => {
      checkbox.removeAttribute('disabled');
    });
  }
}

export function formatPrice(price, currency, region) {
  const ianaRegionFormat = IANA_BY_REGION_MAP.get(Number(region))?.locale || 'en-US';
  return new Intl.NumberFormat(ianaRegionFormat, { style: 'currency', currency }).format(price);
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

  const maxDiscountValue = Math.max(...discountAmounts).toString();
  const maxDiscountBox = document.querySelector('.max-discount');
  if (maxDiscountBox) {
    document.querySelectorAll('.max-discount').forEach((item) => {
      item.textContent = `${maxDiscountValue}%`;
    });
    maxDiscountBox.closest('div').style.visibility = 'visible';
  }
}

// display prices
export function showPrices(storeObj, triggerVPN = false, checkboxId = '', defaultSelector = '') {
  const { currency_label: currencyLabel, currency_iso: currencyIso } = storeObj.selected_variation;
  const { region_id: regionId } = storeObj.selected_variation;
  const { selected_users: prodUsers, selected_years: prodYears } = storeObj;
  const { product_id: productId } = storeObj.config;
  const comparativeTextBox = document.querySelector('.c-top-comparative-with-text');
  const onSelectorClass = `${productId}-${prodUsers}${prodYears}`;

  let parentDiv = '';
  let buyLink = storeObj.buy_link;
  let selectedVarPrice = storeObj.selected_variation.price;
  let selectedVarDiscount = storeObj.selected_variation.discount?.discounted_price;

  const showVpnBox = document.querySelector(`.show_vpn_${productId}`);
  if (showVpnBox) {
    showVpnBox.style.display = 'none';
  }

  const storeObjVPN = StoreProducts.product.vpn;
  if (triggerVPN) {
    parentDiv = document.getElementById(checkboxId).closest('div.prod_box');
    buyLink += '&bundle_id=com.bitdefender.vpn&bundle_payment_period=10d1y';
    selectedVarPrice += storeObjVPN.selected_variation.price || 0;
    selectedVarPrice = selectedVarPrice.toFixed(2);
    if (showVpnBox) {
      showVpnBox.style.display = 'block';
    }
  }

  if (storeObj.selected_variation.discount && storeObj.selected_variation.discount?.discount_value) {
    if (triggerVPN) {
      selectedVarDiscount += storeObjVPN.selected_variation.discount.discounted_price || 0;
      selectedVarDiscount = selectedVarDiscount.toFixed(2);
    }

    const fullPrice = formatPrice(selectedVarPrice, currencyIso, regionId);
    const fullPriceMonthly = formatPrice((selectedVarPrice / 12).toFixed(2), currencyIso, regionId);
    const offerPrice = formatPrice(selectedVarDiscount, currencyIso, regionId);
    const offerPriceMonthly = formatPrice((selectedVarDiscount / 12).toFixed(2), currencyIso, regionId);
    const savingsPrice = selectedVarPrice - selectedVarDiscount;
    const savings = formatPrice(savingsPrice.toFixed(0), currencyIso, regionId);
    const percentageSticker = (((selectedVarPrice - selectedVarDiscount) / selectedVarPrice) * 100).toFixed(0);

    const oldPriceClass = `.oldprice-${onSelectorClass}`;
    if (document.querySelector(oldPriceClass)) {
      const allOldPriceBox = document.querySelectorAll(oldPriceClass);
      if (triggerVPN) {
        parentDiv.querySelector(oldPriceClass).innerHTML = fullPrice;
        if (comparativeTextBox) {
          allOldPriceBox.forEach((item) => {
            item.innerHTML = fullPrice;
          });
        }
      } else {
        allOldPriceBox.forEach((item) => {
          item.innerHTML = fullPrice;
        });
      }
    }

    const onewPriceClass = `.newprice-${onSelectorClass}`;
    if (document.querySelector(onewPriceClass)) {
      const allNewPriceBox = document.querySelectorAll(onewPriceClass);
      if (triggerVPN) {
        parentDiv.querySelector(onewPriceClass).innerHTML = offerPrice;
        if (comparativeTextBox) {
          allNewPriceBox.forEach((item) => {
            item.innerHTML = offerPrice;
          });
        }
      } else {
        allNewPriceBox.forEach((item) => {
          item.innerHTML = offerPrice;
        });
      }
    }

    const oldPriceMonthlyClass = `.oldprice-${onSelectorClass}-monthly`;
    if (document.querySelector(oldPriceMonthlyClass)) {
      const allOldPriceBox = document.querySelectorAll(oldPriceMonthlyClass);
      if (triggerVPN) {
        parentDiv.querySelector(oldPriceMonthlyClass).innerHTML = fullPriceMonthly;
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
        parentDiv.querySelector(onewPriceMonthlyClass).innerHTML = offerPriceMonthly;
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

    if (document.querySelector(`.save-${onSelectorClass}`)) {
      if (triggerVPN) {
        const parentSaveBox = parentDiv.querySelector(`.save-${onSelectorClass}`);
        parentSaveBox.innerHTML = savings;
        parentSaveBox.style.visibility = 'visible';
      } else {
        document.querySelectorAll(`.save-${onSelectorClass}`).forEach((item) => {
          item.innerHTML = savings;
          item.style.visibility = 'visible';
        });
      }
    }

    if (document.querySelector(`.percent-${onSelectorClass}`)) {
      if (triggerVPN) {
        const parentPercentBox = parentDiv.querySelector(`.percent-${onSelectorClass}`);
        parentPercentBox.innerHTML = `${percentageSticker}%`;
        parentPercentBox.parentNode.style.visibility = 'visible';
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
    const fullPrice = formatPrice(selectedVarPrice, currencyIso, regionId);
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
      }
    }

    const oldPriceBox = document.querySelector(`.oldprice-${onSelectorClass}`);
    if (oldPriceBox) {
      if (productId === 'vpn') {
        document.querySelectorAll(`.oldprice-${onSelectorClass}`).forEach((item) => {
          item.innerHTML = fullPrice;
        });
        if (oldPriceBox.parentNode.nodeName === 'P') {
          oldPriceBox.parentNode.style.display = 'none';
        }
      } else {
        oldPriceBox.style.visibility = 'hidden';
        if (oldPriceBox.closest('.prod-oldprice')) {
          oldPriceBox.closest('.prod-oldprice').style.setProperty('display', 'none', 'important');
          if (oldPriceBox.parentNode.nodeName === 'P') {
            oldPriceBox.parentNode.style.display = 'none';
          }
        }
      }
    }

    const saveBox = document.querySelector(`.save-${onSelectorClass}`);
    if (saveBox) {
      const siblingElements = saveBox.parentNode.parentNode.querySelectorAll('div');
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

  if (isZuoraForNetherlandsLangMode() && document.querySelector(`.buylink-${onSelectorClass}`)) {
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

export const DOMAIN_NAME_MAP = new Map([
  ['en', 'https://www.bitdefender.com/'],
  ['uk', 'https://www.bitdefender.co.uk/'],
  ['au', 'https://www.bitdefender.com.au/'],
  ['br', 'https://www.bitdefender.com.br/'],
]);

export function getDefaultBaseUrl() {
  const dynamicLanguage = getInstance() === 'dev' ? 'com' : getDefaultLanguage();
  const defaultHomeUrl = `https://www.bitdefender.${dynamicLanguage}/`;
  return DOMAIN_NAME_MAP.get(dynamicLanguage) || defaultHomeUrl;
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

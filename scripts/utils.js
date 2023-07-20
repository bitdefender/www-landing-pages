/**
 * Returns the instance name based on the hostname
 * @returns {String}
 */
export const instance = (() => {
  const hostToInstance = {
    'pages.bitdefender.com': 'prod',
    'hlx.page': 'stage',
    'hlx.live': 'stage',
  };

  // eslint-disable-next-line no-restricted-syntax
  for (const [host, inst] of Object.entries(hostToInstance)) {
    if (window.location.hostname.includes(host)) return inst;
  }

  return 'dev';
})();

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
export function addScript(src, data = {}, type = undefined, callback = undefined) {
  const s = document.createElement('script');

  s.setAttribute('src', src);

  if (type) {
    s.setAttribute(type, true);
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

  if (callback) {
    s.addEventListener('load', () => {
      callback();
    });
  }

  document.body.appendChild(s);
}

export function getDefaultLanguage() {
  const localisationList = ['au', 'be', 'br', 'de', 'en', 'es', 'fr', 'it', 'nl', 'pt', 'ro', 'se', 'uk'];
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
};

export function adobeMcAppendVisitorId(selector) {
  // https://experienceleague.adobe.com/docs/id-service/using/id-service-api/methods/appendvisitorid.html?lang=en
  try {
    const visitor = Visitor.getInstance('0E920C0F53DA9E9B0A490D45@AdobeOrg', {
      trackingServer: 'sstats.adobe.com',
      trackingServerSecure: 'sstats.adobe.com',
      marketingCloudServer: 'sstats.adobe.com',
      marketingCloudServerSecure: 'sstats.adobe.com',
    });
    const wrapperSelector = document.querySelector(selector);
    const hrefSelector = '[href*="bitdefender"]';
    wrapperSelector.querySelectorAll(hrefSelector).forEach((href) => {
      href.addEventListener('mousedown', (event) => {
        const destinationURLWithVisitorIDs = visitor.appendVisitorIDsTo(event.currentTarget.href);
        event.currentTarget.href = destinationURLWithVisitorIDs.replace(/MCAID%3D.*%7CMCORGID/, 'MCAID%3D%7CMCORGID');
      });
    });
  } catch (e) {
    console.error('Failed to load https://assets.adobedtm.com script, Visitor will not be defined');
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

// truncatePrice
function truncatePrice(price) {
  let ret = price;
  try {
    if (ret >= 0) {
      ret = Math.floor(ret);
    } else {
      ret = Math.ceil(ret);
    }

    if (price !== ret) {
      ret = price;
    }
  } catch (e) { console.log(e); }

  return ret;
}

// formatPrice
function formatPrice(priceVal, currency, region) {
  const price = truncatePrice(priceVal);
  const currencyPrice = [3, 4, 8, 2, 11, 12, 16];

  if (currencyPrice.includes(region)) {
    return `${currency} ${price}`;
  }

  return `${price} ${currency}`;
}

export function isZuoraForNetherlandsLangMode() {
  return getDefaultLanguage() === 'nl' && getDefaultSection() === 'consumer';
}

// showLoaderSpinner
export function showLoaderSpinner(showSpinner) {
  const prodLoadBox = document.querySelectorAll('.prodLoad');
  if (showSpinner) {
    prodLoadBox.forEach((item) => {
      item.classList.remove('awaitLoader');
    });
  } else {
    prodLoadBox.forEach((item) => {
      item.classList.add('awaitLoader');
    });
  }
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
export function showPrices(storeObj, triggerVPN = false, checkboxId = '') {
  const { currency_label: currencyLabel } = storeObj.selected_variation;
  const { region_id: regionId } = storeObj.selected_variation;
  const { product_id: productId } = storeObj.config;
  const comparativeTextBox = document.querySelector('.c-top-comparative-with-text');

  let parentDiv = '';
  let buyLink = storeObj.buy_link;
  let selectedVarPrice = storeObj.selected_variation.price;

  const showVpnBox = document.querySelector(`.show_vpn_${productId}`);
  if (showVpnBox) {
    showVpnBox.style.display = 'none';
  }

  const storeObjVPN = window.StoreProducts.product.vpn;
  if (triggerVPN) {
    parentDiv = document.getElementById(checkboxId).closest('div.prod_box');
    buyLink += '&bundle_id=com.bitdefender.vpn&bundle_payment_period=1d1y';
    selectedVarPrice += storeObjVPN.selected_variation.price || 0;
    selectedVarPrice = selectedVarPrice.toFixed(2);
    if (showVpnBox) {
      showVpnBox.style.display = 'block';
    }
  }

  if (storeObj.selected_variation.discount) {
    let selectedVarDiscount = storeObj.selected_variation.discount.discounted_price;
    if (triggerVPN) {
      selectedVarDiscount += storeObjVPN.selected_variation.discount.discounted_price || 0;
    }

    const fullPrice = formatPrice(selectedVarPrice, currencyLabel, regionId);
    const offerPrice = formatPrice(selectedVarDiscount, currencyLabel, regionId);
    const savingsPrice = selectedVarPrice - selectedVarDiscount;
    const savings = formatPrice(savingsPrice.toFixed(0), currencyLabel, regionId);
    const percentageSticker = (((selectedVarPrice - selectedVarDiscount) / selectedVarPrice) * 100).toFixed(0);

    if (document.querySelector(`.oldprice-${productId}`)) {
      const allOldPriceBox = document.querySelectorAll(`.oldprice-${productId}`);
      if (triggerVPN) {
        parentDiv.querySelector(`.oldprice-${productId}`).innerHTML = fullPrice;
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

    if (document.querySelector(`.newprice-${productId}`)) {
      const allNewPriceBox = document.querySelectorAll(`.newprice-${productId}`);
      if (triggerVPN) {
        parentDiv.querySelector(`.newprice-${productId}`).innerHTML = offerPrice;
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

    if (document.querySelector(`.save-${productId}`)) {
      if (triggerVPN) {
        const parentSaveBox = parentDiv.querySelector(`.save-${productId}`);
        parentSaveBox.innerHTML = savings;
        parentSaveBox.style.visibility = 'visible';
      } else {
        document.querySelectorAll(`.save-${productId}`).forEach((item) => {
          item.innerHTML = savings;
          item.style.visibility = 'visible';
        });
      }
    }

    if (document.querySelector(`.percent-${productId}`)) {
      if (triggerVPN) {
        const parentPercentBox = parentDiv.querySelector(`.percent-${productId}`);
        parentPercentBox.innerHTML = `${percentageSticker}%`;
        parentPercentBox.parentNode.style.visibility = 'visible';
      } else {
        document.querySelectorAll(`.percent-${productId}`).forEach((item) => {
          item.innerHTML = `${percentageSticker}%`;
          item.style.visibility = 'visible';
          item.parentNode.style.visibility = 'visible';
        });
      }
    }

    if (document.querySelector(`.bulina-${productId}`)) {
      const bulinaElement = document.querySelector(`.bulina-${productId}`);
      bulinaElement.closest('div').style.visibility = 'visible';
    }

    const showSaveBox = document.querySelector(`.show_save_${productId}`);
    if (showSaveBox) {
      showSaveBox.style.visibility = 'visible';
    }
  } else {
    const fullPrice = formatPrice(selectedVarPrice, currencyLabel, regionId);
    let vpnHasDiscount = false;
    let offerPrice = 0;
    let percentageSticker = 0;

    if (productId === 'vpn' && storeObj.selected_variation.discount) {
      vpnHasDiscount = true;
      if (storeObj.selected_variation.discount) {
        let selectedVarDiscount = storeObj.selected_variation.discount.discounted_price;
        if (triggerVPN) {
          selectedVarDiscount += storeObjVPN.selected_variation.discount.discounted_price || 0;
        }
        offerPrice = formatPrice(selectedVarDiscount, currencyLabel, regionId);
        percentageSticker = (((selectedVarPrice - selectedVarDiscount) / selectedVarPrice) * 100).toFixed(0);
      }
    }

    const newPriceBox = document.querySelector(`.newprice-${productId}`);
    if (newPriceBox) {
      newPriceBox.innerHTML = fullPrice;
      if (vpnHasDiscount) {
        document.querySelectorAll(`.newprice-${productId}`).forEach((item) => {
          item.innerHTML = offerPrice;
        });
      }
    }

    const oldPriceBox = document.querySelector(`.oldprice-${productId}`);
    if (oldPriceBox) {
      if (productId === 'vpn') {
        document.querySelectorAll(`.oldprice-${productId}`).forEach((item) => {
          item.innerHTML = fullPrice;
        });
      } else {
        oldPriceBox.style.visibility = 'hidden';
      }
    }

    const saveBox = document.querySelector(`.save-${productId}`);
    if (saveBox) {
      const siblingElements = saveBox.parentNode.parentNode.querySelectorAll('div');
      siblingElements.forEach((element) => {
        element.style.visibility = 'hidden';
      });
    }

    const percentBox = document.querySelector(`.percent-${productId}`);
    if (percentBox) {
      if (vpnHasDiscount) {
        if (triggerVPN) {
          const parentPercentBox = parentDiv.querySelector(`.percent-${productId}`);
          parentPercentBox.innerHTML = `${percentageSticker}%`;
          parentPercentBox.parentNode.style.visibility = 'visible';
        } else {
          document.querySelectorAll(`.percent-${productId}`).forEach((item) => {
            item.innerHTML = `${percentageSticker}%`;
            item.parentNode.style.visibility = 'visible';
          });
        }
      }
    }

    const showSaveBox = document.querySelector(`.show_save_${productId}`);
    if (showSaveBox) {
      showSaveBox.style.visibility = 'hidden';
    }

    const bulinaBox = document.querySelector(`.bulina-${productId}`);
    if (bulinaBox) {
      bulinaBox.parentNode.visibility = 'hidden';
    }
  }

  if (isZuoraForNetherlandsLangMode() && document.querySelector(`.buylink-${productId}`)) {
    const allBuyLinkBox = document.querySelectorAll(`.buylink-${productId}`);
    if (triggerVPN) {
      parentDiv.querySelector(`.buylink-${productId}`).href = buyLink;
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

  maxDiscount();
}

export function getDatasetFromSection(block) {
  const parentSelector = block.closest('.section');
  return parentSelector.dataset;
}

export function getLocalizedResourceUrl(resourceName) {
  const { pathname } = window.location;
  const pathnameAsArray = pathname.split('/').filter((x, i) => i <= 2); // "/consumer/en"
  return `${pathnameAsArray.join('/')}/${resourceName}`;
}

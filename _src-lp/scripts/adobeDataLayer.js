import { AdobeDataLayerService, PageLoadStartedEvent } from '@repobit/dex-data-layer';
import { User } from '@repobit/dex-utils';
import { target, getPageNameAndSections, getDefaultLanguage } from './target.js';
import page from './page.js';
import { getMetadata } from './lib-franklin.js';
import {
  GLOBAL_EVENTS, getCookie,
} from './utils.js';

/**
 * Returns the value of a query parameter
 * @returns {String}
 */
export function getParamValue(paramName) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(paramName);
}

/**
 * Sends the page load started event to the Adobe Data Layer
 */
export const sendAnalyticsPageEvent = async () => {
  const DEFAULT_LANGUAGE = getDefaultLanguage();
  window.adobeDataLayer = window.adobeDataLayer || [];
  const { pageName, sections } = getPageNameAndSections();
  const pageLoadStartedEvent = new PageLoadStartedEvent(
    page,
    {
      name: pageName,
      section: sections[0] || '',
      subSection: sections[1] || '',
      subSubSection: sections[2] || '',
      subSubSubSection: sections[3] || '',
      geoRegion: await User.country,
      serverName: 'hlx.live',
      language: navigator.language || navigator.userLanguage || DEFAULT_LANGUAGE,
    },
  );

  // send cdp data
  AdobeDataLayerService.push(pageLoadStartedEvent);
};

/**
 *
 * @param {string} subSection
 */
export const sendAnalyticsErrorEvent = async () => {
  const { subSection } = getPageNameAndSections();

  if ((subSection && subSection === '404') || window.errorCode === '404') {
    await target.configMbox; // wait for CDP data to finalize
    window.adobeDataLayer.push({ event: 'page error' });
    window.adobeDataLayer.push({ event: 'page loaded' });
    document.dispatchEvent(new Event(GLOBAL_EVENTS.PAGE_LOADED));
  }
};

/*
 * Sends the user detected event to the Adobe Data Layer
*/
export async function sendAnalyticsUserInfo() {
  window.adobeDataLayer = window.adobeDataLayer || [];
  const user = {};
  user.loggedIN = 'false';
  user.emarsysID = getParamValue('ems-uid') || getParamValue('sc_uid') || undefined;

  let userID;
  try {
    userID = (typeof localStorage !== 'undefined' && localStorage.getItem('rhvID')) || getParamValue('sc_customer') || getCookie('bdcsufp') || undefined;
  } catch (e) {
    if (e instanceof DOMException) {
      userID = getParamValue('sc_customer') || getCookie('bdcsufp') || undefined;
    } else {
      throw e;
    }
  }

  user.ID = userID;
  user.productFinding = 'campaign page';

  if (typeof user.ID !== 'undefined') {
    user.loggedIN = 'true';
  } else {
    const headers = new Headers({
      'Content-Type': 'application/x-www-form-urlencoded',
      Pragma: 'no-cache',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      Expires: 'Tue, 01 Jan 1971 02:00:00 GMT',
      BDUS_A312C09A2666456D9F2B2AA5D6B463D6: 'check.bitdefender',
    });

    const currentUrl = new URL(window.location.href);
    const queryParams = currentUrl.searchParams;
    const apiUrl = `https://www.bitdefender.com/site/Main/dummyPost?${Math.random()}`;
    const apiWithParams = new URL(apiUrl);
    queryParams.forEach((value, key) => {
      apiWithParams.searchParams.append(key, value);
    });

    try {
      const response = await fetch(apiWithParams, {
        method: 'POST',
        headers,
      });

      if (response.ok) {
        const rhv = response.headers.get('BDUSRH_8D053E77FD604F168345E0F77318E993');
        if (rhv !== null) {
          localStorage.setItem('rhvID', rhv);
          user.ID = rhv;
          user.loggedIN = 'true';
        }
      }
    } catch (error) {
      // console.error('Fetch failed:', error);
    }
  }

  // Remove properties that are undefined
  Object.keys(user).forEach((key) => user[key] === undefined && delete user[key]);

  window.adobeDataLayer.push({
    event: 'user detected',
    user,
  });
}

const productsInAdobe = [];

export async function sendAnalyticsProducts(product, region) {
  const productID = product.selected_variation.product_id;
  let initCount = StoreProducts.initCount;
  let productName = StoreProducts.product[productID].product_name;
  if (region && region === 'nl') {
    initCount = window.productsListCount;
    productName = product.config.name;
  }

  let discountVal = 0;
  if (product.selected_variation.discount) {
    discountVal = product.selected_variation.discount?.discounted_price;
  }

  productsInAdobe.push({
    ID: product.selected_variation.platform_product_id || product.platformProductID || product.product_id,
    name: productName,
    devices: product.selected_users,
    subscription: product.selected_years * 12,
    version: '',
    basePrice: product.selected_variation.price,
    discountValue: Math.round((product.selected_variation.price - discountVal) * 100) / 100,
    discountRate: Math.round(((product.selected_variation.price - discountVal) * 100) / product.selected_variation.price).toString(),
    currency: product.selected_variation.currency_iso,
    priceWithTax: discountVal,
  });

  if (productsInAdobe.length === initCount) {
    window.adobeDataLayer.push({
      event: 'campaign product',
      product: { info: productsInAdobe },
    });

    window.adobeDataLayer.push({
      event: 'page loaded',
    });
    document.dispatchEvent(new Event(GLOBAL_EVENTS.PAGE_LOADED));
  }
}

export async function sendAnalyticsPageLoadedEvent(force = false) {
  if (!Array.isArray(window.adobeDataLayer)) {
    return;
  }

  const hasPageLoadedEvent = window.adobeDataLayer.some((obj) => obj.event === 'page loaded');
  if (hasPageLoadedEvent) {
    return;
  }

  if ((typeof StoreProducts !== 'undefined' && StoreProducts.initCount === 0) || getMetadata('free-product') || force) {
    window.adobeDataLayer.push({ event: 'page loaded' });
    document.dispatchEvent(new Event(GLOBAL_EVENTS.PAGE_LOADED));
  }
}

export async function sendTrialDownloadedEvent() {
  // get every section that has the data-trial-downloaded attribute
  const sections = document.querySelectorAll('[data-trial-download]');
  // select the first button from each section
  sections.forEach((section) => {
    const button = section.querySelector('.button-container a');
    button.addEventListener('click', () => {
      // push the event to the data layer only if the event is not already pushed
      if (!window.adobeDataLayer.some((obj) => obj.event === 'trial downloaded')) {
        const trialEvent = {
          event: 'trial downloaded',
          product: {
            trial: [
              {
                ID: getMetadata('free-product'),
              },
            ],
          },
        };
        window.adobeDataLayer.push(trialEvent);
      }
    });
  });
}

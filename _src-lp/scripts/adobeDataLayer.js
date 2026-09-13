import {
  AdobeDataLayerService, CdpEvent, PageLoadedEvent, PageLoadStartedEvent,
} from '@repobit/dex-data-layer';
import userPromise from './user.js';
import { targetPromise, getPageNameAndSections, getDefaultLanguage } from './target.js';
import pagePromise from './page.js';
import { getMetadata } from './lib-franklin.js';
import {
  GLOBAL_EVENTS, getCookie,
  productsList,
} from './utils.js';

const page = await pagePromise;
const target = await targetPromise;
const userObject = await userPromise;
/**
 * Sends the page load started event to the Adobe Data Layer
 */
export const sendAnalyticsPageEvent = async () => {
  const DEFAULT_LANGUAGE = getDefaultLanguage();
  window.adobeDataLayer = window.adobeDataLayer || [];
  const { pageName, sections } = await getPageNameAndSections();
  const pageLoadStartedEvent = new PageLoadStartedEvent(
    page,
    {
      name: pageName,
      section: sections[0] || '',
      subSection: sections[1] || '',
      subSubSection: sections[2] || '',
      subSubSubSection: sections[3] || '',
      geoRegion: await userObject.country,
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
  const { subSection } = await getPageNameAndSections();

  if ((subSection && subSection === '404') || window.errorCode === '404') {
    const cdpData = await target.cdpData; // wait for CDP data to finalize
    if (cdpData) {
      AdobeDataLayerService.push(new CdpEvent(cdpData));
    }
    window.adobeDataLayer.push({ event: 'page error' });
    AdobeDataLayerService.push(new PageLoadedEvent());
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
  user.emarsysID = page.getParamValue('ems-uid') || page.getParamValue('sc_uid') || undefined;

  let userID;
  try {
    userID = (typeof localStorage !== 'undefined' && localStorage.getItem('rhvID')) || page.getParamValue('sc_customer') || getCookie('bdcsufp') || undefined;
  } catch (e) {
    if (e instanceof DOMException) {
      userID = page.getParamValue('sc_customer') || getCookie('bdcsufp') || undefined;
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

  // TODO: uncomment this after consent is given
  // user.visitorID = await getUserVisitorId() || undefined;

  // Remove properties that are undefined
  Object.keys(user).forEach((key) => user[key] === undefined && delete user[key]);

  window?.adobeDataLayer.push({
    event: 'user detected',
    user,
  });
}

const analyticsProducts = [];
const productsInAdobe = [];
let switcherListenerInitialized = false;

const isProductVisible = (productAlias) => {
  const productElement = document
    .querySelector(`[class*="prodload-${productAlias}-"]`)
    ?.closest('.prod_box');

  return (
    !productElement
    || window.getComputedStyle(productElement).display !== 'none'
  );
};

const getVisibleProducts = () => productsInAdobe.filter(Boolean).map(({ productAlias, ...product }) => product);

const pushCampaignProduct = () => {
  const campaignProduct = window.adobeDataLayer.find(
    (item) => item?.event === 'campaign product',
  );

  const info = getVisibleProducts();

  if (campaignProduct) {
    campaignProduct.product.info = info;
  } else {
    window.adobeDataLayer.push({
      event: 'campaign product',
      product: { info },
    });
  }
};

const buildAdobeProduct = (product, region) => {
  const productID = product.selected_variation.product_id;
  const productData = StoreProducts.product[productID];

  let productName = productData.product_name;

  if (productData.product_alias.includes('_f')) {
    productName = productName.replace(' Individual', ' Family');
  }

  if (region === 'nl') {
    productName = product.config.name;
  }

  const price = product.selected_variation.price;
  const discountVal = product.selected_variation.discount?.discounted_price || 0;

  return {
    ID: product.selected_variation.platform_product_id
      || product.platformProductID
      || product.product_id,
    name: productName,
    devices: product.selected_users,
    subscription: product.selected_years * 12,
    version: '',
    basePrice: price,
    discountValue: Math.round((price - discountVal) * 100) / 100,
    discountRate: Math.round(
      ((price - discountVal) * 100) / price,
    ).toString(),
    currency: product.selected_variation.currency_iso,
    grossPrice: discountVal,
    discountCoupon: product.campaignType
      ? `${product.campaignType}|${product.campaign}`
      : (product.campaign || product?.config?.extra_params?.pid || ''),
    productAlias: productData.product_alias,
  };
};

const refreshAdobeProducts = () => {
  productsInAdobe.length = 0;

  analyticsProducts.forEach(({ product, region }) => {
    if (!product) {
      return;
    }

    const adobeProduct = buildAdobeProduct(product, region);

    if (
      isProductVisible(adobeProduct.productAlias)
      && !productsInAdobe.some((item) => item?.ID === adobeProduct.ID)
    ) {
      productsInAdobe.push(adobeProduct);
    }
  });

  pushCampaignProduct();
};

const initSwitcherListener = () => {
  if (switcherListenerInitialized) {
    return;
  }

  const switchCheckbox = document.getElementById('switchCheckbox');

  if (!switchCheckbox) {
    return;
  }

  switcherListenerInitialized = true;

  switchCheckbox.addEventListener('change', () => {
    requestAnimationFrame(() => {
      refreshAdobeProducts();
    });
  });
};

export async function sendAnalyticsProducts(product, region) {
  let initCount = StoreProducts.initCount;

  if (!product) {
    productsInAdobe.push(product);
  } else {
    analyticsProducts.push({ product, region });

    const productID = product.selected_variation.product_id;
    const productData = StoreProducts.product[productID];

    if (region === 'nl') {
      initCount = window.productsListCount;
    }

    const adobeProduct = buildAdobeProduct(product, region);

    const isDuplicate = productsInAdobe.some(
      (item) => item?.ID === adobeProduct.ID,
    );

    if (isProductVisible(productData.product_alias) && !isDuplicate) {
      productsInAdobe.push(adobeProduct);
    } else {
      productsInAdobe.push(false);
    }
  }

  initSwitcherListener();

  if (
    productsInAdobe.length === initCount
    && (
      getMetadata('allowdatracking')
      || !(getMetadata('trialbuylinks') || window.trialLinksExist)
    )
  ) {
    pushCampaignProduct();

    const cdpData = await target.cdpData;

    if (cdpData) {
      AdobeDataLayerService.push(new CdpEvent(cdpData));
    }

    AdobeDataLayerService.push(new PageLoadedEvent());
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

  if (
    (typeof StoreProducts === 'undefined' && !productsList.length)
    || (typeof StoreProducts !== 'undefined' && StoreProducts.initCount === 0)
    || getMetadata('free-product')
    || (getMetadata('trialbuylinks') && !getMetadata('allowdatatracking'))
    || force) {
    const cdpData = await target.cdpData; // wait for CDP data to finalize
    if (cdpData) {
      AdobeDataLayerService.push(new CdpEvent(cdpData));
    }
    AdobeDataLayerService.push(new PageLoadedEvent());
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

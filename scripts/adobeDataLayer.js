import { getDefaultLanguage, getInstance } from './utils.js';

/**
 * Formats a number to have 2 digits
 * @returns {String}
 */
const formatNumber = (num) => String(num).padStart(2, '0');

/**
 * Returns the page name and sections based on the current URL
 * @returns {Object}
 */
function getPageNameAndSections() {
  const DEFAULT_LANGUAGE = getDefaultLanguage();

  const pageSectionParts = window.location.pathname.split('/').filter((subPath) => subPath !== '');
  const subSubSection = pageSectionParts[0];

  pageSectionParts[0] = DEFAULT_LANGUAGE === 'en' ? 'us' : DEFAULT_LANGUAGE;

  try {
    if (pageSectionParts[1].length === 2) pageSectionParts[1] = 'offers'; // landing pages

    pageSectionParts.splice(2, 0, subSubSection);

    const pageName = pageSectionParts.join(':') || 'Home';
    return {
      pageName,
      sections: pageSectionParts,
    };
  } catch (e) {
    return {
      pageName: 'us:404',
      section: 'us',
      subSection: '404',
    };
  }
}

/**
 * Returns the value of a query parameter
 * @returns {String}
 */
export function getParamValue(paramName) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(paramName);
}

/**
 * Returns the current user operating system
 * @returns {String}
 */
const operatingSystem = (() => {
  const { userAgent } = window.navigator;
  const systems = [
    ['Windows NT 10.0', 'Windows 10'],
    ['Windows NT 6.2', 'Windows 8'],
    ['Windows NT 6.1', 'Windows 7'],
    ['Windows NT 6.0', 'Windows Vista'],
    ['Windows NT 5.1', 'Windows XP'],
    ['Windows NT 5.0', 'Windows 2000'],
    ['X11', 'X11'],
    ['Mac', 'MacOS'],
    ['Linux', 'Linux'],
    ['Android', 'Android'],
    ['like Mac', 'iOS'],
  ];

  // eslint-disable-next-line no-restricted-syntax
  for (const [substr, name] of systems) {
    if (userAgent.includes(substr)) return name;
  }
  return 'Unknown';
})();

/**
 * Returns the current user time in the format HH:MM|HH:00-HH:59|dayOfWeek|timezone
 * @returns {String}
 */
const formatUserTime = (() => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const date = new Date();
  const hours = formatNumber(date.getHours());
  const minutes = formatNumber(date.getMinutes());
  const dayOfWeek = days[date.getDay()];
  const timezoneOffsetInHours = -date.getTimezoneOffset() / 60;
  const timezone = `gmt ${timezoneOffsetInHours >= 0 ? '+' : ''}${timezoneOffsetInHours}`;

  return `${hours}:${minutes}|${hours}:00-${hours}:59|${dayOfWeek}|${timezone}`;
})();

/**
 * Returns the current GMT date in the format DD/MM/YYYY
 * @returns {String}
 */
const currentGMTDate = (() => {
  const date = new Date();
  const day = formatNumber(date.getUTCDate());
  const month = formatNumber(date.getUTCMonth() + 1);
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
})();

/**
 * Sends the page load started event to the Adobe Data Layer
 */
export const sendAnalyticsPageEvent = async () => {
  const DEFAULT_LANGUAGE = getDefaultLanguage();
  window.adobeDataLayer = window.adobeDataLayer || [];

  const { pageName, sections, subSection } = getPageNameAndSections();

  window.adobeDataLayer.push({
    event: 'page load started',
    pageInstanceID: getInstance(),
    page: {
      info: {
        name: pageName,
        section: sections[0] || '',
        subSection: sections[1] || '',
        subSubSection: sections[2] || '',
        subSubSubSection: sections[3] || '',
        destinationURL: window.location.href,
        queryString: window.location.search,
        referringURL: getParamValue('ref') || getParamValue('adobe_mc') || document.referrer || '',
        serverName: 'hlx.live',
        language: navigator.language || navigator.userLanguage || DEFAULT_LANGUAGE,
        // geoRegion: await getIpCountry(), // TODO: uncomment when we have a way to get the user country
        sysEnv: operatingSystem,
      },
      attributes: {
        promotionID: getParamValue('pid') || '',
        internalPromotionID: getParamValue('icid') || '',
        trackingID: getParamValue('cid') || '',
        time: formatUserTime,
        date: currentGMTDate,
        domain: window.location.hostname,
        domainPeriod: window.location.hostname.split('.').length,
      },
    },
  });

  if (subSection && subSection === '404') {
    window.adobeDataLayer.push({ event: 'page error' });
    window.adobeDataLayer.push({ event: 'page loaded' });
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
  user.ID = localStorage.getItem('rhvID') || getParamValue('sc_customer') || undefined;
  user.productFinding = 'campaign page';

  if (typeof user.ID !== 'undefined') {
    user.loggedIN = 'true';
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
  // console.log(product)
  const productID = product.selected_variation.product_id;
  let initCount = StoreProducts.initCount;
  let productName = StoreProducts.product[productID].product_name;
  if (region && region === 'nl') {
    initCount = window.productsListCount;
    productName = product.config.name;
  }

  productsInAdobe.push({
    info: {
      ID: product.selected_variation.platform_product_id,
      name: productName,
      devices: product.selected_users,
      subscription: product.selected_years * 12,
      version: '',
      basePrice: product.selected_variation.price,
      discountValue: Math.round((product.selected_variation.price - product.selected_variation.discount.discounted_price) * 100) / 100,
      discountRate: Math.round(((product.selected_variation.price - product.selected_variation.discount.discounted_price) * 100) / product.selected_variation.price).toString(),
      currency: product.selected_variation.currency_iso,
      priceWithTax: product.selected_variation.discount.discounted_price,
    },
  });

  if (productsInAdobe.length === initCount) {
    window.adobeDataLayer.push({
      event: 'campaign product',
      product: productsInAdobe,
    });

    window.adobeDataLayer.push({
      event: 'page loaded',
    });
  }
}

export async function sendAnalyticsPageLoadedEvent() {
  if (!Array.isArray(window.adobeDataLayer)) {
    return;
  }

  const hasPageLoadedEvent = window.adobeDataLayer.some((obj) => obj.event === 'page loaded');
  if (hasPageLoadedEvent) {
    return;
  }

  if (typeof StoreProducts !== 'undefined' && StoreProducts.initCount === 0) {
    window.adobeDataLayer.push({ event: 'page loaded' });
  }
}

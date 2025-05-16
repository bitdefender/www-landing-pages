/* eslint-disable camelcase */
import { Page } from '@repobit/dex-utils';
import Constants from './constants.js';

export class Locale {
  constructor(async_param) {
    if (typeof async_param === 'undefined') {
      throw new Error('Cannot be called directly');
    }
  }

  static getParamFromUrl(value) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(value);
  }

  static async get() {
    try {
      // Check locale in url param
      const paramLocale = this.getParamFromUrl('locale');
      if (paramLocale) return paramLocale;

      // Check locale in localStorage
      const cachedGeoData = localStorage.getItem(Constants.TGT_GEO_OBJ);
      let country;
      let locale = 'en-us'; // Default

      if (cachedGeoData) {
        const geoData = JSON.parse(cachedGeoData);
        country = geoData[Constants.TGT_GEO_OBJ_KEY];
      } else {
        // Check if country is already cached in localStorage
        const cachedCountry = localStorage.getItem(Constants.COUNTRY);

        if (cachedCountry) {
          country = cachedCountry;
        } else {
          // Fetch country information from the endpoint
          const response = await fetch(Constants.GEOIP_ENDPOINT);
          if (!response.ok) {
            console.error(`Failed to fetch geo data: ${response.statusText}`);
            return locale; // Return default locale in case of error
          }
          const data = await response.json();
          country = data.country;

          // Cache the country in localStorage
          localStorage.setItem(Constants.COUNTRY, country);
        }
      }

      // Fetch locale based on the country
      const localeResponse = await fetch(`${Constants.API_BASE}${Constants.API_ROOT}/countries/${country}/locales`);
      if (!localeResponse.ok) {
        console.error(`Failed to fetch locales: ${localeResponse.statusText}`);
        return locale; // Return default locale in case of error
      }
      const localeData = await localeResponse.json();
      if (localeData.length && localeData[0]?.locale) {
        locale = localeData[0].locale;
      }

      return locale;
    } catch (error) {
      console.error('Error fetching locale:', error);
      return 'en-us'; // Return default locale in case of any other error
    }
  }
}

/**
 * Returns the environment based on the hostname
 * @returns {String}
 */
const getEnvironment = () => {
  const hostToInstance = {
    'bitdefender.com': 'prod',
    'hlx.page': 'dev',
    'hlx.live': 'dev',
  };

  // eslint-disable-next-line no-restricted-syntax
  for (const [host, inst] of Object.entries(hostToInstance)) {
    if (window.location.hostname.includes(host)) return inst;
  }

  return 'dev';
};

/**
 * @returns {string} page name
 */
const getPageName = () => window.location.pathname.split('/').filter(Boolean).pop();

export default new Page(await Locale.get(), getPageName(), getEnvironment());

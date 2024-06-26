
const LOCALE_PARAMETER = 'locale';
const API_BASE = 'https://www.bitdefender.com';
const API_ROOT = '/p-api/v1';
const GEOIP_ENDPOINT = 'https://www.bitdefender.com/geoip';
const COUNTRY = 'bd:country';
const TGT_GEO_OBJ = 'tgt:-424784351:h';
const TGT_GEO_OBJ_KEY = 'x-geo-country-code';

export default class ProductPrice {

  #productId = {
    av: 'com.bitdefender.cl.av',
    is: 'com.bitdefender.cl.is',
    tsmd: 'com.bitdefender.cl.tsmd',
    fp: 'com.bitdefender.fp',
    ps: 'com.bitdefender.premiumsecurity',
    psm: 'com.bitdefender.premiumsecurity',
    psp: 'com.bitdefender.premiumsecurityplus',
    pspm: 'com.bitdefender.premiumsecurityplus',
    soho: 'com.bitdefender.soho',
    mac: 'com.bitdefender.avformac',
    vpn: 'com.bitdefender.vpn',
    'vpn-monthly': 'com.bitdefender.vpn',
    pass: 'com.bitdefender.passwordmanager',
    passm: 'com.bitdefender.passwordmanager',
    pass_sp: 'com.bitdefender.passwordmanager',
    pass_spm: 'com.bitdefender.passwordmanager',
    bms: 'com.bitdefender.bms',
    mobile: 'com.bitdefender.bms',
    ios: 'com.bitdefender.iosprotection',
    mobileios: 'com.bitdefender.iosprotection',
    dip: 'com.bitdefender.dataprivacy',
    dipm: 'com.bitdefender.dataprivacy',
  }

  #locale;
  #campaign;
  #prodString;
  #alias;
  #devicesNo;
  #yearsNo;
  #bundleId;
  initCount;

  constructor(productString, campaign) {
    this.#prodString = productString;
    const prod = this.#prodString.split('/');
    this.#alias = prod[0];
    this.#devicesNo = prod[1];
    this.#yearsNo = prod[2];
    this.#bundleId = this.#productId[this.#alias];
    this.#campaign = campaign;

    const urlParams = new URLSearchParams(window.location.search);
    let forceLocale = urlParams.get(LOCALE_PARAMETER);

    if (forceLocale)
      this.#locale = forceLocale;

    /**
    * Legacy connection to StoreProducts
    */
    if (typeof window.StoreProducts === 'undefined' || window.StoreProducts === null) {
      window.StoreProducts = [];
    }

    if (typeof window.StoreProducts.initCount === 'undefined' || window.StoreProducts.initCount === null) {
      window.StoreProducts.initCount = 0;
    }

    this.initCount = ++window.StoreProducts.initCount;
  }

  async #getProductVariations() {

    if (!this.#locale)
      this.#locale = await Locale.get();

    const endpoint = new URL(`${API_ROOT}/products/${this.#bundleId}/locale/${this.#locale}`, API_BASE);

    if (this.#campaign) {
      endpoint.pathname += `/campaign/${this.#campaign}`;
    }

    try {
      const response = await fetch(
        endpoint.href,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async #getProductVariationsPrice() {

    let payload = await this.#getProductVariations();

    if (!payload || payload.length === 0) {
      return null;
    }

    payload.product.options.forEach((option) => {

      // TODO: remove this
      if (this.#alias == 'vpn')
        option.slots = 10;

      if (this.#devicesNo != option.slots) {
        return;
      }

      if (this.#yearsNo != option.months / 12) {
        return;
      }

      const pricing = {};
      pricing.total = option.price;
      pricing.discount = option.discountAmount;
      pricing.price = option.discountedPrice;
      const decorator = new DecorateLink(option.buyLink, this.#campaign);
      let buy_link = decorator.getFullyDecoratedUrl();

      window.StoreProducts.product[this.#alias] = {
        product_alias: this.#alias,
        product_id: this.#productId[this.#alias],
        product_name: payload.product.productName,
        campaign: this.#campaign,
        locale: this.#locale,
        variations: {},
        selected_users: this.#devicesNo,
        selected_years: this.#yearsNo,
        selected_variation: {
          product_id: this.#alias,
          region_id: 22,
          variation_id: 0,
          platform_id: 16,
          price: pricing.total,
          variation: {
            years: this.#yearsNo,
          },
          currency_label: this.#getCurrencySymbol(this.#locale, option.currency),
          currency_iso: option.currency,
          discount: {
            discounted_price: pricing.price,
            discount_value: pricing.discount,
          },
          promotion: this.#campaign,
        },
        buy_link: buy_link,
        config: {
          product_id: this.#alias,
          name: payload.product.name,
          full_price_class: `oldprice-${this.#alias}`,
          discounted_price_class: `newprice-${this.#alias}`,
          price_class: `price-${this.#alias}`,
          buy_class: `buylink-${this.#alias}`,
          selected_users: this.#devicesNo,
          selected_years: this.#yearsNo,
          users_class: `users_${this.#alias}_fake`,
          years_class: `years_${this.#alias}_fake`,
        },
      };
    });

    return window.StoreProducts.product[this.#alias];
  }

  #getCurrencySymbol(locale, currency) {
    return (0).toLocaleString(
      locale,
      {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }
    ).replace(/\d/g, '').trim()
  }

  async getPrices() {
    window.StoreProducts = window.StoreProducts || [];
    window.StoreProducts.product = window.StoreProducts.product || {};
    return await this.#getProductVariationsPrice(this.id, this.#campaign);
  }

}

export class Bundle {

  #product;
  #bundleProduct;
  #locale = 'en-us';
  #campaign;

  constructor(product, bundleProduct) {
    this.#product = product;
    this.#bundleProduct = bundleProduct;
    this.#locale = product.locale;
    this.#campaign = product.campaign;
  }

  async getBuyLink() {
    const endpoint = new URL(`${API_ROOT}/buy-links/locale/${this.#locale}`, API_BASE);
    endpoint.searchParams.append('campaign', this.#campaign);

    const productMonths = this.#product.selected_years * 12;
    const bundleProductMonths = this.#bundleProduct.selected_years * 12;

    // TODO: remove this
    if (this.#bundleProduct.product_id == 'com.bitdefender.vpn')
      this.#bundleProduct.selected_users = 1;

    let bundles = `${this.#product.product_id}|${this.#product.selected_users}|${productMonths},`;
    bundles += `${this.#bundleProduct.product_id}|${this.#bundleProduct.selected_users}|${bundleProductMonths},`;
    endpoint.searchParams.append('bundles', bundles);

    try {
      const response = await fetch(
        endpoint.href,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  }

}

export class Locale {
  constructor(async_param) {
    if (typeof async_param === 'undefined') {
      throw new Error('Cannot be called directly');
    }
  }

  static async get() {
    try {
      // Extract language from URL
      const url = window.location.href;
      const language = url.split('/')[5];

      // Check for the target variable in localStorage
      const cachedGeoData = localStorage.getItem(TGT_GEO_OBJ);
      let country;

      if (cachedGeoData) {
        const geoData = JSON.parse(cachedGeoData);
        country = geoData[TGT_GEO_OBJ_KEY];
      } else {
        // Check if country is already cached in localStorage
        const cachedCountry = localStorage.getItem(COUNTRY);

        if (cachedCountry) {
          country = cachedCountry;
        } else {
          // Fetch country information from the endpoint
          const response = await fetch(GEOIP_ENDPOINT);
          const data = await response.json();
          country = data.country;

          // Cache the country in localStorage
          localStorage.setItem(COUNTRY, country);
        }
      }

      // Construct the locale string
      const locale = `${language}-${country}`;
      return locale;
    } catch (error) {
      console.error('Error fetching locale:', error);
      return null;
    }
  }
}

export class DecorateLink {
  #link;
  #urlObj;
  #params;
  #campaign;

  constructor(buyLink, campaign = '') {
    if (!buyLink || typeof buyLink !== 'string') {
      throw new Error('A valid buy link must be provided.');
    }
    this.#link = buyLink;
    this.#urlObj = new URL(this.#link);
    this.#params = new URLSearchParams(this.#urlObj.search);
    this.#campaign = campaign;
  }

  /**
   * Adds the current page path as SHOPURL parameter if not already present.
   */
  #addSHOPURL() {
    if (!this.#params.has('SHOPURL')) {
      const currentPagePath = window.location.pathname;
      this.#params.append('SHOPURL', encodeURIComponent(currentPagePath));
    }
  }

  /**
   * Adds the SRC parameter based on the current page URL or channel if specified.
   */
  #addSRC() {
    const urlParams = new URLSearchParams(window.location.search);
    let channel = urlParams.get('channel');
    if (this.#campaign)
      channel = `${channel}_${this.#campaign}`;
    const currentPageUrl = channel || window.location.href;

    if (!this.#params.has('SRC')) {
      this.#params.append('SRC', encodeURIComponent(currentPageUrl));
    }
  }

  #cleanSection() {
    if (this.#params.has('section')) {
      this.#params.set('section', this.#extractSection(window.adobeDataLayer));
    }
  }

  #extractSection(adobeDataLayer) {
    for (const item of adobeDataLayer) {
      if (item.page && item.page.info && item.page.info.section) {
        return item.page.info.section;
      }
    }
    return null;
  }

  /**
   * Returns the fully decorated URL with all necessary parameters added.
   * @returns {string} Fully decorated URL.
   */
  getFullyDecoratedUrl() {
    this.#addSHOPURL();
    this.#addSRC();
    this.#cleanSection();
    this.#urlObj.search = this.#params.toString();
    return this.#urlObj.toString();
  }
}
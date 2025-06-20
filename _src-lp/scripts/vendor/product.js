import { targetPromise } from '../target.js';
import Constants from '../constants.js';
import pagePromise from '../page.js';

const target = await targetPromise;
const page = await pagePromise;
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
    ts_i: "com.bitdefender.tsmd.v2",
    ts_f: "com.bitdefender.tsmd.v2",
    ps_i: "com.bitdefender.premiumsecurity.v2",
    ps_f: "com.bitdefender.premiumsecurity.v2",
    us_i: "com.bitdefender.ultimatesecurityeu.v2",
    us_i_m: "com.bitdefender.ultimatesecurityeu.v2",
    us_f: "com.bitdefender.ultimatesecurityeu.v2",
    us_f_m: "com.bitdefender.ultimatesecurityeu.v2",
    us_pi: "com.bitdefender.ultimatesecurityus.v2",
    us_pi_m: "com.bitdefender.ultimatesecurityus.v2",
    us_pf: "com.bitdefender.ultimatesecurityus.v2",
    us_pf_m: "com.bitdefender.ultimatesecurityus.v2",
    us_pie: "com.bitdefender.ultimatesecurityplusus.v2",
    us_pie_m: "com.bitdefender.ultimatesecurityplusus.v2",
    us_pfe: "com.bitdefender.ultimatesecurityplusus.v2",
    us_pfe_m: "com.bitdefender.ultimatesecurityplusus.v2",
    avpm: "com.bitdefender.cl.avplus.v2",
    ultsec: "com.bitdefender.ultimatesecurityus",
    secpass: "com.bitdefender.securepass",
    secpassm: "com.bitdefender.securepass",
    vsb: "com.bitdefender.vsb",
    vsbm: "com.bitdefender.vsb",
    sc: "com.bitdefender.ccp",
    scm: "com.bitdefender.ccp",
  }

  #locale;
  #campaign;
  #campaignType;
  #prodString;
  #alias;
  #devicesNo;
  #yearsNo;
  #bundleId;
  initCount;
  #targetBuyLinks;

  constructor(productString, campaign, targetBuyLinks) {
    this.#prodString = productString;
    const prod = this.#prodString.split('/');
    this.#alias = prod[0];
    this.#devicesNo = prod[1];
    this.#yearsNo = prod[2];
    this.#bundleId = this.#productId[this.#alias];
    this.#campaign = campaign;
    this.#targetBuyLinks = targetBuyLinks;
    let forceLocale = page.getParamValue(Constants.LOCALE_PARAMETER);

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
      this.#locale = page.locale;

    const endpoint = new URL(`${Constants.API_ROOT}/products/${this.#bundleId}/locale/${this.#locale}`, 'https://pricing.service-delivery.nmbapp.net');

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

  #appendOptionIfMissing(baseElement, targetSelector, value) {
    // Check if the option already exists in the given base element.
    if (!baseElement.querySelector(`option[value="${value}"]`)) {
      // Get all elements that match the target selector.
      document.querySelectorAll(targetSelector).forEach(element => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        element.appendChild(option);
      });
    }
  }

  #generateVariationObject(payload, option, buy_link) {
    return {
      selected_users: this.#devicesNo,
      selected_years: this.#yearsNo,
      currencyLocale: payload.currencyLocale,
      selected_variation: {
        product_id: this.#alias,
        region_id: this.#locale === 'en-us' ? 8 : 22,
        variation_id: 0,
        platform_id: 16,
        price: option.price,
        variation: {
          years: this.#yearsNo,
        },
        currency_label: this.#getCurrencySymbol(this.#locale, option.currency),
        currency_iso: option.currency,
        discount: {
          discounted_price: option.discountedPrice,
          discount_value: option.discountAmount,
        },
        promotion: this.#campaign,
      },
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
      buy_link: buy_link,
    }
  }

  async #getProductVariationsPrice() {
    let payload = await this.#getProductVariations();

    if (!payload || payload.length === 0) {
      return null;
    }

    if (payload.campaign) {
      this.#campaign = payload.campaign;
    }

    if (payload.campaignType) {
      this.#campaignType = payload.campaignType;
    }

    const allOptions = payload.product.options.map(async (option) => {
      // if the product is already added, skip
      // if (window.StoreProducts?.product?.[this.#alias]) return;
      if (this.#alias == 'vpn') option.slots = 10;

      if (this.#devicesNo != option.slots) return;

      if (this.#yearsNo != Math.ceil(option.months / 12)) return;

      if (Constants.MONTHLY_PRODUCTS.includes(this.#alias) && option.months > 1) return;

      if (!Constants.MONTHLY_PRODUCTS.includes(this.#alias) && option.months < 12) return;

      const fakeDevicesSelector = document.getElementById(`u_${this.#alias}-${this.#devicesNo}${this.#yearsNo}`);
      const fakeYearsSelector = document.getElementById(`y_${this.#alias}-${this.#devicesNo}${this.#yearsNo}`);
      const decorator = new DecorateLink(
        this.#targetBuyLinks?.[this.#alias]?.[`${this.#devicesNo}-${this.#yearsNo}`]?.buyLink
          || option.buyLink,
        this.#campaign
      );
      let buy_link = await decorator.getFullyDecoratedUrl();

      if (window.StoreProducts?.product) {
        const alreadyAdded = Object.values(window.StoreProducts.product).some(value =>
          value.product_alias === this.#alias
          && value.variations?.[option.slots]?.[Math.ceil(option.months / 12)]
        );
        if (alreadyAdded) return;

        const alreadyExistingProduct = Object.values(window.StoreProducts.product).find(value =>
          value.product_alias === this.#alias
        );

        if (alreadyExistingProduct) {
          alreadyExistingProduct.variations[this.#devicesNo] = {
            ...(alreadyExistingProduct.variations[this.#devicesNo] || {}),
            [this.#yearsNo]: this.#generateVariationObject(payload, option, buy_link)
          }

          this.#appendOptionIfMissing(fakeDevicesSelector, `.users_${this.#alias}`, this.#devicesNo);
          this.#appendOptionIfMissing(fakeYearsSelector, `.years_${this.#alias}`, this.#yearsNo);

          return;
        }
      }

      const pricing = {};
      pricing.total = option.price;
      pricing.discount = option.discountAmount;
      pricing.price = option.discountedPrice;

      window.StoreProducts.product[this.#alias] = {
        period: option.months,
        product_alias: this.#alias,
        product_id: this.#productId[this.#alias],
        product_name: payload.product.productName,
        campaign: this.#campaign,
        campaignType: this.#campaignType,
        locale: this.#locale,
        currencyLocale: payload.currencyLocale,
        platformProductID: payload.platformProductId,
        variations: {
          [this.#devicesNo]: {
            [this.#yearsNo]: this.#generateVariationObject(payload, option, buy_link)
          }
        },
        selected_users: this.#devicesNo,
        selected_years: this.#yearsNo,
        selected_variation: {
          product_id: this.#alias,
          region_id: this.#locale === 'en-us' ? 8 : 22,
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

      this.#appendOptionIfMissing(fakeDevicesSelector, `.users_${this.#alias}`, this.#devicesNo);
      this.#appendOptionIfMissing(fakeYearsSelector, `.years_${this.#alias}`, this.#yearsNo);
    });

    await Promise.allSettled(allOptions);

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

  getVariation() {
    const variation = window.StoreProducts?.product?.[this.#alias]?.variations?.[this.#devicesNo]?.[this.#yearsNo];
    if (!variation) {
      console.warn(`The product ${this.#alias} with the variation ${this.#devicesNo}-${this.#yearsNo} does not exist on this campaign in Vlaicu`);
    }

    return variation;
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
    const endpoint = new URL(`${Constants.API_ROOT}/buy-links/locale/${this.#locale}`, Constants.API_BASE);
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

      const returnObj = await response.json();
      if (returnObj.buyLink) {
        const decorator = new DecorateLink(returnObj.buyLink);
        returnObj.buyLink = await decorator.getFullyDecoratedUrl();
      }
      return returnObj;
    } catch (error) {
      console.error(error);
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
      const fullURL = window.location.href;
      this.#params.append('SHOPURL', encodeURI(fullURL));
    }
  }

  /**
   * Adds the SRC parameter based on the current page URL
   */
  #addSRC() {
    this.#params.set('SRC', `${window.location.origin}${window.location.pathname}`);
  }

  #addREF() {
    const channel = page.getParamValue('channel') || 'LP';
    this.#params.set('REF', `${channel}_${this.#campaign}`);
  }

  #cleanSection() {
    if (!this.#params.has('section')) {
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

  async #appendAdobeMc(link) {
    try {
      const isAdobeMcAlreadyAdded = link.includes('adobe_mc');
      if (isAdobeMcAlreadyAdded) {
        return link.replace(/MCAID%3D.*%7CMCORGID/, 'MCAID%3D%7CMCORGID');
      }

      const destinationURLWithVisitorIDs = await target.appendVisitorIDsTo(link);
      return destinationURLWithVisitorIDs.replace(/MCAID%3D.*%7CMCORGID/, 'MCAID%3D%7CMCORGID');
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Returns the fully decorated URL with all necessary parameters added.
   * @returns {Promise<string>} Fully decorated URL.
   */
  async getFullyDecoratedUrl() {
    this.#addSHOPURL();
    this.#addSRC();
    this.#addREF();
    this.#cleanSection();
    this.#urlObj.search = this.#params.toString();
    return await this.#appendAdobeMc(this.#urlObj.toString());
  }
}
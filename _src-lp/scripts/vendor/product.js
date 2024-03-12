
const LOCALE_PARAMETER = 'locale';

export default class ProductPrice {

  static monthlyProducts = ['psm', 'pspm', 'vpn-monthly', 'passm', 'pass_spm', 'dipm'];

  // this products come with device_no set differently from the init-selector api where they are set to 1
  static wrongDeviceNumber = ['bms', 'mobile', 'ios', 'mobileios', 'psm', 'passm'];

  productId = {
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

  static names = {
    pass: 'Bitdefender Password Manager',
    pass_sp: 'Bitdefender Password Manager Shared Plan',
    passm: 'Bitdefender Password Manager',
    pass_spm: 'Bitdefender Password Manager Shared Plan',
  }

  config = {
    endpoint: 'https://pricing.service-delivery.nmbapp.net',
  }

  locale = 'en-us';
  campaign;
  prodString;
  alias;
  devicesNo;
  yearsNo;
  bundleId;

  constructor(product, campaign) {
    this.prodString = product;
    const prod = this.prodString.split('/');
    this.alias = prod[0];
    this.devicesNo = prod[1];
    this.yearsNo = prod[2];
    this.bundleId = this.productId[this.alias];
    this.campaign = campaign;

    const urlParams = new URLSearchParams(window.location.search);
    let forceLocale = urlParams.get(LOCALE_PARAMETER);
    
    if (forceLocale)
      this.locale = forceLocale;

  }

  async getProductVariations() {

    const endpoint = new URL(`/api/v1/products/${this.bundleId}/locale/${this.locale}`, this.config.endpoint);

    if (this.campaign) {
      endpoint.pathname += `/campaign/${this.campaign}`;
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

  async getProductVariationsPrice() {

    let payload = await this.getProductVariations();

    if (!payload || payload.length === 0) {
      return null;
    }

    window.StoreProducts.product[this.alias] = {
      product_alias: this.alias,
      product_id: this.productId[this.alias],
      product_name: payload.product.productName,
      variations: {},
    };

    payload.product.options.forEach((option) => {

      const pricing = {};
      pricing.total = option.price;
      pricing.discount = option.discountAmount;
      pricing.price = option.discountedPrice;

      window.StoreProducts.product[this.alias] = {
        selected_users: this.devicesNo,
        selected_years: this.yearsNo,
        selected_variation: {
          product_id: this.alias,
          region_id: 22,
          variation_id: 0,
          platform_id: 16,
          price: pricing.total,
          variation: {
            years: this.yearsNo,
          },
          currency_label: this.getCurrencySymbol(this.locale, option.currency),
          currency_iso: option.currency,
          discount: {
            discounted_price: pricing.price,
            discount_value: pricing.discount,
          },
          promotion: this.campaign,
        },
        buy_link: option.buyLink,
        config: {
          product_id: this.alias,
          name: payload.product.name,
          full_price_class: `oldprice-${this.alias}`,
          discounted_price_class: `newprice-${this.alias}`,
          price_class: `price-${this.alias}`,
          buy_class: `buylink-${this.alias}`,
          selected_users: this.devicesNo,
          selected_years: this.yearsNo,
          users_class: `users_${this.alias}_fake`,
          years_class: `years_${this.alias}_fake`,
        },
      };
    });

    return window.StoreProducts.product[this.alias];
  }

  getCurrencySymbol(locale, currency) {
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
    return await this.getProductVariationsPrice(this.id, this.campaign);
  }

}

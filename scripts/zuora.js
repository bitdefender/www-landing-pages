export default class ZuoraNLClass {
  static coupon = 'BTS2023';

  static monthlyProducts = ['psm', 'pspm', 'vpn-monthly', 'passm', 'pass_spm', 'dipm'];

  // this products come with device_no set differently from the init-selector api where they are set to 1
  static wrongDeviceNumber = ['bms', 'mobile', 'ios', 'mobileios', 'psm', 'passm'];

  static productId = {
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
  };

  static names = {
    pass: 'Bitdefender Password Manager',
    pass_sp: 'Bitdefender Password Manager Shared Plan',
    passm: 'Bitdefender Password Manager',
    pass_spm: 'Bitdefender Password Manager Shared Plan',
  };

  static getKey() {
    return 'bb22f980-fa19-11ed-b443-87a99951e6d5';
  }

  static config() {
    return {
      key: this.getKey(),
      country: 'NL',
      language: 'nl_NL',
      debug: false,
      request_timeout: 15000, // default value if not set 3500
      default_scenario: 'www.checkout.v1',
      disable_auto_generated_new_session: false,
      return_url: document.referrer ? document.referrer : window.location.href,
      central: true,
    };
  }

  static getProductVariationPrice(product, campaignId = this.coupon) {
    const prod = product.split('/');
    const id = prod[0];
    const devicesNo = prod[1];
    const yearsNo = prod[2];
    return new Promise((resolve, reject) => {
      BitCheckoutSDK.getProductVariationsPrice({ bundle: this.productId[id], campaign: campaignId }, (payloadObj) => {
        console.log('payloadObj', payloadObj)
        if (!payloadObj || payloadObj.length === 0) {
          reject();
        }

        const payload = payloadObj[payloadObj.length - 1];
        /* if (this.names[id]) {
          payload = payload.filter((id) => this.productId[id]=== this.names[id]);
        } */

        const pricing = {};
        payload.pricing.forEach((item) => {
          if (item.devices_no === Number(devicesNo)) {
            console.log('item', item);
            pricing.total = item.price;
            pricing.discount = item.discount;
            pricing.price = item.total;
          }
        });
        console.log('pricing', pricing)

        // buylink:
        const zuoraCart = new URL('https://checkout.bitdefender.com/index.html:step=cart?theme=light');
        zuoraCart.searchParams.set('campaign', campaignId);
        zuoraCart.searchParams.set('product_id', this.productId[id]);
        zuoraCart.searchParams.set('session_id', BitCheckoutSDK.getSessionId());
        zuoraCart.searchParams.set('payment_period', this.monthlyProducts[id] ? `${devicesNo}d1m` : `${devicesNo}d${yearsNo}y`);

        window.StoreProducts.product[id] = {
          selected_users: devicesNo,
          selected_years: yearsNo,
          selected_variation: {
            product_id: id,
            region_id: 22,
            variation_id: 0,
            platform_id: 16,
            price: pricing.total,
            variation: {
              years: yearsNo,
            },
            currency_label: '€',
            currency_iso: 'EUR',
            discount: {
              discounted_price: pricing.price,
              discount_value: pricing.discount,
            },
            promotion: campaignId,
          },
          buy_link: zuoraCart.href,
          config: {
            product_id: id,
            name: payload.name,
            full_price_class: `oldprice-${id}`,
            discounted_price_class: `newprice-${id}`,
            price_class: `price-${id}`,
            buy_class: `buylink-${id}`,
            selected_users: devicesNo,
            selected_years: yearsNo,
            users_class: `users_${id}_fake`,
            years_class: `years_${id}_fake`,
          },
        };

        resolve(window.StoreProducts.product[id]);
      });
    });
  }

  static loadProduct(id, campaign) {
    window.StoreProducts = window.StoreProducts || [];
    window.StoreProducts.product = window.StoreProducts.product || {};
    return this.getProductVariationPrice(id, campaign);
  }
}

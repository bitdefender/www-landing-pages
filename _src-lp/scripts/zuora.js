export default class ZuoraNLClass {
  static cachedZuoraConfig = null;

  static async fetchZuoraConfig() {
    // If cached data exists, return it directly
    if (this.cachedZuoraConfig) {
      return this.cachedZuoraConfig;
    }

    const defaultJsonFilePath = '/zuoraconfig.json';
    const jsonFilePath = window.location.hostname === 'www.bitdefender.com'
      ? `https://${window.location.hostname}/pages/zuoraconfig.json`
      : defaultJsonFilePath;

    try {
      const response = await fetch(jsonFilePath);

      if (!response.ok) {
        console.error(`Failed to fetch data. Status: ${response.status}`);
        return {};
      }

      const { data = [] } = await response.json();
      const zuoraConfigData = {
        CAMPAIGN_NAME: data[0]?.CAMPAIGN_NAME || '',
        CAMPAIGN_PRODS: {},
        CAMPAIGN_MONTHLY_PRODS: [],
      };

      // build zuoraConfigData
      data.forEach((item) => {
        if (item.ZUORA_PRODS) {
          const [key, value] = item.ZUORA_PRODS.split(':').map((itm) => itm.trim());
          const clearKey = key.replace('*', '');
          zuoraConfigData.CAMPAIGN_PRODS[clearKey] = value;

          if (key.includes('*')) {
            zuoraConfigData.CAMPAIGN_MONTHLY_PRODS.push(clearKey);
          }
        }
      });

      // Cache the fetched data
      this.cachedZuoraConfig = zuoraConfigData;

      return zuoraConfigData;
    } catch (error) {
      console.error(`Error fetching Zuora config: ${error.message}`);
      return {};
    }
  }

  // this products come with device_no set differently from the init-selector api where they are set to 1
  static wrongDeviceNumber = ['bms', 'mobile', 'ios', 'mobileios', 'psm', 'passm'];

  static names = {
    pass: 'Bitdefender Password Manager',
    pass_sp: 'Bitdefender Password Manager Shared Plan',
    passm: 'Bitdefender Password Manager',
    pass_spm: 'Bitdefender Password Manager Shared Plan',
  };

  static zuoraConfig = {
    cartUrl: 'https://checkout.bitdefender.com',
    key: 'bb22f980-fa19-11ed-b443-87a99951e6d5',
    endpoint: 'https://checkout-service.bitdefender.com',
  };

  static config(key) {
    return {
      key: key || this.zuoraConfig.key,
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

  static async getProductVariations(productId, campaign) {
    const endpoint = new URL('/v1/info/variations/price', this.zuoraConfig.endpoint);
    endpoint.searchParams.set('product_id', productId);
    if (campaign) endpoint.searchParams.set('campaign', campaign);
    endpoint.searchParams.set('country_code', 'NL');

    try {
      const response = await fetch(
        endpoint.href,
        {
          method: 'GET',
          headers: {
            'X-Public-Key': this.zuoraConfig.key,
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

  static async getProductVariationsPrice(product, campaign, fetchedData) {
    /* eslint-disable-next-line no-unused-vars */
    const {
      CAMPAIGN_MONTHLY_PRODS: monthlyProducts,
      CAMPAIGN_NAME: campaignName,
      CAMPAIGN_PRODS: productId,
    } = fetchedData;
    const prod = product.split('/');
    const id = prod[0];
    const devicesNo = prod[1];
    const yearsNo = prod[2];

    let payload = (await this.getProductVariations(productId[id], campaign))?.payload;
    if (!payload || payload.length === 0) {
      return null;
    }

    /**
     * this rules splits one product into multiple products
     * for example com.bitdefender.passwordmanager maps 2 products
     * Password Manager and Password Manager Shared Plan
     */
    if (this.names[id]) {
      payload = payload.filter((item) => item.name === this.names[id]);
    }

    window.StoreProducts.product[id] = {
      product_alias: id,
      product_id: productId[id],
      product_name: payload[0].name,
      variations: {},
    };

    payload.forEach((period) => {
      let billingPeriod;
      switch (period.billing_period) {
        case 'Month':
          billingPeriod = 0;
          break;
        case 'Annual':
          billingPeriod = 1;
          break;
        case 'Two_Years':
          billingPeriod = 2;
          break;
        case 'Three_Years':
          billingPeriod = 3;
          break;
        case 'Five_Years':
          billingPeriod = 5;
          break;
        default:
          billingPeriod = 10;
      }

      if ((monthlyProducts.indexOf(id) === -1 && billingPeriod === 0) || (monthlyProducts.indexOf(id) !== -1 && billingPeriod !== 0)) {
        return;
      }

      if (monthlyProducts.indexOf(id) !== -1) {
        billingPeriod = 1;
      }

      // buylink:
      const windowURL = new URL(window.location.href);
      const zuoraCart = new URL('/index.html:step=cart?theme=light', this.zuoraConfig.cartUrl);

      zuoraCart.searchParams.set('campaign', campaign);
      if (windowURL.searchParams.has('lang')) {
        zuoraCart.searchParams.set('language', windowURL.searchParams.get('lang'));
      }
      if (windowURL.searchParams.has('language')) {
        zuoraCart.searchParams.set('language', windowURL.searchParams.get('language'));
      }
      if (windowURL.searchParams.has('event')) {
        zuoraCart.searchParams.set('event', windowURL.searchParams.get('event'));
      }
      if (windowURL.searchParams.has('channel')) {
        zuoraCart.searchParams.set('channel', windowURL.searchParams.get('channel'));
      }
      zuoraCart.searchParams.set('product_id', productId[id]);
      zuoraCart.searchParams.set('payment_period', monthlyProducts.includes(id) ? `${devicesNo}d1m` : `${devicesNo}d${yearsNo}y`);
      zuoraCart.searchParams.set('country', 'NL');
      zuoraCart.searchParams.set('language', 'nl_NL');
      zuoraCart.searchParams.set('client', '8f768650-6915-11ed-83e3-e514e761ac46');

      let { priceValue, percentValue, totalValue } = { priceValue: 0, discountValue: 0, totalValue: 0 };
      const currentItem = period.pricing?.find((item) => Number(item.devices_no) === Number(devicesNo));
      if (!currentItem) return;

      currentItem.devices_no = currentItem.devices_no === 50 ? 1 : currentItem.devices_no;
      if (Number(devicesNo) === currentItem.devices_no && Number(yearsNo) === billingPeriod) {
        priceValue = currentItem.price;
        percentValue = currentItem.discount;
        totalValue = currentItem.total;

        window.StoreProducts.product[id] = {
          selected_users: devicesNo,
          selected_years: yearsNo,
          selected_variation: {
            product_id: id,
            region_id: 22,
            variation_id: 0,
            platform_id: 16,
            price: priceValue,
            variation: {
              years: yearsNo,
            },
            currency_label: '€',
            currency_iso: 'EUR',
            discount: {
              discounted_price: totalValue,
              discount_value: percentValue,
            },
            promotion: campaign,
          },
          buy_link: zuoraCart.href,
          config: {
            product_id: id,
            name: payload[0].name,
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
      }
    });

    return window.StoreProducts.product[id];
  }

  static async loadProduct(id, campaignParam = '') {
    window.StoreProducts = window.StoreProducts || [];
    window.StoreProducts.product = window.StoreProducts.product || {};

    try {
      let coupon = campaignParam;

      // Fetch the Zuora config once (cached or freshly fetched)
      const fetchedData = await this.fetchZuoraConfig();

      if (!coupon) coupon = fetchedData.CAMPAIGN_NAME;
      return this.getProductVariationsPrice(id, coupon, fetchedData);
    } catch (error) {
      console.error('loadProduct error:', error);
    }

    return this.getProductVariationsPrice(id);
  }
}

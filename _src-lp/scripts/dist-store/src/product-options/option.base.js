export class ProductOption {
  product;

  price;

  discountedPrice;

  devices;

  subscription;

  currency;

  buyLink;

  trialLink;

  discount;

  bundle;

  constructor(option) {
    this.product = option.product;
    this.price = {
      value: option.price,
      monthly: Number(Number(option.price / option.subscription).toFixed(2)),
    };
    this.discountedPrice = {
      value: option.discountedPrice,
      monthly: Number(Number(option.discountedPrice / option.subscription).toFixed(2)),
    };
    this.devices = option.devices;
    this.subscription = option.subscription;
    this.currency = option.product.getCurrency();
    this.buyLink = option.buyLink;
    this.trialLink = option.trialLink;
    this.discount = {
      value: Math.round((option.price - option.discountedPrice + Number.EPSILON) * 100) / 100,
      percentage: Math.round(((option.price - option.discountedPrice) / option.price * 100)),
      monthly: {
        value: Math.round((option.price - option.discountedPrice + Number.EPSILON) * 100 / option.subscription) / 100,
        percentage: Math.round(((option.price - option.discountedPrice) / option.price * 100 / option.subscription)),
      },
    };
    this.bundle = option.bundle || [];
  }

  getProduct() {
    return this.product;
  }

  getVariation() {
    return `${this.devices}-${this.subscription}`;
  }

  getPrice(param) {
    const { monthly = false, currency = true } = param ?? {};
    const rawPrice = monthly ? this.price.monthly : this.price.value;
    if (currency) {
      return this.product.getStore().formatPrice({ price: rawPrice, currency: this.currency });
    }
    return rawPrice;
  }

  getDiscountedPrice(param) {
    const { monthly = false, currency = true } = param ?? {};
    const rawPrice = monthly ? this.discountedPrice.monthly : this.discountedPrice.value;
    if (currency) {
      return this.product.getStore().formatPrice({ price: rawPrice, currency: this.currency });
    }
    return rawPrice;
  }

  getDiscount(param) {
    const { percentage = false, symbol = true, monthly = false } = param ?? {};
    const discount = monthly ? this.discount.monthly : this.discount;
    const rawValue = percentage ? discount.percentage : discount.value;
    if (symbol) {
      return percentage
        ? (rawValue ? `${rawValue}%` : '')
        : this.product.getStore().formatPrice({ price: rawValue, currency: this.currency });
    }
    return rawValue;
  }

  getBuyLink() {
    return this.buyLink;
  }

  getDevices() {
    return this.devices;
  }

  getSubscription() {
    return this.subscription;
  }

  getBundle() {
    return this.bundle;
  }

  getTrialLink() {
    return this.trialLink;
  }

  async getOption(option) {
    if (!option) {
      return undefined;
    }
    const devices = option.devices ?? this.devices;
    const subscription = option.subscription ?? this.subscription;
    // Build new bundle, mapping fixed options and fetching new ones
    const newBundle = await Promise.all(this.bundle.map(async (b) => {
      const nextOption = await b.option.getOption({
        devices: b.devicesFixed ? b.option.getDevices() : devices,
        subscription: b.subscriptionFixed ? b.option.getSubscription() : subscription,
      });
      return { ...b, option: nextOption };
    }));
    // Ensure all bundle options are defined
    const isDefinedBundle = (b) => b.option != null;
    if (!newBundle.every(isDefinedBundle)) {
      return undefined;
    }
    // Return the new ProductOption
    return this.product.getOption({
      devices,
      subscription,
      bundle: newBundle,
    });
  }

  async nextOption(option) {
    if (!option) {
      return undefined;
    }
    const devices = this.product.getDevices();
    const subscriptions = this.product.getSubscriptions();
    // Determine target indices for devices and subscriptions
    const computeIndex = (currentIndex, values, opt) => {
      if (opt === undefined) {
        // no change requested
        return currentIndex;
      }
      if (opt === 'next') {
        return currentIndex + 1;
      }
      if (opt === 'prev') {
        return currentIndex - 1;
      }

      const numeric = currentIndex + Number(opt);
      return values.findIndex((v) => v === numeric);
    };
    // Current indices
    const idxDevice = devices.values.findIndex((v) => v === this.devices);
    const idxSubscription = subscriptions.values.findIndex((v) => v === this.subscription);
    // Next indices
    const targetDeviceIdx = computeIndex(idxDevice, devices.values, option.devices);
    const targetSubscriptionIdx = computeIndex(idxSubscription, subscriptions.values, option.subscription);
    // Calculate new values
    const newDevice = devices.values[targetDeviceIdx];
    const newSubscription = subscriptions.values[targetSubscriptionIdx];
    // Bail out if out of range
    if (targetDeviceIdx < 0
            || targetSubscriptionIdx < 0
            || newDevice > devices.max
            || newSubscription > subscriptions.max
            || newDevice < devices.min
            || newSubscription < subscriptions.min) {
      return undefined;
    }
    return this.getOption({ devices: newDevice, subscription: newSubscription });
  }

  async toogleBundle(bundle) {
    const getKey = (option) => `${option.getProduct().getId()}${option.getProduct().getCampaign()}${option.getDevices()}${option.getSubscription()}`;
    console.log('Option.base: ', bundle);
    const idx = this.bundle.findIndex((b) => getKey(b.option) === getKey(bundle.option));
    let newBundle;
    if (idx !== -1) {
      newBundle = this.bundle.toSpliced(idx, 1);
    } else {
      newBundle = this.bundle.toSpliced(0, 0, bundle);
    }
    return this.product.getOption({
      devices: this.devices,
      subscription: this.subscription,
      bundle: newBundle,
    });
  }

  async switchProduct(productSelector) {
    const product = await this.product.getStore().getProduct(productSelector);
    return product?.getOption({
      devices: this.devices,
      subscription: this.subscription,
      bundle: this.bundle,
    });
  }
}

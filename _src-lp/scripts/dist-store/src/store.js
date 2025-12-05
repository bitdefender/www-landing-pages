import { Adaptor } from './adaptors/adaptor.base.js';
import { formatPrice } from './format-price.js';
import { InitSelectorProvider } from './providers/provider.init-selector.js';
import { VlaicuProvider } from './providers/provider.vlaicu.js';

const BuiltInProviders = {
  init: InitSelectorProvider,
  vlaicu: VlaicuProvider,
};
export const STORE_LOCALE = Symbol('locale');
export const STORE_ADAPTER = Symbol('adapter');
export const STORE_CAMPAIGN = Symbol('campaign');
export const STORE_TRANSFORMERS = Symbol('transformers');
export const STORE_OVERRIDES = Symbol('overrides');
export const STORE_TRIAL_LINKS = Symbol('trialLinks');
export const STORE_FORMATTER = Symbol('formatter');
class Cache {
  products;

  provider;

  constructor(param) {
    this.products = new Map();
    this.provider = param.provider;
  }

  async get({ id, campaign }) {
    const productKey = `${id}-${campaign}`;
    // Check if we already have a cached entry.
    const cacheEntry = this.products.get(productKey);
    if (cacheEntry) {
      return cacheEntry;
    }
    // If no cache entry exists, call the provider and cache the result.
    const productPromise = this.provider.getProduct({ id, campaign });
    this.products.set(productKey, productPromise);
    return await productPromise;
  }
}
export class Store {
  cache;

  [STORE_LOCALE];

  [STORE_ADAPTER];

  [STORE_CAMPAIGN];

  [STORE_TRANSFORMERS];

  [STORE_OVERRIDES];

  [STORE_TRIAL_LINKS];

  [STORE_FORMATTER];

  constructor(config) {
    const defaultCampaign = async ({ campaign }) => campaign;
    this[STORE_LOCALE] = config.locale;
    this[STORE_ADAPTER] = Adaptor.create();
    this[STORE_CAMPAIGN] = config.campaign ?? defaultCampaign;
    this[STORE_TRANSFORMERS] = config.transformers;
    this[STORE_OVERRIDES] = config.overrides;
    this[STORE_TRIAL_LINKS] = config.trialLinks;
    this.cache = new Cache({
      provider: this.getProvider(config.provider),
    });
    this[STORE_FORMATTER] = config.formatter || formatPrice;
  }

  async getProduct(param) {
    const productListToFetch = Array.isArray(param) ? param : [param];
    const productListToReturn = productListToFetch.map((product) => this.cache.get(product));
    const products = (await Promise.allSettled(productListToReturn))
      .filter((promise) => promise.status === 'fulfilled' && !!promise.value)
      .map((promise) => promise.value);
    if (Array.isArray(param)) {
      return products;
    }

    return products.pop();
  }

  getProvider(param) {
    // If provider is a string, use the corresponding built‑in constructor.
    const { name: provider } = param ?? {};
    if (typeof provider === 'string') {
      const ctor = BuiltInProviders[provider];
      if (ctor) {
        return new ctor({ store: this });
      }
      throw new Error(`Unknown provider string: ${provider}`);
    }
    // Otherwise, assume provider is a constructor (a class definition).
    // This must be a concrete subclass of the abstract Provider.
    return new provider({ store: this });
  }

  formatPrice(opt) {
    return this[STORE_FORMATTER](opt);
  }
}

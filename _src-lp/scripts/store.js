import { Store } from '@repobit/dex-store';
import pagePromise from './page.js';
import { targetPromise } from './target.js';
import { getMetadata } from './lib-franklin.js';
import Constants from './constants.js';

const page = await pagePromise;
const target = await targetPromise;

const channel = page.getParamValue('channel') || 'LP';
const DEFAULT_TRIAL_CAMPAIGN = 'default';
const TRIAL_SUBSCRIPTION_MONTHS = 12;

/**
 * Locale column of triallinks.json (COM, UK, AU, FR, RO...)
 * @returns {string}
 */
const getTrialLocale = () => {
  let locale = (page.getParamValue('locale')?.split('-')[1] || page.country || 'com').toLowerCase();
  if (locale === 'gb') locale = 'uk';
  if (['en', 'us', 'de', 'nl'].includes(locale)) locale = 'com';
  return locale.toUpperCase();
};

/**
 * Builds the dex-store trialLinks config from triallinks.json:
 * productAlias -> 'default' -> `${devices}-12` -> '30 days' -> trial link
 */
const getTrialLinks = async () => {
  const trialLinksUrl = window.location.hostname === 'www.bitdefender.com'
    ? 'https://www.bitdefender.com/pages/triallinks.json'
    : '/triallinks.json';

  try {
    const response = await fetch(trialLinksUrl);
    if (!response.ok) return {};

    const { data = [] } = await response.json();
    const trialLocale = getTrialLocale();
    const locale = data.some((row) => row.locale?.toUpperCase() === trialLocale) ? trialLocale : 'COM';

    return data.reduce((acc, {
      product, devices, duration, locale: rowLocale, buy_link: trialLink,
    }) => {
      if (!product || !devices || !duration || !trialLink) return acc;
      if (rowLocale?.toUpperCase() !== locale) return acc;

      const variation = `${devices}-${TRIAL_SUBSCRIPTION_MONTHS}`;
      acc[product] ??= {};
      acc[product][DEFAULT_TRIAL_CAMPAIGN] ??= {};
      acc[product][DEFAULT_TRIAL_CAMPAIGN][variation] ??= {};
      acc[product][DEFAULT_TRIAL_CAMPAIGN][variation][duration] ??= trialLink;

      return acc;
    }, {});
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return {};
  }
};

/**
 * Filled in the background so the page load is not blocked by triallinks.json.
 * The provider applies trial links only after resolving the campaign,
 * so the campaign resolver waits for them.
 */
const trialLinks = {};
const trialLinksPromise = getTrialLinks().then((links) => Object.assign(trialLinks, links));

/**
 * Same precedence the legacy price engine used:
 * Target promotion > vcampaign > pid > campaign param > bd-product campaign > pid metadata
 */
const resolveCampaign = async ({ campaign }) => {
  await trialLinksPromise;

  return (await target.configMbox)?.promotion
    || page.getParamValue('vcampaign')
    || getMetadata('vcampaign')
    || page.getParamValue('pid')
    || page.getParamValue('campaign')
    || campaign
    || getMetadata('pid')
    || undefined;
};

const setUsercentricsId = (url) => {
  if (window.UC_UI) {
    url.searchParams.set('ucControllerId', window.UC_UI.getControllerId());
  }
};

const store = new Store({
  campaign: resolveCampaign,
  locale: page.locale,
  provider: { name: 'vlaicu' },
  trialLinks,
  transformers: {
    buyLink: async ({ buyLink, product, option }) => {
      const products = (await target.configMbox)?.products;
      const monthsToYears = option.subscription / (option.subscription === 1 ? 1 : 12);
      const targetOverride = products?.[product.alias]?.[`${option.devices}-${monthsToYears}`];

      const buyLinkURL = new URL(targetOverride?.buyLink || buyLink);
      setUsercentricsId(buyLinkURL);
      buyLinkURL.searchParams.set('REF', `${channel}_${product.campaign}`);
      targetOverride?.extraParameters?.forEach(({ key, value }) => {
        buyLinkURL.searchParams.set(key, value);
      });

      // the store rebuilds this link on every option change,
      // so the visitor IDs have to be part of the link itself
      return target.appendVisitorIDsTo(buyLinkURL.href);
    },
    trialLink: async ({ trialLink, buyLink, option }) => {
      if (!trialLink) return undefined;

      const trialLinkURL = new URL(trialLink);
      const buyLinkURL = new URL(buyLink);
      ['LANG', 'CURRENCY', 'DCURRENCY', 'COUPON'].forEach((key) => {
        const value = buyLinkURL.searchParams.get(key);
        if (value) trialLinkURL.searchParams.set(key, value);
      });

      // zuora (de, nl) buy links carry no currency, the trial store expects EUR
      if (['de', 'nl'].includes(page.country)) {
        trialLinkURL.searchParams.set('LANG', page.country);
        trialLinkURL.searchParams.set('CURRENCY', 'EUR');
        trialLinkURL.searchParams.set('DCURRENCY', 'EUR');
      }

      const coupon = page.getParamValue('coupon') || getMetadata('coupon') || option.coupon;
      if (coupon) trialLinkURL.searchParams.set('COUPON', coupon);
      trialLinkURL.searchParams.set('SRC', window.location.origin + window.location.pathname);
      setUsercentricsId(trialLinkURL);

      return target.appendVisitorIDsTo(trialLinkURL.href);
    },
  },
});

/**
 * Content authors write products as `alias/devices/years`. The init-to-vlaicu mapping
 * sheet only covers some variations, so for the rest we convert years to months
 * the same way the legacy price engine did.
 */
const adapterKey = Object.getOwnPropertySymbols(Store.prototype)
  .find((symbol) => symbol.description === 'adapter');

store.adapter = store[adapterKey].then((adaptor) => {
  const adaptTo = adaptor.adaptTo.bind(adaptor);
  adaptor.adaptTo = async (param) => {
    const adapted = await adaptTo(param);
    const isUnmapped = adapted.devices === param.devices && adapted.subscription === param.subscription;
    const isYears = adapted.subscription >= 1 && adapted.subscription <= 3;

    if (isUnmapped && isYears && !Constants.MONTHLY_PRODUCTS.includes(param.id)) {
      adapted.subscription *= 12;
    }

    return adapted;
  };

  return adaptor;
});

export default store;

import { Store } from '@repobit/dex-store';
import pagePromise from './page.js';
import { targetPromise } from './target.js';
import { getMetadata } from './lib-franklin.js';

const page = await pagePromise;
const target = await targetPromise;

const vlaicuCampaign = page.getParamValue('vcampaign') || getMetadata('vcampaign');
const campaign = page.getParamValue('campaign');
const channel = page.getParamValue('channel') || 'LP';

export default new Store({
  campaign: async () => (await target.configMbox)?.promotion || vlaicuCampaign || campaign,
  locale: page.locale,
  provider: { name: 'vlaicu' },
  transformers: {
    buyLink: async (param) => {
      const products = (await target.configMbox)?.products;
      const { buyLink, product, option } = param;
      const buyLinkURL = new URL(buyLink);
      buyLinkURL.searchParams.set('REF', `${channel}_${product.campaign}`);
      if (products) {
        const monthsToYears = option.subscription / (option.subscription === 1 ? 1 : 12);
        const extraParameters = products[product.alias]?.[`${option.devices}-${monthsToYears}`]?.extraParameters || [];
        extraParameters.forEach(({ key, value }) => {
          buyLinkURL.searchParams.set(key, value);
        });
      }

      return buyLinkURL.href;
    },
  },
});

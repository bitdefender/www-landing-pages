import { Store } from '@repobit/dex-store';
import pagePromise from './page.js';
import { targetPromise } from './target.js';
import { getMetadata } from './lib-franklin.js';

const page = await pagePromise;
const target = await targetPromise;

const vlaicuCampaign = page.getParamValue('vcampaign') || getMetadata('vcampaign');
const campaign = page.getParamValue('campaign');

export default new Store({
  campaign: async () => (await target.configMbox)?.promotion || vlaicuCampaign || campaign,
  locale: page.locale,
  provider: { name: 'vlaicu' },
  transformers: {
    buyLink: async (param) => {
      const products = (await target.configMbox)?.products;
      const { buyLink, product, option } = param;
      if (!products) {
        return buyLink;
      }

      const monthsToYears = option.subscription / (option.subscription === 1 ? 1 : 12);
      const extraParameters = products[product.alias]?.[`${option.devices}-${monthsToYears}`]?.extraParameters || [];
      const buyLinkURL = new URL(buyLink);
      extraParameters.forEach(({ key, value }) => {
        buyLinkURL.searchParams.set(key, value);
      });

      return buyLinkURL.href;
    },
  },
});

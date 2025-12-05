import { Store } from './dist-store/src/index.js';
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
});

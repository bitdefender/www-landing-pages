import { STORE_LOCALE } from '../store.js';
import { INGNORE_CAMPAIGN, Provider } from './provider.base.js';

export class VlaicuProvider extends Provider {
  constructor(param) {
    super(param);
  }

  async fetch({ id, campaign }) {
    const adaptedId = (await this.adaptTo({ id })).id;
    const computedCampaign = await this.getCampaign(adaptedId, campaign);
    const apiURL = this.buildApiURL(adaptedId, this.store[STORE_LOCALE], computedCampaign);
    let fetchResponse;
    try {
      const response = await fetch(apiURL.href, {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) return undefined;
      fetchResponse = await response.json();
    } catch (error) {
      console.error('Failed to fetch product:', error);
      return undefined;
    }
    // Process variations into option data.
    const { options, currency } = await this.processVariations(adaptedId, fetchResponse.product.options);
    // Return an UnboundProductData.
    return {
      overrides: {
        oldCampaign: campaign,
        newCampaign: computedCampaign,
      },
      product: {
        id: adaptedId,
        alias: id,
        name: fetchResponse.product.productName,
        campaign: computedCampaign || fetchResponse.campaign,
        campaignType: fetchResponse.campaignType || '',
        currency,
        platformId: fetchResponse.platformProductId,
        options,
      },
    };
  }

  buildApiURL(id, locale, campaign) {
    const apiParams = ['products', id, 'locale', locale];
    if (campaign) {
      apiParams.push('campaign', INGNORE_CAMPAIGN.includes(String(campaign)) ? 'null' : campaign);
    }
    const url = new URL(`https://www.bitdefender.com/p-api/v1/${apiParams.join('/')}`);
    return url;
  }

  async processVariations(id, variations) {
    const options = new Map();
    let currency = '';
    // Loop through devices and subscriptions.
    for (const variation of variations) {
      const variationData = {
        devices: variation.slots,
        subscription: variation.months,
        price: Number(variation.price),
        discountedPrice: Number(variation.price === variation.discountedPrice ? NaN : variation.discountedPrice),
        buyLink: variation.buyLink,
        bundle: [],
      };
      // Capture common info.
      currency = variation.currency;
      options.set(`${variation.slots}-${variation.months}`, variationData);
    }
    return { options, currency };
  }
}

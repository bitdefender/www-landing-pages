import { Product } from "../products/product.base.js";
import { STORE_ADAPTER, STORE_CAMPAIGN, STORE_OVERRIDES, STORE_TRANSFORMERS, STORE_TRIAL_LINKS } from "../store.js";
export const INGNORE_CAMPAIGN = ["ignore", "none", "0"];
export class Provider {
    store;
    constructor({ store }) {
        this.store = store;
    }
    async getProduct(param) {
        let data = await this.fetch(param);
        if (!data) {
            return undefined;
        }
        data = await this.applyOverrides(data);
        data = await this.applyTrialLinks(data);
        data = await this.applyTransformers(data);
        return data.product ? new Product({ ...data.product, store: this.store }) : data.product;
    }
    async applyOverrides(data) {
        const { overrides, product } = data;
        if (!product) {
            return data;
        }
        const ovProduct = this.store[STORE_OVERRIDES]?.[product.id];
        if (!ovProduct) {
            return data;
        }
        if (!overrides.oldCampaign) {
            return data;
        }
        const ovOptions = ovProduct[overrides.oldCampaign]?.options;
        if (!ovOptions) {
            return data;
        }
        for (const [variation, ovOption] of Object.entries(ovOptions)) {
            const option = product.options.get(variation);
            if (!ovOption) {
                product.options.delete(variation);
            }
            else {
                product.options.set(variation, { ...option, ...ovOption });
            }
        }
        return data;
    }
    async applyTransformers(data) {
        const { product } = data;
        if (!product) {
            return data;
        }
        for (const option of product.options.values()) {
            if (this.store[STORE_TRANSFORMERS]?.option?.buyLink) {
                option.buyLink = await this.store[STORE_TRANSFORMERS]?.option?.buyLink(option.buyLink);
            }
        }
        return data;
    }
    async applyTrialLinks(data) {
        const { overrides, product } = data;
        if (!product)
            return data;
        const trProduct = this.store[STORE_TRIAL_LINKS]?.[product.id];
        if (!trProduct)
            return data;
        const trOption = trProduct[overrides.newCampaign || ""] || trProduct.default;
        if (!trOption)
            return data;
        for (const [key, link] of Object.entries(trOption)) {
            const option = product.options.get(key);
            if (option) {
                option.trialLink = link;
            }
        }
        return data;
    }
    async getCampaign(id, campaign) {
        if (!campaign && this.store[STORE_OVERRIDES]?.[id]?.default?.campaign) {
            return this.store[STORE_OVERRIDES]?.[id].default.campaign;
        }
        if (campaign && this.store[STORE_OVERRIDES]?.[id]?.[campaign]?.campaign) {
            return this.store[STORE_OVERRIDES]?.[id]?.[campaign].campaign;
        }
        return await this.store[STORE_CAMPAIGN]({ id, campaign });
    }
    async adaptTo(param) {
        const adaptor = await this.store[STORE_ADAPTER];
        return await adaptor.adaptTo(param);
    }
}
//# sourceMappingURL=provider.base.js.map
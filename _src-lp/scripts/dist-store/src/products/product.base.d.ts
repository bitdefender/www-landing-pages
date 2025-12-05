import { ProductBundleOption, ProductOption, ProductOptionData } from "../product-options/option.base.js";
import { Store } from "../store.js";
export type UnboundProductOptionData = Omit<ProductOptionData, "product">;
export type ProductData = {
    store: Store;
    name: string;
    campaign?: string;
    campaignType?: string;
    id: string;
    alias: string;
    currency: string;
    options: Map<string, UnboundProductOptionData>;
    platformId: string;
};
export type UnboundProductData = Omit<ProductData, "store">;
export declare const SET_OPTION: unique symbol;
type MinMaxType = {
    min: number;
    max: number;
};
type DevicesType = MinMaxType & {
    values: number[];
};
type SubscriptionType = MinMaxType & {
    values: number[];
};
export declare class Product {
    private store;
    private name;
    private campaign?;
    private campaignType?;
    private id;
    private alias;
    private currency;
    private options;
    private platformId;
    private devices;
    private subscriptions;
    private discount;
    private price;
    private discountedPrice;
    constructor(product: ProductData);
    getStore(): Store;
    getId(): string;
    getAlias(): string;
    getPlatformId(): string;
    getName(): string;
    getCampaign(): string | undefined;
    getCampaignType(): string | undefined;
    getCurrency(): string;
    getOption(): Promise<ProductOption[]>;
    getOption(param: {
        devices: undefined;
        subscription: undefined;
        bundle: ProductBundleOption[];
    }): Promise<(ProductOption | undefined)[]>;
    getOption(param: {
        devices: number;
        subscription: number;
        bundle?: (ProductBundleOption | undefined)[];
    }): Promise<ProductOption | undefined>;
    [SET_OPTION](param: {
        options: ProductOption | ProductOption[];
    }): void;
    getPrice(): {
        min: string;
        max: string;
    };
    getPrice(param: {
        monthly?: boolean;
        currency: true;
    }): {
        min: string;
        max: string;
    };
    getPrice(param: {
        monthly?: boolean;
        currency?: false;
    }): {
        min: number;
        max: number;
    };
    getDiscountedPrice(): {
        min: string;
        max: string;
    };
    getDiscountedPrice(param: {
        monthly?: boolean;
        currency: true;
    }): {
        min: string;
        max: string;
    };
    getDiscountedPrice(param: {
        monthly?: boolean;
        currency?: false;
    }): {
        min: number;
        max: number;
    };
    getDiscount(): {
        min: number;
        max: number;
    };
    getDiscount(param: {
        percentage?: boolean;
        symbol: true;
    }): {
        min: string;
        max: string;
    };
    getDiscount(param: {
        percentage?: boolean;
        symbol?: false;
    }): {
        min: number;
        max: number;
    };
    getDevices(): DevicesType;
    getSubscriptions(): SubscriptionType;
    protected bundle(base: ProductOption, options: ProductBundleOption[]): Promise<UnboundProductOptionData>;
}
export {};

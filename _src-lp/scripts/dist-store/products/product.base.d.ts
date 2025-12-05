import { ProductOption, ProductOptionData } from "../src/product-options/option.base.js";
import { Store } from "../src/store.js";
export type UnboundProductOptionData = Omit<ProductOptionData, "product">;
export type ProductData = {
    store: Store;
    name: string;
    campaign?: string;
    id: string;
    currency: string;
    options: Map<string, UnboundProductOptionData>;
    platformId: string;
};
export declare const setOption: unique symbol;
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
    private id;
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
    getPlatformId(): string;
    getName(): string;
    getCampaign(): string | undefined;
    getCurrency(): string;
    getOption(): Promise<ProductOption[]>;
    getOption(param: {
        bundle: ProductOption[];
    }): Promise<(ProductOption | undefined)[]>;
    getOption(param: {
        devices: number;
        subscription: number;
        bundle?: (ProductOption | undefined)[];
    }): Promise<ProductOption | undefined>;
    [setOption](param: {
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
    protected bundle(base: ProductOption, options: ProductOption[]): Promise<UnboundProductOptionData>;
}
export {};

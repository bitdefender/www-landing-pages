import { Product } from "../products/product.base.js";
import { ProductSelector } from "../store.js";
type GetOption = number | "prev" | "next";
export type ProductOptionData = {
    product: Product;
    price: number;
    discountedPrice: number;
    devices: number;
    subscription: number;
    buyLink: string;
    trialLink?: string;
    bundle?: ProductBundleOption[];
};
export type ProductBundleOption = {
    option: ProductOption;
    devicesFixed?: boolean;
    subscriptionFixed?: boolean;
};
export declare class ProductOption {
    private product;
    private price;
    private discountedPrice;
    private devices;
    private subscription;
    private currency?;
    private buyLink;
    private trialLink?;
    private discount;
    private bundle;
    constructor(option: ProductOptionData);
    getProduct(): Product;
    getVariation(): string;
    getPrice(): string;
    getPrice(param: {
        monthly?: boolean;
        currency?: true;
    }): string;
    getPrice(param: {
        monthly?: boolean;
        currency: false;
    }): number;
    getDiscountedPrice(): string;
    getDiscountedPrice(param: {
        monthly?: boolean;
        currency?: true;
    }): string;
    getDiscountedPrice(param: {
        monthly?: boolean;
        currency: false;
    }): number;
    getDiscount(): string;
    getDiscount(param: {
        percentage?: boolean;
        symbol?: true;
        monthly?: boolean;
    }): string;
    getDiscount(param: {
        percentage?: boolean;
        symbol: false;
        monthly?: boolean;
    }): number;
    getBuyLink(): string;
    getDevices(): number;
    getSubscription(): number;
    getBundle(): ProductBundleOption[];
    getTrialLink(): string | undefined;
    getOption(option: {
        devices?: number;
        subscription?: number;
    }): Promise<ProductOption | undefined>;
    nextOption(option: {
        devices: GetOption;
        subscription?: GetOption;
    } | {
        devices?: GetOption;
        subscription: GetOption;
    } | {
        devices: GetOption;
        subscription: GetOption;
    }): Promise<ProductOption | undefined>;
    toogleBundle(bundle: ProductBundleOption): Promise<ProductOption | undefined>;
    switchProduct(productSelector: ProductSelector): Promise<ProductOption | undefined>;
}
export {};

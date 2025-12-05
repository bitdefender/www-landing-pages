import { PriceFormat } from "./format-price.js";
import { Product, UnboundProductOptionData } from "./products/product.base.js";
import { Provider, ProviderData } from "./providers/provider.base.js";
import { InitSelectorProvider } from "./providers/provider.init-selector.js";
import { VlaicuProvider } from "./providers/provider.vlaicu.js";
export type ProductSelector = {
    id: string;
    campaign?: string;
};
export type Locale = `${string}-${string}`;
type ProviderCtor = new (param: ProviderData) => Provider;
declare const BuiltInProviders: {
    readonly init: typeof InitSelectorProvider;
    readonly vlaicu: typeof VlaicuProvider;
};
type ProviderSelector = {
    name: keyof typeof BuiltInProviders | ProviderCtor;
};
type StoreConfig = {
    provider: ProviderSelector;
    locale: Locale;
    campaign?: (param: ProductSelector) => Promise<string | undefined>;
    trialLinks?: {
        [key: string]: {
            default?: {
                [key: `${string}-${string}`]: string;
            };
            [key: string]: {
                [key: `${string}-${string}`]: string;
            } | undefined;
        };
    };
    overrides?: {
        [key: string]: {
            default?: {
                campaign?: string;
                options?: {
                    [key: `${string}-${string}`]: Partial<UnboundProductOptionData> | undefined | null;
                };
            };
            [key: string]: {
                campaign?: string;
                options?: {
                    [key: `${string}-${string}`]: Partial<UnboundProductOptionData> | undefined | null;
                };
            } | undefined;
        };
    };
    transformers?: {
        option?: {
            buyLink: (buyLink: string) => Promise<string>;
        };
    };
    formatter?: (opt: PriceFormat) => string | number;
};
export declare const STORE_LOCALE: unique symbol;
export declare const STORE_ADAPTER: unique symbol;
export declare const STORE_CAMPAIGN: unique symbol;
export declare const STORE_TRANSFORMERS: unique symbol;
export declare const STORE_OVERRIDES: unique symbol;
export declare const STORE_TRIAL_LINKS: unique symbol;
export declare const STORE_FORMATTER: unique symbol;
export declare class Store {
    private cache;
    private [STORE_LOCALE];
    private [STORE_ADAPTER];
    private [STORE_CAMPAIGN];
    private [STORE_TRANSFORMERS];
    private [STORE_OVERRIDES];
    private [STORE_TRIAL_LINKS];
    private [STORE_FORMATTER];
    constructor(config: StoreConfig);
    getProduct(param: ProductSelector): Promise<Product | undefined>;
    getProduct(param: ProductSelector[]): Promise<(Product | undefined)[]>;
    private getProvider;
    formatPrice(opt: PriceFormat): string | number;
}
export {};

import { Adaptor } from "./adaptors/adaptor.base.js";
import { Product } from "./products/product.base.js";
import { InitSelectorProvider } from "./providers/provider.init-selector.js";
import { Provider, ProviderData } from "./providers/provider.interface.js";
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
    getCampaign: (param?: ProductSelector) => Promise<string | undefined>;
};
export declare class Store {
    private _locale;
    private cache;
    private _adaptor;
    getCampaign: (param?: ProductSelector) => Promise<string | undefined>;
    constructor(config: StoreConfig);
    get locale(): `${string}-${string}`;
    get adaptor(): Promise<Adaptor>;
    getProduct(param: ProductSelector): Promise<Product | undefined>;
    getProduct(param: ProductSelector[]): Promise<(Product | undefined)[]>;
    private getProvider;
}
export {};

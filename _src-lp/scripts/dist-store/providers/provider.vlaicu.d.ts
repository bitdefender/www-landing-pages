import { Product } from "../src/products/product.base.js";
import { Provider, ProviderData } from "./provider.interface.js";
export declare class VlaicuProvider implements Provider {
    private store;
    constructor(param: ProviderData);
    getProduct(): Promise<Product | undefined>;
}

import { ProductOption } from "../src/product-options/option.base.js";
import { Product, ProductData, UnboundProductOptionData } from "../src/products/product.base.js";
export declare class InitSelectorProduct extends Product {
    constructor(product: ProductData);
    protected bundle(base: ProductOption, options: ProductOption[]): Promise<UnboundProductOptionData>;
    private hasVpnOption;
    private applyVpnBundle;
    private getSmallBusinessBundleMapping;
    private applySmallBusinessBundle;
}

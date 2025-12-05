import { ProductBundleOption, ProductOption } from "../product-options/option.base.js";
import { Product, ProductData, UnboundProductOptionData } from "../products/product.base.js";
export declare class InitSelectorProduct extends Product {
    constructor(product: ProductData);
    protected bundle(base: ProductOption, options: ProductBundleOption[]): Promise<UnboundProductOptionData>;
    private hasVpnOption;
    private applyVpnBundle;
    private getSmallBusinessBundleMapping;
    private applySmallBusinessBundle;
}

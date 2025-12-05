import { ProductBundleOption, ProductOption } from "../product-options/option.base.js";
import { Product, ProductData, UnboundProductOptionData } from "../products/product.base.js";
export declare class VlaicuProduct extends Product {
    constructor(product: ProductData);
    protected bundle(base: ProductOption, options: ProductBundleOption[]): Promise<UnboundProductOptionData>;
}

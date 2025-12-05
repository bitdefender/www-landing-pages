import { ProductOption } from "../src/product-options/option.base.js";
import { Product, ProductData, UnboundProductOptionData } from "../src/products/product.base.js";
export declare class VlaicuProduct extends Product {
    constructor(product: ProductData);
    protected bundle(base: ProductOption, options: ProductOption[]): Promise<UnboundProductOptionData>;
}

import type { Product } from "@repobit/dex-store";
import { StateNode } from "./node.state.js";
export declare class ProductNode extends StateNode {
    autoForward: boolean;
    productId?: string;
    campaign?: string;
    product?: Product;
    private _productChangeEvent;
    private _forwardEventTask;
    private __loadProductTask;
    private _etaProductRenderTask;
    protected shouldRunEtaStateRender(): boolean;
    protected getUpdateComplete(): Promise<boolean>;
}

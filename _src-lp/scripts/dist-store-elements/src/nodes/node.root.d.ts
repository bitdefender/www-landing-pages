import { dataLayerContextType } from "../contexts/context.datalayer.js";
import { derivedContextType } from "../contexts/context.derived.js";
import { optionContextType } from "../contexts/context.option.js";
import { productContextType } from "../contexts/context.product.js";
import { storeContextType } from "../contexts/context.store.js";
import { StateNode } from "./node.state.js";
export declare class RootNode extends StateNode {
    /**
     * Consumes store provided by root node
     */
    store?: storeContextType;
    dataLayer?: dataLayerContextType;
    _optionContextDefault?: optionContextType;
    _productContextDefault?: productContextType;
    derived?: derivedContextType | null;
}

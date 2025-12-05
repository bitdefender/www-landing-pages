var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { dataLayerContext } from "../contexts/context.datalayer.js";
import { derivedContext } from "../contexts/context.derived.js";
import { optionContext } from "../contexts/context.option.js";
import { productContext } from "../contexts/context.product.js";
import { storeContext } from "../contexts/context.store.js";
import { provide } from "@lit/context";
import { property } from "lit/decorators.js";
import { StateNode } from "./node.state.js";
export class RootNode extends StateNode {
    constructor() {
        super(...arguments);
        // Provide a default answer for optionContext at the root so
        // consumers always receive a value (Promise<null>) even when
        // not inside a <bd-option> subtree. A closer provider overrides it.
        this._optionContextDefault = Promise.resolve(null);
        // Provide a default product context so binders receive a value
        // even outside a <bd-product> subtree (overridden by closer provider).
        this._productContextDefault = null;
        // Provide user-defined derived variables/functions for Eta + DSL
        this.derived = null;
    }
}
__decorate([
    provide({ context: storeContext }),
    property({ attribute: false })
], RootNode.prototype, "store", void 0);
__decorate([
    provide({ context: dataLayerContext }),
    property({ attribute: false })
], RootNode.prototype, "dataLayer", void 0);
__decorate([
    provide({ context: optionContext }),
    property({ attribute: false })
], RootNode.prototype, "_optionContextDefault", void 0);
__decorate([
    provide({ context: productContext }),
    property({ attribute: false })
], RootNode.prototype, "_productContextDefault", void 0);
__decorate([
    provide({ context: derivedContext }),
    property({ attribute: false })
], RootNode.prototype, "derived", void 0);
//# sourceMappingURL=node.root.js.map
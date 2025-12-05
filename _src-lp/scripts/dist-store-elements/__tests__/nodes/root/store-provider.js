var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { storeContext } from "../../../src/contexts/context.store.js";
import { ContextProvider } from "@lit/context";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
let StoreProvider = class StoreProvider extends LitElement {
    constructor() {
        super(...arguments);
        this.provider = new ContextProvider(this, { context: storeContext });
    }
    updated(changed) {
        if (changed.has("store")) {
            this.provider.setValue(this.store);
        }
    }
    render() {
        return html `<slot></slot>`;
    }
};
__decorate([
    property({ attribute: false })
], StoreProvider.prototype, "store", void 0);
StoreProvider = __decorate([
    customElement("bd-store-provider")
], StoreProvider);
export { StoreProvider };
//# sourceMappingURL=store-provider.js.map
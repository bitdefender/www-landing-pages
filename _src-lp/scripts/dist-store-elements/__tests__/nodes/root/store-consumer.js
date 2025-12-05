var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
// src/components/StoreConsumer.ts
import { storeContext } from "../../../src/contexts/context.store.js";
import { consume } from "@lit/context";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
let StoreConsumer = class StoreConsumer extends LitElement {
    render() {
        return html `
      <div id="store-output">
        ${this?.store
            ? "Store Set"
            : "No Store"}
      </div>
    `;
    }
};
__decorate([
    consume({ context: storeContext, subscribe: true }),
    property({ attribute: false })
], StoreConsumer.prototype, "store", void 0);
StoreConsumer = __decorate([
    customElement("bd-store-consumer")
], StoreConsumer);
export { StoreConsumer };
//# sourceMappingURL=store-consumer.js.map
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { productContext } from "../contexts/context.product.js";
import { ActionEvent } from "../events/events.js";
import { toDSLContext } from "../renders/context.js";
import { provide } from "@lit/context";
import { Task } from "@lit/task";
import { property } from "lit/decorators.js";
import { StateNode } from "./node.state.js";
export class ProductNode extends StateNode {
    constructor() {
        super(...arguments);
        // Use custom forward tasks; disable default passthrough.
        this.autoForward = false;
        // Reflect incoming product-change events and forward original event.
        this._productChangeEvent = new Task(this, {
            task: ([evt]) => {
                if (!evt)
                    return null;
                if (this.isProductChange(evt)) {
                    this.productId = evt.detail.id;
                    this.campaign = evt.detail.campaign;
                }
                this._forwardEvent(this._event);
                this._notifyParent();
            },
            args: () => [this._event]
        });
        // Synthesize product-change events when attributes change locally.
        this._forwardEventTask = new Task(this, {
            task: ([id, campaign]) => {
                const evt = this._event;
                if (evt && this.isProductChange(evt)) {
                    const { id: evtId, campaign: evtCampaign } = evt.detail;
                    if (evtId === id && evtCampaign === campaign) {
                        return; // skip resynthesizing if mirroring incoming event
                    }
                }
                if (id) {
                    this._forwardEvent(new ActionEvent({ id, campaign }));
                    this._notifyParent();
                }
            },
            args: () => [this.productId, this.campaign]
        });
        this.__loadProductTask = new Task(this, {
            task: async ([store, id, campaign]) => {
                if (!store || !id) {
                    this.product = undefined;
                    return undefined;
                }
                const product = await store.getProduct({ id, campaign });
                this.product = product;
                return product;
            },
            args: () => [this._store, this.productId, this.campaign]
        });
        // Render text templates for product-specific context in direct children
        this._etaProductRenderTask = new Task(this, {
            task: async ([product, state, derived]) => {
                if (!product)
                    return;
                this._etaRenderInProgress = true;
                try {
                    const it = await toDSLContext({ product, state, derived });
                    await this._renderEtaTemplates(it);
                }
                finally {
                    this._etaRenderInProgress = false;
                    // Resolve any waiters from super.getUpdateComplete()
                    this._notifyEtaIdle();
                }
            },
            args: () => [this.product, this.state, this._derived]
        });
    }
    // Avoid double-rendering via StateNode's base Eta render;
    // product task includes state in its context.
    shouldRunEtaStateRender() { return false; }
    async getUpdateComplete() {
        const result = await super.getUpdateComplete();
        await this._productChangeEvent.taskComplete;
        await this._forwardEventTask.taskComplete;
        await this.__loadProductTask.taskComplete;
        await this._etaProductRenderTask.taskComplete;
        return result;
    }
}
__decorate([
    property({ attribute: 'product-id', reflect: true })
], ProductNode.prototype, "productId", void 0);
__decorate([
    property({ reflect: true })
], ProductNode.prototype, "campaign", void 0);
__decorate([
    provide({ context: productContext }),
    property({ attribute: false })
], ProductNode.prototype, "product", void 0);
//# sourceMappingURL=node.product.js.map
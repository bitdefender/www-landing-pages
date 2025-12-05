var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { dataLayerContext } from "../contexts/context.datalayer.js";
import { optionContext } from "../contexts/context.option.js";
import { productContext } from "../contexts/context.product.js";
import { toDSLContext } from "../renders/context.js";
import { consume, provide } from "@lit/context";
import { Task } from "@lit/task";
import { property } from "lit/decorators.js";
import { StateNode } from "./node.state.js";
export class OptionNode extends StateNode {
    constructor() {
        super(...arguments);
        this.bundle = [];
        // ensure datalayer is fired only once (first load)
        this._sentDataLayer = false;
        this._changeOptionEvent = new Task(this, {
            task: async ([evt, store]) => {
                if (!evt || !store) {
                    return null;
                }
                // Ignore events matching this node's ignoreEvents list (works for DOM or context)
                if (this._isIgnoredSource(evt)) {
                    return null;
                }
                this._optionContext = this._changeOptionEvent.taskComplete;
                if (!this.noCollect) {
                    this.collectOption({
                        name: this.storeName,
                        options: this._changeOptionEvent.taskComplete.then(option => option ? [option] : [])
                    });
                }
                let option = null;
                if (this.isActionEvent(evt)) {
                    // Record event-driven attribute values (if any) so attribute task can skip
                    this._pendingDevicesFromEvent = evt.detail?.devices;
                    this._pendingSubscriptionFromEvent = evt.detail?.subscription;
                    option = await this.__applyAction(evt.detail || {});
                }
                if (this.isBundleToogle(evt)) {
                    option = await this.__applyBundle(evt.detail || {});
                }
                if (this.isDeltaUpdate(evt)) {
                    option = await this._applyDeltaUpdate(evt.detail || {});
                }
                this._option = option;
                return option;
            },
            args: () => [this._event, this._store]
        });
        // Ensure datalayer is emitted if the callback becomes available slightly
        // after the first option was computed.
        this._fireDataLayerTask = new Task(this, {
            task: async ([opt, dl, evt]) => {
                if (this._sentDataLayer)
                    return;
                if (opt && dl && evt) {
                    dl({ option: opt, event: evt });
                    this._sentDataLayer = true;
                }
            },
            args: () => [this._option, this._dataLayer, this.dataLayerEvent]
        });
        this._loadOptionByAttributes = new Task(this, {
            task: async ([devices, subscription]) => {
                // Skip only when current attribute values were just set by an event
                if ((this._pendingDevicesFromEvent !== undefined && devices === this._pendingDevicesFromEvent) ||
                    (this._pendingSubscriptionFromEvent !== undefined && subscription === this._pendingSubscriptionFromEvent)) {
                    this._pendingDevicesFromEvent = undefined;
                    this._pendingSubscriptionFromEvent = undefined;
                    return this._option;
                }
                if (!this._option) {
                    return null;
                }
                if (!devices || !subscription) {
                    this._option = null;
                    return null;
                }
                this._optionContext = this._loadOptionByAttributes.taskComplete;
                if (!this.noCollect) {
                    this.collectOption({
                        name: this.storeName,
                        options: this._loadOptionByAttributes.taskComplete.then(option => option ? [option] : [])
                    });
                }
                const option = await this.option?.getOption({ devices, subscription });
                this._option = option;
                return option;
            },
            args: () => [this.devices, this.subscription]
        });
        // Render text templates for option-specific context in direct children
        this._etaOptionRenderTask = new Task(this, {
            task: async ([opt, state, product, derived]) => {
                const option = opt ?? this._option;
                if (!option)
                    return;
                this._etaRenderInProgress = true;
                try {
                    const it = await toDSLContext({ option, product, state, derived });
                    await this._renderEtaTemplates(it);
                }
                finally {
                    this._etaRenderInProgress = false;
                    // Resolve any waiters from super.getUpdateComplete()
                    this._notifyEtaIdle();
                }
            },
            args: () => [this._option, this.state, this.product, this._derived]
        });
    }
    get option() {
        return this._option;
    }
    // Disable base state-level Eta render to avoid double rendering.
    shouldRunEtaStateRender() { return false; }
    connectedCallback() {
        super.connectedCallback();
        if (!this.noCollect) {
            this.collectOption({
                name: this.storeName,
                options: Promise.resolve(this._option ? [this._option] : [])
            });
        }
    }
    disconnectedCallback() {
        this.collectOption({
            name: this.storeName,
            options: null
        });
        super.disconnectedCallback();
    }
    async getUpdateComplete() {
        const result = await super.getUpdateComplete();
        await this._changeOptionEvent.taskComplete;
        await this._loadOptionByAttributes.taskComplete;
        await this._etaOptionRenderTask.taskComplete;
        await this._fireDataLayerTask.taskComplete;
        return result;
    }
    _eventChange(e) {
        // Respect option-level ignore list
        if (this._isIgnoredSource(e)) {
            e.stopPropagation();
            return;
        }
        // Always capture locally
        this._eventDom = e;
        // Allow only product-change events to bubble up to <bd-product>
        if (this.isProductChange(e)) {
            return; // no stopPropagation → let it bubble
        }
        // Keep all other events scoped to this option
        e.stopPropagation();
    }
    async _applyDeltaUpdate({ type, delta, useAsValue, min = Number.MAX_SAFE_INTEGER, max = Number.MIN_SAFE_INTEGER }) {
        const devices = useAsValue && type === "devices" ? Number(delta) : this.devices;
        const subscription = useAsValue && type === "subscription" ? Number(delta) : this.subscription;
        let option;
        if (useAsValue) {
            if (!devices || !subscription) {
                return null;
            }
            option = await this.option?.getOption({ devices, subscription });
        }
        option = await this.option?.nextOption(type === "devices" ?
            { devices: delta } :
            { subscription: delta });
        if (!option) {
            return null;
        }
        if (type === "devices" && (option.getDevices() < min || option.getDevices() > max)) {
            return null;
        }
        if (type === "subscription" && (option.getSubscription() < min || option.getSubscription() > max)) {
            return null;
        }
        // Mark as event-driven attribute update to avoid double work
        this._pendingDevicesFromEvent = devices;
        this._pendingSubscriptionFromEvent = subscription;
        this.devices = devices;
        this.subscription = subscription;
        return option;
    }
    async __applyAction({ id, campaign, devices, subscription }) {
        this.devices = devices || this.devices;
        this.subscription = subscription || this.subscription;
        if (!this.devices || !this.subscription) {
            return null;
        }
        if (id) {
            const product = await this._store?.getProduct({ id, campaign });
            return product?.getOption({
                devices: this.devices,
                subscription: this.subscription,
                bundle: this.option?.getBundle() || []
            });
        }
        return this.option?.getOption({ devices: this.devices, subscription: this.subscription });
    }
    async __applyBundle(option) {
        const devices = option.devices || this.devices;
        const subscription = option.subscription || this.subscription;
        if (!devices || !subscription || !option.id) {
            return null;
        }
        const productToBeBundled = await this._store?.getProduct({ id: option.id, campaign: option.campaign });
        const optionToBeBundled = await productToBeBundled?.getOption({ devices, subscription });
        if (!optionToBeBundled) {
            return null;
        }
        if (this.devices && this.subscription) {
            return this.option?.toogleBundle({
                devicesFixed: Boolean(option.devices),
                subscriptionFixed: Boolean(option.subscription),
                option: optionToBeBundled
            });
        }
        return null;
    }
}
__decorate([
    provide({ context: optionContext }),
    property({ attribute: false })
], OptionNode.prototype, "_optionContext", void 0);
__decorate([
    consume({ context: dataLayerContext, subscribe: true }),
    property({ attribute: false })
], OptionNode.prototype, "_dataLayer", void 0);
__decorate([
    consume({ context: productContext, subscribe: true }),
    property({ attribute: false })
], OptionNode.prototype, "product", void 0);
__decorate([
    property({ attribute: false })
], OptionNode.prototype, "bundle", void 0);
__decorate([
    property({ type: Number, reflect: true })
], OptionNode.prototype, "devices", void 0);
__decorate([
    property({ type: Number, reflect: true })
], OptionNode.prototype, "subscription", void 0);
__decorate([
    property({ attribute: 'data-layer-event' })
], OptionNode.prototype, "dataLayerEvent", void 0);
//# sourceMappingURL=node.option.js.map
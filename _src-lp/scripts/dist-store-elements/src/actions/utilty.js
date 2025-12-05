import { CollectActionEvent, CollectUpdateByDeltaEvent } from "../events/events.js";
import { button } from "./action.button.js";
import { input } from "./action.input.js";
import { select } from "./action.select.js";
export const DATA_ACTION_NODE = "[data-store-action]";
// Track initialized action nodes to ensure we don't wire them up twice
const ACTION_BOUND = new WeakSet();
export const readClickAttributes = (el) => {
    const ds = el.dataset;
    const storeId = ds.storeId || undefined;
    if ('storeSetType' in ds) {
        return {
            type: ds.storeSetType,
            delta: ds.storeSetDelta === "next" || ds.storeSetDelta === "prev" ? ds.storeSetDelta : Number(ds.storeSetDelta),
            min: Number(ds.storeSetMin) || undefined,
            max: Number(ds.storeSetMax) || undefined,
            useAsValue: ds.storeSetUseAsValue === 'true' || ds.storeSetUseAsValue === '' || false,
            storeId
        };
    }
    else {
        return {
            devices: Number(ds.storeSetDevices) || undefined,
            subscription: Number(ds.storeSetSubscription) || undefined,
            id: ds.storeSetId,
            campaign: ds.storeSetCampaign,
            bundle: ds.storeSetBundle === 'true' || ds.storeSetBundle === '' || false,
            storeId
        };
    }
};
const addLogic = async (el) => {
    if (el.updateComplete) {
        await el.updateComplete;
    }
    if (el instanceof HTMLInputElement) {
        connectedCallback(el);
        input(el);
        return;
    }
    if (el instanceof HTMLSelectElement) {
        [...el.options]
            .forEach(option => connectedCallback(option));
        select(el);
        return;
    }
    //treat everything else as a button
    button(el);
    connectedCallback(el);
};
export const connectedCallback = (el) => {
    if (!el.storeName) {
        el.storeName = Symbol("action");
    }
    const attr = readClickAttributes(el);
    const noCollect = (el.dataset.storeNoCollect === '' || el.dataset.storeNoCollect === 'true');
    const shouldCollect = !noCollect;
    if (shouldCollect) {
        if ('type' in attr) {
            el.dispatchEvent(new CollectUpdateByDeltaEvent({ name: el.storeName, update: attr }));
        }
        else {
            el.dispatchEvent(new CollectActionEvent({ name: el.storeName, action: attr }));
        }
    }
};
export const disconnectedCallback = (el) => {
    const attr = readClickAttributes(el);
    const noCollect = (el.dataset.storeNoCollect === '' || el.dataset.storeNoCollect === 'true');
    const shouldCollect = !noCollect;
    if (shouldCollect) {
        if ('storeSetType' in attr) {
            el.dispatchEvent(new CollectUpdateByDeltaEvent({
                name: el.storeName,
                update: null
            }));
        }
        else {
            el.dispatchEvent(new CollectActionEvent({
                name: el.storeName,
                action: null
            }));
        }
    }
};
export const handleActionNode = (node) => {
    if (ACTION_BOUND.has(node))
        return;
    ACTION_BOUND.add(node);
    addLogic(node);
};
export const cleanupActionNode = (node) => {
    // Fire disconnect events to clear collected actions
    if (node instanceof HTMLSelectElement) {
        [...node.options].forEach(option => disconnectedCallback(option));
    }
    else {
        disconnectedCallback(node);
    }
    ACTION_BOUND.delete(node);
};
export const addEventListener = (el, type, listener) => {
    el.addEventListener(type, listener);
    const originalRemove = el.remove;
    el.remove = () => {
        if (el instanceof HTMLSelectElement) {
            [...el.options]
                .forEach(option => disconnectedCallback(option));
        }
        else {
            disconnectedCallback(el);
        }
        el.removeEventListener(type, listener);
        // Allow re-initialization if element is re-attached later
        ACTION_BOUND.delete(el);
        originalRemove.call(el);
    };
};
//# sourceMappingURL=utilty.js.map
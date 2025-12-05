import { ProductOption } from "@repobit/dex-store";
export type UpdateByDelta = {
    type: "devices" | "subscription";
    delta: number | "next" | "prev";
    min?: number;
    max?: number;
    /**
     * If true, treat `delta` as the new absolute value
     * instead of adding/subtracting it.
     */
    useAsValue?: boolean;
    /**
     * Optional identifier of the action source element (data-store-id)
     */
    storeId?: string;
};
export type Action = {
    id?: string;
    campaign?: string;
    bundle?: boolean;
    devices?: number;
    subscription?: number;
    /**
     * Optional identifier of the action source element (data-store-id)
     */
    storeId?: string;
};
export type CollectUpdateByDelta = {
    name: symbol | string;
    update: UpdateByDelta | null;
};
export type CollectAction = {
    name: symbol | string;
    action: Action | null;
};
export type CollectOption = {
    name: symbol | string;
    options: Promise<ProductOption[]> | null;
};
export declare class UpdateByDeltaEvent extends CustomEvent<UpdateByDelta> {
    static readonly eventName = "store-update-delta";
    constructor(detail: UpdateByDelta);
}
export declare class ActionEvent extends CustomEvent<Action> {
    static readonly eventName = "store-set-action";
    constructor(detail: Action);
}
export declare class CollectActionEvent extends CustomEvent<CollectAction> {
    static readonly eventName = "store-collect-action";
    constructor(detail: CollectAction);
}
export declare class CollectUpdateByDeltaEvent extends CustomEvent<CollectUpdateByDelta> {
    static readonly eventName = "store-collect-update-by-delta";
    constructor(detail: CollectUpdateByDelta);
}
export declare class CollectOptionEvent extends CustomEvent<CollectOption> {
    static readonly eventName = "store-collect-option";
    constructor(detail: CollectOption);
}
/**
 * Contextual child registration for updateComplete coordination.
 * Children dispatch these to their nearest StateNode-like parent.
 */
export type CollectChild = {
    child: HTMLElement;
};
export declare class CollectChildEvent extends CustomEvent<CollectChild> {
    static readonly eventName = "store-collect-child";
    constructor(detail: CollectChild);
}
export declare class CollectChildRemovedEvent extends CustomEvent<CollectChild> {
    static readonly eventName = "store-collect-child-removed";
    constructor(detail: CollectChild);
}
export type EventType = UpdateByDeltaEvent | ActionEvent;

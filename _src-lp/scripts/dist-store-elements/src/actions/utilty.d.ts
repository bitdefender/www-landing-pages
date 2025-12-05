import { Action, UpdateByDelta } from "../events/events.js";
export type ActionAttributes = UpdateByDelta | Action;
type WithStore = {
    storeName: symbol;
    updateComplete: Promise<void>;
};
export type ActionNode<T extends HTMLElement = HTMLElement> = T & WithStore;
export declare const DATA_ACTION_NODE = "[data-store-action]";
export declare const readClickAttributes: (el: HTMLElement) => ActionAttributes;
export declare const connectedCallback: (el: ActionNode) => void;
export declare const disconnectedCallback: (el: ActionNode) => void;
export declare const handleActionNode: (node: ActionNode) => void;
export declare const cleanupActionNode: (node: ActionNode) => void;
export declare const addEventListener: (el: HTMLElement, type: "click" | "change", listener: (event: Event) => void) => void;
export {};

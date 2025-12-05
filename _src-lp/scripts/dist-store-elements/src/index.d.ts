import { registerActionNodes } from "./actions/index.js";
import { ContextNode } from './nodes/node.context.js';
import { OptionNode } from './nodes/node.option.js';
import { ProductNode } from './nodes/node.product.js';
import { RootNode } from './nodes/node.root.js';
import { StateNode } from './nodes/node.state.js';
import { registerRenderNodes } from "./renders/index.js";
export { registerActionNodes, registerRenderNodes };
export declare const elementDefinitions: {
    readonly 'bd-root': typeof RootNode;
    readonly 'bd-state': typeof StateNode;
    readonly 'bd-product': typeof ProductNode;
    readonly 'bd-option': typeof OptionNode;
    readonly 'bd-context': typeof ContextNode;
};
export declare function registerContextNodes(): void;
export { ContextNode, OptionNode, ProductNode, RootNode, StateNode };

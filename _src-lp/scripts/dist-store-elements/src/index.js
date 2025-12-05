import { registerActionNodes } from "./actions/index.js";
import { ContextNode } from './nodes/node.context.js';
import { OptionNode } from './nodes/node.option.js';
import { ProductNode } from './nodes/node.product.js';
import { RootNode } from './nodes/node.root.js';
import { StateNode } from './nodes/node.state.js';
import { registerRenderNodes } from "./renders/index.js";
export { registerActionNodes, registerRenderNodes };
// Export definitions for consumers who want tags + constructors
export const elementDefinitions = {
    'bd-root': RootNode,
    'bd-state': StateNode,
    'bd-product': ProductNode,
    'bd-option': OptionNode,
    'bd-context': ContextNode
};
export function registerContextNodes() {
    for (const [tag, Ctor] of Object.entries(elementDefinitions)) {
        if (!customElements.get(tag)) {
            customElements.define(tag, Ctor);
        }
    }
}
export { ContextNode, OptionNode, ProductNode, RootNode, StateNode };
//# sourceMappingURL=index.js.map
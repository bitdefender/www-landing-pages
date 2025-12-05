import { StateNode } from "./node.state.js";
export class ContextNode extends StateNode {
    constructor() {
        super(...arguments);
        this.ignoreEventsParent = true;
    }
}
//# sourceMappingURL=node.context.js.map
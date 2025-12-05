import { cleanupActionNode, DATA_ACTION_NODE, handleActionNode } from "./utilty.js";
const registerActionNodes = (root) => {
    const observed = new WeakSet();
    const cleanupShadowTree = (shadowRoot) => {
        shadowRoot
            .querySelectorAll(DATA_ACTION_NODE)
            .forEach(n => cleanupActionNode(n));
        shadowRoot
            .querySelectorAll('[shadow]')
            .forEach(host => host.shadowRoot && cleanupShadowTree(host.shadowRoot));
    };
    const handleAdded = (node) => {
        if (node.matches(DATA_ACTION_NODE)) {
            handleActionNode(node);
        }
        node
            .querySelectorAll(DATA_ACTION_NODE)
            .forEach(handleActionNode);
        if (node.hasAttribute('shadow') && node.shadowRoot) {
            watch(node.shadowRoot);
        }
        node
            .querySelectorAll('[shadow]')
            .forEach(host => host.shadowRoot && watch(host.shadowRoot));
    };
    const handleRemoved = (node) => {
        if (node.matches(DATA_ACTION_NODE)) {
            cleanupActionNode(node);
        }
        node
            .querySelectorAll(DATA_ACTION_NODE)
            .forEach(n => cleanupActionNode(n));
        if (node.hasAttribute('shadow') && node.shadowRoot) {
            cleanupShadowTree(node.shadowRoot);
        }
        node
            .querySelectorAll('[shadow]')
            .forEach(host => host.shadowRoot && cleanupShadowTree(host.shadowRoot));
    };
    const watch = (node) => {
        if (observed.has(node))
            return;
        observed.add(node);
        if (node instanceof HTMLElement && node.matches(DATA_ACTION_NODE)) {
            handleActionNode(node);
        }
        node
            .querySelectorAll(DATA_ACTION_NODE)
            .forEach(handleActionNode);
        if (node instanceof HTMLElement && node.hasAttribute('shadow') && node.shadowRoot) {
            watch(node.shadowRoot);
        }
        if ('querySelectorAll' in node) {
            node
                .querySelectorAll('[shadow]')
                .forEach(host => host.shadowRoot && watch(host.shadowRoot));
        }
        const mo = new MutationObserver(muts => {
            for (const m of muts) {
                for (const added of Array.from(m.addedNodes)) {
                    if (!(added instanceof HTMLElement))
                        continue;
                    handleAdded(added);
                }
                for (const removed of Array.from(m.removedNodes)) {
                    if (!(removed instanceof HTMLElement))
                        continue;
                    handleRemoved(removed);
                }
            }
        });
        mo.observe(node, {
            childList: true,
            subtree: true
        });
    };
    watch(root);
};
export { registerActionNodes };
//# sourceMappingURL=index.js.map
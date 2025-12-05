import { cleanupRenderNode, DATA_HIDE_NODE, DATA_RENDER_NODE, handleRenderNode } from "./utility.js";
const selectors = [DATA_HIDE_NODE, DATA_RENDER_NODE];
const registerRenderNodes = (root) => {
    const observed = new WeakSet();
    const selectorStr = selectors.join(',');
    const cleanupShadowTree = (shadowRoot) => {
        shadowRoot
            .querySelectorAll(selectorStr)
            .forEach(n => cleanupRenderNode(n));
        shadowRoot
            .querySelectorAll('[shadow]')
            .forEach(host => host.shadowRoot && cleanupShadowTree(host.shadowRoot));
    };
    const handleAdded = (node) => {
        if (selectors.some(s => node.matches(s))) {
            handleRenderNode(node);
        }
        node
            .querySelectorAll(selectorStr)
            .forEach(handleRenderNode);
        if (node.hasAttribute('shadow') && node.shadowRoot) {
            watch(node.shadowRoot);
        }
        node
            .querySelectorAll('[shadow]')
            .forEach(host => host.shadowRoot && watch(host.shadowRoot));
    };
    const handleRemoved = (node) => {
        if (selectors.some(s => node.matches(s))) {
            cleanupRenderNode(node);
        }
        node
            .querySelectorAll(selectorStr)
            .forEach(n => cleanupRenderNode(n));
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
        if (node instanceof HTMLElement && selectors.some(s => node.matches(s))) {
            handleRenderNode(node);
        }
        node
            .querySelectorAll(selectorStr)
            .forEach(handleRenderNode);
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
export { registerRenderNodes };
//# sourceMappingURL=index.js.map
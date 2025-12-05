import { Eta } from 'eta/core';
// Single Eta engine instance used across nodes
const eta = new Eta({
    // We control where templates are injected (text nodes), so auto-escape can remain default.
    // Configure here if you want escaping behavior to change globally.
    tags: ["{{", "}}"]
});
export default eta;
//# sourceMappingURL=eta.js.map
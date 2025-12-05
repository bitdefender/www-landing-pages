import eta from "../../../templating/eta.js";
// Very lightweight preflight checks so we can rely on Eta/JS
// for actual expression evaluation while still catching a few
// DSL-specific pitfalls we used to guard against.
function preflight(expr) {
    // 1) Disallow chained comparisons like: a < b < c
    // Match two comparison operators with no logical op (&&, ||) between
    const chainedCmp = /(<=|>=|<|>)\s*[^&|]+(<=|>=|<|>)/;
    if (chainedCmp.test(expr)) {
        throw new Error("Chained comparisons are not allowed");
    }
    // 2) Basic parentheses balance check to surface a clearer error
    let depth = 0;
    for (const ch of expr) {
        if (ch === "(")
            depth++;
        else if (ch === ")") {
            depth--;
            if (depth < 0) {
                // extra closing paren
                throw new Error("Unexpected ')'");
            }
        }
    }
    if (depth > 0) {
        throw new Error("Expected ')' ");
    }
}
export const compiler = ({ expr, ctx }) => {
    preflight(expr);
    // Normalize equality to strict semantics to match legacy DSL behavior
    // - '=='  -> '==='
    // - '!='  -> '!=='
    // Note: This is a simple text replacement and does not account for quoted strings,
    // but our DSL usage does not place operators inside string literals.
    const normalized = expr
        .replace(/!=(?!=)/g, '!==')
        .replace(/(?<![=!])==(?![=])/g, '===');
    // Build a tiny Eta template that coerces the expression to boolean.
    const tpl = `{{= !!(${normalized}) }}`;
    try {
        const fn = eta.compile(tpl);
        const out = eta.render(fn, ctx);
        // Eta returns a string; normalize to boolean
        return String(out).trim() === "true";
    }
    catch (e) {
        // Normalize error to a generic syntax error message used in tests
        const msg = e instanceof Error ? e.message : String(e);
        throw new Error(`Unexpected expression error: ${msg}`);
    }
};
//# sourceMappingURL=compiler.js.map
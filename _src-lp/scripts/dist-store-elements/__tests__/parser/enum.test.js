// tests/enum.test.ts
// UPDATE THESE IMPORTS
import { Compiler } from "../../src/dsl/compilers/index.js";
import { getPath, isTruthy } from "../../src/dsl/utilty.js";
const PRICE_ALLOWED = ['full', 'discounted', 'full-monthly', 'discounted-monthly'];
// availability predicate (customize to your ctx shape)
const isPriceAvailable = (ctx) => (v) => {
    switch (v) {
        case "full": return isTruthy(getPath(ctx, "price.full"));
        case "discounted": return isTruthy(getPath(ctx, "price.discounted"));
        case "full-monthly": return isTruthy(getPath(ctx, "price.fullMonthly"));
        case "discounted-monthly": return isTruthy(getPath(ctx, "price.discountedMonthly"));
        default: return false;
    }
};
describe('enum fallback', () => {
    const evalExpr = (expr, ctx) => Compiler.enum({
        expr,
        allowed: PRICE_ALLOWED,
        isAvailable: isPriceAvailable(ctx)
    });
    it('picks the first available in order', () => {
        const ctx1 = { price: { full: 20, discounted: 10 } };
        const ctx2 = { price: { full: 20 } };
        expect(evalExpr('discounted || full', ctx1)).toBe('discounted');
        expect(evalExpr('discounted || full', ctx2)).toBe('full');
    });
    it('returns undefined when none available', () => {
        const ctx = { price: {} };
        expect(evalExpr('discounted || full', ctx)).toBeUndefined();
    });
    it('ignores unknown tokens and still works', () => {
        const ctx = { price: { full: 1 } };
        expect(evalExpr('unknown || full', ctx)).toBe('full');
    });
    it('handles single token', () => {
        const ctx = { price: { full: 99 } };
        expect(evalExpr('full', ctx)).toBe('full');
    });
});
//# sourceMappingURL=enum.test.js.map
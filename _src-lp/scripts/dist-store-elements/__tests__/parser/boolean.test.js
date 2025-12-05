// tests/hide.test.ts
// UPDATE THESE IMPORTS
import { Compiler } from "../../src/dsl/compilers/index.js";
describe('hide grammar', () => {
    const evalExpr = (expr, ctx) => Compiler.boolean({ expr, ctx });
    it('parses literals and returns booleans', () => {
        expect(evalExpr('true', {})).toBe(true);
        expect(evalExpr('false', {})).toBe(false);
    });
    it('supports dotted paths and truthiness', () => {
        const ctx = { prices: { full: 20 }, flag: 0 };
        expect(evalExpr('it.prices.full', ctx)).toBe(true);
        expect(evalExpr('it.flag', ctx)).toBe(false);
        expect(evalExpr('!it.flag', ctx)).toBe(true);
    });
    it('supports equality / inequality (strict)', () => {
        const ctx = { product: 'tsmd', years: 1, vip: true };
        expect(evalExpr("it.product == 'tsmd'", ctx)).toBe(true);
        expect(evalExpr("it.product != 'pro'", ctx)).toBe(true);
        expect(evalExpr('it.years == 1', ctx)).toBe(true);
        expect(evalExpr('it.vip == true', ctx)).toBe(true);
    });
    it('supports numeric comparisons', () => {
        const ctx = { n: 10 };
        expect(evalExpr('it.n > 5', ctx)).toBe(true);
        expect(evalExpr('it.n >= 10', ctx)).toBe(true);
        expect(evalExpr('it.n < 9', ctx)).toBe(false);
        expect(evalExpr('it.n <= 10', ctx)).toBe(true);
    });
    it('respects precedence: ! > cmp > && > ||', () => {
        expect(evalExpr('false || true && false', {})).toBe(false); // && first
        expect(evalExpr('!false && false || true', {})).toBe(true); // ! then && then ||
    });
    it('handles parentheses', () => {
        expect(evalExpr('(false || true) && false', {})).toBe(false);
        expect(evalExpr('false || (true && false)', {})).toBe(false);
    });
    it('rejects chained comparisons like a < b < c', () => {
        // compile-time error because parseHideExpr is used internally
        expect(() => evalExpr('1 < 2 < 3', {})).toThrow(/Chained comparisons/);
        expect(() => evalExpr('a > b > c', {})).toThrow();
    });
    it('throws on trailing tokens and bad syntax', () => {
        expect(() => evalExpr('true true', {})).toThrow(/Unexpected|Trailing/);
        expect(() => evalExpr('(true', {})).toThrow(/Expected '\)'/);
        expect(() => evalExpr(')', {})).toThrow();
    });
    it('supports strings and escapes', () => {
        const ctx = { s: 'hello' };
        expect(evalExpr(`it.s == 'hello'`, ctx)).toBe(true);
        expect(evalExpr(`it.s != "world"`, ctx)).toBe(true);
    });
    it('undefined/null literals', () => {
        const ctx = { x: undefined, y: null };
        expect(evalExpr('it.x == undefined', ctx)).toBe(true);
        expect(evalExpr('it.y == null', ctx)).toBe(true);
        expect(evalExpr('it.x == null', ctx)).toBe(false);
    });
});
//# sourceMappingURL=boolean.test.js.map
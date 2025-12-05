import { Compiler } from "../../src/dsl/compilers/index.js";
const evalExpr = (expr) => Compiler.array(expr);
describe('evalExpr', () => {
    it('returns [] for empty string or whitespace', () => {
        expect(evalExpr('')).toBeUndefined();
        expect(evalExpr('   ')).toBeUndefined();
    });
    it('parses simple lists', () => {
        expect(evalExpr('2,3,4,5')).toEqual([2, 3, 4, 5]);
        expect(evalExpr(' 1 ,  2 ,3')).toEqual([1, 2, 3]);
        expect(evalExpr('-1,0,1')).toEqual([-1, 0, 1]);
    });
    it('parses inclusive ranges (asc & desc)', () => {
        expect(evalExpr('1..4')).toEqual([1, 2, 3, 4]);
        expect(evalExpr('4..1')).toEqual([4, 3, 2, 1]);
        expect(evalExpr('1..3,7,5..3')).toEqual([1, 2, 3, 7, 5, 4, 3]);
    });
    it('throws on invalid tokens', () => {
        expect(() => evalExpr('1..a')).toThrow(/Invalid number token/);
        expect(() => evalExpr('1.5')).toThrow(/Invalid number token/);
        expect(() => evalExpr('1...3')).toThrow(/Invalid number token/);
    });
});
//# sourceMappingURL=array.test.js.map
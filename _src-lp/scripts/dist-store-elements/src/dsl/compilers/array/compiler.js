import { split } from "../../../dsl/utilty.js";
// "2,3,4,5"           -> [2,3,4,5]
// "1..4,8,10..7"      -> [1,2,3,4,8,10,9,8,7]
// ""                  -> undefined
export const compiler = (raw) => {
    const s = raw.trim();
    if (s === "")
        return undefined;
    const out = [];
    const intRe = /^-?\d+$/;
    const rangeRe = /^(-?\d+)\s*\.\.\s*(-?\d+)$/;
    for (const part of split(s, ",")) {
        const m = part.match(rangeRe);
        if (m) {
            const a = parseInt(m[1], 10);
            const b = parseInt(m[2], 10);
            const step = a <= b ? 1 : -1;
            for (let v = a; v !== b + step; v += step)
                out.push(v);
            continue;
        }
        if (intRe.test(part)) {
            out.push(parseInt(part, 10));
            continue;
        }
        throw new Error(`Invalid number token: "${part}"`);
    }
    return out;
};
//# sourceMappingURL=compiler.js.map
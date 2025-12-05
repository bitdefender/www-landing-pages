import { split } from "../../../dsl/utilty.js";
export const compiler = ({ expr, allowed, isAvailable }) => {
    const tokens = split(expr, "||");
    // validate tokens early
    for (const t of tokens) {
        if (!allowed.includes(t)) {
            console.warn(`[store] Unknown token "${t}". Allowed: ${allowed.join(", ")}`);
        }
    }
    for (const t of tokens) {
        if (allowed.includes(t) && isAvailable(t))
            return t;
    }
    return undefined;
};
//# sourceMappingURL=compiler.js.map
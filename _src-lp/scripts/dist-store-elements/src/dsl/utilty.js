export const isRecord = (v) => v !== null && typeof v === "object";
export const getPath = (ctx, path) => {
    let acc = ctx;
    for (const key of path.split(".")) {
        if (!isRecord(acc) || !(key in acc))
            return undefined;
        acc = acc[key];
    }
    return acc;
};
export const isTruthy = (v) => v !== "" && v !== false && v !== null && v !== undefined;
// Parse quoted literal or pass-through
export const coerceLiteral = (s) => {
    if (/^-?\d+(\.\d+)?$/.test(s))
        return Number(s);
    if (s === "true")
        return true;
    if (s === "false")
        return false;
    if (s === "null")
        return null;
    if (s === "undefined")
        return undefined;
    const q = s[0], end = s[s.length - 1];
    if ((q === "'" && end === "'") || (q === '"' && end === '"'))
        return s.slice(1, -1);
    return s;
};
// Split by token, trim, drop empties
export const split = (raw, sep) => raw.split(sep).map(s => s.trim())
    .filter(Boolean);
//# sourceMappingURL=utilty.js.map
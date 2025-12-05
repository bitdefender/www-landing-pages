export type Ctx = Record<string, unknown>;
export declare const isRecord: (v: unknown) => v is Record<string, unknown>;
export declare const getPath: <T = unknown>(ctx: unknown, path: string) => T | undefined;
export declare const isTruthy: (v: unknown) => boolean;
export declare const coerceLiteral: (s: string) => string | number | boolean | null | undefined;
export declare const split: (raw: string, sep: string) => string[];

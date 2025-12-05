export declare const Compiler: {
    readonly boolean: ({ expr, ctx }: {
        expr: string;
        ctx: import("../utilty.js").Ctx;
    }) => boolean;
    readonly enum: <Allowed extends string>({ expr, allowed, isAvailable }: {
        expr: string;
        allowed: readonly Allowed[];
        isAvailable: (variant: Allowed) => boolean;
    }) => Allowed | undefined;
    readonly array: (raw: string) => number[] | undefined;
};

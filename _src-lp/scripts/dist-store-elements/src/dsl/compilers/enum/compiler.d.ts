type Params<Allowed extends string> = {
    expr: string;
    allowed: readonly Allowed[];
    isAvailable: (variant: Allowed) => boolean;
};
export declare const compiler: <Allowed extends string>({ expr, allowed, isAvailable }: Params<Allowed>) => Allowed | undefined;
export {};

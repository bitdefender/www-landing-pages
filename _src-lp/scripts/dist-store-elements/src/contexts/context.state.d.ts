export type MinMax = {
    min: {
        value: number;
        fmt: string;
    };
    max: {
        value: number;
        fmt: string;
    };
};
type Price = MinMax & {
    monthly: MinMax;
};
type Discount = MinMax & {
    monthly: MinMax;
    percentage: MinMax & {
        monthly: MinMax;
    };
};
export type stateContextType = {
    price: Price;
    discountedPrice: Price;
    discount: Discount;
};
export declare const stateContext: {
    __context__: stateContextType;
};
export {};

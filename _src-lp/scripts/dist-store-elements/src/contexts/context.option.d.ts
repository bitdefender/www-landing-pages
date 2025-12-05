import { ProductOption } from '@repobit/dex-store';
export type optionContextType = Promise<ProductOption | null | undefined> | undefined;
export declare const optionContext: {
    __context__: optionContextType;
};

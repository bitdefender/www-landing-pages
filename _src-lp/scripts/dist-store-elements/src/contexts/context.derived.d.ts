import { Product, ProductOption, Store } from '@repobit/dex-store';
import { stateContextType } from './context.state.js';
export type Params = {
    product?: Product | null;
    option?: ProductOption | null;
    state?: stateContextType;
    store?: Store;
};
export type derivedContextType = (param: Params) => Promise<Record<string, unknown>>;
export declare const derivedContext: {
    __context__: derivedContextType | null | undefined;
};

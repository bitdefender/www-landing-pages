import type { derivedContextType } from '../contexts/context.derived.js';
import type { stateContextType } from '../contexts/context.state.js';
import type { Product, ProductOption } from '@repobit/dex-store';
export type UnifiedContext = {
    option?: ProductOption | null;
    product?: Product | null;
    state?: stateContextType;
    derived?: derivedContextType | null;
};
export type DSLContext = Record<string, unknown>;
export declare const toDSLContext: ({ option, product, state, derived }: UnifiedContext) => Promise<DSLContext>;

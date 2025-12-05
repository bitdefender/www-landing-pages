import type { ProductOption } from '@repobit/dex-store';
export type dataLayerPayload = {
    option: ProductOption;
    event: "all" | "info" | "comparison" | (string & {});
};
export type dataLayerContextType = ((payload: dataLayerPayload) => void) | undefined;
export declare const dataLayerContext: {
    __context__: dataLayerContextType;
};

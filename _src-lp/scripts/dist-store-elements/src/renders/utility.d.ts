import { Context, ContextType } from '@lit/context';
type AnyContext = Context<unknown, unknown>;
type CtxVal<C extends AnyContext> = ContextType<C>;
type ContextMap = Record<string, AnyContext>;
type ContextValues<M extends ContextMap> = {
    [K in keyof M]: CtxVal<M[K]>;
};
type BindContext<M extends ContextMap> = {
    el: HTMLElement;
    contexts: M;
    logic: (values: ContextValues<M>) => void | Promise<void>;
    observedAttrs: string[];
    requireAll?: boolean;
};
export type RenderNode = HTMLElement & {
    updateComplete?: Promise<void>;
};
export declare const DATA_RENDER_NODE = "[data-store-render]";
export declare const DATA_HIDE_NODE = "[data-store-hide]";
export declare const attachContext: <C extends AnyContext>(el: HTMLElement, context: C, onValue: (value: ContextType<C>) => void, { subscribe }?: {
    subscribe?: boolean;
}) => () => void | undefined;
export declare const observeAttributes: (el: HTMLElement, onChange: () => void, filter?: string[]) => () => void;
/**
 * Subscribes to all contexts in `contexts`, coalesces updates in a microtask,
 * and calls `logic` with the latest values once ALL are present.
 * Returns a single disposer.
 */
export declare function bindContext<M extends ContextMap>({ el, contexts, logic, observedAttrs, requireAll }: BindContext<M>): () => void;
export declare const handleRenderNode: (el: RenderNode) => void;
export declare const cleanupRenderNode: (el: RenderNode) => void;
export {};

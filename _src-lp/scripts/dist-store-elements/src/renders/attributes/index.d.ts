import type { UnifiedContext } from '../context.js';
export type AttributeHandler = (el: HTMLElement, ctx: UnifiedContext) => void | Promise<void>;
export declare const renderAttributes: (el: HTMLElement, ctx: UnifiedContext) => Promise<void>;

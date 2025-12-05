import { derivedContext } from '../contexts/context.derived.js';
import { optionContext } from '../contexts/context.option.js';
import { productContext } from '../contexts/context.product.js';
import { stateContext } from '../contexts/context.state.js';
// Legacy per-context renders remain available until full migration is complete
import { CollectChildEvent, CollectChildRemovedEvent } from '../events/events.js';
import { renderAttributes } from '../renders/attributes/index.js';
import { OBS_ATTRS_OPTION_PLUS_STATE } from '../renders/observe.js';
import { ContextEvent } from '@lit/context';
export const DATA_RENDER_NODE = "[data-store-render]";
export const DATA_HIDE_NODE = "[data-store-hide]";
// Track initialized render nodes to avoid duplicate bindings
const RENDER_BOUND = new WeakSet();
const RENDER_DISPOSE = new WeakMap();
const RENDER_RESOLVE = new WeakMap();
export const attachContext = (el, context, onValue, { subscribe = true } = {}) => {
    let dispose;
    el.dispatchEvent(new ContextEvent(context, el, (value, d) => {
        onValue(value);
        dispose = d; // may be provided when subscribe === true
    }, subscribe));
    // call this later to unsubscribe (if provider gave you a disposer)
    return () => dispose?.();
};
export const observeAttributes = (el, onChange, filter) => {
    const mo = new MutationObserver((mutations) => {
        for (const m of mutations) {
            if (m.type === 'attributes') {
                onChange();
            }
        }
    });
    mo.observe(el, {
        attributes: true,
        attributeFilter: filter // e.g. ['user-id','subscribe']
    });
    // return disposer
    return () => mo.disconnect();
};
/**
 * Subscribes to all contexts in `contexts`, coalesces updates in a microtask,
 * and calls `logic` with the latest values once ALL are present.
 * Returns a single disposer.
 */
export function bindContext({ el, contexts, logic, observedAttrs = [], requireAll = true }) {
    const keys = Object.keys(contexts);
    const latest = {};
    let scheduled = false; // a microtask has been queued
    let running = false; // logic is currently executing
    let needsRun = false; // something changed; run again after current finishes
    let disposed = false;
    const haveAll = () => keys.every((k) => latest[k] !== undefined);
    const haveAny = () => keys.some((k) => latest[k] !== undefined);
    const pump = async () => {
        scheduled = false;
        // If we're already running, just mark that we need another pass.
        if (running || disposed) {
            needsRun = true;
            return;
        }
        // Run when required contexts are present at least once.
        if (requireAll ? !haveAll() : !haveAny())
            return;
        running = true;
        try {
            do {
                needsRun = false;
                // Snapshot so each run sees a stable view even if `latest` changes while awaiting.
                const snapshot = {};
                for (const k of keys)
                    snapshot[k] = latest[k];
                await Promise.resolve(logic(snapshot));
            } while (needsRun && !disposed); // drain one more time if updates queued while running
        }
        catch (err) {
            // Keep the queue alive even if user logic throws.
            console.error(err);
        }
        finally {
            running = false;
            if (needsRun && !disposed) {
                scheduled = true;
                queueMicrotask(pump);
            }
        }
    };
    const scheduleRun = () => {
        if (disposed)
            return;
        needsRun = true;
        if (!scheduled) {
            scheduled = true;
            queueMicrotask(pump);
        }
    };
    // subscribe to each requested context
    const disposers = keys.map((k) => attachContext(el, contexts[k], (value) => {
        latest[k] = value;
        scheduleRun();
    }));
    // optional: observe attributes once for the whole group
    const stopAttrs = observedAttrs.length > 0
        ? observeAttributes(el, scheduleRun, observedAttrs)
        : () => { };
    // single disposer
    return () => {
        disposed = true;
        stopAttrs();
        for (const d of disposers)
            d();
    };
}
const addLogic = (el, rendered) => {
    // Single binder aggregates both contexts and renders when either changes
    return bindContext({
        el,
        contexts: { optionContext, stateContext, productContext, derivedContext },
        logic: async ({ optionContext, stateContext, productContext, derivedContext }) => {
            const opt = await optionContext;
            await renderAttributes(el, {
                option: opt,
                state: stateContext,
                product: productContext,
                derived: derivedContext
            });
            rendered();
        },
        observedAttrs: [...OBS_ATTRS_OPTION_PLUS_STATE]
    });
};
export const handleRenderNode = (el) => {
    // Idempotent: don't re-bind the same node
    if (RENDER_BOUND.has(el))
        return;
    RENDER_BOUND.add(el);
    const { promise, resolve } = Promise.withResolvers();
    el.updateComplete = promise;
    const dispose = addLogic(el, resolve);
    RENDER_DISPOSE.set(el, dispose);
    RENDER_RESOLVE.set(el, resolve);
    // Register as contextual child so nearest StateNode parents can await it
    try {
        el.dispatchEvent(new CollectChildEvent({ child: el }));
    }
    catch { /* ignore */ }
    const originalRemove = el.remove;
    el.remove = () => {
        dispose();
        try {
            resolve();
        }
        catch { /* ignore */ }
        try {
            el.dispatchEvent(new CollectChildRemovedEvent({ child: el }));
        }
        catch { /* ignore */ }
        RENDER_BOUND.delete(el);
        RENDER_DISPOSE.delete(el);
        RENDER_RESOLVE.delete(el);
        originalRemove.call(el);
    };
};
export const cleanupRenderNode = (el) => {
    const dispose = RENDER_DISPOSE.get(el);
    try {
        dispose?.();
    }
    catch { /* ignore */ }
    // Resolve any outstanding updateComplete so parents don't hang
    const resolve = RENDER_RESOLVE.get(el);
    try {
        resolve?.();
    }
    catch { /* ignore */ }
    try {
        el.dispatchEvent(new CollectChildRemovedEvent({ child: el }));
    }
    catch { /* ignore */ }
    RENDER_DISPOSE.delete(el);
    RENDER_BOUND.delete(el);
    RENDER_RESOLVE.delete(el);
};
//# sourceMappingURL=utility.js.map
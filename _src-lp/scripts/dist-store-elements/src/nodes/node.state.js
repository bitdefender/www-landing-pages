var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { derivedContext } from "../contexts/context.derived.js";
import { eventContext } from "../contexts/context.event.js";
import { stateContext } from "../contexts/context.state.js";
import { storeContext } from "../contexts/context.store.js";
import { ActionEvent, CollectActionEvent, CollectChildEvent, CollectChildRemovedEvent, CollectOptionEvent, CollectUpdateByDeltaEvent, UpdateByDeltaEvent } from "../events/events.js";
import { toDSLContext } from "../renders/context.js";
import eta from "../templating/eta.js";
import { consume, provide } from "@lit/context";
import { Task } from "@lit/task";
import { html, LitElement } from "lit";
import { property } from "lit/decorators.js";
import morph from 'nanomorph';
if (!window.Promise.withResolvers) {
    window.Promise.withResolvers = function () {
        let resolve, reject;
        const promise = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });
        return { resolve, reject, promise };
    };
}
export class StateNode extends LitElement {
    constructor() {
        super(...arguments);
        this.autoForward = true;
        this.noCollect = false;
        this.storeName = Symbol("bd-state");
        // Configurable delay for mutation-triggered Eta coalescing (ms).
        //  - Use 0 for next-tick behavior (runs ASAP, more visits)
        //  - Use a higher value (e.g., 50–150) to batch SPA bursts
        this.etaMutationDelay = 10;
        this.etaMutationDelayMax = 100;
        // If true, ignore events coming from parent context; only react to
        // events originating inside this subtree (DOM-bubbled via listeners).
        this.ignoreEventsParent = false;
        /**
         * all options as seens by this node
         * options + partialOptions
         */
        this._options = new Map();
        /**
         * all actions as seens by this node
         */
        this._actions = new Map();
        /**
         * all delta updates as seens by this node
         * changes that affect only devices and subscription
         */
        this._deltaUpdates = new Map();
        /**
         * all product changes as seens by this node
         */
        this._partialOptions = new Map();
        /**
         * all product changes as seens by this node
         */
        this._partialBundleOptions = new Map();
        /**
         * Local state
         */
        this.state = {
            price: {
                min: {
                    value: Number.MAX_SAFE_INTEGER,
                    fmt: ""
                },
                max: {
                    value: Number.MIN_SAFE_INTEGER,
                    fmt: ""
                },
                monthly: {
                    min: {
                        value: Number.MAX_SAFE_INTEGER,
                        fmt: ""
                    },
                    max: {
                        value: Number.MIN_SAFE_INTEGER,
                        fmt: ""
                    }
                }
            },
            discountedPrice: {
                min: {
                    value: Number.MAX_SAFE_INTEGER,
                    fmt: ""
                },
                max: {
                    value: Number.MIN_SAFE_INTEGER,
                    fmt: ""
                },
                monthly: {
                    min: {
                        value: Number.MAX_SAFE_INTEGER,
                        fmt: ""
                    },
                    max: {
                        value: Number.MIN_SAFE_INTEGER,
                        fmt: ""
                    }
                }
            },
            discount: {
                min: {
                    value: Number.MAX_SAFE_INTEGER,
                    fmt: ""
                },
                max: {
                    value: Number.MIN_SAFE_INTEGER,
                    fmt: ""
                },
                monthly: {
                    min: {
                        value: Number.MAX_SAFE_INTEGER,
                        fmt: ""
                    },
                    max: {
                        value: Number.MIN_SAFE_INTEGER,
                        fmt: ""
                    }
                },
                percentage: {
                    min: {
                        value: Number.MAX_SAFE_INTEGER,
                        fmt: ""
                    },
                    max: {
                        value: Number.MIN_SAFE_INTEGER,
                        fmt: ""
                    },
                    monthly: {
                        min: {
                            value: Number.MAX_SAFE_INTEGER,
                            fmt: ""
                        },
                        max: {
                            value: Number.MIN_SAFE_INTEGER,
                            fmt: ""
                        }
                    }
                }
            }
        };
        this._computeTask = new Task(this, {
            task: async (_, { signal }) => {
                const isActive = () => {
                    if (signal.aborted) {
                        throw new DOMException('Task aborted', `AbortError ${this.storeName.toString()}`);
                    }
                };
                // runs whenever _store or version changes
                try {
                    const computed = await this._computeState(isActive);
                    await this._computeContext(computed, isActive);
                    return computed ?? [];
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                }
                catch (e) { /* empty */ }
            },
            args: () => [this._store]
        });
        // Default event forwarder for simple pass-through nodes (e.g., root/context)
        this._defaultForwardEventTask = new Task(this, {
            task: async ([evt, auto]) => {
                if (!evt || !auto)
                    return;
                this._forwardEvent(evt);
                this._notifyParent();
            },
            args: () => [this._event, this.autoForward]
        });
        // Keep `_event` in sync with either DOM events or parent context,
        // depending on `ignoreEventsParent`.
        this._syncEventTask = new Task(this, {
            task: async ([fromParent, fromDom, ignoreParent]) => {
                // Track last-seen refs so we can choose the freshest source
                const domChanged = fromDom !== this._prevDomEventRef;
                const parentChanged = fromParent !== this._prevParentEventRef;
                this._prevDomEventRef = fromDom;
                this._prevParentEventRef = fromParent;
                if (ignoreParent) {
                    this._event = fromDom ?? undefined;
                    return;
                }
                if (domChanged && !parentChanged) {
                    this._event = fromDom ?? undefined;
                    return;
                }
                if (parentChanged && !domChanged) {
                    this._event = fromParent ?? undefined;
                    return;
                }
                if (domChanged && parentChanged) {
                    // If both changed in the same microtask, prefer DOM-originated
                    this._event = fromDom ?? fromParent ?? undefined;
                    return;
                }
                // Neither changed; keep current, but if nothing set yet, fall back
                if (this._event === undefined) {
                    this._event = fromDom ?? fromParent ?? undefined;
                }
            },
            args: () => [this._eventParent, this._eventDom, this.ignoreEventsParent]
        });
        this._collectToggleTask = new Task(this, {
            task: async ([noCollect]) => {
                const prev = this._prevCollect;
                this._prevCollect = !noCollect; // track last 'collect' state for edge detection
                if (prev === undefined) {
                    // Initial mount: register only if collecting (noCollect=false)
                    if (!noCollect)
                        this._notifyParent();
                    return;
                }
                // prev represents prior collect state
                const currentCollect = !noCollect;
                if (currentCollect && !prev) {
                    this._notifyParent();
                }
                else if (!currentCollect && prev) {
                    this.dispatchEvent(new CollectOptionEvent({ name: this.storeName, options: null }));
                }
            },
            args: () => [this.noCollect]
        });
        // Cache original templates per element so we can re-render from the original innerHTML
        this._tplElementTemplates = new WeakMap();
        this._tplAttrTemplates = new WeakMap();
        this._etaRenderTask = new Task(this, {
            task: async ([state, derived]) => {
                if (!state)
                    return;
                if (!this.shouldRunEtaStateRender())
                    return;
                // Provide 'it' derived from DSL context
                // Mark cause (mutation-triggered vs state/derived-triggered)
                this._etaRenderCurrentFromMutation = this._etaRenderTriggeredByMutation;
                this._etaRenderTriggeredByMutation = false;
                this._etaRenderInProgress = true;
                try {
                    const it = await toDSLContext({ state, derived });
                    await this._renderEtaTemplates(it);
                }
                finally {
                    this._etaRenderInProgress = false;
                    this._etaRenderCurrentFromMutation = false;
                    // If mutations arrived while rendering, schedule one more pass
                    if (this._etaRenderNeedsRun) {
                        this._etaRenderNeedsRun = false;
                        this._scheduleEtaRenderFromMutation();
                    }
                    this._notifyEtaIdle();
                }
            },
            args: () => [this.state, this._derived]
        });
        // Track DOM changes in the light DOM (slot content) to rerun Eta when SPA rewrites
        this._etaRenderInProgress = false;
        this._etaRenderScheduled = false;
        this._etaRenderNeedsRun = false;
        this._etaRenderTriggeredByMutation = false;
        this._etaRenderCurrentFromMutation = false;
        this._etaIdleWaiters = [];
        // Track nearest contextual children (register via CollectChildEvent)
        this._contextualChildren = new Set();
        this._onCollectChild = (e) => {
            if (e.target === this)
                return;
            e.stopPropagation();
            const { child } = e.detail;
            if (child && child !== this) {
                this._contextualChildren.add(child);
            }
        };
        this._onCollectChildRemoved = (e) => {
            if (e.target === this)
                return;
            e.stopPropagation();
            const { child } = e.detail;
            if (child && child !== this) {
                this._contextualChildren.delete(child);
            }
        };
    }
    /**
     * all options computed by this node
     * options * actions
     */
    get computedOptions() {
        return this._computeTask.value;
    }
    // Allow subclasses (e.g., OptionNode) to disable the base Eta render
    // when they provide their own option-specific rendering pipeline.
    shouldRunEtaStateRender() { return true; }
    _isEtaIdle() {
        return !this._etaRenderInProgress && !this._etaRenderDebounce && !this._etaRenderNeedsRun;
    }
    _waitEtaSettled() {
        if (this._isEtaIdle())
            return Promise.resolve();
        return new Promise((resolve) => {
            this._etaIdleWaiters.push(resolve);
        });
    }
    _notifyEtaIdle() {
        if (!this._isEtaIdle())
            return;
        if (this._etaIdleWaiters.length === 0)
            return;
        const waiters = this._etaIdleWaiters.splice(0);
        for (const w of waiters)
            w();
    }
    _scheduleEtaRenderFromMutation() {
        // If a render is already in progress, remember to run again once it finishes.
        if (this._etaRenderInProgress) {
            this._etaRenderNeedsRun = true;
            return;
        }
        if (!this.shouldRunEtaStateRender())
            return;
        // Adaptive coalescing: restart timer on every mutation and, if bursts continue,
        // increase delay up to a configured max to batch work.
        const base = Math.max(0, Number(this.etaMutationDelay) || 0);
        const max = Math.max(base, Number(this.etaMutationDelayMax) || 0);
        let delay = base;
        if (this._etaRenderDebounce) {
            clearTimeout(this._etaRenderDebounce);
            const prev = this._etaCoalesceDelay ?? base;
            delay = Math.min(prev > 0 ? prev * 2 : base, max);
        }
        this._etaCoalesceDelay = delay;
        this._etaRenderTriggeredByMutation = true;
        this._etaRenderDebounce = window.setTimeout(() => {
            this._etaRenderDebounce = undefined;
            this._etaCoalesceDelay = base;
            this._etaRenderTask.run();
            // If nothing else is scheduled and not in-progress, resolve any idle waiters
            queueMicrotask(() => this._notifyEtaIdle());
        }, delay);
    }
    _isStateNodeElement(el) {
        if (el instanceof StateNode)
            return true;
        const t = el.tagName;
        return t === 'BD-STATE' || t === 'BD-PRODUCT' || t === 'BD-OPTION' || t === 'BD-CONTEXT';
    }
    // Find the nearest eligible element under this provider to use as a refresh root
    _findEligibleRoot(n) {
        let cur = n;
        while (cur && cur !== this) {
            if (cur instanceof ShadowRoot) {
                cur = cur.host;
                continue;
            }
            if (!(cur instanceof HTMLElement)) {
                cur = cur.parentNode;
                continue;
            }
            if (this._isStateNodeElement(cur) && cur !== this)
                return null; // nested provider boundary
            if (cur.hasAttribute('data-store-render'))
                return null; // render-managed boundary
            const parentProvider = cur.parentElement?.closest('bd-state,bd-product,bd-option,bd-context');
            if (parentProvider === this || cur.parentElement === this)
                return cur;
            cur = cur.parentNode;
        }
        return this;
    }
    _hasNestedStateNode(el) {
        return !!el.querySelector?.('bd-state,bd-product,bd-option,bd-context');
    }
    _safeEtaRender(entry, data, { onErrorReturnInput = false } = {}) {
        try {
            if (!entry.fn) {
                entry.fn = eta.compile(entry.src);
            }
            const out = eta.render(entry.fn, data);
            return typeof out === 'string' ? out : String(out ?? '');
        }
        catch (err) {
            console.error('Eta render error:', err);
            return onErrorReturnInput ? entry.src : '';
        }
    }
    async _renderEtaAttributes(el, data) {
        // any attribute whose value contains '{{' is treated as an Eta template
        const names = el.getAttributeNames();
        let cache = this._tplAttrTemplates.get(el);
        if (!cache) {
            cache = new Map();
            this._tplAttrTemplates.set(el, cache);
        }
        // Fast path: if we've previously seen no templated attributes, skip scan
        if (this._noEtaAttrs && this._noEtaAttrs.has(el))
            return;
        let foundTemplateAttr = false;
        // Implicit any-attribute templates (heuristic: contains '{{')
        for (const a of names) {
            const raw = el.getAttribute(a);
            if (!raw || !raw.includes('{{'))
                continue;
            foundTemplateAttr = true;
            const key = `imp:${a}`;
            let entry = cache.get(key);
            if (!entry || entry.src !== raw) {
                entry = { src: raw };
                cache.set(key, entry);
            }
            const rendered = this._safeEtaRender(entry, data, { onErrorReturnInput: true });
            if (rendered !== raw) {
                try {
                    el.setAttribute(a, rendered);
                }
                catch { /* ignore */ }
            }
        }
        // If no templated attributes were found on this element, mark it to skip next time
        if (!foundTemplateAttr) {
            if (!this._noEtaAttrs)
                this._noEtaAttrs = new WeakSet();
            this._noEtaAttrs.add(el);
        }
    }
    _hasRenderNodes(el) {
        const h = el;
        if (!h)
            return false;
        if (h.hasAttribute && h.hasAttribute('data-store-render'))
            return true;
        // Heuristic: check innerHTML for render markers to avoid expensive queries
        const html = h.innerHTML;
        return typeof html === 'string' && html.includes('data-store-render');
    }
    async _morphElementFromHTML(el, html) {
        // Fast path: nothing changed
        if (el.innerHTML === html)
            return;
        try {
            const wrapper = el.cloneNode(false);
            wrapper.innerHTML = html;
            morph(el, wrapper);
        }
        catch {
            el.innerHTML = html;
        }
    }
    async _renderEtaTemplates(context) {
        // Traverse descendants (including opted-in shadow roots); for any element that
        // does NOT contain a nested state node, treat its innerHTML as a single Eta
        // template and render/morph the entire subtree.
        let _processed = 0;
        const waitForCustomUpdate = async (el) => {
            const maybe = el.updateComplete;
            if (maybe && typeof maybe.then === 'function') {
                try {
                    await maybe;
                }
                catch { /* ignore */ }
            }
        };
        const visit = async (root) => {
            // If a follow-up Eta run is already requested (DOM still changing)
            // and this pass was triggered by mutation, bail out to avoid unstable writes.
            if (this._etaRenderCurrentFromMutation && this._etaRenderNeedsRun)
                return;
            for (const child of Array.from(root.children)) {
                if (this._etaRenderCurrentFromMutation && this._etaRenderNeedsRun)
                    return;
                if (!(child instanceof HTMLElement))
                    continue;
                if (this._etaRenderCurrentFromMutation && this._etaRenderNeedsRun)
                    return;
                await waitForCustomUpdate(child);
                const shadowRoot = child.hasAttribute('shadow') ? child.shadowRoot : null;
                const traverseShadow = async () => {
                    if (shadowRoot) {
                        await visit(shadowRoot);
                    }
                };
                if (shadowRoot) {
                    this._observeShadowRoot(shadowRoot, child);
                }
                // Read current HTML source once
                const currentSrc = child.innerHTML ?? '';
                // Always allow attribute-level Eta on any node in this subtree
                await this._renderEtaAttributes(child, context);
                if (this._isStateNodeElement(child) && child !== this) {
                    continue; // nested provider; let it handle its subtree
                }
                const hasNestedStateNode = this._hasNestedStateNode(child);
                if (hasNestedStateNode) {
                    // drill down until we reach leaves without nested state nodes
                    await visit(child);
                    await traverseShadow();
                    continue;
                }
                // Cheap render-node detection using current HTML source
                // If subtree contains render nodes, recurse into it but don't morph at this level
                if (this._hasRenderNodes(child)) {
                    await visit(child);
                    await traverseShadow();
                    continue;
                }
                // Skip elements managed by the render pipeline
                if (child.hasAttribute('data-store-render')) {
                    continue;
                }
                // Reuse cached template, but refresh if DOM source changed (e.g., SPA mutated innerHTML)
                let entry = this._tplElementTemplates.get(child);
                const hadTemplate = Boolean(entry && entry.src && entry.src.includes('{{'));
                // If this element and its attributes contain no templates, it is not a
                // special provider/render container, and it never had a template cached,
                // skip further work.
                const noAttrs = this._noEtaAttrs?.has(child) ?? false;
                if (!currentSrc.includes('{{') && noAttrs && !hadTemplate && !hasNestedStateNode) {
                    await traverseShadow();
                    continue;
                }
                if (!entry) {
                    entry = { src: currentSrc };
                    this._tplElementTemplates.set(child, entry);
                }
                else if (entry.src !== currentSrc) {
                    const isTemplateLike = currentSrc.includes('{{');
                    // Accept SPA-authored changes (even without templates) only when this pass is mutation-triggered.
                    if (isTemplateLike || this._etaRenderCurrentFromMutation) {
                        entry.src = currentSrc;
                        delete entry.fn;
                    }
                }
                const out = this._safeEtaRender(entry, context, { onErrorReturnInput: true });
                if (this._etaRenderCurrentFromMutation) {
                    // During mutation-triggered passes, avoid writing to DOM to prevent
                    // racing with SPA changes. We refreshed caches above so subsequent
                    // non-mutation renders have the latest source.
                    await traverseShadow();
                    continue;
                }
                if (this._etaRenderCurrentFromMutation && this._etaRenderNeedsRun)
                    return;
                await this._morphElementFromHTML(child, out);
                await traverseShadow();
                // Periodically yield to avoid long tasks
                if ((++_processed % 50) === 0) {
                    await Promise.resolve();
                }
            }
        };
        const visitWithShadow = async (root) => {
            await visit(root);
            if (root.hasAttribute('shadow') && root.shadowRoot) {
                await visit(root.shadowRoot);
            }
        };
        // If this is a mutation-triggered pass and we have specific dirty roots, only refresh those
        if (this._etaRenderCurrentFromMutation && this._etaDirtyRoots && this._etaDirtyRoots.size) {
            for (const r of this._etaDirtyRoots) {
                await visitWithShadow(r);
            }
            this._etaDirtyRoots.clear();
        }
        else {
            await visitWithShadow(this);
        }
    }
    connectedCallback() {
        super.connectedCallback();
        // Listen for child registration/unregistration
        this.addEventListener(CollectChildEvent.eventName, this._onCollectChild);
        this.addEventListener(CollectChildRemovedEvent.eventName, this._onCollectChildRemoved);
        this.addEventListener(CollectActionEvent.eventName, this._collectActionEvent);
        this.addEventListener(CollectUpdateByDeltaEvent.eventName, this._collectUpdateByDeltaEvent);
        this.addEventListener(CollectOptionEvent.eventName, this._collectOptionEvent);
        [ActionEvent, UpdateByDeltaEvent].forEach(e => this.addEventListener(e.eventName, this._eventChange));
        // Observe slot/light DOM changes to trigger Eta re-rendering in SPA scenarios
        if (!this._slotMo && this.shouldRunEtaStateRender()) {
            this._slotMo = new MutationObserver((muts) => this._handleEtaMutations(muts));
            this._slotMo.observe(this, {
                childList: true,
                subtree: true,
                characterData: true,
                attributes: true
            });
            this.querySelectorAll('[shadow]').forEach(host => {
                if (host.shadowRoot)
                    this._observeShadowRoot(host.shadowRoot, host);
            });
        }
        // Announce this node as a contextual child of its nearest parent StateNode
        // so parents can await our updateComplete as part of theirs.
        this._announceAsContextualChild();
    }
    remove() {
        // Announce removal to parent before DOM detaches, so it can unregister us
        this._announceContextualChildRemoved();
        this.dispatchEvent(new CollectOptionEvent({ name: this.storeName, options: null }));
        super.remove();
    }
    disconnectedCallback() {
        // Stop listening for contextual child events
        this.removeEventListener(CollectChildEvent.eventName, this._onCollectChild);
        this.removeEventListener(CollectChildRemovedEvent.eventName, this._onCollectChildRemoved);
        this.removeEventListener(CollectActionEvent.eventName, this._collectActionEvent);
        this.removeEventListener(CollectUpdateByDeltaEvent.eventName, this._collectUpdateByDeltaEvent);
        this.removeEventListener(CollectOptionEvent.eventName, this._collectOptionEvent);
        [ActionEvent, UpdateByDeltaEvent].forEach(e => this.removeEventListener(e.eventName, this._eventChange));
        this._options.clear();
        this._actions.clear();
        this._partialOptions.clear();
        this._contextualChildren.clear();
        if (this._etaRenderDebounce) {
            clearTimeout(this._etaRenderDebounce);
            this._etaRenderDebounce = undefined;
        }
        this._slotMo?.disconnect();
        this._slotMo = undefined;
        if (this._shadowSlotMos) {
            for (const [sr, mo] of this._shadowSlotMos.entries()) {
                try {
                    mo.disconnect();
                }
                catch { /* ignore */ }
                try {
                    this._cleanupShadowRoot(sr);
                }
                catch { /* ignore */ }
            }
            this._shadowSlotMos.clear();
            this._shadowSlotMos = undefined;
        }
        super.disconnectedCallback();
    }
    _announceAsContextualChild() {
        this.dispatchEvent(new CollectChildEvent({ child: this }));
    }
    _announceContextualChildRemoved() {
        this.dispatchEvent(new CollectChildRemovedEvent({ child: this }));
    }
    _cleanupShadowRoot(sr) {
        if (this._shadowSlotMos && this._shadowSlotMos.has(sr)) {
            const mo = this._shadowSlotMos.get(sr);
            try {
                mo?.disconnect();
            }
            catch { /* ignore */ }
            this._shadowSlotMos.delete(sr);
        }
        sr.querySelectorAll('[shadow]').forEach(host => {
            if (host.shadowRoot)
                this._cleanupShadowRoot(host.shadowRoot);
        });
    }
    _handleEtaMutations(muts) {
        for (const m of muts) {
            // Consider only targets that aren't within nested-provider or render-managed subtrees
            const targets = [];
            if (m.type === 'characterData' || m.type === 'attributes') {
                targets.push(m.target);
                // If attributes changed on an element previously marked as having no Eta attrs,
                // clear the cache so it can be rescanned on the next pass.
                if (m.type === 'attributes' && this._noEtaAttrs && m.target instanceof HTMLElement) {
                    this._noEtaAttrs.delete(m.target);
                }
            }
            else {
                targets.push(...Array.from(m.addedNodes));
                for (const removed of Array.from(m.removedNodes)) {
                    if (!(removed instanceof HTMLElement))
                        continue;
                    if (removed.hasAttribute('shadow') && removed.shadowRoot) {
                        this._cleanupShadowRoot(removed.shadowRoot);
                    }
                    removed
                        .querySelectorAll('[shadow]')
                        .forEach(host => host.shadowRoot && this._cleanupShadowRoot(host.shadowRoot));
                }
            }
            const eligibles = [];
            for (const t of targets) {
                if (t instanceof HTMLElement && t.hasAttribute('shadow') && t.shadowRoot) {
                    this._observeShadowRoot(t.shadowRoot, t);
                }
                if (t instanceof HTMLElement) {
                    t.querySelectorAll('[shadow]').forEach(host => {
                        if (host.shadowRoot)
                            this._observeShadowRoot(host.shadowRoot, host);
                    });
                }
                const root = this._findEligibleRoot(t);
                if (root)
                    eligibles.push(root);
            }
            if (!eligibles.length)
                continue;
            // Track dirty roots for this cycle
            if (!this._etaDirtyRoots)
                this._etaDirtyRoots = new Set();
            eligibles.forEach(r => this._etaDirtyRoots.add(r));
            this._scheduleEtaRenderFromMutation();
            break; // one schedule is enough per batch
        }
    }
    _observeShadowRoot(sr, host) {
        if (!this.shouldRunEtaStateRender())
            return;
        const rootHost = host ?? (sr.host instanceof HTMLElement ? sr.host : null);
        if (rootHost) {
            const eligible = this._findEligibleRoot(rootHost);
            if (!eligible)
                return;
        }
        if (!this._shadowSlotMos)
            this._shadowSlotMos = new Map();
        if (this._shadowSlotMos.has(sr))
            return;
        const mo = new MutationObserver((muts) => this._handleEtaMutations(muts));
        mo.observe(sr, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true
        });
        this._shadowSlotMos.set(sr, mo);
        sr.querySelectorAll('[shadow]').forEach(host => {
            if (host.shadowRoot)
                this._observeShadowRoot(host.shadowRoot, host);
        });
    }
    _eventChange(e) {
        e.stopPropagation();
        // ignore if source matches ignore list
        if (this._isIgnoredSource(e)) {
            return;
        }
        this._eventDom = e;
    }
    _forwardEvent(e = this._event) {
        this._fEvent = e;
    }
    _collectOptionEvent(e) {
        if (e.target === this) {
            return;
        }
        e.stopPropagation();
        this.collectOption(e.detail);
    }
    collectOption({ name, options }) {
        //node has disconected
        if (options === null) {
            this._options.delete(name);
        }
        else {
            this._options.set(name, options);
        }
        this._computeTask.abort();
        this._computeTask.run();
        this._notifyParent();
    }
    _collectActionEvent(e) {
        if (e.target === this) {
            return;
        }
        e.stopPropagation();
        const { name, action } = e.detail;
        //node has disconected
        if (action === null) {
            this._actions.delete(name);
            this._partialOptions.delete(name);
            this._partialBundleOptions.delete(name);
        }
        else if (!action.id && (action.devices || action.subscription)) {
            this._actions.set(name, action);
        }
        else {
            if (action.bundle) {
                this._partialBundleOptions.set(name, action);
            }
            else {
                this._partialOptions.set(name, action);
            }
        }
        this._computeTask.abort();
        this._computeTask.run();
        this._notifyParent();
    }
    _collectUpdateByDeltaEvent(e) {
        if (e.target === this) {
            return;
        }
        const { name, update } = e.detail;
        //node has disconected
        if (update === null) {
            this._deltaUpdates.delete(name);
        }
        else {
            this._deltaUpdates.set(name, update);
        }
        this._computeTask.abort();
        this._computeTask.run();
        this._notifyParent();
    }
    async _computeState(isActive) {
        // We'll iteratively expand the set of options using actions and delta updates
        // until we reach a fixed point (no new options discovered). This ensures
        // combinations across different dimensions are included (e.g., 10-24).
        const computed = new Set();
        const queue = [];
        const enqueue = (opt) => {
            if (!computed.has(opt)) {
                computed.add(opt);
                queue.push(opt);
            }
        };
        // 1) collect base options + partialOptions and seed the queue
        for (const optsPromise of this._options.values()) {
            isActive();
            const opts = await optsPromise;
            for (const opt of opts) {
                isActive();
                enqueue(opt);
                const partials = await this._applyPartials(opt, isActive);
                for (const p of partials)
                    enqueue(p);
            }
        }
        // 2) Repeatedly apply actions and delta updates to closure
        while (queue.length) {
            isActive();
            const current = queue.shift();
            const actionResults = await this._applyActions(current, isActive);
            for (const a of actionResults)
                enqueue(a);
            const deltaResults = await this._applyDeltaUpdates(current, isActive);
            for (const d of deltaResults)
                enqueue(d);
        }
        // 3) combine bundles on the full set
        for (const opt of [...computed]) {
            isActive();
            const bundles = [...this._partialBundleOptions.values()];
            const combos = await this._applyBundles(opt, bundles);
            combos.forEach(cb => cb && computed.add(cb));
        }
        return [...computed];
    }
    async _applyPartials(baseOpt, isActive) {
        const results = [];
        for (const partial of this._partialOptions.values()) {
            isActive();
            if (!partial.id) {
                continue;
            }
            const newProduct = await baseOpt.switchProduct({ id: partial.id, campaign: partial.campaign });
            const newOpt = await newProduct?.getOption({
                devices: partial.devices || baseOpt.getDevices(),
                subscription: partial.subscription || baseOpt.getSubscription()
            });
            if (newOpt)
                results.push(newOpt);
        }
        return results;
    }
    async _applyActions(baseOpt, isActive) {
        const results = [];
        for (const action of this._actions.values()) {
            isActive();
            const targetDevices = action.devices ?? baseOpt.getDevices();
            const targetSubscription = action.subscription ?? baseOpt.getSubscription();
            // Skip no-op actions that don't change anything
            if (targetDevices === baseOpt.getDevices() && targetSubscription === baseOpt.getSubscription()) {
                continue;
            }
            const newOpt = await baseOpt.getOption({
                devices: targetDevices,
                subscription: targetSubscription
            });
            if (newOpt)
                results.push(newOpt);
        }
        return results;
    }
    async _applyDeltaUpdates(baseOpt, isActive) {
        const results = [];
        const product = baseOpt.getProduct();
        const baseDevices = product.getDevices().values;
        const baseSubscriptions = product.getSubscriptions().values;
        let devices = baseOpt.getDevices();
        let subscription = baseOpt.getSubscription();
        // corner case for input types that define an interval by themselves
        const getValue = (action, startValue, minValue) => {
            if (action.useAsValue) {
                action.delta = 1;
                return Number(action.min) || minValue;
            }
            else {
                return startValue;
            }
        };
        for (const action of this._deltaUpdates.values()) {
            isActive();
            // Loop until we can no longer apply the delta
            while (true) {
                isActive();
                const values = action.type === "devices" ? baseDevices : baseSubscriptions;
                const current = action.type === "devices"
                    ? getValue(action, devices, baseDevices[0])
                    : getValue(action, subscription, baseSubscriptions[0]);
                const { newValue, done } = this._computeDelta(values, current, action);
                if (done)
                    break;
                // Update the appropriate variable
                if (action.type === "devices") {
                    devices = newValue;
                }
                else {
                    subscription = newValue;
                }
                // Fetch the new option and collect it if exists
                const newOpt = await baseOpt.getOption({ devices, subscription });
                if (newOpt)
                    results.push(newOpt);
            }
        }
        return results;
    }
    /**
   * Attempts to apply the given delta action to the current value.
   * Returns the updated value and whether we've exhausted variants.
   */
    _computeDelta(values, current, action) {
        const min = Number(action.min) || Number.MAX_SAFE_INTEGER;
        const max = Number(action.max) || Number.MIN_SAFE_INTEGER;
        // Handle "next" / "prev" stepping through a discrete list
        if (action.delta === "next" || action.delta === "prev") {
            const idx = values.findIndex(v => v === current);
            const step = action.delta === "next" ? 1 : -1;
            const candidate = values.at(idx + step);
            if (candidate && (action.delta === "next" ? candidate <= min : candidate >= max)) {
                return { newValue: candidate, done: false };
            }
            return { newValue: current, done: true };
        }
        // Handle numeric delta
        const candidate = current + action.delta;
        const isValid = action.delta > 0 ? candidate <= min : candidate >= max;
        if (isValid) {
            return { newValue: candidate, done: false };
        }
        return { newValue: current, done: true };
    }
    async _computeContext(options, isActive) {
        function updateMinMax(range, value, formatted) {
            if (range.min.value == null || value < range.min.value) {
                range.min.value = value;
                range.min.fmt = formatted;
            }
            if (range.max.value == null || value > range.max.value) {
                range.max.value = value;
                range.max.fmt = formatted;
            }
        }
        for (const option of options) {
            isActive();
            updateMinMax(this.state.price, option.getPrice({ currency: false }), option.getPrice());
            updateMinMax(this.state.price.monthly, option.getPrice({ monthly: true, currency: false }), option.getPrice({ monthly: true }));
            updateMinMax(this.state.discountedPrice, option.getDiscountedPrice({ currency: false }), option.getDiscountedPrice());
            updateMinMax(this.state.discountedPrice.monthly, option.getDiscountedPrice({ monthly: true, currency: false }), option.getDiscountedPrice({ monthly: true }));
            updateMinMax(this.state.discount, option.getDiscount({ symbol: false }), option.getDiscount());
            updateMinMax(this.state.discount.monthly, option.getDiscount({ monthly: true, symbol: false }), option.getDiscount({ monthly: true }));
            updateMinMax(this.state.discount.percentage, option.getDiscount({ percentage: true, symbol: false }), option.getDiscount({ percentage: true }));
            updateMinMax(this.state.discount.percentage.monthly, option.getDiscount({ monthly: true, percentage: true, symbol: false }), option.getDiscount({ monthly: true, percentage: true }));
        }
        this.state = { ...this.state };
    }
    async _getOption({ id, campaign, devices, subscription }, bundle = []) {
        if (id && devices && subscription) {
            const product = await this._store?.getProduct({ id, campaign });
            return await product?.getOption({ devices, subscription, bundle });
        }
        return null;
    }
    async _applyBundles(baseOpt, bundles) {
        const result = [];
        const recurse = async (prefix, start) => {
            for (let i = start; i < bundles.length; i++) {
                const bundleOption = await this._getOption({
                    id: bundles[i].id,
                    campaign: bundles[i].campaign,
                    devices: bundles[i].devices ?? baseOpt.getDevices(),
                    subscription: bundles[i].subscription ?? baseOpt.getSubscription()
                }, []);
                if (!bundleOption) {
                    continue;
                }
                const next = prefix.concat({
                    devicesFixed: Boolean(bundles[i].devices),
                    subscriptionFixed: Boolean(bundles[i].subscription),
                    option: bundleOption
                });
                result.push(next);
                await recurse(next, i + 1);
            }
        };
        const bundleOption = async (option, bundles = []) => {
            for (const bundle of bundles) {
                const newOpt = await option.toogleBundle(bundle);
                if (newOpt) {
                    option = newOpt;
                }
                else {
                    return null;
                }
            }
            return option;
        };
        await recurse([], 0);
        const x = await Promise.all(result.map(bundles => bundleOption(baseOpt, bundles)));
        return x;
    }
    _notifyParent() {
        if (this.noCollect)
            return;
        this.dispatchEvent(new CollectOptionEvent({
            name: this.storeName,
            options: this._computeTask.taskComplete
        }));
    }
    async getUpdateComplete() {
        const result = await super.getUpdateComplete();
        await this._computeTask.taskComplete;
        await this._defaultForwardEventTask.taskComplete;
        await this._syncEventTask.taskComplete;
        await this._collectToggleTask.taskComplete;
        await this._etaRenderTask.taskComplete;
        // Ensure any debounced/mutation-triggered Eta runs have settled
        await this._waitEtaSettled();
        // Await all registered contextual children (nearest descendants only)
        try {
            const children = Array.from(this._contextualChildren);
            const waits = children
                .map((c) => c.updateComplete)
                .filter((p) => !!p);
            if (waits.length > 0)
                await Promise.allSettled(waits);
        }
        catch { /* ignore */ }
        return result;
    }
    isDeviceAndSubscriptionChange(evt) {
        return evt instanceof ActionEvent
            && Boolean(evt.detail?.devices || evt.detail?.subscription)
            && !evt.detail.bundle;
    }
    isBundleToogle(evt) {
        return evt instanceof ActionEvent
            && Boolean(evt.detail?.id)
            && Boolean(evt.detail.bundle);
    }
    isProductChange(evt) {
        return evt instanceof ActionEvent
            && Boolean(evt.detail?.id)
            && !evt.detail.bundle;
    }
    isActionEvent(evt) {
        return this.isProductChange(evt) || this.isDeviceAndSubscriptionChange(evt);
    }
    isDeltaUpdate(evt) {
        return evt instanceof UpdateByDeltaEvent;
    }
    _isIgnoredSource(e) {
        const set = this._getIgnoreSet();
        if (set.size === 0)
            return false;
        const id = e.detail?.storeId || "";
        return set.has(id);
    }
    _getIgnoreSet() {
        const raw = this.ignoreEvents;
        if (!raw)
            return new Set();
        return new Set(raw
            .split(',')
            .map(s => s.trim())
            .filter(Boolean));
    }
    render() {
        return html `<slot></slot>`;
    }
}
__decorate([
    property({ type: Boolean })
], StateNode.prototype, "autoForward", void 0);
__decorate([
    property({ type: Boolean, attribute: 'no-collect' })
], StateNode.prototype, "noCollect", void 0);
__decorate([
    property({ attribute: 'ignore-events' })
], StateNode.prototype, "ignoreEvents", void 0);
__decorate([
    property({ attribute: 'store-name' })
], StateNode.prototype, "storeName", void 0);
__decorate([
    property({ attribute: 'eta-mutation-delay', type: Number })
], StateNode.prototype, "etaMutationDelay", void 0);
__decorate([
    property({ attribute: 'eta-mutation-delay-max', type: Number })
], StateNode.prototype, "etaMutationDelayMax", void 0);
__decorate([
    property({ type: Boolean, attribute: 'ignore-events-parent' })
], StateNode.prototype, "ignoreEventsParent", void 0);
__decorate([
    consume({ context: storeContext, subscribe: true }),
    property({ attribute: false })
], StateNode.prototype, "_store", void 0);
__decorate([
    consume({ context: eventContext, subscribe: true }),
    property({ attribute: false })
], StateNode.prototype, "_eventParent", void 0);
__decorate([
    consume({ context: derivedContext, subscribe: true }),
    property({ attribute: false })
], StateNode.prototype, "_derived", void 0);
__decorate([
    property({ attribute: false })
], StateNode.prototype, "_event", void 0);
__decorate([
    property({ attribute: false })
], StateNode.prototype, "_eventDom", void 0);
__decorate([
    provide({ context: eventContext }),
    property({ attribute: false })
], StateNode.prototype, "_fEvent", void 0);
__decorate([
    provide({ context: stateContext }),
    property({ attribute: false })
], StateNode.prototype, "state", void 0);
//# sourceMappingURL=node.state.js.map
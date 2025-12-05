import { derivedContextType } from "../contexts/context.derived.js";
import { eventContexType } from "../contexts/context.event.js";
import { stateContextType } from "../contexts/context.state.js";
import { storeContextType } from "../contexts/context.store.js";
import { Action, ActionEvent, CollectAction, CollectOption, CollectUpdateByDelta, EventType, UpdateByDeltaEvent } from "../events/events.js";
import { ProductBundleOption, ProductOption } from "@repobit/dex-store";
import { LitElement } from "lit";
type Options = Map<symbol | string, Promise<ProductOption[]>>;
type Actions = Map<symbol | string, NonNullable<CollectAction["action"]>>;
type DeltaUpdate = Map<symbol | string, NonNullable<CollectUpdateByDelta["update"]>>;
export declare class StateNode extends LitElement {
    autoForward: boolean;
    noCollect: boolean;
    ignoreEvents?: string;
    storeName: symbol | string;
    etaMutationDelay: number;
    etaMutationDelayMax: number;
    ignoreEventsParent: boolean;
    /**
     * all options as seens by this node
     * options + partialOptions
     */
    _options: Options;
    /**
     * all actions as seens by this node
     */
    _actions: Actions;
    /**
     * all delta updates as seens by this node
     * changes that affect only devices and subscription
     */
    _deltaUpdates: DeltaUpdate;
    /**
     * all product changes as seens by this node
     */
    _partialOptions: Actions;
    /**
     * all product changes as seens by this node
     */
    _partialBundleOptions: Actions;
    /**
     * Consumes store provided by root node
     */
    _store?: storeContextType;
    /**
     * Consumes change event from parent
     */
    _eventParent?: eventContexType;
    _derived?: derivedContextType | null;
    _event?: eventContexType;
    _eventDom?: eventContexType;
    private _prevParentEventRef?;
    private _prevDomEventRef?;
    /**
     * Provides change event from parent or from it's context
     */
    _fEvent?: eventContexType;
    /**
     * Local state
     */
    state: stateContextType;
    /**
     * all options computed by this node
     * options * actions
     */
    get computedOptions(): ProductOption[] | undefined;
    private _computeTask;
    private _defaultForwardEventTask;
    private _syncEventTask;
    private _prevCollect?;
    private _collectToggleTask;
    private _tplElementTemplates;
    private _tplAttrTemplates;
    private _etaRenderTask;
    protected shouldRunEtaStateRender(): boolean;
    protected _etaRenderInProgress: boolean;
    private _etaRenderScheduled;
    private _etaRenderNeedsRun;
    private _etaRenderDebounce?;
    private _etaRenderTriggeredByMutation;
    private _etaRenderCurrentFromMutation;
    private _slotMo?;
    private _shadowSlotMos?;
    private _etaIdleWaiters;
    private _noEtaAttrs?;
    private _etaDirtyRoots?;
    private _etaCoalesceDelay?;
    private _contextualChildren;
    private _isEtaIdle;
    private _waitEtaSettled;
    protected _notifyEtaIdle(): void;
    private _scheduleEtaRenderFromMutation;
    private _isStateNodeElement;
    private _findEligibleRoot;
    private _hasNestedStateNode;
    private _safeEtaRender;
    private _renderEtaAttributes;
    private _hasRenderNodes;
    private _morphElementFromHTML;
    protected _renderEtaTemplates(context: object): Promise<void>;
    connectedCallback(): void;
    remove(): void;
    disconnectedCallback(): void;
    private _onCollectChild;
    private _onCollectChildRemoved;
    private _announceAsContextualChild;
    private _announceContextualChildRemoved;
    private _cleanupShadowRoot;
    private _handleEtaMutations;
    private _observeShadowRoot;
    protected _eventChange(e: EventType): void;
    protected _forwardEvent(e?: eventContexType): void;
    private _collectOptionEvent;
    collectOption({ name, options }: CollectOption): void;
    private _collectActionEvent;
    private _collectUpdateByDeltaEvent;
    private _computeState;
    private _applyPartials;
    private _applyActions;
    private _applyDeltaUpdates;
    /**
   * Attempts to apply the given delta action to the current value.
   * Returns the updated value and whether we've exhausted variants.
   */
    private _computeDelta;
    private _computeContext;
    protected _getOption({ id, campaign, devices, subscription }: Partial<Action>, bundle?: ProductBundleOption[]): Promise<ProductOption | null | undefined>;
    private _applyBundles;
    protected _notifyParent(): void;
    protected getUpdateComplete(): Promise<boolean>;
    protected isDeviceAndSubscriptionChange(evt: EventType): evt is ActionEvent;
    protected isBundleToogle(evt: EventType): evt is ActionEvent;
    protected isProductChange(evt: EventType): evt is ActionEvent;
    protected isActionEvent(evt: EventType): evt is ActionEvent;
    protected isDeltaUpdate(evt: EventType): evt is UpdateByDeltaEvent;
    protected _isIgnoredSource(e: EventType): boolean;
    private _getIgnoreSet;
    render(): import("lit-html").TemplateResult<1>;
}
export {};

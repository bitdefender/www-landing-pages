import { storeContextType } from "../../../src/contexts/context.store.js";
import { LitElement } from "lit";
import type { PropertyValues } from "lit";
export declare class StoreProvider extends LitElement {
    store?: storeContextType;
    private provider;
    protected updated(changed: PropertyValues): void;
    render(): import("lit-html").TemplateResult<1>;
}

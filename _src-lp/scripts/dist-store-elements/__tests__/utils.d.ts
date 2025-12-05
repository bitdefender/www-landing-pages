import { ProductOption } from "@repobit/dex-store";
type ComputedOptions = {
    id: string;
    devices: number;
    subscription: number;
    bundle: ComputedOptions[];
};
export declare function getComputedOptions(computedOptions?: ProductOption[]): ComputedOptions[];
export {};

export type OptionsMapping = Record<number, Record<number, {
    devices: number;
    subscription: number;
}>>;
export type ProductsMapping = Map<string, {
    id: string;
    options?: Promise<OptionsMapping | null>;
}>;
export type Product = {
    id: string;
    devices: number;
    subscription: number;
};
export type OptionsSheet = {
    total: number;
    offset: number;
    limit: number;
    data: Array<{
        fromDevices: number;
        fromSubscription: number;
        toDevices: number;
        toSubscription: number;
    }>;
    columns: Array<"fromDevices" | "fromSubscription" | "toDevices" | "toSubscription">;
    ":type": "sheet";
};
export type ProductIdSheet = {
    total: number;
    offset: number;
    limit: number;
    data: Array<{
        from: string;
        to: string;
    }>;
    columns: Array<"from" | "to">;
    ":type": "sheet";
};
export declare class Adaptor {
    private mapper;
    constructor(mapper: ProductsMapping | null);
    static create(): Promise<Adaptor>;
    adaptTo(param: {
        id: string;
    }): Promise<{
        id: string;
    }>;
    adaptTo(param: {
        id: string;
        devices: number;
        subscription: number;
    }): Promise<{
        id: string;
        devices: number;
        subscription: number;
    }>;
    static getMappings(): Promise<ProductsMapping | null>;
    private getMappingForId;
}

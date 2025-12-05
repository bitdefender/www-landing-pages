import { Store } from "../../src/store.js";
const makeResponse = (data) => ({ ok: true, json: async () => data });
const vlaicuProduct = (campaign) => makeResponse({
    code: 200,
    message: "OK",
    campaign: campaign || "DEFAULT",
    campaignType: "def",
    platformProductId: "P12345",
    verifoneProductCode: "CODE",
    product: {
        productId: "tsmd",
        productName: "Test Product",
        options: [
            {
                slots: 5,
                months: 12,
                currency: "USD",
                price: 100,
                discountedPrice: 80,
                discountAmount: 20,
                discountPercentage: 20,
                buyLink: "https://example.com/buy?opt=5-12"
            },
            {
                slots: 10,
                months: 12,
                currency: "USD",
                price: 200,
                discountedPrice: 150,
                discountAmount: 50,
                discountPercentage: 25,
                buyLink: "https://example.com/buy?opt=10-12"
            }
        ]
    }
});
const idMappingsEmpty = makeResponse({
    total: 0,
    offset: 0,
    limit: 0,
    data: [],
    columns: ["from", "to"],
    ":type": "sheet"
});
describe("Store features", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });
    describe("transformers", () => {
        it("applies transformers.option.buyLink to all options", async () => {
            vi.spyOn(global, "fetch").mockImplementation(async (url) => {
                if (typeof url === "string" && url.includes("/p-api/v1/products/tsmd/locale/en-us")) {
                    return vlaicuProduct();
                }
                if (typeof url === "string" && url.includes("sheet=id-mappings")) {
                    return idMappingsEmpty;
                }
                return makeResponse({});
            });
            const store = new Store({
                locale: "en-us",
                provider: { name: "vlaicu" },
                transformers: {
                    option: {
                        buyLink: async (link) => `${link}&tracked=1`
                    }
                }
            });
            const product = await store.getProduct({ id: "tsmd" });
            const optA = await product?.getOption({ devices: 5, subscription: 12 });
            const optB = await product?.getOption({ devices: 10, subscription: 12 });
            expect(optA?.getBuyLink()).toContain("tracked=1");
            expect(optB?.getBuyLink()).toContain("tracked=1");
        });
    });
    describe("trialLinks", () => {
        it("uses default trialLinks when campaign has no entry", async () => {
            vi.spyOn(global, "fetch").mockImplementation(async (url) => {
                if (typeof url === "string" && url.includes("/p-api/v1/products/tsmd/locale/en-us")) {
                    // no /campaign present -> default
                    return vlaicuProduct();
                }
                if (typeof url === "string" && url.includes("sheet=id-mappings")) {
                    return idMappingsEmpty;
                }
                return makeResponse({});
            });
            const store = new Store({
                locale: "en-us",
                provider: { name: "vlaicu" },
                trialLinks: {
                    tsmd: {
                        default: {
                            "5-12": "https://trial.example.com/default/5-12",
                            "10-12": "https://trial.example.com/default/10-12"
                        }
                    }
                }
            });
            const product = await store.getProduct({ id: "tsmd" });
            const optA = await product?.getOption({ devices: 5, subscription: 12 });
            const optB = await product?.getOption({ devices: 10, subscription: 12 });
            expect(optA?.getTrialLink()).toBe("https://trial.example.com/default/5-12");
            expect(optB?.getTrialLink()).toBe("https://trial.example.com/default/10-12");
        });
        it("uses campaign-specific trialLinks when available", async () => {
            vi.spyOn(global, "fetch").mockImplementation(async (url) => {
                if (typeof url === "string" && url.includes("/p-api/v1/products/tsmd/locale/en-us/campaign/CampX")) {
                    return vlaicuProduct("CampX");
                }
                if (typeof url === "string" && url.includes("sheet=id-mappings")) {
                    return idMappingsEmpty;
                }
                return makeResponse({});
            });
            const store = new Store({
                locale: "en-us",
                provider: { name: "vlaicu" },
                trialLinks: {
                    tsmd: {
                        default: {
                            "5-12": "https://trial.example.com/default/5-12"
                        },
                        CampX: {
                            "5-12": "https://trial.example.com/campx/5-12",
                            "10-12": "https://trial.example.com/campx/10-12"
                        }
                    }
                }
            });
            const product = await store.getProduct({ id: "tsmd", campaign: "CampX" });
            const optA = await product?.getOption({ devices: 5, subscription: 12 });
            const optB = await product?.getOption({ devices: 10, subscription: 12 });
            expect(optA?.getTrialLink()).toBe("https://trial.example.com/campx/5-12");
            expect(optB?.getTrialLink()).toBe("https://trial.example.com/campx/10-12");
        });
    });
    describe("overrides", () => {
        it("merges option overrides and deletes when null", async () => {
            vi.spyOn(global, "fetch").mockImplementation(async (url) => {
                if (typeof url === "string" && url.includes("/p-api/v1/products/tsmd/locale/en-us/campaign/WINTER")) {
                    return vlaicuProduct("WINTER");
                }
                if (typeof url === "string" && url.includes("sheet=id-mappings")) {
                    return idMappingsEmpty;
                }
                return makeResponse({});
            });
            const store = new Store({
                locale: "en-us",
                provider: { name: "vlaicu" },
                overrides: {
                    tsmd: {
                        WINTER: {
                            options: {
                                "5-12": { buyLink: "https://example.com/buy/overridden", discountedPrice: 49.99 },
                                "10-12": null
                            }
                        }
                    }
                }
            });
            const product = await store.getProduct({ id: "tsmd", campaign: "WINTER" });
            const optA = await product?.getOption({ devices: 5, subscription: 12 });
            const optB = await product?.getOption({ devices: 10, subscription: 12 });
            expect(optA?.getBuyLink()).toBe("https://example.com/buy/overridden");
            expect(optA?.getDiscountedPrice({ currency: false })).toBe(49.99);
            expect(optB).toBeUndefined();
        });
    });
    describe("campaign", () => {
        it("uses custom campaign resolver", async () => {
            vi.spyOn(global, "fetch").mockImplementation(async (url) => {
                if (typeof url === "string" && url.includes("/p-api/v1/products/tsmd/locale/en-us/campaign/ComputedCamp")) {
                    return vlaicuProduct("ComputedCamp");
                }
                if (typeof url === "string" && url.includes("sheet=id-mappings")) {
                    return idMappingsEmpty;
                }
                return makeResponse({});
            });
            const store = new Store({
                locale: "en-us",
                provider: { name: "vlaicu" },
                campaign: async ({ id }) => (id === "tsmd" ? "ComputedCamp" : undefined)
            });
            const product = await store.getProduct({ id: "tsmd" });
            expect(product?.getCampaign()).toBe("ComputedCamp");
        });
        it("uses overrides.default.campaign when present", async () => {
            vi.spyOn(global, "fetch").mockImplementation(async (url) => {
                if (typeof url === "string" && url.includes("/p-api/v1/products/tsmd/locale/en-us/campaign/OvDefault")) {
                    return vlaicuProduct("OvDefault");
                }
                if (typeof url === "string" && url.includes("sheet=id-mappings")) {
                    return idMappingsEmpty;
                }
                return makeResponse({});
            });
            const store = new Store({
                locale: "en-us",
                provider: { name: "vlaicu" },
                overrides: {
                    tsmd: {
                        default: {
                            campaign: "OvDefault"
                        }
                    }
                }
            });
            const product = await store.getProduct({ id: "tsmd" });
            expect(product?.getCampaign()).toBe("OvDefault");
        });
        it("uses overrides[campaign].campaign mapping when present", async () => {
            vi.spyOn(global, "fetch").mockImplementation(async (url) => {
                if (typeof url === "string" && url.includes("/p-api/v1/products/tsmd/locale/en-us/campaign/Bar")) {
                    return vlaicuProduct("Bar");
                }
                if (typeof url === "string" && url.includes("sheet=id-mappings")) {
                    return idMappingsEmpty;
                }
                return makeResponse({});
            });
            const store = new Store({
                locale: "en-us",
                provider: { name: "vlaicu" },
                overrides: {
                    tsmd: {
                        Foo: { campaign: "Bar" }
                    }
                }
            });
            const product = await store.getProduct({ id: "tsmd", campaign: "Foo" });
            expect(product?.getCampaign()).toBe("Bar");
        });
    });
});
//# sourceMappingURL=store.features.test.js.map
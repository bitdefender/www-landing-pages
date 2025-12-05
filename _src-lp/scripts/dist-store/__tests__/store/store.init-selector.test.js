import { Store } from "../../src/store.js";
const idMappings = {
    ok: true,
    json: async () => ({
        total: 2,
        offset: 0,
        limit: 2,
        data: [
            { from: "vpn", to: "com.bitdefender.vpn" },
            { from: "vpn-monthly", to: "com.bitdefender.vpn" }
        ],
        columns: ["from", "to"],
        ":type": "sheet"
    })
};
const vpnMapping = {
    ok: true,
    json: async () => ({
        total: 1,
        offset: 0,
        limit: 1,
        data: [
            {
                fromDevices: "10",
                fromSubscription: "1",
                toDevices: "1",
                toSubscription: "12"
            }
        ],
        columns: [
            "fromDevices",
            "fromSubscription",
            "toDevices",
            "toSubscription"
        ],
        ":type": "sheet"
    })
};
const vpnMonthlyMapping = {
    ok: true,
    json: async () => ({
        total: 1,
        offset: 0,
        limit: 1,
        data: [
            {
                fromDevices: "10",
                fromSubscription: "1",
                toDevices: "1",
                toSubscription: "1"
            }
        ],
        columns: [
            "fromDevices",
            "fromSubscription",
            "toDevices",
            "toSubscription"
        ],
        ":type": "sheet"
    })
};
const vpn = {
    ok: true,
    json: async () => ({
        "code": 0,
        "data": {
            "product": {
                "product_id": "5008",
                "product_name": "VPN Premium",
                "product_type": "3",
                "product_alias": "vpn",
                "product_active": "1",
                "base_uri": "https://www.bitdefender.com:/site",
                "variations": {
                    "10": {
                        "1": {
                            "product_id": "5008",
                            "region_id": "8",
                            "variation_id": "34",
                            "platform_id": "16",
                            "platform_product_id": "4718333",
                            "price": "69.99",
                            "currency_id": "6",
                            "in_selector": "1",
                            "active_platform": "1",
                            "variation_active": "1",
                            "avangate_variation_prefix": "",
                            "variation": {
                                "variation_id": "34",
                                "variation_name": "10u-1y",
                                "dimension_id": "1",
                                "dimension_value": "10",
                                "years": "1"
                            },
                            "currency_label": "$",
                            "currency_iso": "USD",
                            "discount": {
                                "discounted_price": "34.99",
                                "discount_value": "34.99",
                                "discount_type": 3
                            },
                            "promotion": "BF_REST_CAMPAIGN_2024_VPN",
                            "promotion_functions": ""
                        }
                    }
                }
            },
            "config": {
                "country_code": "us",
                "extra_params": {
                    "pid": null
                }
            }
        }
    })
};
const vpnMonthly = {
    ok: true,
    json: async () => ({
        "code": 0,
        "data": {
            "product": {
                "product_id": "4718334",
                "product_name": "VPN Monthly",
                "product_type": "3",
                "product_alias": "vpn-monthly",
                "product_active": "1",
                "base_uri": "https://www.bitdefender.com:/site",
                "variations": {
                    "10": {
                        "1": {
                            "product_id": "4718334",
                            "region_id": "8",
                            "variation_id": "34",
                            "platform_id": "16",
                            "platform_product_id": "4718334",
                            "price": "6.99",
                            "currency_id": "6",
                            "in_selector": "1",
                            "active_platform": "1",
                            "variation_active": "1",
                            "avangate_variation_prefix": "",
                            "variation": {
                                "variation_id": "34",
                                "variation_name": "10u-1y",
                                "dimension_id": "1",
                                "dimension_value": "10",
                                "years": "1"
                            },
                            "currency_label": "$",
                            "currency_iso": "USD"
                        }
                    }
                }
            },
            "config": {
                "country_code": "us",
                "extra_params": {
                    "pid": null
                }
            }
        }
    })
};
let store;
describe("Store", () => {
    beforeEach(async () => {
        vi.spyOn(global, "fetch").mockImplementation(async (url, options) => {
            if (typeof url === "string" && url.includes("sheet=id-mappings")) {
                return idMappings;
            }
            if (typeof url === "string" && url.includes("sheet=vpn-monthly")) {
                return vpnMonthlyMapping;
            }
            if (typeof url === "string" && url.includes("sheet=vpn")) {
                return vpnMapping;
            }
            // Check if the body is a FormData instance
            if (options && options.body instanceof FormData) {
                const formData = options.body;
                const entries = {};
                formData.forEach((value, key) => {
                    entries[key] = JSON.parse(value);
                });
                // Now you can check for specific values
                if (entries['data']?.product_id === "vpn") {
                    // return a specific response if the form data matches
                    return vpn;
                }
                if (entries['data']?.product_id === "vpn-monthly") {
                    // return a specific response if the form data matches
                    return vpnMonthly;
                }
            }
            return {
                ok: true,
                json: async () => ({})
            };
        });
        store = new Store({
            locale: "en-us",
            provider: {
                name: "init"
            }
        });
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });
    describe("getProduct", () => {
        it("product merge (vpn and vpn-monthly) - vlaicu compatibility", async () => {
            const vpn = await store.getProduct({ id: "vpn" });
            const vpnMonthly = await store.getProduct({ id: "vpn-monthly" });
            const monthlyOption = await vpnMonthly?.getOption({ devices: 10, subscription: 1 });
            const yearlyOption = await vpn?.getOption({ devices: 10, subscription: 1 });
            expect({
                devices: monthlyOption?.getDevices(),
                subscription: monthlyOption?.getSubscription()
            }).toEqual({ devices: 1, subscription: 1 });
            expect({
                devices: yearlyOption?.getDevices(),
                subscription: yearlyOption?.getSubscription()
            }).toEqual({ devices: 1, subscription: 12 });
        });
    });
});
//# sourceMappingURL=store.init-selector.test.js.map
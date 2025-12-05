import { InitSelectorProvider } from "../../src/providers/provider.init-selector.js";
import { STORE_ADAPTER, STORE_CAMPAIGN, STORE_LOCALE } from "../../src/store.js";
const vpnFetch = {
    ok: true,
    json: async () => ({
        code: 0,
        data: {
            product: {
                product_id: "5008",
                product_name: "VPN Premium",
                product_type: "3",
                product_alias: "vpn",
                product_active: "1",
                base_uri: "https://www.bitdefender.com:/site",
                variations: {
                    "10": {
                        "1": {
                            product_id: "5008",
                            region_id: "8",
                            variation_id: "34",
                            platform_id: "16",
                            platform_product_id: "4718333",
                            price: "69.99",
                            currency_id: "6",
                            in_selector: "1",
                            active_platform: "1",
                            variation_active: "1",
                            avangate_variation_prefix: "",
                            variation: {
                                variation_id: "34",
                                variation_name: "10u-1y",
                                dimension_id: "1",
                                dimension_value: "10",
                                years: "1"
                            },
                            currency_label: "$",
                            currency_iso: "USD",
                            discount: {
                                discounted_price: "34.99",
                                discount_value: "34.99",
                                discount_type: 3
                            },
                            promotion: "BF_REST_CAMPAIGN_2024_VPN",
                            promotion_functions: ""
                        }
                    }
                }
            },
            config: {
                country_code: "us",
                extra_params: {
                    pid: null
                }
            }
        }
    })
};
const store = {
    [STORE_LOCALE]: "en-us",
    [STORE_CAMPAIGN]: ({ campaign }) => campaign || "default-campaign",
    [STORE_ADAPTER]: {
        adaptTo() {
            return { id: "com.bitdefender.vpn", devices: 10, subscription: 12 };
        }
    }
};
// Helper function to parse FormData into an object
function parseFormData(formData) {
    const result = {};
    formData.forEach((value, key) => {
        try {
            result[key] = JSON.parse(value);
        }
        catch {
            result[key] = value;
        }
    });
    return result;
}
// Helper function to verify fetch call and extract options
function getFetchOptions(fetchSpy) {
    expect(fetchSpy).toHaveBeenCalled();
    const fetchCallArgs = fetchSpy.mock.calls[0];
    const options = fetchCallArgs[1];
    expect(options?.method).toBe("post");
    expect(options?.body).toBeInstanceOf(FormData);
    return options;
}
// Helper that returns the parsed FormData from the fetch call
function getParsedFetchForm(fetchSpy) {
    const options = getFetchOptions(fetchSpy);
    return parseFormData(options?.body);
}
const provider = new InitSelectorProvider({ store });
describe("Provider Init Selector", () => {
    let fetchSpy;
    beforeEach(async () => {
        fetchSpy = vi.spyOn(global, "fetch");
        fetchSpy.mockResolvedValue(vpnFetch);
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });
    describe("getProduct", () => {
        it("vpn", async () => {
            const vpn = await provider.getProduct({ id: "vpn" });
            const option = await vpn?.getOption({ devices: 10, subscription: 12 });
            const product = {
                id: option?.getProduct().getId(),
                devices: option?.getDevices(),
                subscription: option?.getSubscription()
            };
            expect(product).toEqual({ id: "com.bitdefender.vpn", devices: 10, subscription: 12 });
        });
        it("vpn + campaign", async () => {
            await provider.getProduct({ id: "vpn", campaign: "test" });
            const formObject = getParsedFetchForm(fetchSpy);
            expect(formObject.data).toEqual({
                ev: 1,
                product_id: "vpn",
                config: {
                    country_code: "us",
                    extra_params: { pid: "test" }
                }
            });
        });
        it("vpn + default campaign from store", async () => {
            await provider.getProduct({ id: "vpn" });
            const formObject = getParsedFetchForm(fetchSpy);
            expect(formObject.data).toEqual({
                ev: 1,
                product_id: "vpn",
                config: {
                    country_code: "us",
                    extra_params: { pid: "default-campaign" }
                }
            });
        });
        it("vpn + ingore default campaign from store", async () => {
            const provider = new InitSelectorProvider({
                store: { ...store, [STORE_CAMPAIGN]: () => "ignore" }
            });
            await provider.getProduct({ id: "vpn" });
            const formObject = getParsedFetchForm(fetchSpy);
            expect(formObject.data).toEqual({
                ev: 1,
                product_id: "vpn",
                config: {
                    country_code: "us",
                    ignore_promotions: true
                }
            });
        });
    });
});
//# sourceMappingURL=provider.init-selector.test.js.map
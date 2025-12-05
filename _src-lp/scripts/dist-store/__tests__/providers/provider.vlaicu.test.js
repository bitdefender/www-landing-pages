import { VlaicuProvider } from "../../src/providers/provider.vlaicu.js";
import { STORE_ADAPTER, STORE_CAMPAIGN, STORE_LOCALE } from "../../src/store.js";
const vpnFetch = {
    ok: true,
    json: async () => ({
        "code": 200,
        "message": "Information retrieved successfully",
        "campaign": "WINTERMCWEB24",
        "campaignType": "def",
        "platformProductId": "4718334",
        "verifoneProductCode": "VPN-M",
        "product": {
            "productId": "com.bitdefender.vpn",
            "productName": "Bitdefender Premium VPN",
            "options": [
                {
                    "slots": 1,
                    "months": 1,
                    "currency": "USD",
                    "price": 6.99,
                    "discountedPrice": 6.99,
                    "discountAmount": 0.0,
                    "discountPercentage": 0.0,
                    "buyLink": "https://store.bitdefender.com/order/checkout.php?redirect=0&CART=1&CARD=2&PRODS=4718334&QTY=1&OPTIONS4718334=&LANG=en&CURRENCY=USD&DCURRENCY=USD&CLEAN_CART=1&ORDERSTYLE=nLWw45SpnHI=&SHORT_FORM=1&section=en-us"
                },
                {
                    "slots": 1,
                    "months": 12,
                    "currency": "USD",
                    "price": 69.99,
                    "discountedPrice": 34.99,
                    "discountAmount": 35.0,
                    "discountPercentage": 50.0072,
                    "buyLink": "https://store.bitdefender.com/order/checkout.php?redirect=0&CART=1&CARD=2&PRODS=4718333&QTY=1&OPTIONS4718333=&LANG=en&CURRENCY=USD&DCURRENCY=USD&CLEAN_CART=1&ORDERSTYLE=nLWw45SpnHI=&COUPON=WINTERMCWEB24_BDR-000557_USD_BDR0049934-2&SHORT_FORM=1&section=en-us"
                }
            ]
        }
    })
};
const store = {
    [STORE_LOCALE]: "en-us",
    [STORE_CAMPAIGN]: ({ campaign }) => campaign || "default-campaign",
    [STORE_ADAPTER]: {
        adaptTo() {
            return { id: "com.bitdefender.vpn", devices: 1, subscription: 12 };
        }
    }
};
const provider = new VlaicuProvider({ store });
const fetchOptions = { "headers": { "Content-Type": "application/json" }, "method": "get" };
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
            const option = await vpn?.getOption({ devices: 1, subscription: 12 });
            const product = {
                id: option?.getProduct().getId(),
                devices: option?.getDevices(),
                subscription: option?.getSubscription()
            };
            expect(product).toEqual({ id: "com.bitdefender.vpn", devices: 1, subscription: 12 });
        });
        it("vpn + campaign", async () => {
            await provider.getProduct({ id: "vpn", campaign: "test" });
            expect(fetchSpy).toHaveBeenCalledWith("https://www.bitdefender.com/p-api/v1/products/com.bitdefender.vpn/locale/en-us/campaign/test", fetchOptions);
        });
        it("vpn + default campaign from store", async () => {
            await provider.getProduct({ id: "vpn" });
            expect(fetchSpy).toHaveBeenCalledWith("https://www.bitdefender.com/p-api/v1/products/com.bitdefender.vpn/locale/en-us/campaign/default-campaign", fetchOptions);
        });
        it("vpn + ingore default campaign from store", async () => {
            const provider = new VlaicuProvider({ store: { ...store, [STORE_CAMPAIGN]: () => "ignore" } });
            await provider.getProduct({ id: "vpn" });
            expect(fetchSpy).toHaveBeenCalledWith("https://www.bitdefender.com/p-api/v1/products/com.bitdefender.vpn/locale/en-us/campaign/null", fetchOptions);
        });
    });
});
//# sourceMappingURL=provider.vlaicu.test.js.map
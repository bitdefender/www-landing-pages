import { VlaicuProduct } from "../../src/products/product.vlaicu.js";
import { STORE_ADAPTER, STORE_CAMPAIGN, STORE_LOCALE } from "../../src/store.js";
import { vi } from "vitest";
const mockResponse = {
    ok: true,
    json: async () => ({
        "code": 200,
        "message": "success",
        "buyLink": "https://store.bitdefender.com/order/checkout.php?redirect=0&CART=1&CARD=2&CURRENCY=USD&DCURRENCY=USD&CLEAN_CART=1&ORDERSTYLE=nLWw45SpnHI=&SHORT_FORM=1&section=en-us&COUPON=WINTERMCWEB24_BDR-000557_USD_BDR0049946-1&LANG=en&PRODS=4718334,42003585&QTY=1,1&OPTIONSVPN-M=&OPTIONSTS-I-v1=ind-5d-1y"
    })
};
const store = {
    [STORE_LOCALE]: "en-us",
    [STORE_CAMPAIGN]: undefined,
    [STORE_ADAPTER]: {
        adaptTo(product) {
            return product;
        }
    }
};
const tsmd = new VlaicuProduct({
    store,
    name: "Bitdefender Total Security Individual",
    campaign: "WINTERMCWEB24",
    id: "com.bitdefender.tsmd.v2",
    alias: "tsmd",
    platformId: "42003585",
    currency: "USD",
    options: new Map([
        ["5-12", {
                price: 109.99,
                discountedPrice: 59.99,
                devices: 5,
                subscription: 12,
                buyLink: "https://www.bitdefender.com/site/Store/buy/tsmd/5/1/",
                bundle: []
            }]
    ])
});
const vpn = new VlaicuProduct({
    store,
    name: "Bitdefender Premium VPN",
    campaign: "WINTERMCWEB24",
    id: "com.bitdefender.vpn",
    alias: "vpn",
    platformId: "4718334",
    currency: "USD",
    options: new Map([
        ["1-1", {
                price: 6.99,
                discountedPrice: 6.99,
                devices: 1,
                subscription: 1,
                buyLink: "https://www.bitdefender.com/site/Store/buy/vpn/10/1/",
                bundle: []
            }]
    ])
});
describe("Vlaicu Product", () => {
    let fetchSpy;
    beforeEach(async () => {
        fetchSpy = vi.spyOn(global, "fetch");
        fetchSpy.mockResolvedValue(mockResponse);
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });
    describe("Bundle", () => {
        it("tsmd bundle with vpn", async () => {
            const vpnOption = await vpn.getOption({ devices: 1, subscription: 1 });
            const tsmdBundleWithVPN = await tsmd.getOption({ devices: 5, subscription: 12, bundle: [{ option: vpnOption }] });
            expect(tsmdBundleWithVPN?.getBuyLink()).toBe("https://store.bitdefender.com/order/checkout.php?redirect=0&CART=1&CARD=2&CURRENCY=USD&DCURRENCY=USD&CLEAN_CART=1&ORDERSTYLE=nLWw45SpnHI=&SHORT_FORM=1&section=en-us&COUPON=WINTERMCWEB24_BDR-000557_USD_BDR0049946-1&LANG=en&PRODS=4718334,42003585&QTY=1,1&OPTIONSVPN-M=&OPTIONSTS-I-v1=ind-5d-1y");
        });
    });
});
//# sourceMappingURL=product.vlaicu.test.js.map
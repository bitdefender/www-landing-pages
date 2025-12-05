import { Store } from "../../src/store.js";
const idMappings = {
    ok: true,
    json: async () => ({
        total: 1,
        offset: 0,
        limit: 1,
        data: [{ from: "tsmd", to: "com.bitdefender.tsmd.v2" }],
        columns: ["from", "to"],
        ":type": "sheet"
    })
};
const tsmdMapping = {
    ok: true,
    json: async () => ({
        total: 3,
        offset: 0,
        limit: 3,
        data: [
            {
                fromDevices: "5",
                fromSubscription: "1",
                toDevices: "5",
                toSubscription: "12"
            },
            {
                fromDevices: "10",
                fromSubscription: "1",
                toDevices: "10",
                toSubscription: "12"
            },
            {
                fromDevices: "25",
                fromSubscription: "2",
                toDevices: "25",
                toSubscription: "24"
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
const tsmdProduct = {
    ok: true,
    json: async () => ({
        "code": 200,
        "message": "Information retrieved successfully",
        "campaign": "WINTERMCWEB24",
        "campaignType": "def",
        "platformProductId": "42003585",
        "verifoneProductCode": "TS-I-v1",
        "product": {
            "productId": "com.bitdefender.tsmd.v2",
            "productName": "Bitdefender Total Security Individual",
            "options": [
                {
                    "slots": 5,
                    "months": 12,
                    "currency": "USD",
                    "price": 109.99,
                    "discountedPrice": 59.99,
                    "discountAmount": 50.0,
                    "discountPercentage": 45.4587,
                    "buyLink": "https://store.bitdefender.com/order/checkout.php?redirect=0&CART=1&CARD=2&PRODS=42003585&QTY=1&OPTIONS42003585=ind-5d-1y&LANG=en&CURRENCY=USD&DCURRENCY=USD&CLEAN_CART=1&ORDERSTYLE=nLWw45SpnHI=&COUPON=WINTERMCWEB24_BDR-000557_USD_BDR0049946-1&SHORT_FORM=1&section=en-us"
                },
                {
                    "slots": 25,
                    "months": 12,
                    "currency": "USD",
                    "price": 139.99,
                    "discountedPrice": 79.99,
                    "discountAmount": 60.0,
                    "discountPercentage": 42.8603,
                    "buyLink": "https://store.bitdefender.com/order/checkout.php?redirect=0&CART=1&CARD=2&PRODS=42003885&QTY=1&OPTIONS42003885=fam-25d-1y&LANG=en&CURRENCY=USD&DCURRENCY=USD&CLEAN_CART=1&ORDERSTYLE=nLWw45SpnHI=&COUPON=WINTERMCWEB24_BDR-000557_USD_BDR0049946-2&SHORT_FORM=1&section=en-us"
                },
                {
                    "slots": 25,
                    "months": 24,
                    "currency": "USD",
                    "price": 279.99,
                    "discountedPrice": 169.99,
                    "discountAmount": 110.0,
                    "discountPercentage": 39.2872,
                    "buyLink": "https://store.bitdefender.com/order/checkout.php?redirect=0&CART=1&CARD=2&PRODS=42003885&QTY=1&OPTIONS42003885=fam-25d-2y&LANG=en&CURRENCY=USD&DCURRENCY=USD&CLEAN_CART=1&ORDERSTYLE=nLWw45SpnHI=&COUPON=WINTERMCWEB24_BDR-000557_USD_BDR0049948-3&SHORT_FORM=1&section=en-us"
                },
                {
                    "slots": 5,
                    "months": 24,
                    "currency": "USD",
                    "price": 219.99,
                    "discountedPrice": 129.99,
                    "discountAmount": 90.0,
                    "discountPercentage": 40.911,
                    "buyLink": "https://store.bitdefender.com/order/checkout.php?redirect=0&CART=1&CARD=2&PRODS=42003585&QTY=1&OPTIONS42003585=ind-5d-2y&LANG=en&CURRENCY=USD&DCURRENCY=USD&CLEAN_CART=1&ORDERSTYLE=nLWw45SpnHI=&COUPON=WINTERMCWEB24_BDR-000557_USD_BDR0049948-4&SHORT_FORM=1&section=en-us"
                }
            ]
        }
    })
};
const tsmdProductCampaign = {
    ok: true,
    json: async () => ({
        "code": 200,
        "message": "Information retrieved successfully",
        "campaign": "Fam_test",
        "campaignType": "def",
        "platformProductId": "47061551",
        "verifoneProductCode": "TS-I-v1",
        "product": {
            "productId": "com.bitdefender.tsmd.v2",
            "productName": "Bitdefender Total Security Individual",
            "options": [
                {
                    "slots": 5,
                    "months": 12,
                    "currency": "RON",
                    "price": 399.99,
                    "discountedPrice": 199.99,
                    "discountAmount": 200.0,
                    "discountPercentage": 50.0013,
                    "buyLink": "https://store.bitdefender.com/order/checkout.php?redirect=0&CART=1&CARD=2&PRODS=47061551&QTY=1&OPTIONS47061551=ind-5d-1y&LANG=ro&CURRENCY=RON&DCURRENCY=RON&CLEAN_CART=1&ORDERSTYLE=nLWw45aprnY=&COUPON=WINTERMCWEB24_BDR-000557_RON_BDR0049815-1&SHORT_FORM=1&section=ro-RO"
                },
                {
                    "slots": 25,
                    "months": 12,
                    "currency": "RON",
                    "price": 579.99,
                    "discountedPrice": 299.99,
                    "discountAmount": 280.0,
                    "discountPercentage": 48.2767,
                    "buyLink": "https://store.bitdefender.com/order/checkout.php?redirect=0&CART=1&CARD=2&PRODS=47061636&QTY=1&OPTIONS47061636=fam-25d-1y&LANG=ro&CURRENCY=RON&DCURRENCY=RON&CLEAN_CART=1&ORDERSTYLE=nLWw45aprnY=&COUPON=WINTERMCWEB24_BDR-000557_RON_BDR0049815-2&SHORT_FORM=1&section=ro-RO"
                },
                {
                    "slots": 25,
                    "months": 24,
                    "currency": "RON",
                    "price": 1159.99,
                    "discountedPrice": 599.99,
                    "discountAmount": 560.0,
                    "discountPercentage": 48.2763,
                    "buyLink": "https://store.bitdefender.com/order/checkout.php?redirect=0&CART=1&CARD=2&PRODS=47061636&QTY=1&OPTIONS47061636=fam-25d-2y&LANG=ro&CURRENCY=RON&DCURRENCY=RON&CLEAN_CART=1&ORDERSTYLE=nLWw45aprnY=&COUPON=WINTERMCWEB24_BDR-000557_RON_BDR0049817-3&SHORT_FORM=1&section=ro-RO"
                },
                {
                    "slots": 5,
                    "months": 24,
                    "currency": "RON",
                    "price": 799.99,
                    "discountedPrice": 399.99,
                    "discountAmount": 400.0,
                    "discountPercentage": 50.0007,
                    "buyLink": "https://store.bitdefender.com/order/checkout.php?redirect=0&CART=1&CARD=2&PRODS=47061551&QTY=1&OPTIONS47061551=ind-5d-2y&LANG=ro&CURRENCY=RON&DCURRENCY=RON&CLEAN_CART=1&ORDERSTYLE=nLWw45aprnY=&COUPON=WINTERMCWEB24_BDR-000557_RON_BDR0049817-4&SHORT_FORM=1&section=ro-RO"
                }
            ]
        }
    })
};
let store;
describe("Store", () => {
    beforeEach(async () => {
        vi.spyOn(global, "fetch").mockImplementation(async (url) => {
            if (typeof url === "string" && url.includes("sheet=id-mappings")) {
                return idMappings;
            }
            if (typeof url === "string" && url.includes("sheet=tsmd")) {
                return tsmdMapping;
            }
            if (typeof url === "string" && url.includes("p-api/v1/products/com.bitdefender.tsmd.v2/locale/en-us/campaign/Fam_test")) {
                return tsmdProductCampaign;
            }
            if (typeof url === "string" && url.includes("p-api/v1/products/com.bitdefender.tsmd.v2/locale/en-us")) {
                return tsmdProduct;
            }
            return {
                ok: true,
                json: async () => ({})
            };
        });
        store = new Store({
            locale: "en-us",
            provider: {
                name: "vlaicu"
            }
        });
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });
    describe("getProduct", () => {
        it("same product 2 campaigns", async () => {
            const tsmdDefaultCampaign = await store.getProduct({ id: "tsmd" });
            const tsmdCampaign = await store.getProduct({ id: "tsmd", "campaign": "Fam_test" });
            expect(tsmdDefaultCampaign?.getCampaign()).toBe("WINTERMCWEB24");
            expect(tsmdCampaign?.getCampaign()).toBe("Fam_test");
        });
    });
});
//# sourceMappingURL=store.vlaicu.test.js.map
import { formatPrice } from "../../src/format-price.js";
import { Product } from "../../src/products/product.base.js";
import { STORE_ADAPTER, STORE_CAMPAIGN, STORE_LOCALE } from "../../src/store.js";
const store = {
    [STORE_LOCALE]: "en-us",
    [STORE_CAMPAIGN]: undefined,
    [STORE_ADAPTER]: {
        adaptTo({ id, devices, subscription }) {
            if (subscription === 1) {
                return { id, devices, subscription: 12 };
            }
            return { id, devices, subscription };
        }
    },
    formatPrice
};
const option5d12s = {
    price: 109.99,
    discountedPrice: 59.99,
    devices: 5,
    subscription: 12,
    buyLink: "https://store.bitdefender.com/order/checkout.php",
    bundle: []
};
const option5d24s = {
    price: 219.99,
    discountedPrice: 129.99,
    devices: 5,
    subscription: 24,
    buyLink: "https://store.bitdefender.com/order/checkout.php",
    bundle: []
};
const option25d12s = {
    price: 139.99,
    discountedPrice: 79.99,
    devices: 25,
    subscription: 12,
    buyLink: "https://store.bitdefender.com/order/checkout.php",
    bundle: []
};
const option25d24s = {
    price: 279.99,
    discountedPrice: 169.99,
    devices: 25,
    subscription: 24,
    buyLink: "https://store.bitdefender.com/order/checkout.php",
    bundle: []
};
const product = new Product({
    store,
    name: "Bitdefender Total Security Individual",
    campaign: "campaign-name",
    id: "com.bitdefender.tsmd.v2",
    alias: "tsmd",
    platformId: "42003585",
    currency: "USD",
    options: new Map([
        ["5-12", option5d12s],
        ["5-24", option5d24s],
        ["25-12", option25d12s],
        ["25-24", option25d24s]
    ])
});
describe("Product", () => {
    describe("setProduct", () => {
        it("default case", async () => {
            const option = await product.getOption({ devices: 5, subscription: 12 });
            expect(option?.getProduct()).toBe(product);
        });
    });
    describe("getId", () => {
        it("default case", () => {
            expect(product.getId()).toBe("com.bitdefender.tsmd.v2");
        });
    });
    describe("getPlatformId", () => {
        it("default case", () => {
            expect(product.getPlatformId()).toBe("42003585");
        });
    });
    describe("getName", () => {
        it("default case", () => {
            expect(product.getName()).toBe("Bitdefender Total Security Individual");
        });
    });
    describe("getCampaign", () => {
        it("default case", () => {
            expect(product.getCampaign()).toBe("campaign-name");
        });
    });
    describe("getOption", () => {
        it("return correctly selected option", async () => {
            const option = await product.getOption({ devices: 5, subscription: 12 });
            expect({
                price: option?.getPrice({ currency: false }),
                discountedPrice: option?.getDiscountedPrice({ currency: false }),
                devices: option?.getDevices(),
                subscription: option?.getSubscription(),
                buyLink: option?.getBuyLink(),
                bundle: option?.getBundle()
            }).toEqual(option5d12s);
        });
        it("return all options", async () => {
            const options = await product.getOption();
            expect(options.map(option => {
                return {
                    price: option.getPrice({ currency: false }),
                    discountedPrice: option.getDiscountedPrice({ currency: false }),
                    devices: option.getDevices(),
                    subscription: option.getSubscription(),
                    buyLink: option.getBuyLink(),
                    bundle: option.getBundle()
                };
            })).toEqual([option5d12s, option5d24s, option25d12s, option25d24s]);
        });
        it("return using old variation", async () => {
            const option = await product.getOption({ devices: 5, subscription: 1 });
            expect({
                devices: option?.getDevices(),
                subscription: option?.getSubscription()
            }).toEqual({ devices: 5, subscription: 12 });
        });
    });
    describe("getPrice", () => {
        it("default case", () => {
            expect(product.getPrice()).toEqual({ "max": "$279.99", "min": "$109.99" });
        });
        it("returns numeric price", () => {
            expect(product.getPrice({ monthly: false, currency: false })).toEqual({ "max": 279.99, "min": 109.99 });
        });
        it("returns numeric monthly price", () => {
            expect(product.getPrice({ monthly: true, currency: false })).toEqual({ "max": 11.67, "min": 9.17 });
        });
        it("returns formatted price", () => {
            expect(product.getPrice({ monthly: false, currency: true })).toEqual({ "max": "$279.99", "min": "$109.99" });
        });
        it("returns formatted monthly price", () => {
            expect(product.getPrice({ monthly: true, currency: true })).toEqual({ "max": "$11.67", "min": "$9.17" });
        });
    });
    describe("getDiscountedPrice", () => {
        it("default case", () => {
            expect(product.getDiscountedPrice()).toEqual({ "max": "$169.99", "min": "$59.99" });
        });
        it("returns numeric discounted price", () => {
            expect(product.getDiscountedPrice({ monthly: false, currency: false })).toEqual({ "max": 169.99, "min": 59.99 });
        });
        it("returns numeric monthly discounted price", () => {
            expect(product.getDiscountedPrice({ monthly: true, currency: false })).toEqual({ "max": 7.08, "min": 5 });
        });
        it("returns formatted discounted price", () => {
            expect(product.getDiscountedPrice({ monthly: false, currency: true })).toEqual({ "max": "$169.99", "min": "$59.99" });
        });
        it("returns formatted monthly discounted price", () => {
            expect(product.getDiscountedPrice({ monthly: true, currency: true })).toEqual({ "max": "$7.08", "min": "$5" });
        });
    });
    describe("getDiscount", () => {
        it("default case", () => {
            expect(product.getDiscount()).toEqual({ "max": "$110", "min": "$50" });
        });
        it("returns numeric discount", () => {
            expect(product.getDiscount({ percentage: false, symbol: false })).toEqual({ "max": 110, "min": 50 });
        });
        it("returns numeric percentage discount", () => {
            expect(product.getDiscount({ percentage: true, symbol: false })).toEqual({ "max": 45, "min": 39 });
        });
        it("returns formatted discount", () => {
            expect(product.getDiscount({ percentage: false, symbol: true })).toEqual({ "max": "$110", "min": "$50" });
        });
        it("returns formatted monthly percentage discounted", () => {
            expect(product.getDiscount({ percentage: true, symbol: true })).toEqual({ "max": "45%", "min": "39%" });
        });
    });
    describe("getDevices", () => {
        it("default case", () => {
            expect(product.getDevices()).toEqual({ min: 5, max: 25, values: [5, 25] });
        });
    });
    describe("getSubscriptions", () => {
        it("default case", () => {
            expect(product.getSubscriptions()).toEqual({ min: 12, max: 24, values: [12, 24] });
        });
    });
});
//# sourceMappingURL=product.base.test.js.map
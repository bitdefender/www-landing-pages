import { formatPrice } from "../../src/format-price.js";
import { ProductOption } from "../../src/product-options/option.base.js";
describe("ProductOption", () => {
    const option = new ProductOption({
        product: {
            getCurrency() { return "USD"; },
            getStore() { return { formatPrice }; }
        },
        price: 109.99,
        discountedPrice: 59.99,
        devices: 5,
        subscription: 12,
        buyLink: "https://store.bitdefender.com/order/checkout.php",
        bundle: []
    });
    describe("getVariation", () => {
        it("default case", () => {
            expect(option.getVariation()).toBe("5-12");
        });
    });
    describe("getPrice", () => {
        it("default case", () => {
            expect(option.getPrice()).toBe("$109.99");
        });
        it("returns numeric price", () => {
            expect(option.getPrice({ monthly: false, currency: false })).toBeCloseTo(109.99, 2);
        });
        it("returns numeric monthly price", () => {
            expect(option.getPrice({ monthly: true, currency: false })).toBeCloseTo(9.17, 2);
        });
        it("returns formatted price", () => {
            expect(option.getPrice({ monthly: false, currency: true })).toBe("$109.99");
        });
        it("returns formatted monthly price", () => {
            expect(option.getPrice({ monthly: true, currency: true })).toBe("$9.17");
        });
    });
    describe("getDiscountedPrice", () => {
        it("default case", () => {
            expect(option.getDiscountedPrice()).toBe("$59.99");
        });
        it("returns numeric discounted price", () => {
            expect(option.getDiscountedPrice({ monthly: false, currency: false })).toBeCloseTo(59.99, 2);
        });
        it("returns numeric monthly discounted price", () => {
            expect(option.getDiscountedPrice({ monthly: true, currency: false })).toBeCloseTo(5, 2);
        });
        it("returns formatted discounted price", () => {
            expect(option.getDiscountedPrice({ monthly: false, currency: true })).toBe("$59.99");
        });
        it("returns formatted monthly discounted price", () => {
            expect(option.getDiscountedPrice({ monthly: true, currency: true })).toBe("$5");
        });
    });
    describe("getDiscount", () => {
        it("default case", () => {
            expect(option.getDiscount()).toBe("$50");
        });
        it("returns numeric discounted price", () => {
            expect(option.getDiscount({ percentage: false, symbol: false })).toBeCloseTo(50, 2);
        });
        it("returns numeric monthly discounted price", () => {
            expect(option.getDiscount({ percentage: true, symbol: false })).toBeCloseTo(45, 2);
        });
        it("returns formatted discounted price", () => {
            expect(option.getDiscount({ percentage: false, symbol: true })).toBe("$50");
        });
        it("returns formatted monthly discounted price", () => {
            expect(option.getDiscount({ percentage: true, symbol: true })).toBe("45%");
        });
    });
    describe("getDevices", () => {
        it("default case", () => {
            expect(option.getDevices()).toBe(5);
        });
    });
    describe("getSubscription", () => {
        it("default case", () => {
            expect(option.getSubscription()).toBe(12);
        });
    });
    describe("getBuyLink", () => {
        it("default case", () => {
            expect(option.getBuyLink()).toBe("https://store.bitdefender.com/order/checkout.php");
        });
    });
});
//# sourceMappingURL=option.test.js.map
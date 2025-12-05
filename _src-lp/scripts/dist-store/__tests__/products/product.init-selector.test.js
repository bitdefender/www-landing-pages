import { InitSelectorProduct } from "../../src/products/product.init-selector.js";
import { STORE_ADAPTER, STORE_CAMPAIGN, STORE_LOCALE } from "../../src/store.js";
const store = {
    [STORE_LOCALE]: "en-us",
    [STORE_CAMPAIGN]: undefined,
    [STORE_ADAPTER]: {
        adaptTo(product) {
            return product;
        }
    }
};
const wa = new InitSelectorProduct({
    store,
    name: "Bitdefender GravityZone Web Access and Device Control",
    campaign: "campaign-name",
    id: "bs_wadc",
    alias: "bs_wadc",
    platformId: "42003585",
    currency: "USD",
    options: new Map([
        ["1-1", {
                price: 109.99,
                discountedPrice: 59.99,
                devices: 5,
                subscription: 12,
                buyLink: "https://www.bitdefender.com/site/Store/buy/bs_wadc/1/1/",
                bundle: []
            }]
    ])
});
const na = new InitSelectorProduct({
    store,
    name: "Bitdefender GravityZone Network Attack Defense and Risk Management",
    campaign: "campaign-name",
    id: "bs_nadrm",
    alias: "bs_nadrm",
    platformId: "42003585",
    currency: "USD",
    options: new Map([
        ["1-1", {
                price: 109.99,
                discountedPrice: 59.99,
                devices: 5,
                subscription: 12,
                buyLink: "https://www.bitdefender.com/site/Store/buy/bs_nadrm/1/1/",
                bundle: []
            }]
    ])
});
const smallbs = new InitSelectorProduct({
    store,
    name: "Bitdefender Total Security Individual",
    campaign: "campaign-name",
    id: "smallbs",
    alias: "smallbs",
    platformId: "42003585",
    currency: "USD",
    options: new Map([
        ["1-1", {
                price: 109.99,
                discountedPrice: 59.99,
                devices: 5,
                subscription: 12,
                buyLink: "https://www.bitdefender.com/site/Store/buy/smallbs/1/1/",
                bundle: []
            }]
    ])
});
const tsmd = new InitSelectorProduct({
    store,
    name: "Bitdefender Total Security Individual",
    campaign: "campaign-name",
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
const vpn = new InitSelectorProduct({
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
describe("InitSelector Product", () => {
    describe("Bundle", () => {
        it("vpn", async () => {
            const vpnOption = await vpn.getOption({ devices: 1, subscription: 1 });
            const tsmdBundleWithVPN = await tsmd.getOption({ devices: 5, subscription: 12, bundle: [{ option: vpnOption }] });
            expect(tsmdBundleWithVPN?.getBuyLink()).toBe("https://www.bitdefender.com/site/Store/buybundle/tsmd/5/1/");
        });
        it("Small business with Web Access and Device Control", async () => {
            const waOption = await wa.getOption({ devices: 1, subscription: 1 });
            const smallbsBundle = await smallbs.getOption({ devices: 1, subscription: 1, bundle: [{ option: waOption }] });
            expect(smallbsBundle?.getBuyLink()).toBe("https://www.bitdefender.com/site/Store/buy/b_wa/1/1/COUPON.GravityZone-30OFF");
        });
        it("Small business with Network Attack Defense and Risk Management", async () => {
            const naOption = await na.getOption({ devices: 1, subscription: 1 });
            const smallbsBundle = await smallbs.getOption({
                devices: 1,
                subscription: 1,
                bundle: [{ option: naOption }]
            });
            expect(smallbsBundle?.getBuyLink()).toBe("https://www.bitdefender.com/site/Store/buy/b_na/1/1/COUPON.GravityZone-30OFF");
        });
        it("Small business with Web Access and Device Control and Network Attack Defense and Risk Management", async () => {
            const waOption = await wa.getOption({ devices: 1, subscription: 1 });
            const naOption = await na.getOption({ devices: 1, subscription: 1 });
            const smallbsBundle = await smallbs.getOption({
                devices: 1,
                subscription: 1,
                bundle: [
                    { option: waOption },
                    { option: naOption }
                ]
            });
            expect(smallbsBundle?.getBuyLink()).toBe("https://www.bitdefender.com/site/Store/buy/b_wa_na/1/1/COUPON.GravityZone-30OFF");
        });
        it("Small business with Network Attack Defense and Risk Management and Web Access and Device Control", async () => {
            const waOption = await wa.getOption({ devices: 1, subscription: 1 });
            const naOption = await na.getOption({ devices: 1, subscription: 1 });
            const smallbsBundle = await smallbs.getOption({
                devices: 1,
                subscription: 1,
                bundle: [
                    { option: naOption },
                    { option: waOption }
                ]
            });
            expect(smallbsBundle?.getBuyLink()).toBe("https://www.bitdefender.com/site/Store/buy/b_wa_na/1/1/COUPON.GravityZone-30OFF");
        });
    });
    describe("Bundle with Promotion", () => {
        const tsmd = new InitSelectorProduct({
            store,
            name: "Bitdefender Total Security Individual",
            campaign: "campaign-name",
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
                        buyLink: "https://www.bitdefender.com/site/Store/buy/tsmd/5/1/pid.test",
                        bundle: []
                    }]
            ])
        });
        const vpn = new InitSelectorProduct({
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
                        buyLink: "https://www.bitdefender.com/site/Store/buy/vpn/10/1/pid.test",
                        bundle: []
                    }]
            ])
        });
        const wa = new InitSelectorProduct({
            store,
            name: "Bitdefender GravityZone Web Access and Device Control",
            campaign: "campaign-name",
            id: "bs_wadc",
            alias: "bs_wadc",
            platformId: "42003585",
            currency: "USD",
            options: new Map([
                ["1-1", {
                        price: 109.99,
                        discountedPrice: 59.99,
                        devices: 5,
                        subscription: 12,
                        buyLink: "https://www.bitdefender.com/site/Store/buy/bs_wadc/1/1/pid.test",
                        bundle: []
                    }]
            ])
        });
        const smallbs = new InitSelectorProduct({
            store,
            name: "Bitdefender Total Security Individual",
            campaign: "campaign-name",
            id: "smallbs",
            alias: "smallbs",
            platformId: "42003585",
            currency: "USD",
            options: new Map([
                ["1-1", {
                        price: 109.99,
                        discountedPrice: 59.99,
                        devices: 5,
                        subscription: 12,
                        buyLink: "https://www.bitdefender.com/site/Store/buy/smallbs/1/1/pid.test",
                        bundle: []
                    }]
            ])
        });
        it("vpn", async () => {
            const vpnOption = await vpn.getOption({ devices: 1, subscription: 1 });
            const tsmdBundleWithVPN = await tsmd.getOption({ devices: 5, subscription: 12, bundle: [{ option: vpnOption }] });
            expect(tsmdBundleWithVPN?.getBuyLink()).toBe("https://www.bitdefender.com/site/Store/buybundle/tsmd/5/1/pid.test");
        });
        it("Small business with Web Access and Device Control", async () => {
            const waOption = await wa.getOption({ devices: 1, subscription: 1 });
            const smallbsBundle = await smallbs.getOption({ devices: 1, subscription: 1, bundle: [{ option: waOption }] });
            expect(smallbsBundle?.getBuyLink()).toBe("https://www.bitdefender.com/site/Store/buy/b_wa/1/1/pid.test");
        });
    });
});
//# sourceMappingURL=product.init-selector.test.js.map
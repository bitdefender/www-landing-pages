import { registerActionNodes, registerContextNodes, registerRenderNodes } from '../../src/index.js';
import { fixture, fixtureCleanup, html } from '@open-wc/testing-helpers';
import { Store } from '@repobit/dex-store';
import { apiMock } from "../../__tests__/apiMock.js";
import { describe } from 'vitest';
beforeAll(registerContextNodes);
let store;
describe('Render Div', () => {
    beforeEach(async () => {
        vi.spyOn(global, "fetch").mockImplementation(apiMock);
        store = new Store({
            locale: "en-us",
            provider: {
                name: "vlaicu"
            }
        });
    });
    afterEach(() => {
        fixtureCleanup();
        vi.restoreAllMocks();
    });
    it('render all attributes', async () => {
        const rootNode = await fixture(html `
      <bd-root store-name="root">
        <bd-product store-name="product" product-id="com.bitdefender.tsmd.v2">
          <bd-option devices="5" subscription="12">
            <div data-store-render data-store-devices></div>
            <div data-store-render data-store-subscription data-store-subscription-type="months"></div>
            <div data-store-render data-store-subscription data-store-subscription-type="years"></div>
            <div data-store-render data-store-price="full"></div>
            <div data-store-render data-store-price="discounted"></div>
            <div data-store-render data-store-price="full-monthly"></div>
            <div data-store-render data-store-price="discounted-monthly"></div>
            <a data-store-render data-store-buy-link></a>
            <div data-store-render data-store-discount="percentage"></div>
            <div data-store-render data-store-discount="value"></div>
            <div data-store-render data-store-discount="percentage-monthly"></div>
            <div data-store-render data-store-discount="value-monthly"></div>
            <!-- <div data-store-trial-link></div> -->
            <div data-store-render data-store-context-price="min-discounted"></div>
            <div data-store-render data-store-context-discount="min-percentage"></div>
          </bd-option>
        </bd-product>
      </bd-root>
    `);
        rootNode.store = store;
        registerActionNodes(rootNode);
        registerRenderNodes(rootNode);
        await rootNode.updateComplete;
        const data = {
            devices: Number(rootNode.querySelector("[data-store-devices]")?.textContent),
            subscriptionMonths: Number(rootNode.querySelector("[data-store-subscription-type='months']")?.textContent),
            subscriptionYears: Number(rootNode.querySelector("[data-store-subscription-type='years']")?.textContent),
            price: rootNode.querySelector("[data-store-price='full']")?.textContent,
            priceDiscounted: rootNode.querySelector("[data-store-price='discounted']")?.textContent,
            priceFullMonthly: rootNode.querySelector("[data-store-price='full-monthly']")?.textContent,
            priceDiscountedMonthly: rootNode.querySelector("[data-store-price='discounted-monthly']")?.textContent,
            discountValue: rootNode.querySelector("[data-store-discount='value']")?.textContent,
            discountValueMonthly: rootNode.querySelector("[data-store-discount='value-monthly']")?.textContent,
            discountPercentage: rootNode.querySelector("[data-store-discount='percentage']")?.textContent,
            discountPercentageMonthly: rootNode.querySelector("[data-store-discount='percentage-monthly']")?.textContent,
            buyLink: rootNode.querySelector("[data-store-buy-link]")?.href
        };
        expect(data).toStrictEqual({
            devices: 5,
            subscriptionMonths: 12,
            subscriptionYears: 1,
            price: "$109.99",
            priceDiscounted: "$59.99",
            priceFullMonthly: "$9.17",
            priceDiscountedMonthly: "$5",
            discountPercentage: "45%",
            discountPercentageMonthly: "4%",
            discountValue: "$50",
            discountValueMonthly: "$4.17",
            buyLink: "https://store.bitdefender.com/order/checkout.php?redirect=0&CART=1&CARD=2&PRODS=42003585&QTY=1&OPTIONS42003585=ind-5d-1y&LANG=en&CURRENCY=USD&DCURRENCY=USD&CLEAN_CART=1&ORDERSTYLE=nLWw45SpnHI=&COUPON=WINTERMCWEB24_BDR-000557_USD_BDR0049946-1&SHORT_FORM=1&section=en-us"
        });
    });
    it('change:option', async () => {
        const rootNode = await fixture(html `
      <bd-root store-name="root">
        <bd-product store-name="product" product-id="com.bitdefender.tsmd.v2">
          <bd-option devices="5" subscription="12">
            <div data-store-action data-store-set-devices="25" data-store-set-subscription="24">
            <div data-store-render data-store-devices></div>
            <div data-store-render data-store-subscription></div>
            </div>
          </bd-option>
        </bd-product>
      </bd-root>
    `);
        rootNode.store = store;
        registerActionNodes(rootNode);
        registerRenderNodes(rootNode);
        const optionNode = rootNode.querySelector('bd-option');
        await optionNode.updateComplete;
        expect({
            devices: Number(rootNode.querySelector("[data-store-devices]")?.textContent),
            subscription: Number(rootNode.querySelector("[data-store-subscription]")?.textContent)
        }).toStrictEqual({
            devices: 5,
            subscription: 1
        });
        rootNode.querySelector('[data-store-action]').click();
        await optionNode.updateComplete;
        expect({
            devices: Number(rootNode.querySelector("[data-store-devices]")?.textContent),
            subscription: Number(rootNode.querySelector("[data-store-subscription]")?.textContent)
        }).toStrictEqual({
            devices: 25,
            subscription: 2
        });
    });
});
//# sourceMappingURL=render.div.test.js.map
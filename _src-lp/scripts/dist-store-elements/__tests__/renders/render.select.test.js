import { registerActionNodes, registerContextNodes, registerRenderNodes } from '../../src/index.js';
import { fixture, fixtureCleanup, html } from '@open-wc/testing-helpers';
import { Store } from '@repobit/dex-store';
import { apiMock } from "../../__tests__/apiMock.js";
import { getComputedOptions } from '../../__tests__/utils.js';
import { describe } from 'vitest';
beforeAll(registerContextNodes);
let store;
const readOptions = (collection) => {
    return [...collection].map(o => o.text);
};
describe('Render Select', () => {
    beforeEach(async () => {
        vi.spyOn(global, "fetch").mockImplementation(apiMock);
        store = new Store({
            locale: "en-us",
            provider: {
                name: "init"
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
        <bd-product store-name="product" product-id="smallbs">
          <bd-option devices="5" subscription="12">
            <select data-store-render data-store-devices data-store-text-single="device" data-store-text-many="devices"></select>
            <select data-store-render data-store-subscription data-store-text-single="year" data-store-text-many="years"></select>
            <select data-store-render data-store-subscription data-store-text-single="month" data-store-text-many="months" data-store-subscription-type="months"></select>
          </bd-option>
        </bd-product>
      </bd-root>
    `);
        rootNode.store = store;
        registerActionNodes(rootNode);
        registerRenderNodes(rootNode);
        await rootNode.updateComplete;
        const data = {
            devices: rootNode.querySelector("[data-store-devices]").options.length,
            subscriptionYears: readOptions(rootNode.querySelector("[data-store-subscription]").options),
            subscriptionMonths: readOptions(rootNode.querySelector("[data-store-subscription-type='months']").options)
        };
        expect(data).toStrictEqual({
            devices: 100,
            subscriptionYears: ["1 year", "2 years", "3 years"],
            subscriptionMonths: ["12 months", "24 months", "36 months"]
        });
    });
    it('limit devices or subscription + actionable', async () => {
        const rootNode = await fixture(html `
      <bd-root store-name="root">
        <bd-product store-name="product" product-id="smallbs">
          <bd-option devices="5" subscription="12">
            <select data-store-action data-store-render data-store-devices="9,10..13,14" data-store-text-single="device" data-store-text-many="devices"></select>
            <select data-store-action data-store-render data-store-subscription data-store-text-single="year" data-store-text-many="years"></select>
          </bd-option>
        </bd-product>
      </bd-root>
    `);
        rootNode.store = store;
        registerRenderNodes(rootNode);
        registerActionNodes(rootNode);
        await rootNode.updateComplete;
        const selectDevices = rootNode.querySelector("[data-store-devices]");
        const selectSubscription = rootNode.querySelector("[data-store-subscription]");
        const data = {
            devices: readOptions(selectDevices.options),
            subscriptionYears: readOptions(selectSubscription.options)
        };
        expect(data).toStrictEqual({
            devices: [
                "9 devices",
                "10 devices",
                "11 devices",
                "12 devices",
                "13 devices",
                "14 devices"
            ],
            subscriptionYears: ["1 year", "2 years", "3 years"]
        });
        selectDevices.value = String(10);
        selectDevices.dispatchEvent(new Event("change"));
        const option = rootNode.querySelector("bd-option");
        await option.updateComplete;
        expect(option.devices).toBe(10);
        expect(getComputedOptions(option.computedOptions)).toContainEqual({
            id: 'smallbs',
            campaign: '',
            devices: 10,
            subscription: 24,
            bundle: []
        });
    });
});
//# sourceMappingURL=render.select.test.js.map
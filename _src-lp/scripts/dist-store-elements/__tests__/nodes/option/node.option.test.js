import { registerContextNodes } from '../../../src/index.js';
import { fixture, fixtureCleanup, html } from '@open-wc/testing-helpers';
import { Store } from '@repobit/dex-store';
import { apiMock } from "../../../__tests__/apiMock.js";
import { getComputedOptions } from '../../../__tests__/utils.js';
import { describe } from 'vitest';
beforeAll(registerContextNodes);
let store;
describe('Store Test', () => {
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
    it('it loads an option', async () => {
        const rootNode = await fixture(html `
      <bd-root store-name="root">
        <bd-product store-name="product" product-id="com.bitdefender.tsmd.v2">
          <bd-option store-name="option" devices="5" subscription="12"></bd-option>
        </bd-product>
      </bd-root>
    `);
        rootNode.store = store;
        const optionNode = rootNode.querySelector('bd-option');
        await optionNode.updateComplete;
        expect(`${optionNode.option?.getDevices()}-${optionNode.option?.getSubscription()}`).toStrictEqual("5-12");
    });
    it('late store load', async () => {
        const rootNode = await fixture(html `
      <bd-root store-name="root">
        <bd-product store-name="product" product-id="com.bitdefender.tsmd.v2">
          <bd-option devices="5" subscription="12"></bd-option>
        </bd-product>
      </bd-root>
    `);
        const optionNode = rootNode.querySelector('bd-option');
        await optionNode.updateComplete;
        expect(optionNode.option).toBeFalsy();
        rootNode.store = store;
        await optionNode.updateComplete;
        expect(`${optionNode.option?.getDevices()}-${optionNode.option?.getSubscription()}`).toStrictEqual("5-12");
    });
    it('change option', async () => {
        const rootNode = await fixture(html `
      <bd-root store-name="root">
        <bd-product store-name="product" product-id="com.bitdefender.tsmd.v2">
          <bd-option devices="5" subscription="12"></bd-option>
        </bd-product>
      </bd-root>
    `);
        rootNode.store = store;
        const optionNode = rootNode.querySelector('bd-option');
        await optionNode.updateComplete;
        expect(`${optionNode.option?.getDevices()}-${optionNode.option?.getSubscription()}`).toStrictEqual("5-12");
        optionNode.subscription = 24;
        optionNode.devices = 25;
        await optionNode.updateComplete;
        expect(`${optionNode.option?.getDevices()}-${optionNode.option?.getSubscription()}`).toStrictEqual("25-24");
    });
    it('product change', async () => {
        const rootNode = await fixture(html `
      <bd-root store-name="root">
        <bd-product store-name="product" product-id="com.bitdefender.tsmd.v2">
          <bd-option devices="5" subscription="12"></bd-option>
        </bd-product>
      </bd-root>
    `);
        rootNode.store = store;
        const productNode = rootNode.querySelector('bd-product');
        const optionNode = rootNode.querySelector('bd-option');
        await optionNode.updateComplete;
        expect(optionNode.option?.getProduct().getId()).toStrictEqual("com.bitdefender.tsmd.v2");
        productNode.productId = "com.bitdefender.premiumsecurity.v2";
        await optionNode.updateComplete;
        expect(optionNode.option?.getProduct().getId()).toStrictEqual("com.bitdefender.premiumsecurity.v2");
    });
    it('node state is corect', async () => {
        const rootNode = await fixture(html `
      <bd-root store-name="root">
        <bd-product store-name="product" product-id="com.bitdefender.tsmd.v2">
          <bd-option store-name="option" devices="5" subscription="12"></bd-option>
        </bd-product>
      </bd-root>
    `);
        rootNode.store = store;
        const productNode = rootNode.querySelector('bd-product');
        await rootNode.updateComplete;
        expect(getComputedOptions(rootNode.computedOptions)).toStrictEqual([
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 12, bundle: [] }
        ]);
        productNode.productId = "com.bitdefender.premiumsecurity.v2";
        await rootNode.updateComplete;
        expect(getComputedOptions(rootNode.computedOptions)).toStrictEqual([
            { id: 'com.bitdefender.premiumsecurity.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 12, bundle: [] }
        ]);
    });
});
//# sourceMappingURL=node.option.test.js.map
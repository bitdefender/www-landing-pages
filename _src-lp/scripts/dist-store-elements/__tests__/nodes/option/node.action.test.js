import { registerActionNodes, registerContextNodes } from '../../../src/index.js';
import { fixture, fixtureCleanup, html } from '@open-wc/testing-helpers';
import { Store } from '@repobit/dex-store';
import { apiMock } from "../../../__tests__/apiMock.js";
import { describe } from 'vitest';
beforeAll(registerContextNodes);
let store;
describe('Action Test', () => {
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
    it('change:option', async () => {
        const rootNode = await fixture(html `
      <bd-root store-name="root">
        <bd-product store-name="product" product-id="com.bitdefender.tsmd.v2">
          <bd-option devices="5" subscription="12">
            <div data-store-action data-store-set-devices="25" data-store-set-subscription="24"></div>
          </bd-option>
        </bd-product>
      </bd-root>
    `);
        rootNode.store = store;
        registerActionNodes(rootNode);
        const optionNode = rootNode.querySelector('bd-option');
        await optionNode.updateComplete;
        expect(`${optionNode.option?.getDevices()}-${optionNode.option?.getSubscription()}`).toStrictEqual("5-12");
        rootNode.querySelector('[data-store-action]').click();
        await optionNode.updateComplete;
        expect(`${optionNode.option?.getDevices()}-${optionNode.option?.getSubscription()}`).toStrictEqual("25-24");
    });
    it('change:product', async () => {
        const rootNode = await fixture(html `
      <bd-root store-name="root">
        <bd-product store-name="product" product-id="com.bitdefender.tsmd.v2">
          <div data-store-action data-store-set-id="com.bitdefender.premiumsecurity.v2"></div>
          <bd-option devices="5" subscription="12">
          </bd-option>
        </bd-product>
      </bd-root>
    `);
        rootNode.store = store;
        registerActionNodes(rootNode);
        const optionNode = rootNode.querySelector('bd-option');
        await optionNode.updateComplete;
        expect(optionNode.option?.getProduct().getId()).toStrictEqual("com.bitdefender.tsmd.v2");
        rootNode.querySelector('[data-store-action]').click();
        await optionNode.updateComplete;
        expect(optionNode.option?.getProduct().getId()).toStrictEqual("com.bitdefender.premiumsecurity.v2");
    });
    it('change:product:devices', async () => {
        const rootNode = await fixture(html `
      <bd-root store-name="root">
        <bd-product store-name="product" product-id="com.bitdefender.tsmd.v2">
          <div data-store-action data-store-set-id="com.bitdefender.premiumsecurity.v2" data-store-set-devices="25"></div>
          <bd-option devices="5" subscription="12">
          </bd-option>
        </bd-product>
      </bd-root>
    `);
        rootNode.store = store;
        registerActionNodes(rootNode);
        const optionNode = rootNode.querySelector('bd-option');
        await optionNode.updateComplete;
        expect(optionNode.option?.getProduct().getId()).toStrictEqual("com.bitdefender.tsmd.v2");
        rootNode.querySelector('[data-store-action]').click();
        await optionNode.updateComplete;
        expect(optionNode.option?.getProduct().getId()).toStrictEqual("com.bitdefender.premiumsecurity.v2");
        expect(optionNode.option?.getDevices()).toStrictEqual(25);
    });
    it('change:product:devices + no propagation to secondary product', async () => {
        const rootNode = await fixture(html `
      <bd-root store-name="root">
        <bd-product store-name="product" product-id="com.bitdefender.tsmd.v2">
          <bd-option devices="5" subscription="12">
            <div data-store-action data-store-set-id="com.bitdefender.premiumsecurity.v2" data-store-set-devices="25"></div>
          </bd-option>
        </bd-product>
        <bd-product store-name="product" product-id="com.bitdefender.tsmd.v2">
          <bd-option id="test" devices="5" subscription="12"></bd-option>
        </bd-product>
      </bd-root>
    `);
        rootNode.store = store;
        registerActionNodes(rootNode);
        const optionNode = rootNode.querySelector('bd-option');
        await optionNode.updateComplete;
        expect(optionNode.option?.getProduct().getId()).toStrictEqual("com.bitdefender.tsmd.v2");
        rootNode.querySelector('[data-store-action]').click();
        await optionNode.updateComplete;
        expect(optionNode.option?.getProduct().getId()).toStrictEqual("com.bitdefender.premiumsecurity.v2");
        expect(optionNode.option?.getDevices()).toStrictEqual(25);
        const testOption = rootNode.querySelector('#test');
        expect(testOption.option?.getProduct().getId()).toStrictEqual("com.bitdefender.tsmd.v2");
    });
});
//# sourceMappingURL=node.action.test.js.map
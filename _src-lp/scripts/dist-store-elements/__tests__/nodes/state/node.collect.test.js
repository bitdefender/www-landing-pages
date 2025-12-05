import { registerActionNodes, registerContextNodes } from '../../../src/index.js';
import { fixture, fixtureCleanup, html } from '@open-wc/testing-helpers';
import { Store } from '@repobit/dex-store';
import { apiMock } from "../../../__tests__/apiMock.js";
import { getComputedOptions } from '../../../__tests__/utils.js';
import { describe } from 'vitest';
beforeAll(registerContextNodes);
let store;
describe('Collect gating (nodes and actions)', () => {
    beforeEach(async () => {
        vi.spyOn(global, "fetch").mockImplementation(apiMock);
        store = new Store({
            locale: "en-us",
            provider: { name: "vlaicu" }
        });
    });
    afterEach(() => {
        fixtureCleanup();
        vi.restoreAllMocks();
    });
    it('node noCollect prevents upward collection', async () => {
        const rootNode = await fixture(html `
      <bd-root store-name="root">
        <bd-product store-name="product" product-id="com.bitdefender.tsmd.v2">
          <bd-option store-name="option" devices="5" subscription="12" no-collect></bd-option>
        </bd-product>
      </bd-root>
    `);
        rootNode.store = store;
        registerActionNodes(rootNode);
        await rootNode.updateComplete;
        expect(getComputedOptions(rootNode.computedOptions)).toStrictEqual([]);
    });
    it('action data-store-no-collect excludes action from state combinations', async () => {
        const rootNode = await fixture(html `
      <bd-root store-name="root">
        <bd-product store-name="product" product-id="com.bitdefender.tsmd.v2">
          <bd-option store-name="option" devices="5" subscription="12">
            <!-- These actions would normally add combinations, but are excluded from collection -->
            <div data-store-action data-store-no-collect data-store-set-devices="25"></div>
            <div data-store-action data-store-no-collect data-store-set-subscription="24"></div>
          </bd-option>
        </bd-product>
      </bd-root>
    `);
        rootNode.store = store;
        registerActionNodes(rootNode);
        await rootNode.updateComplete;
        // Without collection, only the base option is present in state combinations
        expect(getComputedOptions(rootNode.computedOptions)).toStrictEqual([
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 12, bundle: [] }
        ]);
    });
    it('toggle noCollect at runtime re-registers/unregisters', async () => {
        const rootNode = await fixture(html `
      <bd-root store-name="root">
        <bd-product store-name="product" product-id="com.bitdefender.tsmd.v2">
          <bd-option store-name="option" devices="5" subscription="12"></bd-option>
        </bd-product>
      </bd-root>
    `);
        rootNode.store = store;
        registerActionNodes(rootNode);
        await rootNode.updateComplete;
        expect(getComputedOptions(rootNode.computedOptions)).toStrictEqual([
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 12, bundle: [] }
        ]);
        const option = rootNode.querySelector('bd-option');
        option.noCollect = true;
        await rootNode.updateComplete;
        expect(getComputedOptions(rootNode.computedOptions)).toStrictEqual([]);
        option.noCollect = false;
        await rootNode.updateComplete;
        expect(getComputedOptions(rootNode.computedOptions)).toStrictEqual([
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 12, bundle: [] }
        ]);
    });
});
//# sourceMappingURL=node.collect.test.js.map
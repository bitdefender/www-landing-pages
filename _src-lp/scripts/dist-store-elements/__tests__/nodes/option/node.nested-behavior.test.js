import { registerActionNodes, registerContextNodes } from '../../../src/index.js';
import { fixture, fixtureCleanup, html } from '@open-wc/testing-helpers';
import { Store } from '@repobit/dex-store';
import { apiMock } from "../../../__tests__/apiMock.js";
beforeAll(registerContextNodes);
let store;
describe('Option nested behavior', () => {
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
    it('keeps nested bd-option nodes in sync with parent events while isolating child actions', async () => {
        const root = await fixture(html `
      <bd-root store-name="root">
        <bd-product store-name="product" product-id="com.bitdefender.tsmd.v2">
          <bd-option store-name="outer" devices="5" subscription="12">
            <button id="outerAction" data-store-action data-store-set-devices="25" data-store-set-subscription="12"></button>
            <bd-option store-name="inner" devices="5" subscription="12">
              <button id="innerAction" data-store-action data-store-set-devices="5" data-store-set-subscription="12"></button>
            </bd-option>
          </bd-option>
        </bd-product>
      </bd-root>
    `);
        root.store = store;
        registerActionNodes(root);
        const outer = root.querySelector('bd-option[store-name="outer"]');
        const inner = root.querySelector('bd-option[store-name="inner"]');
        await root.updateComplete;
        const expectDevices = (node, expected) => {
            const option = node.option;
            expect(option).toBeTruthy();
            expect(option.getDevices()).toBe(expected);
        };
        expectDevices(outer, 5);
        expectDevices(inner, 5);
        root.querySelector('#outerAction').click();
        await root.updateComplete;
        expectDevices(outer, 25);
        expectDevices(inner, 25);
        root.querySelector('#innerAction').click();
        await root.updateComplete;
        expectDevices(outer, 25);
        expectDevices(inner, 5);
    });
    it('allows nested bd-product + bd-option islands to receive parent product changes while scoping their own', async () => {
        const root = await fixture(html `
      <bd-root store-name="root">
        <bd-product store-name="outer-product" product-id="com.bitdefender.tsmd.v2">
          <bd-option store-name="outer-option" devices="5" subscription="12">
            <button
              id="outerProductSwitch"
              data-store-action
              data-store-set-id="com.bitdefender.vpn"
              data-store-set-devices="1"
              data-store-set-subscription="12"
            ></button>
            <bd-product store-name="inner-product" product-id="com.bitdefender.tsmd.v2">
              <bd-option store-name="inner-option" devices="5" subscription="12">
                <button
                  id="innerProductSwitch"
                  data-store-action
                  data-store-set-id="com.bitdefender.tsmd.v2"
                  data-store-set-devices="5"
                  data-store-set-subscription="12"
                ></button>
              </bd-option>
            </bd-product>
          </bd-option>
        </bd-product>
      </bd-root>
    `);
        root.store = store;
        registerActionNodes(root);
        const outerProduct = root.querySelector('bd-product[store-name="outer-product"]');
        const innerProduct = root.querySelector('bd-product[store-name="inner-product"]');
        const outerOption = root.querySelector('bd-option[store-name="outer-option"]');
        const innerOption = root.querySelector('bd-option[store-name="inner-option"]');
        await root.updateComplete;
        const expectProductId = (node, expected) => {
            const option = node.option;
            expect(option).toBeTruthy();
            expect(option.getProduct().getId()).toBe(expected);
        };
        expect(outerProduct.productId).toBe('com.bitdefender.tsmd.v2');
        expect(innerProduct.productId).toBe('com.bitdefender.tsmd.v2');
        expectProductId(outerOption, 'com.bitdefender.tsmd.v2');
        expectProductId(innerOption, 'com.bitdefender.tsmd.v2');
        root.querySelector('#outerProductSwitch').click();
        await root.updateComplete;
        expect(outerProduct.productId).toBe('com.bitdefender.vpn');
        expectProductId(outerOption, 'com.bitdefender.vpn');
        expect(innerProduct.productId).toBe('com.bitdefender.vpn');
        expectProductId(innerOption, 'com.bitdefender.vpn');
        root.querySelector('#innerProductSwitch').click();
        await root.updateComplete;
        expect(innerProduct.productId).toBe('com.bitdefender.tsmd.v2');
        expectProductId(innerOption, 'com.bitdefender.tsmd.v2');
        expect(outerProduct.productId).toBe('com.bitdefender.vpn');
        expectProductId(outerOption, 'com.bitdefender.vpn');
    });
    it('ignore-events-parent on inner option blocks parent-driven updates but allows local actions', async () => {
        const root = await fixture(html `
      <bd-root store-name="root">
        <bd-product store-name="product" product-id="com.bitdefender.tsmd.v2">
          <bd-option store-name="outer" devices="5" subscription="12">
            <button id="outerAction" data-store-action data-store-set-devices="25" data-store-set-subscription="12"></button>
            <bd-option store-name="inner" devices="5" subscription="12" ignore-events-parent>
              <button id="innerAction" data-store-action data-store-set-id="com.bitdefender.tsmd.v2" data-store-set-devices="25" data-store-set-subscription="12"></button>
            </bd-option>
          </bd-option>
        </bd-product>
      </bd-root>
    `);
        root.store = store;
        registerActionNodes(root);
        const outer = root.querySelector('bd-option[store-name="outer"]');
        const inner = root.querySelector('bd-option[store-name="inner"]');
        await root.updateComplete;
        const expectDevices = (node, expected) => {
            const option = node.option;
            expect(option).toBeTruthy();
            expect(option.getDevices()).toBe(expected);
        };
        expectDevices(outer, 5);
        // inner ignores parent events, so it may not be initialized yet
        expect(inner.option).toBeUndefined();
        root.querySelector('#outerAction').click();
        await root.updateComplete;
        // Outer changed, inner ignored parent event due to ignore-events-parent
        expectDevices(outer, 25);
        expect(inner.option).toBeUndefined();
        // Local action on inner still applies
        root.querySelector('#innerAction').click();
        await root.updateComplete;
        expectDevices(outer, 25);
        expectDevices(inner, 25);
    });
    it('nocollect on inner option prevents contributing to parent computedOptions', async () => {
        const root = await fixture(html `
      <bd-root store-name="root">
        <bd-product store-name="product" product-id="com.bitdefender.tsmd.v2">
          <bd-option store-name="outer" devices="5" subscription="12">
            <bd-option store-name="inner" devices="5" subscription="12" no-collect>
              <button id="innerPing" data-store-action data-store-set-devices="5" data-store-set-subscription="12"></button>
            </bd-option>
          </bd-option>
        </bd-product>
      </bd-root>
    `);
        root.store = store;
        registerActionNodes(root);
        const outer = root.querySelector('bd-option[store-name="outer"]');
        const inner = root.querySelector('bd-option[store-name="inner"]');
        await root.updateComplete;
        // With inner marked nocollect, outer only sees itself
        expect(Array.isArray(outer.computedOptions)).toBe(true);
        const countWithNoCollect = (outer.computedOptions || []).length;
        expect(countWithNoCollect).toBe(1);
        // Track whether outer receives collect events from inner
        let innerCollectsAtParent = 0;
        outer.addEventListener('store-collect-option', (e) => {
            const ce = e;
            if (!ce.detail)
                return;
            if (ce.detail.name === 'inner' && ce.detail.options !== null) {
                innerCollectsAtParent++;
            }
        });
        // Remove nocollect and wait for recompute, then trigger a local action
        inner.noCollect = false;
        await root.updateComplete;
        root.querySelector('#innerPing').click();
        await root.updateComplete;
        // Parent should now observe at least one collect from the inner
        expect(innerCollectsAtParent).toBeGreaterThan(0);
    });
});
//# sourceMappingURL=node.nested-behavior.test.js.map
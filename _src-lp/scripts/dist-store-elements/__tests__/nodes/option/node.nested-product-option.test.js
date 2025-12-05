import { registerActionNodes, registerContextNodes, registerRenderNodes } from '../../../src/index.js';
import { fixture, fixtureCleanup, html } from '@open-wc/testing-helpers';
import { Store } from '@repobit/dex-store';
import { apiMock } from "../../../__tests__/apiMock.js";
beforeAll(registerContextNodes);
let store;
describe('Nested product option inside another option', () => {
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
    it('tsmd option renders nested vpn option price via render nodes', async () => {
        const root = await fixture(html `
      <bd-root store-name="root">
        <bd-product store-name="tsmd" product-id="com.bitdefender.tsmd.v2">
          <bd-option devices="5" subscription="12">
            <div id="tsmd-price" data-store-render data-store-price="full"></div>

            <!-- Nested product/option: should render independently -->
            <bd-product store-name="vpn" product-id="com.bitdefender.vpn" ignore-events-parent>
              <bd-option devices="1" subscription="12">
                <div id="vpn-price" data-store-render data-store-price="discounted"></div>
              </bd-option>
            </bd-product>
          </bd-option>
        </bd-product>
      </bd-root>
    `);
        root.store = store;
        registerActionNodes(root);
        registerRenderNodes(root);
        // Wait for both options to finish rendering
        const tsmdOpt = root.querySelector('bd-product[store-name="tsmd"] bd-option');
        const vpnOpt = root.querySelector('bd-product[store-name="vpn"] bd-option');
        await tsmdOpt.updateComplete;
        await vpnOpt.updateComplete;
        // Allow any pending microtasks from context binding to flush
        await Promise.resolve();
        await Promise.resolve();
        const tsmdPrice = root.querySelector('#tsmd-price').textContent;
        expect(tsmdPrice).toBe("$109.99");
        // Nested product subtree should initialize independently and render discounted price
        await vpnOpt.updateComplete;
        const vpnPrice = root.querySelector('#vpn-price').textContent;
        expect(vpnPrice).toBe("$34.99");
    });
});
//# sourceMappingURL=node.nested-product-option.test.js.map
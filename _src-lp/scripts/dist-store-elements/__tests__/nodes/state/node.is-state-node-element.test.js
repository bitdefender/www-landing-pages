import { registerContextNodes } from '../../../src/index.js';
import { fixture, fixtureCleanup, html } from '@open-wc/testing-helpers';
import { Store } from '@repobit/dex-store';
import { apiMock } from "../../../__tests__/apiMock.js";
beforeAll(registerContextNodes);
let store;
describe('_isStateNodeElement behavior', () => {
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
    it('renders multiple bd-option inside one bd-product independently', async () => {
        const { registerRenderNodes } = await import('../../../src/index.js');
        const root = await fixture(html `
      <bd-root store-name="root">
        <bd-product store-name="product" product-id="com.bitdefender.tsmd.v2">
          <bd-option id="opt5" devices="5" subscription="12">
            <div id="o1" data-store-render data-store-devices></div>
          </bd-option>
          <bd-option id="opt25" devices="25" subscription="12">
            <div id="o2" data-store-render data-store-devices></div>
          </bd-option>
        </bd-product>
      </bd-root>
    `);
        root.store = store;
        registerRenderNodes(root);
        // Wait until each option finishes its own tasks (including Eta render)
        const opt5 = root.querySelector('bd-option#opt5');
        const opt10 = root.querySelector('bd-option#opt25');
        await opt5.updateComplete;
        await opt10.updateComplete;
        expect(Number(root.querySelector('#o1').textContent)).toBe(5);
        expect(Number(root.querySelector('#o2').textContent)).toBe(25);
    });
    it('skips nested bd-product subtree while allowing it to render its own option (vpn)', async () => {
        const { registerRenderNodes } = await import('../../../src/index.js');
        const root = await fixture(html `
      <bd-root store-name="root">
        <bd-product store-name="tsmd" product-id="com.bitdefender.tsmd.v2">
          <bd-option devices="5" subscription="12">
            <div id="outer" data-store-render data-store-devices></div>
          </bd-option>
        </bd-product>

        <!-- Separate product (vpn) -->
        <bd-product store-name="vpn" product-id="com.bitdefender.vpn">
          <bd-option devices="1" subscription="12">
            <div id="vpn" data-store-render data-store-devices></div>
          </bd-option>
        </bd-product>
      </bd-root>
    `);
        root.store = store;
        registerRenderNodes(root);
        // Wait for both product options to finish their renders
        const outerOpt = root.querySelector('bd-product[store-name="tsmd"] bd-option');
        const vpnOpt = root.querySelector('bd-product[store-name="vpn"] bd-option');
        await outerOpt.updateComplete;
        await vpnOpt.updateComplete;
        expect(`${vpnOpt.option?.getDevices()}`).toBe('1');
        expect(Number(root.querySelector('#outer').textContent)).toBe(5);
        expect(Number(root.querySelector('#vpn').textContent)).toBe(1);
    });
});
//# sourceMappingURL=node.is-state-node-element.test.js.map
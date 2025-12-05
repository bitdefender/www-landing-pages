import { OptionNode, registerActionNodes, registerContextNodes } from '../../../src/index.js';
import eta from "../../../src/templating/eta.js";
import { fixture, fixtureCleanup, html } from '@open-wc/testing-helpers';
import { Store } from '@repobit/dex-store';
import { apiMock } from "../../../__tests__/apiMock.js";
beforeAll(registerContextNodes);
let store;
describe('Option Eta rendering', () => {
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
    it('uses only option-level Eta render (no state-only render in OptionNode)', async () => {
        const { StateNode } = await import('../../../src/nodes/node.state.js');
        // Cast to a shape that declares the private method as a function to satisfy spyOn's typing
        const renderSpy = vi.spyOn(StateNode.prototype, "_renderEtaTemplates");
        const root = await fixture(html `
      <bd-root store-name="root">
        <bd-product store-name="product" product-id="com.bitdefender.tsmd.v2">
          <bd-option devices="5" subscription="12">
            <!-- Eta template: should be rendered by option-level task with ctx available -->
            <div id="tpl">Devices: {{= it.option.devices }}</div>
          </bd-option>
        </bd-product>
      </bd-root>
    `);
        root.store = store;
        registerActionNodes(root);
        await root.updateComplete;
        // Gather calls and the instance that invoked the method
        const calls = renderSpy.mock.calls.map((args, idx) => ({ args, instance: renderSpy.mock.instances[idx] }));
        // Filter calls coming from OptionNode
        const optionCalls = calls.filter(c => c.instance instanceof OptionNode);
        // Ensure we had at least one option-level render
        expect(optionCalls.length).toBeGreaterThan(0);
        // In OptionNode, the Eta render context should include `ctx`.
        for (const c of optionCalls) {
            const ctx = c.args[0];
            expect('ctx' in ctx).toBe(true);
        }
        // Ensure there are no OptionNode base-state render calls (which would pass only { state })
        const optionStateOnlyCalls = optionCalls.filter(c => !('ctx' in c.args[0]));
        expect(optionStateOnlyCalls.length).toBe(0);
    });
    it('compiles Eta template once per element and reuses it across re-renders', async () => {
        const compileSpy = vi.spyOn(eta, 'compile');
        const root = await fixture(html `
      <bd-root store-name="root">
        <bd-product store-name="product" product-id="com.bitdefender.tsmd.v2">
          <bd-option devices="5" subscription="12">
            <!-- Template without data-store-render should be processed by Eta pipeline -->
            <div id="tpl">Devices: {{= it.option.devices }}</div>
            <!-- Action to trigger a second render with changed devices -->
            <button id="bump" data-store-action data-store-set-devices="25"></button>
          </bd-option>
        </bd-product>
      </bd-root>
    `);
        root.store = store;
        registerActionNodes(root);
        const bump = root.querySelector('#bump');
        await root.updateComplete;
        // First pass should compile at least once (one per eligible child)
        const firstCompileCount = compileSpy.mock.calls.length;
        expect(firstCompileCount).toBeGreaterThan(0);
        // Trigger re-render via action and wait for completion
        bump.click();
        await root.updateComplete;
        // Compiles should not increase because the compiled fn is cached per element
        const secondCompileCount = compileSpy.mock.calls.length;
        expect(secondCompileCount).toBe(firstCompileCount);
    });
    it('preserves event listeners on elements inside Eta-morphed templates', async () => {
        const root = await fixture(html `
      <bd-root store-name="root">
        <bd-product store-name="product" product-id="com.bitdefender.tsmd.v2">
          <bd-option devices="5" subscription="12">
            <p id="msg">Now at only {{= it.option.discount.value }} <a id="cta">buy here</a></p>
            <button id="bump" data-store-action data-store-set-devices="25"></button>
          </bd-option>
        </bd-product>
      </bd-root>
    `);
        root.store = new Store({ locale: 'en-us', provider: { name: 'vlaicu' } });
        registerActionNodes(root);
        const opt = root.querySelector('bd-option');
        await root.updateComplete;
        let clicks = 0;
        const anchor1 = root.querySelector('#cta');
        anchor1.addEventListener('click', () => { clicks++; });
        // Sanity: initial listener fires
        anchor1.click();
        expect(clicks).toBe(1);
        // Trigger a re-render (option change → Eta render runs and morphs DOM)
        root.querySelector('#bump').click();
        await opt.updateComplete;
        // Re-query the anchor after morph and ensure listener is still active
        const anchor2 = root.querySelector('#cta');
        anchor2.click();
        expect(clicks).toBe(2);
        //
        const p = root.querySelector('#msg');
        expect(p.innerHTML).toBe(`Now at only $60 <a id="cta">buy here</a>`);
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
    it('renders async derived values inside Eta templates', async () => {
        const root = await fixture(html `
      <bd-root store-name="root">
        <bd-product store-name="product" product-id="com.bitdefender.tsmd.v2">
          <bd-option devices="5" subscription="12">
            <div id="derived">Mails: {{= it.mails(10) }}</div>
          </bd-option>
        </bd-product>
      </bd-root>
    `);
        // async derived returns a function mails(p) based on current option devices
        root.derived = async ({ option }) => ({
            mails: (p) => ((option?.getDevices() ?? 0) / p) * 100
        });
        root.store = store;
        registerActionNodes(root);
        await root.updateComplete;
        const el = root.querySelector('#derived');
        expect(el.textContent?.trim()).toBe('Mails: 50');
    });
    it('renders Eta attribute values', async () => {
        const root = await fixture(html `
      <bd-root store-name="root">
        <bd-product store-name="product" product-id="com.bitdefender.tsmd.v2">
          <div id="attr" title="Name {{= it.product.name }}">
              <bd-option devices="5" subscription="12">
              </bd-option>
            </div>
        </bd-product>
      </bd-root>
    `);
        root.store = store;
        registerActionNodes(root);
        await root.updateComplete;
        const el = root.querySelector('#attr');
        expect(el.getAttribute('title')).toBe('Name Bitdefender Total Security Individual');
    });
});
//# sourceMappingURL=node.eta-render.test.js.map
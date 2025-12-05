import { registerActionNodes, registerContextNodes, registerRenderNodes } from '../../../src/index.js';
import { fixture, fixtureCleanup, html } from '@open-wc/testing-helpers';
import { Store } from '@repobit/dex-store';
import { apiMock } from "../../../__tests__/apiMock.js";
class ShadowHost extends HTMLElement {
    constructor() {
        super();
        this.updateComplete = new Promise((res) => { this._resolveUpdate = res; });
    }
    connectedCallback() {
        if (this.shadowRoot)
            return;
        const sr = this.attachShadow({ mode: 'open' });
        sr.innerHTML = `<p id="shadowTpl">Devices: {{= it.option.devices }}</p>`;
        this._resolveUpdate?.();
    }
}
class ShadowActionHost extends HTMLElement {
    connectedCallback() {
        if (this.shadowRoot)
            return;
        const sr = this.attachShadow({ mode: 'open' });
        sr.innerHTML = `
      <button id="shadowAction" data-store-action data-store-set-devices="25" data-store-set-subscription="12"></button>
    `;
    }
}
class ShadowRenderHost extends HTMLElement {
    connectedCallback() {
        if (this.shadowRoot)
            return;
        const sr = this.attachShadow({ mode: 'open' });
        sr.innerHTML = `<div id="shadowRender" data-store-render data-store-devices></div>`;
    }
}
if (!customElements.get('shadow-host')) {
    customElements.define('shadow-host', ShadowHost);
}
if (!customElements.get('shadow-action-host')) {
    customElements.define('shadow-action-host', ShadowActionHost);
}
if (!customElements.get('shadow-render-host')) {
    customElements.define('shadow-render-host', ShadowRenderHost);
}
beforeAll(registerContextNodes);
let store;
describe('Eta render in shadow roots', () => {
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
    it('renders Eta templates inside shadow hosts and updates on option changes', async () => {
        const root = await fixture(html `
      <bd-root store-name="root">
        <bd-product store-name="product" product-id="com.bitdefender.tsmd.v2">
          <bd-option devices="5" subscription="12">
            <shadow-host shadow></shadow-host>
            <button id="bumpDevices" data-store-action data-store-set-devices="25"></button>
          </bd-option>
        </bd-product>
      </bd-root>
    `);
        root.store = store;
        registerActionNodes(root);
        const option = root.querySelector('bd-option');
        await root.updateComplete;
        await option.updateComplete;
        const getShadowText = () => {
            const host = root.querySelector('shadow-host');
            const tpl = host.shadowRoot?.querySelector('#shadowTpl');
            return tpl?.textContent;
        };
        await option.updateComplete;
        expect(option.option).toBeTruthy();
        expect(getShadowText()).toBe('Devices: 5');
        root.querySelector('#bumpDevices').click();
        await root.updateComplete;
        await option.updateComplete;
        await option.updateComplete;
        expect(getShadowText()).toBe('Devices: 25');
    });
    it('registerActionNodes binds actions inside shadow DOM of shadow hosts', async () => {
        const root = await fixture(html `
      <bd-root store-name="root">
        <bd-product store-name="product" product-id="com.bitdefender.tsmd.v2">
          <bd-option devices="5" subscription="12">
            <shadow-action-host shadow></shadow-action-host>
          </bd-option>
        </bd-product>
      </bd-root>
    `);
        root.store = store;
        registerActionNodes(root);
        const option = root.querySelector('bd-option');
        await option.updateComplete;
        expect(option.option).toBeTruthy();
        const host = root.querySelector('shadow-action-host');
        const btn = host.shadowRoot.querySelector('#shadowAction');
        btn.click();
        await option.updateComplete;
        expect(option.option?.getDevices()).toBe(25);
    });
    it('registerRenderNodes renders bindings inside shadow DOM of shadow hosts', async () => {
        const root = await fixture(html `
      <bd-root store-name="root">
        <bd-product store-name="product" product-id="com.bitdefender.tsmd.v2">
          <bd-option devices="5" subscription="12">
            <shadow-render-host shadow></shadow-render-host>
          </bd-option>
        </bd-product>
      </bd-root>
    `);
        root.store = store;
        registerRenderNodes(root);
        await root.updateComplete;
        const host = root.querySelector('shadow-render-host');
        const renderDiv = host.shadowRoot?.querySelector('#shadowRender');
        expect(renderDiv?.textContent).toBe('5');
        // change devices to ensure render updates as well
        const option = root.querySelector('bd-option');
        option.devices = 25;
        await root.updateComplete;
        expect(host.shadowRoot?.querySelector('#shadowRender')?.textContent).toBe('25');
    });
});
//# sourceMappingURL=node.shadow-eta.test.js.map
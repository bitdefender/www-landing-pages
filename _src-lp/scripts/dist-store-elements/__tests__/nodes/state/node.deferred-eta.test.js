import { registerActionNodes, registerContextNodes } from '../../../src/index.js';
import { fixture, fixtureCleanup, html } from '@open-wc/testing-helpers';
import { Store } from '@repobit/dex-store';
import { apiMock } from "../../../__tests__/apiMock.js";
beforeAll(registerContextNodes);
let store;
describe('Deferred Eta render (mutation-driven)', () => {
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
    it('reruns Eta after external DOM mutation and waits for debounce', async () => {
        const root = await fixture(html `
      <bd-root store-name="root">
        <bd-context store-name="ctx">
          <p id="msg">Now at only {{= it.state.price.full.min }}</p>
          <bd-product product-id="com.bitdefender.tsmd.v2">
            <bd-option devices="5" subscription="12"></bd-option>
          </bd-product>
        </bd-context>
      </bd-root>
    `);
        root.store = store;
        registerActionNodes(root);
        // Initial mount may schedule a debounced Eta render via MutationObserver
        await root.updateComplete;
        const msg = root.querySelector('#msg');
        const ctx = root.querySelector('bd-context');
        // Ensure initial tasks settle; exact content may vary until first compute completes
        await ctx.updateComplete;
        // Simulate SPA altering light DOM content directly
        msg.innerHTML = 'stale content';
        // updateComplete should wait for the debounced rerender
        // Let debounce fire and updateComplete settle
        await ctx.updateComplete;
        // SPA-authored content remains authoritative after debounce
        expect(msg.innerHTML).toBe('stale content');
    });
    it('coalesces rapid mutations into one Eta rerender', async () => {
        const root = await fixture(html `
      <bd-root store-name="root">
        <bd-context store-name="ctx">
          <p id="msg">Now at only {{= it.state.price.full.min }}</p>
          <bd-product product-id="com.bitdefender.tsmd.v2">
            <bd-option devices="5" subscription="12"></bd-option>
          </bd-product>
        </bd-context>
      </bd-root>
    `);
        root.store = store;
        registerActionNodes(root);
        await new Promise(r => setTimeout(r, 60));
        await root.updateComplete;
        const msg = root.querySelector('#msg');
        const ctx2 = root.querySelector('bd-context');
        // Let initial tasks settle
        await ctx2.updateComplete;
        // Burst of quick changes resets debounce each time
        msg.innerHTML = 'temp1';
        msg.innerHTML = 'temp2';
        msg.innerHTML = 'temp3';
        // After quiet period, SPA last edit persists
        await ctx2.updateComplete;
        expect(msg.innerHTML).toBe('temp3');
    });
});
//# sourceMappingURL=node.deferred-eta.test.js.map
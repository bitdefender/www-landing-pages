import { registerActionNodes, registerContextNodes, registerRenderNodes } from '../../src/index.js';
import { fixture, fixtureCleanup, html } from '@open-wc/testing-helpers';
import { Store } from '@repobit/dex-store';
import { apiMock } from "../../__tests__/apiMock.js";
import { describe } from 'vitest';
beforeAll(registerContextNodes);
let store;
describe('Render Input', () => {
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
    it('render all attributes', async () => {
        const rootNode = await fixture(html `
      <bd-root store-name="root">
        <bd-product store-name="product" product-id="com.bitdefender.tsmd.v2">
          <bd-option devices="5" subscription="12">
            <input data-store-render data-store-devices/>
            <input data-store-render data-store-subscription/>
            <input data-store-render data-store-subscription data-store-subscription-type="months"/>
          </bd-option>
        </bd-product>
      </bd-root>
    `);
        rootNode.store = store;
        registerActionNodes(rootNode);
        registerRenderNodes(rootNode);
        await rootNode.updateComplete;
        const data = {
            devices: Number(rootNode.querySelector("[data-store-devices]")?.value),
            subscriptionYears: Number(rootNode.querySelector("[data-store-subscription]")?.value),
            subscriptionMonths: Number(rootNode.querySelector("[data-store-subscription-type='months']")?.value)
        };
        expect(data).toStrictEqual({
            devices: 5,
            subscriptionYears: 1,
            subscriptionMonths: 12
        });
    });
});
//# sourceMappingURL=render.input.test.js.map
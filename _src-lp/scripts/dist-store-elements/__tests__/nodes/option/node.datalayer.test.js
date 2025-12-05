import { registerActionNodes, registerContextNodes } from '../../../src/index.js';
import { fixture, fixtureCleanup, html } from "@open-wc/testing-helpers";
import { Store } from "@repobit/dex-store";
import { apiMock } from "../../../__tests__/apiMock.js";
beforeAll(registerContextNodes);
describe("DataLayer first-load callback", () => {
    let store;
    beforeEach(() => {
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
    it("fires callback only on first bd-option load", async () => {
        const dl = vi.fn();
        const root = await fixture(html `
      <bd-root store-name="root">
        <bd-product store-name="product" product-id="com.bitdefender.tsmd.v2">
          <bd-option id="opt" devices="5" subscription="12" data-layer-event="info">
            <!-- action to later change devices -->
            <div id="devicesAction" data-store-action data-store-set-devices="25"></div>
          </bd-option>
        </bd-product>
      </bd-root>
    `);
        root.store = store;
        root.dataLayer = dl;
        registerActionNodes(root);
        const option = root.querySelector("#opt");
        // Synthesize initial product load after datalayer is attached
        await option.updateComplete;
        // First load should trigger the datalayer exactly once
        expect(dl).toHaveBeenCalledTimes(1);
        const payload = dl.mock.calls[0][0];
        expect(payload.event).toBe("info");
        expect(payload.option).toBe(option.option);
        // Change devices via action → should NOT trigger callback again
        root.querySelector("#devicesAction").click();
        await option.updateComplete;
        expect(dl).toHaveBeenCalledTimes(1);
    });
});
//# sourceMappingURL=node.datalayer.test.js.map
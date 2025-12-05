import { registerActionNodes, registerContextNodes } from '../../../src/index.js';
import { fixture, fixtureCleanup, html } from "@open-wc/testing-helpers";
import { Store } from "@repobit/dex-store";
import { apiMock } from "../../../__tests__/apiMock.js";
import { getComputedOptions } from "../../../__tests__/utils.js";
import { describe } from "vitest";
beforeAll(registerContextNodes);
let store;
describe("Immediate parent notify on reconnect", () => {
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
    it("reconnect bd-context then await only context.updateComplete", async () => {
        const rootNode = await fixture(html `
      <bd-root store-name="root">
        <bd-context store-name="ctx">
          <bd-product store-name="tsmd" product-id='com.bitdefender.tsmd.v2'>
            <bd-option devices="5" subscription="12">
              <div data-store-action data-store-set-devices="25"></div>
              <div data-store-action data-store-set-subscription="24"></div>
            </bd-option>
          </bd-product>
        </bd-context>
      </bd-root>
    `);
        rootNode.store = store;
        registerActionNodes(rootNode);
        await rootNode.updateComplete;
        // Remove + re-append the context subtree
        const ctx = rootNode.querySelector("bd-context");
        ctx.remove();
        rootNode.appendChild(ctx);
        // Intentionally await only the context — not the root
        await ctx.updateComplete;
        // Expect parent state to have options ready
        expect(getComputedOptions(rootNode.computedOptions)).toStrictEqual([
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 24, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 24, bundle: [] }
        ]);
    });
    it("reconnect nested bd-context; await only inner.updateComplete", async () => {
        const rootNode = await fixture(html `
      <bd-root store-name="root">
        <bd-context store-name="outer">
          <bd-context store-name="inner">
            <bd-product store-name="tsmd" product-id='com.bitdefender.tsmd.v2'>
              <bd-option devices="5" subscription="12">
                <div data-store-action data-store-set-devices="25"></div>
                <div data-store-action data-store-set-subscription="24"></div>
              </bd-option>
            </bd-product>
          </bd-context>
        </bd-context>
      </bd-root>
    `);
        rootNode.store = store;
        registerActionNodes(rootNode);
        await rootNode.updateComplete;
        // Remove + re-append the INNER context only
        const outer = rootNode.querySelector("bd-context[store-name=outer]");
        const inner = outer.querySelector("bd-context[store-name=inner]");
        inner.remove();
        outer.appendChild(inner);
        // Intentionally await only inner context — not outer nor root
        await inner.updateComplete;
        // Expect parent state to have options ready without awaiting root
        expect(getComputedOptions(rootNode.computedOptions)).toStrictEqual([
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 24, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 24, bundle: [] }
        ]);
    });
});
//# sourceMappingURL=node.reconnect.immediate.test.js.map
import { registerActionNodes, registerContextNodes, registerRenderNodes } from '../../../src/index.js';
import { elementUpdated, fixture, fixtureCleanup, html } from '@open-wc/testing-helpers';
import { Store } from '@repobit/dex-store';
import { apiMock } from '../../../__tests__/apiMock.js';
import { getComputedOptions } from '../../../__tests__/utils.js';
import { describe, expect, it } from 'vitest';
import './store-consumer.js';
import './store-provider.js';
beforeAll(registerContextNodes);
let store;
describe('Store Test', () => {
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
    it('setStore', async () => {
        const el = await fixture(html `
      <bd-root>
        <bd-store-consumer></bd-store-consumer>
      </bd-root>
      `);
        const bdStoreConsumer = el.querySelector("bd-store-consumer");
        el.store = store;
        await el.updateComplete;
        await bdStoreConsumer.updateComplete;
        expect(el.store).toBe(store);
        expect(bdStoreConsumer?.store).toBe(store);
    });
    it('reassign store across context/product/option with render + action', async () => {
        const el = await fixture(html `
      <bd-root store-name="root">
        <bd-context store-name="ctx">
          <bd-product store-name="prod" product-id="com.bitdefender.tsmd.v2">
            <bd-option store-name="opt" devices="5" subscription="12">
              <div id="price" data-store-render data-store-price="full"></div>
              <button id="change-devices" data-store-action data-store-set-devices="25">
                Change devices
              </button>
            </bd-option>
          </bd-product>
        </bd-context>
      </bd-root>
    `);
        const firstStore = store;
        const secondStore = new Store({
            locale: "en-us",
            provider: {
                name: "vlaicu"
            }
        });
        el.store = firstStore;
        registerActionNodes(el);
        registerRenderNodes(el);
        await el.updateComplete;
        const option = el.querySelector('bd-option');
        await option.updateComplete;
        const initialPrice = el.querySelector("#price")?.textContent?.trim();
        expect(initialPrice).toBeTruthy();
        el.querySelector("#change-devices").click();
        await option.updateComplete;
        const updatedPrice = el.querySelector("#price")?.textContent?.trim();
        expect(updatedPrice).toBeTruthy();
        el.store = secondStore;
        await elementUpdated(el);
        expect(el.store).toBe(secondStore);
        await option.updateComplete;
        const priceAfterReassign = el.querySelector("#price")?.textContent?.trim();
        expect(priceAfterReassign).toBeTruthy();
        expect(getComputedOptions(el.computedOptions)).not.toHaveLength(0);
    });
    it('reassigns store while disconnected and keeps consumers in sync', async () => {
        const el = await fixture(html `
      <bd-root>
        <bd-store-consumer></bd-store-consumer>
      </bd-root>
    `);
        const consumer = el.querySelector("bd-store-consumer");
        el.store = store;
        await el.updateComplete;
        await consumer.updateComplete;
        expect(consumer.store).toBe(store);
        // Detach, update store, then reattach.
        el.remove();
        const nextStore = new Store({
            locale: "en-us",
            provider: {
                name: "vlaicu"
            }
        });
        el.store = nextStore;
        document.body.appendChild(el);
        await el.updateComplete;
        await consumer.updateComplete;
        expect(consumer.store).toBe(nextStore);
    });
    it('recomputes options when the store instance changes', async () => {
        const el = await fixture(html `
      <bd-root>
        <bd-product product-id="com.bitdefender.tsmd.v2">
          <bd-option devices="5" subscription="12"></bd-option>
        </bd-product>
      </bd-root>
    `);
        el.store = store;
        await el.updateComplete;
        expect(getComputedOptions(el.computedOptions)).not.toHaveLength(0);
        const nextStore = new Store({
            locale: "en-us",
            provider: { name: "vlaicu" }
        });
        el.store = nextStore;
        await el.updateComplete;
        expect(getComputedOptions(el.computedOptions)).not.toHaveLength(0);
    });
    it('mounts a fresh bd-root subtree with its own store', async () => {
        const container = await fixture(html `
      <div>
        <bd-root id="root-one" store-name="root-one">
          <bd-context store-name="ctx-one">
            <bd-product store-name="prod-one" product-id="com.bitdefender.tsmd.v2">
              <bd-option store-name="opt-one" devices="5" subscription="12">
                <div id="price-one" data-store-render data-store-price="full"></div>
                <bd-root id="root-two" store-name="root-two">
                  <bd-context store-name="ctx-two">
                    <bd-product store-name="prod-two" product-id="com.bitdefender.tsmd.v2">
                      <bd-option store-name="opt-two" devices="5" subscription="12">
                        <div id="price-two" data-store-render data-store-price="full"></div>
                      </bd-option>
                    </bd-product>
                  </bd-context>
                </bd-root>
              </bd-option>
            </bd-product>
          </bd-context>
        </bd-root>
      </div>
    `);
        const rootOne = container.querySelector("#root-one");
        const rootTwo = container.querySelector("#root-two");
        const storeOne = store;
        const storeTwo = new Store({
            locale: "de-de",
            campaign: async () => "BFMCWEB25",
            provider: { name: "vlaicu" }
        });
        rootOne.store = storeOne;
        rootTwo.store = storeTwo;
        registerActionNodes(container);
        registerRenderNodes(container);
        await rootOne.updateComplete;
        await rootTwo.updateComplete;
        const priceOne = container.querySelector("#price-one")?.textContent?.trim();
        const priceTwo = container.querySelector("#price-two")?.textContent?.trim();
        expect(rootOne.store).toBe(storeOne);
        expect(rootTwo.store).toBe(storeTwo);
        expect(priceOne).toBeTruthy();
        expect(priceTwo).toBeTruthy();
        expect(getComputedOptions(rootOne.computedOptions)).not.toHaveLength(0);
        expect(getComputedOptions(rootTwo.computedOptions)).not.toHaveLength(0);
    });
    it('nested bd-root prefers its own store over ancestor store', async () => {
        const outer = await fixture(html `
      <bd-root id="outer">
        <bd-root id="inner">
          <bd-store-consumer></bd-store-consumer>
        </bd-root>
      </bd-root>
    `);
        const inner = outer.querySelector("#inner");
        const consumer = inner.querySelector("bd-store-consumer");
        const outerStore = store;
        const innerStore = new Store({
            locale: "en-us",
            provider: { name: "vlaicu" }
        });
        outer.store = outerStore;
        inner.store = innerStore;
        await outer.updateComplete;
        await inner.updateComplete;
        await consumer.updateComplete;
        expect(consumer.store).toBe(innerStore);
        expect(consumer.store).not.toBe(outerStore);
    });
});
//# sourceMappingURL=node.root.test.js.map
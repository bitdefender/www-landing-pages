import { registerActionNodes, registerContextNodes } from '../../../src/index.js';
import { fixture, fixtureCleanup, html } from '@open-wc/testing-helpers';
import { Store } from '@repobit/dex-store';
import { apiMock } from "../../../__tests__/apiMock.js";
import { getComputedOptions } from '../../../__tests__/utils.js';
import { describe } from 'vitest';
import './state-consumer.js'; // ensure your element is registered
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
    it('test state for one level', async () => {
        const stateNode = await fixture(html `
      <bd-root store-name="root">
        <bd-product store-name="product" product-id="com.bitdefender.tsmd.v2">
          <bd-option store-name="option" devices="5" subscription="12">
            <div data-store-action data-store-set-devices="25"></div>
            <div data-store-action data-store-set-id="com.bitdefender.premiumsecurity.v2"></div>
            <div data-store-action data-store-set-subscription="24"></div>
          </bd-option>
        </bd-product>
      </bd-root>
      `);
        stateNode.store = store;
        registerActionNodes(stateNode);
        await stateNode.updateComplete;
        expect(getComputedOptions(stateNode.computedOptions)).toStrictEqual([
            { id: 'com.bitdefender.premiumsecurity.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.premiumsecurity.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 24, bundle: [] },
            { id: 'com.bitdefender.premiumsecurity.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.premiumsecurity.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 24, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 24, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 24, bundle: [] }
        ]);
    });
    it('test bundle', async () => {
        const stateNode = await fixture(html `
      <bd-root>
        <bd-product store-name="product" product-id="com.bitdefender.tsmd.v2">
          <bd-option store-name="option" devices="5" subscription="12">
            <div data-store-action data-store-set-devices="25"></div>
            <div data-store-action data-store-set-id="com.bitdefender.premiumsecurity.v2"></div>
            <div data-store-action data-store-set-subscription="24"></div>
            <div
              data-store-action
              data-store-set-id="com.bitdefender.vpn"
              data-store-set-devices="1"
              data-store-set-subscription="12"
              data-store-set-bundle></div>
          </bd-option>
        </bd-product>
      </bd-root>
      `);
        stateNode.store = store;
        registerActionNodes(stateNode);
        await stateNode.updateComplete;
        expect(getComputedOptions(stateNode.computedOptions)).toStrictEqual([
            { id: 'com.bitdefender.premiumsecurity.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.premiumsecurity.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 12, bundle: [{ id: "com.bitdefender.vpn", campaign: "WINTERMCWEB24", devices: 1, subscription: 12, bundle: [] }] },
            { id: 'com.bitdefender.premiumsecurity.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 24, bundle: [] },
            { id: 'com.bitdefender.premiumsecurity.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 24, bundle: [{ id: "com.bitdefender.vpn", campaign: "WINTERMCWEB24", devices: 1, subscription: 12, bundle: [] }] },
            { id: 'com.bitdefender.premiumsecurity.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.premiumsecurity.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 12, bundle: [{ id: "com.bitdefender.vpn", campaign: "WINTERMCWEB24", devices: 1, subscription: 12, bundle: [] }] },
            { id: 'com.bitdefender.premiumsecurity.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 24, bundle: [] },
            { id: 'com.bitdefender.premiumsecurity.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 24, bundle: [{ id: "com.bitdefender.vpn", campaign: "WINTERMCWEB24", devices: 1, subscription: 12, bundle: [] }] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 12, bundle: [{ id: "com.bitdefender.vpn", campaign: "WINTERMCWEB24", devices: 1, subscription: 12, bundle: [] }] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 24, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 24, bundle: [{ id: "com.bitdefender.vpn", campaign: "WINTERMCWEB24", devices: 1, subscription: 12, bundle: [] }] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 12, bundle: [{ id: "com.bitdefender.vpn", campaign: "WINTERMCWEB24", devices: 1, subscription: 12, bundle: [] }] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 24, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 24, bundle: [{ id: "com.bitdefender.vpn", campaign: "WINTERMCWEB24", devices: 1, subscription: 12, bundle: [] }] }
        ]);
    });
    it('test state for one level action disconect', async () => {
        const stateNode = await fixture(html `
      <bd-root store-name="root">
         <bd-product store-name="product" product-id="com.bitdefender.tsmd.v2">
          <bd-option store-name="option" devices="5" subscription="12">
            <div data-store-action store-name="devices" data-store-set-devices="25"></div>
            <div data-store-action store-name="productChange" id="productChange" data-store-set-id="com.bitdefender.premiumsecurity.v2"></div>
            <div data-store-action store-name="subscription" data-store-set-subscription="24"></div>
          </bd-option>
        </bd-product>
      </bd-root>
      `);
        stateNode.store = store;
        registerActionNodes(stateNode);
        const actionNode = stateNode.querySelector("#productChange");
        await stateNode.updateComplete;
        expect(getComputedOptions(stateNode.computedOptions)).toStrictEqual([
            { id: 'com.bitdefender.premiumsecurity.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.premiumsecurity.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 24, bundle: [] },
            { id: 'com.bitdefender.premiumsecurity.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.premiumsecurity.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 24, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 24, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 24, bundle: [] }
        ]);
        actionNode.remove();
        await stateNode.updateComplete;
        expect(getComputedOptions(stateNode.computedOptions)).toStrictEqual([
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 24, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 24, bundle: [] }
        ]);
    });
    it('test state for two levels', async () => {
        const stateNode = await fixture(html `
      <bd-root store-name="root">
        <bd-state store-name="parent">
          <div>
          <bd-product store-name="tsmd" product-id='com.bitdefender.tsmd.v2'>
            <bd-option devices="5" subscription="12">
              <div data-store-action store-name="tsmd-devices" data-store-set-devices="25"></div>
              <div data-store-action store-name="tsmd-subscription" data-store-set-subscription="24"></div>
            </bd-option>
          </bd-product>
           <bd-product store-name="ps" product-id='com.bitdefender.premiumsecurity.v2'>
            <bd-option devices="5" subscription="12">
              <div data-store-action store-name="ps-devices" data-store-set-devices="25"></div>
              <div data-store-action store-name="ps-subscription" data-store-set-subscription="24"></div>
            </bd-option>
          </bd-product>
        </div>
        </bd-state>
      </bd-root>
      `);
        stateNode.store = store;
        registerActionNodes(stateNode);
        await stateNode.updateComplete;
        expect(getComputedOptions(stateNode.computedOptions)).toStrictEqual([
            { id: 'com.bitdefender.premiumsecurity.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.premiumsecurity.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 24, bundle: [] },
            { id: 'com.bitdefender.premiumsecurity.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.premiumsecurity.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 24, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 24, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 24, bundle: [] }
        ]);
    });
    it('test state for one level with option change', async () => {
        const stateNode = await fixture(html `
      <bd-root store-name="root">
         <bd-product store-name="tsmd" product-id='com.bitdefender.tsmd.v2'>
            <bd-option devices="5" subscription="12"></bd-option>
              <div data-store-action data-store-set-devices="25"></div>
              <div data-store-action data-store-set-subscription="24"></div>
            </bd-option>
          </bd-product>
        </bd-state>
      </bd-root>
      `);
        stateNode.store = store;
        registerActionNodes(stateNode);
        await stateNode.updateComplete;
        expect(getComputedOptions(stateNode.computedOptions)).toStrictEqual([
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 24, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 24, bundle: [] }
        ]);
        const product = stateNode.querySelector("bd-product");
        product.productId = "com.bitdefender.premiumsecurity.v2";
        await stateNode.updateComplete;
        expect(getComputedOptions(stateNode.computedOptions)).toStrictEqual([
            { id: 'com.bitdefender.premiumsecurity.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.premiumsecurity.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 24, bundle: [] },
            { id: 'com.bitdefender.premiumsecurity.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.premiumsecurity.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 24, bundle: [] }
        ]);
        const option = stateNode.querySelector("bd-option");
        option.devices = 25;
        await stateNode.updateComplete;
        expect(getComputedOptions(stateNode.computedOptions)).toStrictEqual([
            { id: 'com.bitdefender.premiumsecurity.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.premiumsecurity.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 24, bundle: [] }
        ]);
    });
    it('disconect state node', async () => {
        const stateNode = await fixture(html `
      <bd-root store-name="root">
        <bd-context store-name="parent">
          <div>
          <bd-product store-name="tsmd" product-id='com.bitdefender.tsmd.v2'>
            <bd-option devices="5" subscription="12">
              <div data-store-action data-store-set-devices="25"></div>
              <div data-store-action data-store-set-subscription="24"></div>
            </bd-option>
          </bd-product>
           <bd-product store-name="ps" product-id='com.bitdefender.premiumsecurity.v2'>
            <bd-option devices="5" subscription="12">
              <div data-store-action data-store-set-devices="25"></div>
              <div data-store-action data-store-set-subscription="24"></div>
            </bd-option>
          </bd-product>
        </div>
        </bd-context>
      </bd-root>
      `);
        stateNode.store = store;
        registerActionNodes(stateNode);
        const nodePs = stateNode.querySelector("[store-name=ps]");
        nodePs.remove();
        await stateNode.updateComplete;
        expect(getComputedOptions(stateNode.computedOptions)).toStrictEqual([
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 24, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 24, bundle: [] }
        ]);
    });
    it('disconect state node and reconect', async () => {
        const stateNode = await fixture(html `
      <bd-root store-name="root">
        <bd-context store-name="parent">
          <div>
          <bd-product store-name="tsmd" product-id='com.bitdefender.tsmd.v2'>
            <bd-option devices="5" subscription="12">
              <div data-store-action store-name="tmsd-devices" data-store-set-devices="25"></div>
              <div data-store-action store-name="tmsd-subscription" data-store-set-subscription="24"></div>
            </bd-option>
          </bd-product>
        </div>
        </bd-context>
      </bd-root>
      `);
        stateNode.store = store;
        registerActionNodes(stateNode);
        const nodeTsmd = stateNode.querySelector("[store-name=tsmd]");
        await stateNode.updateComplete;
        expect(getComputedOptions(stateNode.computedOptions)).toStrictEqual([
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 24, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 24, bundle: [] }
        ]);
        nodeTsmd.remove();
        await stateNode.updateComplete;
        expect(getComputedOptions(stateNode.computedOptions)).toStrictEqual([]);
        stateNode.appendChild(nodeTsmd);
        await stateNode.updateComplete;
        expect(getComputedOptions(stateNode.computedOptions)).toStrictEqual([
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 24, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 24, bundle: [] }
        ]);
    });
    it('disconect state node and reconect with product change', async () => {
        const stateNode = await fixture(html `
      <bd-root store-name="root">
        <bd-context store-name="parent">
          <div>
          <bd-product store-name="tsmd" product-id='com.bitdefender.tsmd.v2'>
              <bd-option devices="5" subscription="12">
                <div data-store-action data-store-set-devices="25"></div>
                <div data-store-action data-store-set-subscription="24"></div>
              </bd-option>
            </bd-product>
            <bd-product store-name="ps" product-id='com.bitdefender.premiumsecurity.v2'>
              <bd-option devices="5" subscription="12">
                <div data-store-action data-store-set-devices="25"></div>
                <div data-store-action data-store-set-subscription="24"></div>
              </bd-option>
            </bd-product>
        </div>
        </bd-context>
      </bd-root>
      `);
        stateNode.store = store;
        registerActionNodes(stateNode);
        const nodePs = stateNode.querySelector("[store-name=ps]");
        await stateNode.updateComplete;
        expect(getComputedOptions(stateNode.computedOptions)).toStrictEqual([
            { id: 'com.bitdefender.premiumsecurity.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.premiumsecurity.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 24, bundle: [] },
            { id: 'com.bitdefender.premiumsecurity.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.premiumsecurity.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 24, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 24, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 24, bundle: [] }
        ]);
        nodePs.remove();
        stateNode.appendChild(nodePs);
        nodePs.productId = "com.bitdefender.tsmd.v2";
        await stateNode.updateComplete;
        expect(getComputedOptions(stateNode.computedOptions)).toStrictEqual([
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 24, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 24, bundle: [] }
        ]);
    });
    it('compute correctly state', async () => {
        const stateNode = await fixture(html `
      <bd-root store-name="root">
       <bd-context store-name="parent">
        <div>
          <bd-product store-name="tsmd" product-id='com.bitdefender.tsmd.v2'>
              <bd-option devices="5" subscription="12">
                <div data-store-action data-store-set-devices="25"></div>
                <div data-store-action data-store-set-subscription="24"></div>
              </bd-option>
            </bd-product>
            <bd-product store-name="ps" product-id='com.bitdefender.premiumsecurity.v2'>
              <bd-option devices="5" subscription="12">
                <div data-store-action data-store-set-devices="25"></div>
                <div data-store-action data-store-set-subscription="24"></div>
              </bd-option>
            </bd-product>
          </div>
        </bd-context>
      </bd-root>
      `);
        stateNode.store = store;
        registerActionNodes(stateNode);
        await stateNode.updateComplete;
        expect(stateNode.state).toStrictEqual({
            price: {
                min: { value: 109.99, fmt: "$109.99" },
                max: { value: 339.99, fmt: "$339.99" },
                monthly: {
                    min: { value: 9.17, fmt: "$9.17" },
                    max: { value: 14.17, fmt: "$14.17" }
                }
            },
            discountedPrice: {
                min: { value: 59.99, fmt: "$59.99" },
                max: { value: 199.99, fmt: "$199.99" },
                monthly: {
                    min: { value: 5, fmt: "$5" },
                    max: { value: 8.33, fmt: "$8.33" }
                }
            },
            discount: {
                min: { value: 50, fmt: "$50" },
                max: { value: 140, fmt: "$140" },
                monthly: {
                    min: { value: 3.75, fmt: "$3.75" },
                    max: { value: 5.83, fmt: "$5.83" }
                },
                percentage: {
                    min: { value: 38, fmt: "38%" },
                    max: { value: 45, fmt: "45%" },
                    monthly: {
                        min: { value: 2, fmt: "2%" },
                        max: { value: 4, fmt: "4%" }
                    }
                }
            }
        });
    });
    it('provide state after compute', async () => {
        const stateNode = await fixture(html `
      <bd-root>
        <bd-product store-name="tsmd" product-id='com.bitdefender.tsmd.v2'>
          <bd-option devices="5" subscription="12">
            <div data-store-action data-store-set-devices="25"></div>
            <div data-store-action data-store-set-id="com.bitdefender.premiumsecurity.v2"></div>
            <div data-store-action data-store-set-subscription="24"></div>
            <bd-state-consumer></bd-state-consumer>
          </bd-option>
        </bd-product>
      </bd-root>
      `);
        stateNode.store = store;
        registerActionNodes(stateNode);
        const stateConsumer = stateNode.querySelector("bd-state-consumer");
        await stateNode.updateComplete;
        expect(stateConsumer.state).toStrictEqual({
            price: {
                min: { value: 109.99, fmt: "$109.99" },
                max: { value: 339.99, fmt: "$339.99" },
                monthly: {
                    min: { value: 9.17, fmt: "$9.17" },
                    max: { value: 14.17, fmt: "$14.17" }
                }
            },
            discountedPrice: {
                min: { value: 59.99, fmt: "$59.99" },
                max: { value: 199.99, fmt: "$199.99" },
                monthly: {
                    min: { value: 5, fmt: "$5" },
                    max: { value: 8.33, fmt: "$8.33" }
                }
            },
            discount: {
                min: { value: 50, fmt: "$50" },
                max: { value: 140, fmt: "$140" },
                monthly: {
                    min: { value: 3.75, fmt: "$3.75" },
                    max: { value: 5.83, fmt: "$5.83" }
                },
                percentage: {
                    min: { value: 38, fmt: "38%" },
                    max: { value: 45, fmt: "45%" },
                    monthly: {
                        min: { value: 2, fmt: "2%" },
                        max: { value: 4, fmt: "4%" }
                    }
                }
            }
        });
    });
});
//# sourceMappingURL=node.product-option.test.js.map
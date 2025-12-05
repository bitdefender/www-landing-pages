import { registerActionNodes, registerContextNodes } from '../../../src/index.js';
import { fixture, fixtureCleanup, html } from '@open-wc/testing-helpers';
import { Store } from '@repobit/dex-store';
import { apiMock } from "../../../__tests__/apiMock.js";
import { getComputedOptions } from '../../../__tests__/utils.js';
import { describe } from 'vitest';
import './state-consumer.js'; // ensure your element is registered
beforeAll(registerContextNodes);
let store;
let products;
describe('Store Test', () => {
    beforeEach(async () => {
        vi.spyOn(global, "fetch").mockImplementation(apiMock);
        store = new Store({
            locale: "en-us",
            provider: {
                name: "vlaicu"
            }
        });
        const ts = (await store.getProduct({ id: "com.bitdefender.tsmd.v2" }));
        const optionTs = (await ts.getOption({ devices: 5, subscription: 12 }));
        const ps = (await store.getProduct({ id: "com.bitdefender.premiumsecurity.v2" }));
        const optionPs = (await ps.getOption({ devices: 5, subscription: 12 }));
        products = { ps: optionPs, ts: optionTs };
    });
    afterEach(() => {
        fixtureCleanup();
        vi.restoreAllMocks();
    });
    it('missing store', async () => {
        const el = await fixture(html `
      <bd-root>
        <bd-state></bd-state>
      </bd-root>
    `);
        const state = el.querySelector('bd-state');
        await state.updateComplete;
        expect(getComputedOptions(state.computedOptions)).toStrictEqual([]);
    });
    it('nothing to do when empty', async () => {
        const el = await fixture(html `
      <bd-root>
        <bd-state>
        </bd-state>
      </bd-root>
    `);
        el.store = store;
        const state = el.querySelector('bd-state');
        await state.updateComplete;
        expect(getComputedOptions(state.computedOptions)).toStrictEqual([]);
    });
    it('test state for one level', async () => {
        const el = await fixture(html `
      <bd-root>
        <bd-state>
          <div data-store-action data-store-set-devices="25"></div>
          <div data-store-action data-store-set-id="com.bitdefender.premiumsecurity.v2"></div>
          <div data-store-action data-store-set-subscription="24"></div>
        </bd-state>
      </bd-root>
      `);
        el.store = store;
        registerActionNodes(el);
        const stateNode = el.querySelector("bd-state");
        stateNode.collectOption({ name: stateNode.storeName, options: Promise.resolve([products.ts]) });
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
    it('test update by delta', async () => {
        const el = await fixture(html `
      <bd-root store-name="root">
        <bd-state store-name="state">
          <div data-store-action data-store-set-id="com.bitdefender.premiumsecurity.v2"></div>
          <div data-store-action data-store-set-type="devices" data-store-set-delta="next"></div>
        </bd-state>
      </bd-root>
      `);
        el.store = store;
        registerActionNodes(el);
        const stateNode = el.querySelector("bd-state");
        stateNode.collectOption({ name: stateNode.storeName, options: Promise.resolve([products.ts]) });
        await stateNode.updateComplete;
        expect(getComputedOptions(stateNode.computedOptions)).toStrictEqual([
            { id: 'com.bitdefender.premiumsecurity.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.premiumsecurity.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 12, bundle: [] }
        ]);
    });
    it('test bundle', async () => {
        const el = await fixture(html `
      <bd-root>
        <bd-state>
          <div data-store-action data-store-set-devices="25"></div>
          <div data-store-action data-store-set-id="com.bitdefender.premiumsecurity.v2"></div>
          <div data-store-action data-store-set-subscription="24"></div>
          <div 
            data-store-action 
            data-store-set-id="com.bitdefender.vpn" 
            data-store-set-devices="1" 
            data-store-set-subscription="12" 
            data-store-set-bundle="true"></div>
        </bd-state>
      </bd-root>
      `);
        el.store = store;
        registerActionNodes(el);
        const stateNode = el.querySelector("bd-state");
        stateNode.collectOption({ name: stateNode.storeName, options: Promise.resolve([products.ts]) });
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
        const el = await fixture(html `
      <bd-root store-name="root">
        <bd-state store-name="state">
          <div data-store-action store-name="devices" data-store-set-devices="25"></div>
          <div data-store-action store-name="productChange" data-store-set-id="com.bitdefender.premiumsecurity.v2"></div>
          <div data-store-action store-name="subscription" data-store-set-subscription="24"></div>
        </bd-state>
      </bd-root>
      `);
        el.store = store;
        registerActionNodes(el);
        const stateNode = el.querySelector("bd-state");
        const actionNode = el.querySelector("[store-name=productChange]");
        stateNode.collectOption({ name: stateNode.storeName, options: Promise.resolve([products.ts]) });
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
        const el = await fixture(html `
      <bd-root store-name="root">
        <bd-state store-name="parent">
          <div>
          <bd-state store-name="tsmd" id='tsmd'>
            <div data-store-action store-name="tsmd-devices" data-store-set-devices="25"></div>
            <div data-store-action store-name="tsmd-subscription" data-store-set-subscription="24"></div>
          </bd-state>
            <bd-state store-name="ps" id='ps'>
            <div data-store-action store-name="ps-devices" data-store-set-devices="25"></div>
            <div data-store-action store-name="ps-subscription" data-store-set-subscription="24"></div>
          </bd-state>
        </div>
        </bd-state>
      </bd-root>
      `);
        el.store = store;
        registerActionNodes(el);
        const stateNode = el.querySelector("bd-state");
        const nodeTsmd = el.querySelector("#tsmd");
        const nodePs = el.querySelector("#ps");
        nodeTsmd.collectOption({ name: nodeTsmd.storeName, options: Promise.resolve([products.ts]) });
        nodePs.collectOption({ name: nodePs.storeName, options: Promise.resolve([products.ps]) });
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
        const el = await fixture(html `
      <bd-root store-name="root">
        <bd-state store-name="product">
          <div data-store-action data-store-set-devices="25"></div>
          <div data-store-action data-store-set-subscription="24"></div>
        </bd-state>
      </bd-root>
      `);
        el.store = store;
        registerActionNodes(el);
        const stateNode = el.querySelector("bd-state");
        stateNode.collectOption({ name: stateNode.storeName, options: Promise.resolve([products.ts]) });
        await stateNode.updateComplete;
        expect(getComputedOptions(stateNode.computedOptions)).toStrictEqual([
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 24, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 24, bundle: [] }
        ]);
        stateNode.collectOption({ name: stateNode.storeName, options: Promise.resolve([products.ps]) });
        await stateNode.updateComplete;
        expect(getComputedOptions(stateNode.computedOptions)).toStrictEqual([
            { id: 'com.bitdefender.premiumsecurity.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.premiumsecurity.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 24, bundle: [] },
            { id: 'com.bitdefender.premiumsecurity.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.premiumsecurity.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 24, bundle: [] }
        ]);
    });
    it('disconect state node', async () => {
        const el = await fixture(html `
      <bd-root store-name="root">
        <bd-state store-name="parent">
          <div>
          <bd-state store-name="tsmd" id='tsmd'>
            <div data-store-action data-store-set-devices="25"></div>
            <div data-store-action data-store-set-subscription="24"></div>
          </bd-state>
           <bd-state store-name="ps" id='ps'>
            <div data-store-action data-store-set-devices="25"></div>
            <div data-store-action data-store-set-subscription="24"></div>
          </bd-state>
        </div>
        </bd-state>
      </bd-root>
      `);
        el.store = store;
        registerActionNodes(el);
        const stateNode = el.querySelector("bd-state");
        const nodeTsmd = el.querySelector("#tsmd");
        const nodePs = el.querySelector("#ps");
        nodeTsmd.collectOption({ name: nodeTsmd.storeName, options: Promise.resolve([products.ts]) });
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
        const el = await fixture(html `
      <bd-root store-name="root">
        <bd-state store-name="parent">
          <div>
          <bd-state store-name="tsmd" id='tsmd'>
            <div data-store-action store-name="tmsd-devices" data-store-set-devices="25"></div>
            <div data-store-action store-name="tmsd-subscription" data-store-set-subscription="24"></div>
          </bd-state>
        </div>
        </bd-state>
      </bd-root>
      `);
        el.store = store;
        registerActionNodes(el);
        const stateNode = el.querySelector("bd-state");
        const nodeTsmd = el.querySelector("#tsmd");
        nodeTsmd.collectOption({ name: nodeTsmd.storeName, options: Promise.resolve([products.ts]) });
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
        nodeTsmd.collectOption({ name: nodeTsmd.storeName, options: Promise.resolve([products.ts]) });
        await stateNode.updateComplete;
        expect(getComputedOptions(stateNode.computedOptions)).toStrictEqual([
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 24, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 24, bundle: [] }
        ]);
    });
    it('disconect state node and reconect with product change', async () => {
        const el = await fixture(html `
      <bd-root store-name="root">
        <bd-state store-name="parent">
          <div>
          <bd-state store-name="tsmd" id='tsmd'>
            <div data-store-action data-store-set-devices="25"></div>
            <div data-store-action data-store-set-subscription="24"></div>
          </bd-state>
           <bd-state store-name="ps" id='ps'>
            <div data-store-action data-store-set-devices="25"></div>
            <div data-store-action data-store-set-subscription="24"></div>
          </bd-state>
        </div>
        </bd-state>
      </bd-root>
      `);
        el.store = store;
        registerActionNodes(el);
        const stateNode = el.querySelector("bd-state");
        const nodeTsmd = el.querySelector("#tsmd");
        const nodePs = el.querySelector("#ps");
        nodeTsmd.collectOption({ name: nodeTsmd.storeName, options: Promise.resolve([products.ts]) });
        nodePs.collectOption({ name: nodePs.storeName, options: Promise.resolve([products.ps]) });
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
        nodePs.collectOption({ name: nodePs.storeName, options: Promise.resolve([products.ts]) });
        await stateNode.updateComplete;
        expect(getComputedOptions(stateNode.computedOptions)).toStrictEqual([
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 5, subscription: 24, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 12, bundle: [] },
            { id: 'com.bitdefender.tsmd.v2', campaign: 'WINTERMCWEB24', devices: 25, subscription: 24, bundle: [] }
        ]);
    });
    it('compute correctly state', async () => {
        const el = await fixture(html `
      <bd-root store-name="root">
        <bd-state store-name="parent">
          <div>
          <bd-state store-name="tsmd" id='tsmd'>
            <div data-store-action store-name="tsmd-devices" data-store-set-devices="25"></div>
            <div data-store-action store-name="tsmd-subscription" data-store-set-subscription="24"></div>
          </bd-state>
           <bd-state store-name="ps" id='ps'>
            <div data-store-action store-name="ps-devices" data-store-set-devices="25"></div>
            <div data-store-action store-name="ps-subscription" data-store-set-subscription="24"></div>
          </bd-state>
        </div>
        </bd-state>
      </bd-root>
      `);
        el.store = store;
        registerActionNodes(el);
        const stateNode = el.querySelector("bd-state");
        const nodeTsmd = el.querySelector("#tsmd");
        const nodePs = el.querySelector("#ps");
        nodeTsmd.collectOption({ name: nodeTsmd.storeName, options: Promise.resolve([products.ts]) });
        nodePs.collectOption({ name: nodePs.storeName, options: Promise.resolve([products.ps]) });
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
        const el = await fixture(html `
      <bd-root>
        <bd-state>
          <div data-store-action data-store-set-devices="25"></div>
          <div data-store-action data-store-set-id="com.bitdefender.premiumsecurity.v2"></div>
          <div data-store-action data-store-set-subscription="24"></div>
          <bd-state-consumer></bd-state-consumer>
        </bd-state>
      </bd-root>
      `);
        el.store = store;
        registerActionNodes(el);
        const stateNode = el.querySelector("bd-state");
        const stateConsumer = el.querySelector("bd-state-consumer");
        stateNode.collectOption({ name: stateNode.storeName, options: Promise.resolve([products.ts]) });
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
//# sourceMappingURL=node.state.test.js.map
import { registerActionNodes, registerContextNodes } from '../../../src/index.js';
import { fixture, fixtureCleanup, html } from '@open-wc/testing-helpers';
import { Store } from '@repobit/dex-store';
import { apiMock } from "../../../__tests__/apiMock.js";
import { describe } from 'vitest';
beforeAll(registerContextNodes);
let store;
describe('Ignore Events by storeName', () => {
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
    it('product ignores specific action nodes', async () => {
        const rootNode = await fixture(html `
      <bd-root store-name="root">
        <bd-product store-name="product" product-id="com.bitdefender.tsmd.v2" ignore-events="devicesButton,subscriptionButton">
          <bd-option devices="5" subscription="12"></bd-option>
          <!-- Actions live as siblings under product so product is the first StateNode on the path -->
          <div data-store-action data-store-id="devicesButton" data-store-set-devices="25"></div>
          <div data-store-action data-store-id="subscriptionButton" data-store-set-subscription="24"></div>
          <div data-store-action data-store-id="otherButton" data-store-set-devices="25"></div>
        </bd-product>
      </bd-root>
    `);
        rootNode.store = store;
        registerActionNodes(rootNode);
        const optionNode = rootNode.querySelector('bd-option');
        await optionNode.updateComplete;
        expect(`${optionNode.option?.getDevices()}-${optionNode.option?.getSubscription()}`).toStrictEqual("5-12");
        // Ignored devices change
        rootNode.querySelector('[data-store-id=devicesButton]').click();
        await optionNode.updateComplete;
        expect(`${optionNode.option?.getDevices()}-${optionNode.option?.getSubscription()}`).toStrictEqual("5-12");
        // Ignored subscription change
        rootNode.querySelector('[data-store-id=subscriptionButton]').click();
        await optionNode.updateComplete;
        expect(`${optionNode.option?.getDevices()}-${optionNode.option?.getSubscription()}`).toStrictEqual("5-12");
        // Not ignored
        rootNode.querySelector('[data-store-id=otherButton]').click();
        await optionNode.updateComplete;
        expect(`${optionNode.option?.getDevices()}-${optionNode.option?.getSubscription()}`).toStrictEqual("25-12");
    });
    it('option ignores upper-level action nodes', async () => {
        const rootNode = await fixture(html `
      <bd-root store-name="root">
        <bd-product store-name="product" product-id="com.bitdefender.tsmd.v2">
          <bd-option ignore-events="devicesButton,subscriptionButton" devices="5" subscription="12"></bd-option>
          <!-- Actions are outside the option, higher in the tree -->
          <div data-store-action data-store-id="devicesButton" data-store-set-devices="25"></div>
          <div data-store-action data-store-id="subscriptionButton" data-store-set-subscription="24"></div>
          <div data-store-action data-store-id="otherButton" data-store-set-devices="25"></div>
        </bd-product>
      </bd-root>
    `);
        rootNode.store = store;
        registerActionNodes(rootNode);
        const optionNode = rootNode.querySelector('bd-option');
        await optionNode.updateComplete;
        expect(`${optionNode.option?.getDevices()}-${optionNode.option?.getSubscription()}`).toStrictEqual("5-12");
        // Ignored devices change (upper-level)
        rootNode.querySelector('[data-store-id=devicesButton]').click();
        await optionNode.updateComplete;
        expect(`${optionNode.option?.getDevices()}-${optionNode.option?.getSubscription()}`).toStrictEqual("5-12");
        // Ignored subscription change (upper-level)
        rootNode.querySelector('[data-store-id=subscriptionButton]').click();
        await optionNode.updateComplete;
        expect(`${optionNode.option?.getDevices()}-${optionNode.option?.getSubscription()}`).toStrictEqual("5-12");
        // Not ignored (upper-level) → applies
        rootNode.querySelector('[data-store-id=otherButton]').click();
        await optionNode.updateComplete;
        expect(`${optionNode.option?.getDevices()}-${optionNode.option?.getSubscription()}`).toStrictEqual("25-12");
    });
    it('one option ignores, one applies when action is above both', async () => {
        const rootNode = await fixture(html `
      <bd-root store-name="root">
        <bd-product store-name="product" product-id="com.bitdefender.tsmd.v2">
          <!-- Action placed before both options under product -->
          <div data-store-action data-store-id="devicesButton" data-store-set-devices="25"></div>

          <!-- This option ignores the action -->
          <bd-option id="optA" ignore-events="devicesButton" devices="5" subscription="12"></bd-option>

          <!-- This option accepts the action -->
          <bd-option id="optB" devices="5" subscription="12"></bd-option>
        </bd-product>
      </bd-root>
    `);
        rootNode.store = store;
        registerActionNodes(rootNode);
        const optA = rootNode.querySelector('#optA');
        const optB = rootNode.querySelector('#optB');
        await rootNode.updateComplete;
        expect(`${optA.option?.getDevices()}-${optA.option?.getSubscription()}`).toStrictEqual("5-12");
        expect(`${optB.option?.getDevices()}-${optB.option?.getSubscription()}`).toStrictEqual("5-12");
        // Fire action once; only optB should react
        rootNode.querySelector('[data-store-id=devicesButton]').click();
        await rootNode.updateComplete;
        expect(`${optA.option?.getDevices()}-${optA.option?.getSubscription()}`).toStrictEqual("5-12");
        expect(`${optB.option?.getDevices()}-${optB.option?.getSubscription()}`).toStrictEqual("25-12");
    });
});
describe('Ignore Events at root/context level', () => {
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
    it('root-level actions are ignored by product subtree', async () => {
        const rootNode = await fixture(html `
      <bd-root store-name="root" ignore-events="rootDevices,rootSubscription">
        <!-- Root-level actions (outside product) -->
        <div data-store-action data-store-id="rootDevices" data-store-set-devices="25"></div>
        <div data-store-action data-store-id="rootSubscription" data-store-set-subscription="24"></div>

        <bd-product store-name="product" product-id="com.bitdefender.tsmd.v2">
          <bd-option devices="5" subscription="12"></bd-option>
        </bd-product>
      </bd-root>
    `);
        rootNode.store = store;
        registerActionNodes(rootNode);
        const optionNode = rootNode.querySelector('bd-option');
        await optionNode.updateComplete;
        expect(`${optionNode.option?.getDevices()}-${optionNode.option?.getSubscription()}`).toStrictEqual("5-12");
        // Click root-level ignored actions
        rootNode.querySelector('[data-store-id=rootDevices]').click();
        rootNode.querySelector('[data-store-id=rootSubscription]').click();
        await optionNode.updateComplete;
        // Still unchanged
        expect(`${optionNode.option?.getDevices()}-${optionNode.option?.getSubscription()}`).toStrictEqual("5-12");
    });
    it('context-level actions are ignored for the contained subtree', async () => {
        const rootNode = await fixture(html `
      <bd-root store-name="root">
        <bd-context store-name="ctx" ignore-events="ctxDevices,ctxSubscription">
          <!-- Context-level actions (siblings to product) -->
          <div data-store-action data-store-id="ctxDevices" data-store-set-devices="25"></div>
          <div data-store-action data-store-id="ctxSubscription" data-store-set-subscription="24"></div>

          <bd-product store-name="product" product-id="com.bitdefender.tsmd.v2">
            <bd-option devices="5" subscription="12"></bd-option>
          </bd-product>
        </bd-context>
      </bd-root>
    `);
        rootNode.store = store;
        registerActionNodes(rootNode);
        const optionNode = rootNode.querySelector('bd-option');
        await optionNode.updateComplete;
        expect(`${optionNode.option?.getDevices()}-${optionNode.option?.getSubscription()}`).toStrictEqual("5-12");
        // Click context-level ignored actions
        rootNode.querySelector('[data-store-id=ctxDevices]').click();
        rootNode.querySelector('[data-store-id=ctxSubscription]').click();
        await optionNode.updateComplete;
        // Still unchanged
        expect(`${optionNode.option?.getDevices()}-${optionNode.option?.getSubscription()}`).toStrictEqual("5-12");
    });
});
//# sourceMappingURL=node.ignore-events.test.js.map
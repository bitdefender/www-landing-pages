import { registerActionNodes, registerContextNodes } from '../../../src/index.js';
import { fixture, fixtureCleanup, html } from '@open-wc/testing-helpers';
import { Store } from '@repobit/dex-store';
import { apiMock } from "../../../__tests__/apiMock.js";
import { describe } from 'vitest';
import './product-consumer.js'; // ensure your element is registered
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
    it('it loads a product', async () => {
        const rootNode = await fixture(html `
      <bd-root store-name="root">
        <bd-product store-name="product" product-id="com.bitdefender.tsmd.v2">
        </bd-product>
      </bd-root>
    `);
        rootNode.store = store;
        const productNode = rootNode.querySelector('bd-product');
        await productNode.updateComplete;
        expect(productNode.product?.getId()).toStrictEqual("com.bitdefender.tsmd.v2");
    });
    it('late store load', async () => {
        const rootNode = await fixture(html `
      <bd-root store-name="root">
        <bd-product store-name="product" product-id="com.bitdefender.tsmd.v2">
        </bd-product>
      </bd-root>
    `);
        const productNode = rootNode.querySelector('bd-product');
        await productNode.updateComplete;
        expect(productNode.product).toBe(undefined);
        rootNode.store = store;
        await productNode.updateComplete;
        expect(productNode.product?.getId()).toStrictEqual("com.bitdefender.tsmd.v2");
    });
    it('product change', async () => {
        const rootNode = await fixture(html `
      <bd-root store-name="root">
        <bd-product store-name="product" product-id="com.bitdefender.tsmd.v2">
        </bd-product>
      </bd-root>
    `);
        rootNode.store = store;
        const productNode = rootNode.querySelector('bd-product');
        productNode.productId = "com.bitdefender.premiumsecurity.v2";
        await productNode.updateComplete;
        expect(productNode.product?.getId()).toStrictEqual("com.bitdefender.premiumsecurity.v2");
        productNode.productId = "com.bitdefender.tsmd.v2";
        await productNode.updateComplete;
        expect(productNode.product?.getId()).toStrictEqual("com.bitdefender.tsmd.v2");
    });
    it('product change by event', async () => {
        const rootNode = await fixture(html `
      <bd-root store-name="root">
        <bd-product store-name="product" product-id="com.bitdefender.tsmd.v2">
          <div data-store-action data-store-set-id="com.bitdefender.premiumsecurity.v2"></div>
        </bd-product>
      </bd-root>
    `);
        rootNode.store = store;
        registerActionNodes(rootNode);
        const productNode = rootNode.querySelector('bd-product');
        const actionNode = rootNode.querySelector('[data-store-action]');
        await productNode.updateComplete;
        expect(productNode.product?.getId()).toStrictEqual("com.bitdefender.tsmd.v2");
        actionNode.click();
        await productNode.updateComplete;
        expect(productNode.product?.getId()).toStrictEqual("com.bitdefender.premiumsecurity.v2");
    });
});
//# sourceMappingURL=node.product.test.js.map
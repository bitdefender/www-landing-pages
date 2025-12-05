import { registerActionNodes, registerContextNodes } from '../../../src/index.js';
import { fixture, fixtureCleanup, html } from '@open-wc/testing-helpers';
import { Store } from '@repobit/dex-store';
import { apiMock } from "../../../__tests__/apiMock.js";
import { getComputedOptions } from '../../../__tests__/utils.js';
import { describe } from 'vitest';
beforeAll(registerContextNodes);
let store;
describe('Bundle Test: smallbs + bs_nadrm + bs_wadc', () => {
    beforeEach(async () => {
        vi.spyOn(global, "fetch").mockImplementation(apiMock);
        store = new Store({
            locale: "en-us",
            provider: {
                name: "init"
            }
        });
    });
    afterEach(() => {
        fixtureCleanup();
        vi.restoreAllMocks();
    });
    it('computes bundled options for smallbs with bs_nadrm and bs_wadc', async () => {
        const rootNode = await fixture(html `
      <bd-root store-name="root">
        <bd-product store-name="smallbs-product" product-id="smallbs">
          <bd-option store-name="option" devices="3" subscription="12">
            <div data-store-action data-store-set-id="bs_nadrm" data-store-set-bundle></div>
            <div data-store-action data-store-set-id="bs_wadc" data-store-set-bundle></div>
          </bd-option>
        </bd-product>
      </bd-root>
    `);
        rootNode.store = store;
        registerActionNodes(rootNode);
        await rootNode.updateComplete;
        expect(getComputedOptions(rootNode.computedOptions)).toStrictEqual([
            { id: 'smallbs', campaign: '', devices: 3, subscription: 12, bundle: [] },
            {
                id: 'smallbs',
                campaign: '',
                devices: 3,
                subscription: 12,
                bundle: [
                    { id: 'bs_nadrm', campaign: '', devices: 3, subscription: 12, bundle: [] }
                ]
            },
            {
                id: 'smallbs',
                campaign: '',
                devices: 3,
                subscription: 12,
                bundle: [
                    { id: 'bs_nadrm', campaign: '', devices: 3, subscription: 12, bundle: [] },
                    { id: 'bs_wadc', campaign: '', devices: 3, subscription: 12, bundle: [] }
                ]
            },
            {
                id: 'smallbs',
                campaign: '',
                devices: 3,
                subscription: 12,
                bundle: [
                    { id: 'bs_wadc', campaign: '', devices: 3, subscription: 12, bundle: [] }
                ]
            }
        ]);
    });
    it('bundled device locked (bs_nadrm devices fixed)', async () => {
        const rootNode = await fixture(html `
      <bd-root store-name="root">
        <bd-product store-name="smallbs-product" product-id="smallbs">
          <bd-option store-name="option" devices="3" subscription="12">
            <div data-store-action data-store-set-id="bs_nadrm" data-store-set-devices="1" data-store-set-bundle></div>
            <div data-store-action data-store-set-id="bs_wadc" data-store-set-bundle></div>
          </bd-option>
        </bd-product>
      </bd-root>
    `);
        rootNode.store = store;
        registerActionNodes(rootNode);
        await rootNode.updateComplete;
        expect(getComputedOptions(rootNode.computedOptions)).toStrictEqual([
            { id: 'smallbs', campaign: '', devices: 3, subscription: 12, bundle: [] },
            { id: 'smallbs', campaign: '', devices: 3, subscription: 12, bundle: [
                    { id: 'bs_nadrm', campaign: '', devices: 1, subscription: 12, bundle: [] }
                ] },
            { id: 'smallbs', campaign: '', devices: 3, subscription: 12, bundle: [
                    { id: 'bs_nadrm', campaign: '', devices: 1, subscription: 12, bundle: [] },
                    { id: 'bs_wadc', campaign: '', devices: 3, subscription: 12, bundle: [] }
                ] },
            { id: 'smallbs', campaign: '', devices: 3, subscription: 12, bundle: [
                    { id: 'bs_wadc', campaign: '', devices: 3, subscription: 12, bundle: [] }
                ] }
        ]);
    });
    it('bundled subscription locked (bs_wadc subscription fixed)', async () => {
        const rootNode = await fixture(html `
      <bd-root store-name="root">
        <bd-product store-name="smallbs-product" product-id="smallbs">
          <bd-option store-name="option" devices="3" subscription="12">
            <div data-store-action data-store-set-id="bs_nadrm" data-store-set-bundle></div>
            <div data-store-action data-store-set-id="bs_wadc" data-store-set-subscription="24" data-store-set-bundle></div>
          </bd-option>
        </bd-product>
      </bd-root>
    `);
        rootNode.store = store;
        registerActionNodes(rootNode);
        await rootNode.updateComplete;
        expect(getComputedOptions(rootNode.computedOptions)).toStrictEqual([
            { id: 'smallbs', campaign: '', devices: 3, subscription: 12, bundle: [] },
            { id: 'smallbs', campaign: '', devices: 3, subscription: 12, bundle: [
                    { id: 'bs_nadrm', campaign: '', devices: 3, subscription: 12, bundle: [] }
                ] },
            { id: 'smallbs', campaign: '', devices: 3, subscription: 12, bundle: [
                    { id: 'bs_nadrm', campaign: '', devices: 3, subscription: 12, bundle: [] },
                    { id: 'bs_wadc', campaign: '', devices: 3, subscription: 24, bundle: [] }
                ] },
            { id: 'smallbs', campaign: '', devices: 3, subscription: 12, bundle: [
                    { id: 'bs_wadc', campaign: '', devices: 3, subscription: 24, bundle: [] }
                ] }
        ]);
    });
});
//# sourceMappingURL=node.bundle.smallbs.test.js.map
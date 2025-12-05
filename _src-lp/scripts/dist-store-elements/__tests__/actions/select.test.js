import { ActionEvent } from "../../src/events/events.js";
import { registerActionNodes, registerContextNodes } from '../../src/index.js';
import { fixture, fixtureCleanup, html } from '@open-wc/testing-helpers';
import { describe, expect, it, vi } from 'vitest';
beforeAll(registerContextNodes);
describe('Button action', () => {
    afterEach(() => {
        fixtureCleanup();
    });
    it('Set product event', async () => {
        const el = await fixture(html `
    <div>
      <select data-store-action>
        <option
          data-store-set-devices="5"
          data-store-set-subscription="12"
          data-store-set-id="com.bitdefender.tsmd.v2"
          data-store-set-campaign="test"
          value="5-12">
        </option>
         <option
          data-store-set-devices="25"
          data-store-set-subscription="12"
          data-store-set-id="com.bitdefender.tsmd.v2"
          data-store-set-campaign="test"
          value="25-12">
        </option>
      </select>
    </div>`);
        registerActionNodes(el);
        const confirmSpy = vi.fn();
        el.addEventListener(ActionEvent.eventName, (evt) => {
            confirmSpy(evt.detail);
        });
        const select = el.querySelector("select");
        select.value = "5-12";
        select.dispatchEvent(new Event("change"));
        expect(confirmSpy).toHaveBeenCalledWith({
            bundle: false,
            campaign: "test",
            devices: 5,
            id: "com.bitdefender.tsmd.v2",
            subscription: 12
        });
        select.value = "25-12";
        select.dispatchEvent(new Event("change"));
        expect(confirmSpy).toHaveBeenCalledWith({
            bundle: false,
            campaign: "test",
            devices: 25,
            id: "com.bitdefender.tsmd.v2",
            subscription: 12
        });
    });
});
//# sourceMappingURL=select.test.js.map
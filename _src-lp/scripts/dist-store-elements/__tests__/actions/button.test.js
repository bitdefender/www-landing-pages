import { ActionEvent, UpdateByDeltaEvent } from "../../src/events/events.js";
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
      <button
        data-store-action
        data-store-set-devices="5"
        data-store-set-subscription="12"
        data-store-set-id="com.bitdefender.tsmd.v2"
        data-store-set-campaign="test"
        data-store-set-bundle="true"
      >Click me
      </button>
    </div>`);
        registerActionNodes(el);
        const confirmSpy = vi.fn();
        el.addEventListener(ActionEvent.eventName, (evt) => {
            confirmSpy(evt.detail);
        });
        el.querySelector("button")?.click();
        expect(confirmSpy).toHaveBeenCalledWith({
            bundle: true,
            campaign: "test",
            devices: 5,
            id: "com.bitdefender.tsmd.v2",
            subscription: 12
        });
    });
    it('Update by delta event', async () => {
        const el = await fixture(html `
      <div>
        <button
          data-store-action
          data-store-set-type="devices"
          data-store-set-delta="10"
          data-store-set-min="5"
          data-store-set-max="20"
        >Click me
        </button>
      </div>`);
        registerActionNodes(el);
        const confirmSpy = vi.fn();
        el.addEventListener(UpdateByDeltaEvent.eventName, (evt) => {
            confirmSpy(evt.detail);
        });
        el.querySelector("button")?.click();
        expect(confirmSpy).toHaveBeenCalledWith({
            type: "devices",
            delta: 10,
            min: 5,
            max: 20,
            useAsValue: false
        });
    });
});
//# sourceMappingURL=button.test.js.map
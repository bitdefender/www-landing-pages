import { ActionEvent, UpdateByDeltaEvent } from "../events/events.js";
import { addEventListener, connectedCallback, readClickAttributes } from "./utilty.js";
export const button = (el) => {
    const action = () => {
        const attr = readClickAttributes(el);
        if ('type' in attr) {
            el.dispatchEvent(new UpdateByDeltaEvent(attr));
            return;
        }
        el.dispatchEvent(new ActionEvent(attr));
    };
    connectedCallback(el);
    addEventListener(el, "click", action);
};
//# sourceMappingURL=action.button.js.map
import { ActionEvent } from "../events/events.js";
import { addEventListener, readClickAttributes } from "./utilty.js";
export const select = (el) => {
    const action = () => {
        const attr = readClickAttributes(el.selectedOptions[0]);
        if (!('type' in attr)) {
            el.dispatchEvent(new ActionEvent(attr));
        }
    };
    addEventListener(el, "change", action);
};
//# sourceMappingURL=action.select.js.map
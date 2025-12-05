import { ActionEvent, UpdateByDeltaEvent } from "../events/events.js";
import { addEventListener, readClickAttributes } from "./utilty.js";
export const input = (el) => {
    const button = () => {
        const attr = readClickAttributes(el);
        if ('type' in attr) {
            el.dispatchEvent(new UpdateByDeltaEvent(attr));
            return;
        }
        el.dispatchEvent(new ActionEvent(attr));
    };
    const number = () => {
        const attr = readClickAttributes(el);
        if ('type' in attr) {
            el.dispatchEvent(new UpdateByDeltaEvent({
                type: attr.type,
                delta: Number(el.value),
                min: Number(el.min),
                max: Number(el.max),
                useAsValue: true,
                storeId: attr.storeId
            }));
            return;
        }
    };
    switch (el.type) {
        case "checkbox":
        case "radio":
            addEventListener(el, "click", button);
            break;
        case "text":
        case "number":
            addEventListener(el, "change", number);
            break;
    }
};
//# sourceMappingURL=action.input.js.map
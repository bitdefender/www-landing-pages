import { handleBuyLink } from './buyLink.js';
import { handleDevices } from './devices.js';
import { handleDiscount } from './discount.js';
import { handleHide } from './hide.js';
import { handlePrice } from './price.js';
import { handleSubscription } from './subscription.js';
import { handleTrialLink } from './trialLink.js';
// Dispatch known attribute handlers. Order matters for conflicts; keep hide last.
const handlers = [
    handleDevices,
    handleSubscription,
    handleBuyLink,
    handlePrice,
    handleDiscount,
    handleHide,
    handleTrialLink
    // further handlers (devices, subscription, links) will be pushed here
];
export const renderAttributes = async (el, ctx) => {
    for (const h of handlers) {
        await h(el, ctx);
    }
};
//# sourceMappingURL=index.js.map
import { Compiler } from '../../dsl/compilers/index.js';
import { formatSubscription } from '../../renders/format.js';
export const handleSubscription = (el, ctx) => {
    if (!('storeSubscription' in el.dataset))
        return;
    const option = ctx.option;
    if (!option)
        return;
    const ds = el.dataset;
    const type = ds.storeSubscriptionType === 'months' ? 'months' : 'years';
    // input
    if (el instanceof HTMLInputElement) {
        const value = type === 'months' ? option.getSubscription() : Math.floor(option.getSubscription() / 12);
        el.value = String(value);
        return;
    }
    // select
    if (el instanceof HTMLSelectElement) {
        const product = option.getProduct();
        const provided = ds.storeSubscription;
        const available = (provided !== undefined ? Compiler.array(provided) : undefined) ?? product.getSubscriptions().values;
        el.options.length = 0;
        available.forEach(sub => {
            const text = formatSubscription(sub, type, ds.storeTextSingle, ds.storeTextMany);
            const htmlOption = new Option(text, String(sub), sub === option.getSubscription(), sub === option.getSubscription());
            htmlOption.setAttribute('data-store-set-subscription', String(sub));
            el.add(htmlOption);
        });
        return;
    }
    // generic content
    el.innerHTML = formatSubscription(option.getSubscription(), type, ds.storeTextSingle, ds.storeTextMany);
};
//# sourceMappingURL=subscription.js.map
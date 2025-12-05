import { Compiler } from '../../dsl/compilers/index.js';
import { formatDevices } from '../../renders/format.js';
export const handleDevices = (el, ctx) => {
    if (!('storeDevices' in el.dataset))
        return;
    const option = ctx.option;
    if (!option)
        return;
    // input
    if (el instanceof HTMLInputElement) {
        el.value = String(option.getDevices());
        return;
    }
    // select
    if (el instanceof HTMLSelectElement) {
        const ds = el.dataset;
        const product = option.getProduct();
        const provided = ds.storeDevices;
        const available = (provided !== undefined ? Compiler.array(provided) : undefined) ?? product.getDevices().values;
        el.options.length = 0;
        available.forEach(device => {
            const text = formatDevices(device, ds.storeTextSingle, ds.storeTextMany);
            const htmlOption = new Option(text, String(device), device === option.getDevices(), device === option.getDevices());
            htmlOption.setAttribute('data-store-set-devices', String(device));
            el.add(htmlOption);
        });
        return;
    }
    // generic content
    el.innerHTML = String(option.getDevices());
};
//# sourceMappingURL=devices.js.map
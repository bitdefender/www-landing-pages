export const handleTrialLink = (el, ctx) => {
    const ds = el.dataset;
    if (!('storeTrialLink' in ds))
        return;
    const option = ctx.option;
    if (!option)
        return;
    const link = el instanceof HTMLAnchorElement ? el : el.querySelector('a');
    if (!link)
        return;
    link.href = option.getTrialLink() || "";
};
//# sourceMappingURL=trialLink.js.map
export const handleBuyLink = (el, ctx) => {
    const ds = el.dataset;
    if (!('storeBuyLink' in ds))
        return;
    const option = ctx.option;
    if (!option)
        return;
    const link = el instanceof HTMLAnchorElement ? el : el.querySelector('a');
    if (!link)
        return;
    link.href = option.getBuyLink();
    link.setAttribute('data-product', option.getProduct().getId());
    link.setAttribute('data-buy-price', option.getDiscountedPrice({ currency: false }).toString());
    link.setAttribute('data-old-price', option.getPrice({ currency: false }).toString());
    link.setAttribute('data-currency', option.getProduct().getCurrency());
    link.setAttribute('data-variation', `${option.getDevices()}u-${option.getSubscription()}m`);
};
//# sourceMappingURL=buyLink.js.map
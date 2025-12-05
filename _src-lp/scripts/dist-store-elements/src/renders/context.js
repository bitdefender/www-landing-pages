import deepmerge from 'deepmerge';
export const toDSLContext = async ({ option, product, state, derived }) => {
    const optionCtx = option
        ? {
            price: {
                full: option.getPrice({ currency: true }),
                discounted: option.getDiscountedPrice({ currency: true }),
                fullMonthly: option.getPrice({ monthly: true, currency: true }),
                discountedMonthly: option.getDiscountedPrice({ monthly: true, currency: true })
            },
            discount: {
                percentage: option.getDiscount({ percentage: true, symbol: true }),
                percentageMonthly: option.getDiscount({ percentage: true, monthly: true, symbol: true }),
                value: option.getDiscount({ percentage: false, symbol: true }),
                valueMonthly: option.getDiscount({ percentage: false, monthly: true, symbol: true })
            },
            links: {
                buy: option.getBuyLink(),
                trial: option.getTrialLink()
            },
            devices: option.getDevices(),
            subscription: option.getSubscription()
        }
        : undefined;
    // derive product details from option when available
    const productCtx = product
        ? {
            id: product.getId(),
            campaign: product.getCampaign(),
            name: product.getName()
        }
        : option
            ? {
                id: option.getProduct().getId(),
                campaign: option.getProduct().getCampaign(),
                name: option.getProduct().getName()
            }
            : undefined;
    const stateCtx = state
        ? {
            price: {
                full: {
                    min: state.price.min.fmt,
                    max: state.price.max.fmt,
                    monthly: {
                        min: state.price.monthly.min.fmt,
                        max: state.price.monthly.max.fmt
                    }
                },
                discounted: {
                    min: state.discountedPrice.min.fmt,
                    max: state.discountedPrice.max.fmt,
                    monthly: {
                        min: state.discountedPrice.monthly.min.fmt,
                        max: state.discountedPrice.monthly.max.fmt
                    }
                }
            },
            discount: {
                percentage: {
                    min: state.discount.percentage.min.fmt,
                    max: state.discount.percentage.max.fmt,
                    monthly: {
                        min: state.discount.percentage.monthly.min.fmt,
                        max: state.discount.percentage.monthly.max.fmt
                    }
                },
                value: {
                    min: state.discount.min.fmt,
                    max: state.discount.max.fmt,
                    monthly: {
                        min: state.discount.monthly.min.fmt,
                        max: state.discount.monthly.max.fmt
                    }
                }
            }
        }
        : undefined;
    const base = {
        option: optionCtx,
        product: productCtx,
        state: stateCtx,
        ctx: stateCtx
    };
    const extra = derived ? await derived({ option, product, state }) : {};
    return deepmerge(base, extra || {});
};
//# sourceMappingURL=context.js.map
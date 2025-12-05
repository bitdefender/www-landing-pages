import { Compiler } from '../../dsl/compilers/index.js';
// Handles both data-store-price (option-level) and data-store-context-price (state-level)
export const handlePrice = (el, ctx) => {
    const ds = el.dataset;
    // Option-level price
    if (ds.storePrice && ctx.option) {
        const allowed = ['full', 'discounted', 'full-monthly', 'discounted-monthly'];
        const chosen = Compiler.enum({
            expr: ds.storePrice,
            allowed,
            isAvailable: (v) => {
                switch (v) {
                    case 'full':
                        return !!ctx.option.getPrice({ currency: false });
                    case 'discounted':
                        return !!ctx.option.getDiscountedPrice({ currency: false });
                    case 'full-monthly':
                        return !!ctx.option.getPrice({ currency: false, monthly: true });
                    case 'discounted-monthly':
                        return !!ctx.option.getDiscountedPrice({ currency: false, monthly: true });
                }
            }
        });
        switch (chosen) {
            case 'full':
                el.innerHTML = ctx.option.getPrice();
                return;
            case 'discounted':
                el.innerHTML = ctx.option.getDiscountedPrice();
                return;
            case 'full-monthly':
                el.innerHTML = ctx.option.getPrice({ monthly: true });
                return;
            case 'discounted-monthly':
                el.innerHTML = ctx.option.getDiscountedPrice({ monthly: true });
                return;
        }
    }
    // State-level price
    if (ds.storeContextPrice && ctx.state) {
        const allowed = [
            'min-full',
            'max-full',
            'min-discounted',
            'max-discounted',
            'min-full-monthly',
            'max-full-monthly',
            'min-discounted-monthly',
            'max-discounted-monthly'
        ];
        const s = ctx.state;
        const chosen = Compiler.enum({
            expr: ds.storeContextPrice,
            allowed,
            isAvailable: (v) => {
                switch (v) {
                    case 'min-full': return !!s.price.min.value;
                    case 'max-full': return !!s.price.max.value;
                    case 'min-full-monthly': return !!s.price.monthly.min.value;
                    case 'max-full-monthly': return !!s.price.monthly.max.value;
                    case 'min-discounted': return !!s.discountedPrice.min.value;
                    case 'max-discounted': return !!s.discountedPrice.max.value;
                    case 'min-discounted-monthly': return !!s.discountedPrice.monthly.min.value;
                    case 'max-discounted-monthly': return !!s.discountedPrice.monthly.max.value;
                }
            }
        });
        switch (chosen) {
            case 'min-full':
                el.innerHTML = s.price.min.fmt;
                return;
            case 'max-full':
                el.innerHTML = s.price.max.fmt;
                return;
            case 'min-full-monthly':
                el.innerHTML = s.price.monthly.min.fmt;
                return;
            case 'max-full-monthly':
                el.innerHTML = s.price.monthly.max.fmt;
                return;
            case 'min-discounted':
                el.innerHTML = s.discountedPrice.min.fmt;
                return;
            case 'max-discounted':
                el.innerHTML = s.discountedPrice.max.fmt;
                return;
            case 'min-discounted-monthly':
                el.innerHTML = s.discountedPrice.monthly.min.fmt;
                return;
            case 'max-discounted-monthly':
                el.innerHTML = s.discountedPrice.monthly.max.fmt;
                return;
        }
    }
};
//# sourceMappingURL=price.js.map
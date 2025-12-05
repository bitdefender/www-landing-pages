import { Compiler } from '../../dsl/compilers/index.js';
// Handles both data-store-discount (option-level) and data-store-context-discount (state-level)
export const handleDiscount = (el, ctx) => {
    const ds = el.dataset;
    // Option-level discount
    if (ds.storeDiscount && ctx.option) {
        const allowed = ['value', 'percentage', 'value-monthly', 'percentage-monthly'];
        const chosen = Compiler.enum({
            expr: ds.storeDiscount,
            allowed,
            isAvailable: (v) => {
                switch (v) {
                    case 'value':
                        return !!ctx.option.getDiscount({ symbol: false, percentage: false });
                    case 'percentage':
                        return !!ctx.option.getDiscount({ symbol: false, percentage: true });
                    case 'value-monthly':
                        return !!ctx.option.getDiscount({ symbol: false, percentage: false, monthly: true });
                    case 'percentage-monthly':
                        return !!ctx.option.getDiscount({ symbol: false, percentage: true, monthly: true });
                }
            }
        });
        switch (chosen) {
            case 'percentage':
                el.innerHTML = ctx.option.getDiscount({ percentage: true }).toString();
                return;
            case 'percentage-monthly':
                el.innerHTML = ctx.option.getDiscount({ percentage: true, monthly: true }).toString();
                return;
            case 'value':
                el.innerHTML = ctx.option.getDiscount({ percentage: false }).toString();
                return;
            case 'value-monthly':
                el.innerHTML = ctx.option.getDiscount({ percentage: false, monthly: true }).toString();
                return;
        }
    }
    // State-level discount
    if (ds.storeContextDiscount && ctx.state) {
        const allowed = [
            'min-value',
            'max-value',
            'min-percentage',
            'max-percentage',
            'min-value-monthly',
            'max-value-monthly',
            'min-percentage-monthly',
            'max-percentage-monthly'
        ];
        const s = ctx.state;
        const chosen = Compiler.enum({
            expr: ds.storeContextDiscount,
            allowed,
            isAvailable: (v) => {
                switch (v) {
                    case 'min-value': return !!s.discount.min.value;
                    case 'max-value': return !!s.discount.max.value;
                    case 'min-value-monthly': return !!s.discount.monthly.min.value;
                    case 'max-value-monthly': return !!s.discount.monthly.max.value;
                    case 'min-percentage': return !!s.discount.percentage.min.value;
                    case 'max-percentage': return !!s.discount.percentage.max.value;
                    case 'min-percentage-monthly': return !!s.discount.percentage.monthly.min.value;
                    case 'max-percentage-monthly': return !!s.discount.percentage.monthly.max.value;
                }
            }
        });
        switch (chosen) {
            case 'min-value':
                el.innerHTML = s.discount.min.fmt;
                return;
            case 'max-value':
                el.innerHTML = s.discount.max.fmt;
                return;
            case 'min-value-monthly':
                el.innerHTML = s.discount.monthly.min.fmt;
                return;
            case 'max-value-monthly':
                el.innerHTML = s.discount.monthly.max.fmt;
                return;
            case 'min-percentage':
                el.innerHTML = s.discount.percentage.min.fmt;
                return;
            case 'max-percentage':
                el.innerHTML = s.discount.percentage.max.fmt;
                return;
            case 'min-percentage-monthly':
                el.innerHTML = s.discount.percentage.monthly.min.fmt;
                return;
            case 'max-percentage-monthly':
                el.innerHTML = s.discount.percentage.monthly.max.fmt;
                return;
        }
    }
};
//# sourceMappingURL=discount.js.map
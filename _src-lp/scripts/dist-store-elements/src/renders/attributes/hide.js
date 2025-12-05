import { Compiler } from '../../dsl/compilers/index.js';
import { toDSLContext } from '../context.js';
export const handleHide = async (el, ctx) => {
    const ds = el.dataset;
    if (!ds.storeHide)
        return;
    const dslCtx = await toDSLContext(ctx);
    const hide = Compiler.boolean({ expr: ds.storeHide, ctx: dslCtx });
    const type = ds.storeHideType || 'display';
    if (hide) {
        if (type === 'opacity') {
            el.style.opacity = '0';
        }
        else if (type === 'visibility') {
            el.style.visibility = 'hidden';
        }
        else {
            el.style.display = 'none';
        }
    }
    else {
        if (type === 'opacity') {
            el.style.opacity = '';
        }
        else if (type === 'visibility') {
            el.style.visibility = '';
        }
        else {
            el.style.display = '';
        }
    }
};
//# sourceMappingURL=hide.js.map
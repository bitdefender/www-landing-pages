// Attributes that, when changed, should trigger a re-render of nodes.
// Shared across both contexts
export const OBS_ATTRS_COMMON = [
    'data-store-hide',
    'data-store-hide-type'
];
// Attributes affecting option-level rendering
export const OBS_ATTRS_OPTION = [
    'data-store-devices',
    'data-store-subscription',
    'data-store-text-single',
    'data-store-text-many',
    'data-store-subscription-type',
    'data-store-price',
    'data-store-discount',
    'data-store-buy-link',
    'data-store-trial-link'
];
// Attributes affecting state-level rendering
export const OBS_ATTRS_STATE = [
    'data-store-context-price',
    'data-store-context-discount'
];
// Combined set used when option-side also cares about state-driven attributes in markup
export const OBS_ATTRS_OPTION_PLUS_STATE = [
    ...OBS_ATTRS_OPTION,
    ...OBS_ATTRS_STATE,
    ...OBS_ATTRS_COMMON
];
//# sourceMappingURL=observe.js.map
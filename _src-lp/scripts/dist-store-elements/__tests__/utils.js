export function getComputedOptions(computedOptions) {
    if (!computedOptions)
        return [];
    return computedOptions
        ?.map(p => {
        return {
            id: p.getProduct().getId(),
            campaign: p.getProduct().getCampaign() || "",
            devices: p.getDevices(),
            subscription: p.getSubscription(),
            bundle: getComputedOptions(p.getBundle().map(b => b.option))
        };
    })
        .sort((a, b) => (a.id.localeCompare(b.id) ||
        a.campaign.localeCompare(b.campaign) ||
        (a.devices - b.devices) ||
        (a.subscription - b.subscription)));
}
//# sourceMappingURL=utils.js.map
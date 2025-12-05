export const formatSubscription = (subscription, format = "years", textSingular, textPlural) => {
    const years = subscription / 12;
    const months = subscription % 12;
    if (format === "years" && months === 0) {
        if (!textPlural || !textSingular) {
            return `${years}`;
        }
        return `${years} ${years === 1 ? textSingular : textPlural}`;
    }
    if (!textPlural || !textSingular) {
        return `${subscription}`;
    }
    return `${subscription} ${subscription === 1 ? textSingular : textPlural}`;
};
export const formatDevices = (devices, textSingular, textPlural) => {
    if (!textPlural || !textSingular) {
        return `${devices}`;
    }
    return `${devices} ${devices === 1 ? textSingular : textPlural}`;
};
//# sourceMappingURL=format.js.map
export const bs_nadrmMappings = {
    ok: true,
    json: async () => {
        const data = [];
        for (let devices = 1; devices <= 100; devices++) {
            for (let sub = 1; sub <= 3; sub++) {
                data.push({
                    fromDevices: devices,
                    fromSubscription: sub,
                    toDevices: devices,
                    toSubscription: sub * 12
                });
            }
        }
        return {
            total: data.length,
            offset: 0,
            limit: data.length,
            data,
            columns: [
                "fromDevices",
                "fromSubscription",
                "toDevices",
                "toSubscription"
            ],
            ":type": "sheet"
        };
    }
};
//# sourceMappingURL=bs_nadrm.js.map
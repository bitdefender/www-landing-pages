const data = [
    { from: "tsmd", to: "com.bitdefender.tsmd.v2" },
    { from: "smallbs", to: "smallbs" },
    { from: "bs_nadrm", to: "bs_nadrm" },
    { from: "bs_wadc", to: "bs_wadc" }
];
export const idMappings = {
    ok: true,
    json: async () => ({
        total: data.length,
        offset: 0,
        limit: data.length,
        data,
        columns: ["from", "to"],
        ":type": "sheet"
    })
};
//# sourceMappingURL=id-mappings.js.map
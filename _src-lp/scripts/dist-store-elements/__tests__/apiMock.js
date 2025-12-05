import { bs_nadrmMappings } from "./mappings/bs_nadrm.js";
import { bs_wadcMappings } from "./mappings/bs_wadc.js";
import { idMappings } from "./mappings/id-mappings.js";
import { smallbsMappings } from "./mappings/smallbs.js";
import { bs_nadrmProduct } from "./products/bs_nadrm.js";
import { bs_wadcProduct } from "./products/bs_wadc.js";
import { tsmdProduct as tsmdProductDe } from "./products/DE/tsmd.js";
import { psProduct } from "./products/ps.js";
import { smallbsProduct } from "./products/smallbs.js";
import { tsmdProduct } from "./products/tsmd.js";
import { vpnProduct } from "./products/vpn.js";
const parseFormData = (body) => {
    if (!(body instanceof FormData)) {
        return null;
    }
    const raw = body.get("data");
    if (typeof raw === "string") {
        try {
            return JSON.parse(raw);
        }
        catch {
            return null;
        }
    }
    return null;
};
export const apiMock = async (url, init) => {
    if (typeof url !== "string") {
        return {
            ok: true,
            json: async () => ({})
        };
    }
    //mapings
    if (url.includes("sheet=id-mappings"))
        return idMappings;
    if (url.includes("sheet=smallbs"))
        return smallbsMappings;
    if (url.includes("sheet=bs_wadc"))
        return bs_wadcMappings;
    if (url.includes("sheet=bs_nadrm"))
        return bs_nadrmMappings;
    //vlaicu api
    //en-us
    if (url.includes("com.bitdefender.tsmd.v2/locale/en-us"))
        return tsmdProduct;
    if (url.includes("com.bitdefender.vpn/locale/en-us"))
        return vpnProduct;
    if (url.includes("com.bitdefender.premiumsecurity.v2/locale/en-us"))
        return psProduct;
    //de-de
    if (url.includes("com.bitdefender.tsmd.v2/locale/de-de/campaign/BFMCWEB25"))
        return tsmdProductDe;
    //init api
    if (url.includes("site/Store/ajax?force_country=us")) {
        const { product_id } = parseFormData(init?.body) || {};
        if (product_id === "smallbs")
            return smallbsProduct;
        if (product_id === "bs_wadc")
            return bs_wadcProduct;
        if (product_id === "bs_nadrm")
            return bs_nadrmProduct;
    }
    return {
        ok: true,
        json: async () => ({})
    };
};
//# sourceMappingURL=apiMock.js.map
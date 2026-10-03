import { Constants } from '@repobit/dex-constants';
const w = window;
/** Fetches the visitor's country (lowercase), or null if the lookup fails. */
export const fetchGeoCountry = async () => {
    try {
        const response = await fetch(`${Constants.PUBLIC_URL_ORIGIN}/geoip`);
        if (!response.ok) {
            return null;
        }
        const country = await response.json();
        if (country.error_code) {
            return null;
        }
        return country['country'].toLowerCase();
    }
    catch {
        return null;
    }
};
/** Fetches the default locale for a country, falling back to en-us. */
export const fetchCountryLocale = async (country) => {
    try {
        const response = await fetch(`${Constants.WWW_ONLY_ORIGIN}/p-api/v1/countries/${country.toUpperCase()}/locales`);
        const locales = await response.json();
        return locales[0].locale.toLowerCase();
    }
    catch {
        return 'en-us';
    }
};
/** Starts the country and locale requests back to back, without waiting for anything else. */
export const startGeoLookup = () => {
    const country = fetchGeoCountry();
    const locale = country.then((code) => fetchCountryLocale(code ?? 'us'));
    return { country, locale };
};
/** Returns the lookup started by early-geo.ts, if the page loaded it. */
export const getEarlyGeo = () => w.BD?.earlyGeo;

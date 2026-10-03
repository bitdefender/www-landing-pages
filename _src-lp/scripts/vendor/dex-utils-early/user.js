import { Constants } from '@repobit/dex-constants';
import Cookies from './cookies.js';
import { fetchCountryLocale, fetchGeoCountry, getEarlyGeo } from './geo.js';
import UserAgent from './user-agent/index.js';
const w = window;
export default class User {
    _info = this.Initialise();
    _fingerprint = this.getFingerprint();
    _pageCountry;
    _country;
    _locale;
    constructor(pageCountry) {
        this._pageCountry = pageCountry;
        const earlyGeo = getEarlyGeo();
        this._country = this.getGeolocation(earlyGeo);
        this._locale = this.getUserLocale(earlyGeo);
    }
    async Initialise() {
        if (!Cookies.has(Constants.LOGIN_LOGGED_USER_EXPIRY_COOKIE_NAME)) {
            return null;
        }
        try {
            const userDataResponse = await fetch(`${Constants.LOGIN_URL_ORIGIN}/bin/login/userInfo.json`);
            return userDataResponse.ok ? (await userDataResponse.json()).result : null;
        }
        catch {
            return null;
        }
    }
    async getFingerprint() {
        // Try to grab the fingeprint from localstoraage
        const storageFingerprint = localStorage.getItem(Constants.FINGERPRINT_LOCAL_STORAGE_NAME);
        if (storageFingerprint) {
            return storageFingerprint;
        }
        // Try to grab fingerprint from login data
        const userInfo = await this._info;
        if (userInfo) {
            localStorage.setItem(Constants.FINGERPRINT_LOCAL_STORAGE_NAME, userInfo.fingerprint);
            return userInfo.fingerprint;
        }
        // Try to grab fingerprint from dummyPost (from user local antivirus instance)
        const fingerprintNotExist = Cookies.has(Constants.NO_FINGERPRINT_COOKIE_NAME);
        if (!fingerprintNotExist && UserAgent.isWindows) {
            try {
                const fingerprintReq = await fetch(`${Constants.WWW_ONLY_ORIGIN}/site/Main/dummyPost?${Math.random()}`, {
                    method: 'POST',
                    headers: {
                        'Content-type': 'application/x-www-form-urlencoded',
                        'Pragma': 'no-cache',
                        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                        'Expires': 'Tue, 01 Jan 1971 02:00:00 GMT',
                        'BDUS_A312C09A2666456D9F2B2AA5D6B463D6': 'check.bitdefender'
                    }
                });
                if (fingerprintReq.ok && fingerprintReq.headers.has(Constants.FINGERPRINT_HEADER)) {
                    const fingerprint = fingerprintReq.headers.get(Constants.FINGERPRINT_HEADER);
                    localStorage.setItem(Constants.FINGERPRINT_LOCAL_STORAGE_NAME, fingerprint);
                    return fingerprint;
                }
                else {
                    Cookies.set(Constants.NO_FINGERPRINT_COOKIE_NAME, 'true', { expires: 1 });
                }
            }
            catch { /* empty */ }
        }
        return null;
    }
    /**
     * Handling User Geolocation
     * This wil fetch the user's country, reusing the early lookup if the page started one
    */
    async getGeolocation(earlyGeo) {
        const country = await (earlyGeo?.country ?? fetchGeoCountry());
        return country || this._pageCountry || 'us';
    }
    /** Getting the User's Locale */
    async getUserLocale(earlyGeo) {
        const userCountry = await this._country;
        // The early locale was resolved for (country ?? 'us'); reuse it unless a pageCountry fallback changed the country
        if (earlyGeo && userCountry === ((await earlyGeo.country) ?? 'us')) {
            return earlyGeo.locale;
        }
        return fetchCountryLocale(userCountry);
    }
    /** attempt to log the user in.
     * You can access it from the mega menu if it is imported.
     * If the login fails, this operation will not be permited in the same tab session. */
    async login() {
        const loginAttempt = sessionStorage.getItem(Constants.LOGIN_ATTEMPT_SESSION_STORAGE_KEY);
        const userData = await this._info;
        const userLoggedInExpirationDate = Number(Cookies.get(Constants.LOGIN_LOGGED_USER_EXPIRY_COOKIE_NAME)) || 0;
        if (!loginAttempt && !userData
            && userLoggedInExpirationDate > Date.now()) {
            sessionStorage.setItem(Constants.LOGIN_ATTEMPT_SESSION_STORAGE_KEY, 'true');
            const loginEndpointUrl = new URL(`${Constants.LOGIN_URL_ORIGIN}${Constants.LOGIN_ENDPOINT}`);
            loginEndpointUrl.searchParams.set('origin', `${window.location.pathname}${window.location.search}`);
            loginEndpointUrl.searchParams.set('adobe_mc_ref', document.referrer);
            // variable which ensures no Page Loaded Event sent to analytics on window.location.href change
            w.BD.loginAttempted = true;
            window.location.replace(loginEndpointUrl.href);
        }
    }
    get info() {
        return this._info;
    }
    get fingerprint() {
        return this._fingerprint;
    }
    get country() {
        return this._country;
    }
    get locale() {
        return this._locale;
    }
}
w.BD = w.BD || {};

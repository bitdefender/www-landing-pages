import Cookie from "js-cookie";
const Cookies = Cookie;
Cookies.has = function (name) {
    const cookieChecked = this.get(name);
    if (cookieChecked !== '' && typeof cookieChecked !== 'undefined') {
        return true;
    }
    return false;
};
export default Cookies;

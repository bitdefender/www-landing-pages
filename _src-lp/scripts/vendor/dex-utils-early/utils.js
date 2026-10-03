import { Constants } from "@repobit/dex-constants";
export function loadScript(src, attrs = {}) {
    return new Promise((resolve, reject) => {
        if (!document.querySelector(`head > script[src="${src}"]`)) {
            const script = document.createElement('script');
            script.src = src;
            for (const attr in attrs) {
                script.setAttribute(attr, attrs[attr]);
            }
            script.onload = () => resolve();
            script.onerror = reject;
            document.head.append(script);
        }
        else {
            resolve();
        }
    });
}
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function throttle(callback, delay = 250) {
    let shouldWait = false;
    return (...args) => {
        if (shouldWait) {
            return;
        }
        shouldWait = true;
        setTimeout(() => {
            callback(...args);
            shouldWait = false;
        }, delay);
    };
}
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function debounce(callback, delay = 250, immediate = false) {
    let timeout = null;
    return (...args) => {
        const later = () => {
            timeout = null;
            if (!immediate) {
                callback(...args);
            }
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, delay);
        if (callNow) {
            callback(...args);
        }
    };
}
export async function getUserVisitorId() {
    try {
        const uuidFetchCall = await fetch(`${Constants.PUBLIC_URL_ORIGIN}/bduuid`);
        const uuidFetchData = await uuidFetchCall.json();
        return uuidFetchData.bd_visitor_id;
    }
    catch {
        return '';
    }
}

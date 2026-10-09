import { targetPromise } from './target.js';
import { getMetadata } from './lib-franklin.js';
import userPromise from './user.js';

const target = await targetPromise;
const user = await userPromise;

export const IANA_BY_REGION_MAP = new Map([
  [3, { locale: 'en-GB', label: 'united kingdom' }],
  [4, { locale: 'au-AU', label: 'australia' }],
  [5, { locale: 'de-DE', label: 'germany' }],
  [6, { locale: 'ro-RO', label: 'romania' }],
  [7, { locale: 'es-ES', label: 'spain' }],
  [8, { locale: 'en-US', label: 'com' }],
  [9, { locale: 'it-IT', label: 'italy' }],
  [10, { locale: 'en-CA', label: 'canada' }],
  [12, { locale: 'pt-PT', label: 'portugal' }],
  [13, { locale: 'br-BR', label: 'brazil' }],
  [14, { locale: 'fr-FR', label: 'france' }],
  [15, { locale: 'en-GB', label: 'united kingdom' }],
  [16, { locale: 'en-US', label: 'rest of the world EU countries' }],
  [17, { locale: 'de-CH', label: 'germany-switzerland' }],
  [19, { locale: 'en-ZA', label: 'en south africa' }],
  [22, { locale: 'nl-NL', label: 'netherlands' }],
  [24, { locale: 'en-VN', label: 'en vietnam' }],
  [20, { locale: 'en-MX', label: 'en es mexico' }],
  [21, { locale: 'en-CO', label: 'en es columbia' }],
  [25, { locale: 'en-SG', label: 'en singapore' }],
  [26, { locale: 'en-SE', label: 'en sweden' }],
  [27, { locale: 'en-DK', label: 'en denmark' }],
  [28, { locale: 'en-HU', label: 'en hungary' }],
  [29, { locale: 'en-BG', label: 'en bulgaria' }],
  [30, { locale: 'en-HR', label: 'en croatia' }],
  [31, { locale: 'en-NO', label: 'en norway' }],
  [32, { locale: 'en-MD', label: 'en moldova' }],
  [33, { locale: 'en-RS', label: 'en serbia' }],
  [34, { locale: 'en-RU', label: 'en russia' }],
  [35, { locale: 'en-EG', label: 'en egypt' }],
  [36, { locale: 'en-SA', label: 'en saudi arabia' }],
  [37, { locale: 'fr-DZ', label: 'en Algeria' }],
  [38, { locale: 'en-AE', label: 'en united arab emirates' }],
  [39, { locale: 'en-PS', label: 'en palestinia' }],
  [40, { locale: 'en-CN', label: 'en china' }],
  [41, { locale: 'en-HK', label: 'en hong kong' }],
  [42, { locale: 'en-CK', label: 'Cook Islands' }],
  [43, { locale: 'en-KE', label: 'en kenya' }],
  [44, { locale: 'en-NG', label: 'en nigeria' }],
  [45, { locale: 'fr-TN', label: 'en Tunisia' }],
  [46, { locale: 'en-PL', label: 'en poland' }],
  [47, { locale: 'en-CZ', label: 'en Czech' }],
  [48, { locale: 'es-VE', label: 'en Venezuela' }],
  [49, { locale: 'en-TR', label: 'en turkey' }],
  [50, { locale: 'en-ID', label: 'en Indonesia' }],
  [51, { locale: 'en-PH', label: 'en Philippines' }],
  [52, { locale: 'en-TW', label: 'en taiwan' }],
  [53, { locale: 'en-UA', label: 'en Ukraine' }],
  [54, { locale: 'es-CL', label: 'en Chile' }],
  [55, { locale: 'en-MY', label: 'en Malaysia' }],
  [56, { locale: 'es-AR', label: 'en Argentina' }],
  [57, { locale: 'es-PE', label: 'en Peru' }],
  [59, { locale: 'hr-HR', label: 'Croatia' }],
  [60, { locale: 'ma-MA', label: 'Morocco' }],
  [61, { locale: 'pk-PK', label: 'Pakistan' }],
  [62, { locale: 'bo-BO', label: 'Bolivia' }],
  [63, { locale: 'do-DO', label: 'Dominican Republic' }],
  [64, { locale: 'kw-KW', label: 'Kuwait' }],
  [65, { locale: 'jo-JO', label: 'Jordan' }],
  [66, { locale: 'th-TH', label: 'Thailand' }],
  [67, { locale: 'en-BD', label: 'en Bangladesh' }],
  [68, { locale: 'en-LK', label: 'en Sri Lanka' }],
  [69, { locale: 'en-PY', label: 'en Paraguay' }],
  [70, { locale: 'en-UY', label: 'en Uruguay' }],
  [72, { locale: 'en-JP', label: 'en Japan' }],
]);

/**
 * Returns the instance name based on the hostname
 * @returns {String}
 */
export function getInstance() {
  const hostToInstance = {
    'bitdefender.com': 'prod',
    'hlx.page': 'stage',
    'hlx.live': 'stage',
  };

  // eslint-disable-next-line no-restricted-syntax
  for (const [host, inst] of Object.entries(hostToInstance)) {
    if (window.location.hostname.includes(host)) return inst;
  }

  return 'dev';
}

/**
 * Returns the geoIP country code. Very costly on performance, use with caution.
 * @returns {String}
 */

/**
let cachedIpCountry;
export const getIpCountry = async () => {
  if (cachedIpCountry) {
    return cachedIpCountry;
  }

  try {
    const response = await fetch('https://pages.bitdefender.com/ip.json');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      const ipCountry = response.headers.get('X-Cf-Ipcountry').toLowerCase();

      if (ipCountry) {
        cachedIpCountry = ipCountry;
        return ipCountry;
      }
      throw new Error('X-Cf-Ipcountry header not found');
    }
  } catch (error) {
    console.log(`There has been a problem with your fetch operation: ${error.message}`);
    return null;
  }
};
*/

export const GLOBAL_EVENTS = {
  ADOBE_MC_LOADED: 'adobe_mc::loaded',
  PAGE_LOADED: 'page::loaded',
  COUNTER_LOADED: 'counter::loaded',
  GEOIPINFO_LOADED: 'geoipinfo::loaded',
};

const LOCALISATIONS = {
  au: 'en-au',
  be: 'en-us',
  br: 'pt-br',
  de: 'de-de',
  en: 'en-us',
  es: 'es-es',
  fr: 'fr-fr',
  it: 'it-it',
  nl: 'nl-nl',
  pt: 'pt-pt',
  ro: 'ro-ro',
  se: 'sv-se',
  uk: 'en-gb',
  'zh-tw': 'zh-tw',
};
const DEFAULT_LANGUAGE = 'en';

// add new script file
export function addScript(src, data = {}, loadStrategy = undefined, onLoadCallback = undefined, onErrorCallback = undefined, type = undefined) {
  const s = document.createElement('script');

  s.setAttribute('src', src);

  if (loadStrategy) {
    s.setAttribute(loadStrategy, true);
  }

  if (type) {
    s.setAttribute('type', type);
  }

  if (typeof data === 'object' && data !== null) {
    // eslint-disable-next-line no-restricted-syntax
    for (const key in data) {
      // eslint-disable-next-line no-prototype-builtins
      if (data.hasOwnProperty(key)) {
        s.dataset[key] = data[key];
      }
    }
  }

  if (onLoadCallback) {
    s.onload = onLoadCallback;
  }

  if (onErrorCallback) {
    s.onerror = onErrorCallback;
  }

  document.body.appendChild(s);
}

export function getLocale(lang) {
  return LOCALISATIONS[lang] || LOCALISATIONS[DEFAULT_LANGUAGE];
}

export function getDefaultSection() {
  const currentPathUrl = window.location.pathname;
  return currentPathUrl.indexOf('/business/') !== -1 ? 'business' : 'consumer';
}

export function appendAdobeMcLinks(selector) {
  try {
    const wrapperSelector = document.querySelector(selector);
    const hrefSelector = '[href*=".bitdefender."]';
    const currentHostname = window.location.hostname;

    wrapperSelector.querySelectorAll(hrefSelector).forEach(async (link) => {
      const isAdobeMcAlreadyAdded = link.href.includes('adobe_mc');
      if (isAdobeMcAlreadyAdded) {
        return;
      }

      const linkHostname = new URL(link.href, window.location.origin).hostname;

      // daca host-ul este diferit, add adobe_mc
      if (linkHostname !== currentHostname) {
        const destinationURLWithVisitorIDs = await target.appendVisitorIDsTo(link.href);
        link.href = destinationURLWithVisitorIDs.replace(/MCAID%3D.*%7CMCORGID/, 'MCAID%3D%7CMCORGID');
      }
    });
  } catch (e) {
    console.error(e);
  }
}

export function adobeMcAppendVisitorId(selector) {
  // https://experienceleague.adobe.com/docs/id-service/using/id-service-api/methods/appendvisitorid.html?lang=en

  if (window.ADOBE_MC_EVENT_LOADED) {
    appendAdobeMcLinks(selector);
  } else {
    document.addEventListener(GLOBAL_EVENTS.ADOBE_MC_LOADED, () => {
      appendAdobeMcLinks(selector);
    });
  }
}

// DEX-17703 - replacing VAT INFO text for en regions
export function updateVATinfo(countryCode, selector) {
  const skipVATinfo = getMetadata('skip-vatinfo-logic');
  if ((skipVATinfo && skipVATinfo === 'true') || getDefaultSection() === 'business') {
    return;
  }

  const vat2replace = [
    'Taxes not included',
    'Sales tax included',
    'Plus applicable sales tax',
    'Tax included',
  ];
  const taxText = countryCode === 8 ? 'Plus applicable sales tax' : 'Sales tax included';
  const containers = new Set([...document.querySelectorAll(selector)]
    .map((element) => element.closest('[data-testid="prod_box"], .prices_box, .prod_box, .hasProds'))
    .filter(Boolean));

  // only text nodes are changed, so store nodes and their renders are left untouched
  containers.forEach((container) => {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const text = vat2replace.find((vatText) => node.textContent.includes(vatText));
      if (text && text !== taxText) node.textContent = node.textContent.replace(text, taxText);
    }
  });
}

export function getDatasetFromSection(block) {
  const parentSelector = block.closest('.section');
  return parentSelector.dataset;
}

export function getLocalizedResourceUrl(resourceName) {
  const { pathname } = window.location;
  const lastCharFromUrl = pathname.charAt(pathname.length - 1);
  const lpIsInFolder = lastCharFromUrl === '/';

  let pathnameAsArray = pathname.split('/');

  if (lpIsInFolder) {
    return `${pathnameAsArray.join('/')}${resourceName}`;
  }

  const basePathIndex = pathname.startsWith('/pages/') ? 3 : 2;
  pathnameAsArray = pathnameAsArray.slice(0, basePathIndex + 1); // "/consumer/en";

  return `${pathnameAsArray.join('/')}/${resourceName}`;
}

/**
 * Image URL for a CSS background. EDS media_ images keep the resize/WebP params;
 * without them the CDN serves the original upload. Other URLs (SVG, external) are returned
 * without their query string, as before.
 * @param {String} src - img src or image URL from metadata
 */
export function getBackgroundImageUrl(src) {
  if (!src) return src;
  const [path] = src.split('?');
  if (!/\/media_[^/]+\.(jpe?g|png)$/i.test(path)) return path;
  return `${path}?width=2000&format=webply&optimize=medium`;
}

export function generateUuidv4() {
  // eslint-disable-next-line no-bitwise,no-mixed-operators
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
}

export function getDefaultBaseUrl() {
  return 'https://www.bitdefender.com/';
}

/**
 * Get cookie
 * @param {String} name - cookie name
 */
export function getCookie(name) {
  const cookie = {};
  document.cookie.split(';').forEach((el) => {
    const [key, value] = el.split('=');
    cookie[key.trim()] = value;
  });
  return cookie[name];
}

/**
 * Fetches geoip data from the /geoip endpoint and dispatches a custom event with the received information.
 *
 * This function makes an asynchronous call to the /geoip endpoint. If the call is successful, it parses
 * the JSON response and dispatches a custom event named 'geoipinfo' with the received data. In case of an error
 * during the fetch process, it logs the error to the console.
 */
export async function fetchGeoIP() {
  try {
    window.geoip = await user.country;

    const event = new CustomEvent(GLOBAL_EVENTS.GEOIPINFO_LOADED, { detail: window.geoip });
    window.dispatchEvent(event);
  } catch (error) {
    console.error('Failed to fetch geoip data:', error);
  }
}

export function getOperatingSystem(userAgent) {
  const systems = [
    ['Windows NT 10.0', 'Windows 10'],
    ['Windows NT 6.2', 'Windows 8'],
    ['Windows NT 6.1', 'Windows 7'],
    ['Windows NT 6.0', 'Windows Vista'],
    ['Windows NT 5.1', 'Windows XP'],
    ['Windows NT 5.0', 'Windows 2000'],
    ['X11', 'X11'],
    ['Linux', 'Linux'],
    ['Android', 'Android'],
    ['iPhone', 'iOS'],
    ['iPod', 'iOS'],
    ['iPad', 'iOS'],
    ['Mac', 'MacOS'],
  ];

  return systems.find(([substr]) => userAgent.includes(substr))?.[1] || 'Unknown';
}

export function openUrlForOs(urlMacos, urlWindows, urlAndroid, urlIos) {
  // Get user's operating system
  const { userAgent } = navigator;
  const userOS = getOperatingSystem(userAgent);

  // Open the appropriate URL based on the OS
  let openUrl;
  switch (userOS) {
    case 'MacOS':
      openUrl = urlMacos;
      break;
    case 'Windows 10':
    case 'Windows 8':
    case 'Windows 7':
    case 'Windows Vista':
    case 'Windows XP':
    case 'Windows 2000':
      openUrl = urlWindows;
      break;
    case 'Android':
      openUrl = urlAndroid;
      break;
    case 'iOS':
      openUrl = urlIos;
      break;
    default:
      openUrl = null; // Fallback or 'Unknown' case
  }

  if (openUrl) {
    window.open(openUrl, '_self');
  }
}

// Debounce function to limit the rate at which a function is executed.
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Registry of active matchers, so repeated calls for the same node + selector
// re-run the existing matcher instead of stacking new observers and listeners.
const dimensionMatchers = new WeakMap();

// Keeps the given dimension of all elements matching a selector in sync.
// All triggers (DOM changes, resizes, font loading) are batched into a single
// microtask, which runs before the next paint and, unlike requestAnimationFrame,
// also in hidden tabs and headless screenshots. The reset + re-apply happens in
// one synchronous pass, so the ResizeObserver only fires on real size changes
// instead of feeding back into itself and causing layout shifts.
function matchDimension(targetNode, selector, { property, measure, isEnabled }) {
  if (!targetNode) return;

  let nodeMatchers = dimensionMatchers.get(targetNode);
  if (!nodeMatchers) {
    nodeMatchers = new Map();
    dimensionMatchers.set(targetNode, nodeMatchers);
  }

  const key = `${property}|${selector}`;
  const existingMatcher = nodeMatchers.get(key);
  if (existingMatcher) {
    existingMatcher.isEnabled = isEnabled;
    existingMatcher.schedule();
    return;
  }

  const matcher = { isEnabled };
  const observedElements = new Set();
  let isScheduled = false;

  const adjust = () => {
    isScheduled = false;
    const elements = Array.from(targetNode.querySelectorAll(selector));

    // reset, measure and apply in one pass, so the reset is never painted
    elements.forEach((element) => {
      element.style[property] = '';
    });

    let newValue = '';
    if (matcher.isEnabled() && elements.length) {
      newValue = `${Math.max(...elements.map(measure))}px`;
    }

    elements.forEach((element) => {
      element.style[property] = newValue;
    });
  };

  const resizeObserver = new ResizeObserver(() => matcher.schedule());

  const observeElements = () => {
    targetNode.querySelectorAll(selector).forEach((element) => {
      if (observedElements.has(element)) return;
      observedElements.add(element);
      resizeObserver.observe(element);
    });
  };

  matcher.schedule = () => {
    if (isScheduled) return;
    isScheduled = true;
    queueMicrotask(adjust);
  };

  const mutationObserver = new MutationObserver(() => {
    observeElements();
    matcher.schedule();
  });
  mutationObserver.observe(targetNode, { childList: true, characterData: true, subtree: true });

  window.addEventListener('resize', matcher.schedule);
  // text that shrinks after a font swap doesn't trigger the ResizeObserver,
  // because the element is held by its min-height / min-width
  document.fonts?.ready.then(matcher.schedule);
  window.addEventListener('load', matcher.schedule, { once: true });

  nodeMatchers.set(key, matcher);
  observeElements();
  adjust();
}

// General function to match the height of elements based on a selector
export async function matchHeights(targetNode, selector, onMobile = undefined) {
  matchDimension(targetNode, selector, {
    property: 'minHeight',
    measure: (element) => element.offsetHeight,
    isEnabled: () => onMobile || window.innerWidth >= 768,
  });
}

// General function to match the width of elements based on a selector
export async function matchWidths(targetNode, selector, windowMaxInnerWidth = 768) {
  matchDimension(targetNode, selector, {
    property: 'minWidth',
    measure: (element) => element.offsetWidth,
    isEnabled: () => window.innerWidth >= windowMaxInnerWidth,
  });
}

/**
 * /**
 * @typedef {{
 *  auds: string,
 *  [key: string]: string
 * }} CdpData
 *
 * @param {string} mcID
 * @returns {Promise<CdpData>}
*/
export async function getCdpData(mcID) {
  try {
    const cdpDataCall = await fetch(`https://www.bitdefender.com/cdp/${mcID}`);

    /** @type {{auds: string[], mdl: {key: string, value: string}[], ub: any[] vid: string}} */
    const receivedCdpData = await cdpDataCall.json();
    let cdpData = {
      auds: receivedCdpData?.auds[0] || '',
    };

    if (receivedCdpData.mdl) {
      cdpData = receivedCdpData?.mdl.reduce((acc, mdlValue) => {
        acc[mdlValue.key] = mdlValue.value;
        return acc;
      }, cdpData);
    }

    window.adobeDataLayer.push({
      event: 'cdp data',
      parameters: cdpData,
    });

    return cdpData;
  } catch (e) {
    console.warn(e);
  }

  return {};
}

let isRendering = false;
let widgetExecuting = false;
export function renderTurnstile(containerId, { invisible = false } = {}) {
  if (isRendering) {
    return Promise.reject(new Error('Turnstile is already rendering.'));
  }

  isRendering = true;

  return new Promise((resolve, reject) => {
    function finish(error, result = null) {
      isRendering = false;
      widgetExecuting = false;
      if (error) reject(error);
      else resolve(result);
    }

    function renderWidget() {
      if (!window.turnstile) {
        return finish(new Error('Turnstile not loaded.'));
      }

      const container = document.getElementById(containerId);
      if (!container) {
        return finish(new Error(`Container "${containerId}" not found.`));
      }

      // Clear previous widget
      container.innerHTML = '';

      const widgetId = window.turnstile.render(container, {
        sitekey: '0x4AAAAAABkTzSd63P7J-Tl_',
        size: invisible ? 'compact' : 'normal',
        callback: (token) => {
          widgetExecuting = false;

          if (!invisible) window.latestVisibleToken = token;
          if (!token) return finish(new Error('Token missing.'));
          return finish(null, { widgetId, token });
        },
        'error-callback': () => {
          finish(new Error('Turnstile error during execution.'));
        },
        'expired-callback': () => {
          finish(new Error('Turnstile token expired.'));
        },
      });

      if (invisible) {
        if (!widgetExecuting) {
          widgetExecuting = true;

          try {
            window.turnstile.execute(widgetId);
          } catch (err) {
            window.turnstile.reset(widgetId);
            window.turnstile.execute(widgetId);
          }
        }
      } else {
        finish(null, { widgetId });
      }

      return undefined;
    }

    if (window.turnstile) {
      renderWidget();
    } else {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback';
      script.async = true;
      script.defer = true;
      window.onloadTurnstileCallback = renderWidget;
      document.head.appendChild(script);
    }
  });
}

export async function submitWithTurnstile({
  widgetId,
  data,
  fileName,
  successCallback = null,
  errorCallback = null,
}) {
  let ENDPOINT = 'https://stage.bitdefender.com/form';
  if (window.location.hostname.startsWith('www.')) {
    ENDPOINT = ENDPOINT.replace('stage.', 'www.');
  }

  try {
    if (!window.turnstile || typeof window.turnstile.getResponse !== 'function') {
      throw new Error('Turnstile is not loaded.');
    }

    const token = window.turnstile.getResponse(widgetId);
    if (!token || token.length < 10) {
      throw new Error('Turnstile token is missing or invalid. Please complete the challenge.');
    }

    const requestData = {
      file: `/sites/common/formdata/${fileName}.xlsx`,
      table: 'Table1',
      row: { ...data },
      token,
    };

    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData),
    });

    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}`);
    }

    if (typeof successCallback === 'function') successCallback();

    window.turnstile.reset(widgetId);
  } catch (err) {
    if (typeof errorCallback === 'function') errorCallback(err);
  }
}

/**
 * Moves all of element's children into wrapper, then appends wrapper to element.
 * @param {HTMLElement} element
 * @param {HTMLElement} wrapper
 * @returns {HTMLElement} wrapper
 */
const wrapChildren = (element, wrapper) => {
  while (element.firstChild) {
    wrapper.appendChild(element.firstChild);
  }

  element.appendChild(wrapper);
  return wrapper;
};

/**
 * @param {HTMLElement} element
 * @param {object} storeProperties
 * @param {number} storeProperties.devices
 * @param {number} storeProperties.subscription
 * @param {string} storeProperties.storeEvent
 * @returns {HTMLElement|undefined} the created bd-option
 * @summary
 * Modifies element into the following structure:
 * ```html
 * <bd-option>
 *   initial element's children
 * </bd-option>
 * ```
 */
export const wrapChildrenWithOption = (element, {
  devices,
  subscription,
  storeEvent = '',
}) => {
  if (!element || element.firstElementChild?.matches('bd-option')) {
    return undefined;
  }

  const option = document.createElement('bd-option');
  option.setAttribute('devices', devices?.trim());
  option.setAttribute('subscription', subscription?.trim());
  if (storeEvent) {
    option.setAttribute('data-layer-event', storeEvent);
  }

  return wrapChildren(element, option);
};

/**
 * @param {HTMLElement} element
 * @param {object} storeProperties
 * @param {string} storeProperties.productId
 * @param {number} storeProperties.devices
 * @param {number} storeProperties.subscription
 * @param {string} storeProperties.storeEvent
 * @returns {HTMLElement|undefined} the created bd-product
 * @summary
 * Modifies element into the following structure:
 * ```html
 * <bd-product>
 *   <bd-option>
 *     initial element's children
 *   </bd-option>
 * </bd-product>
 * ```
 */
export const wrapChildrenWithProduct = (element, {
  productId,
  devices,
  subscription,
  storeEvent = '',
}) => {
  if (!element || element.firstElementChild?.matches('bd-product')) {
    return undefined;
  }

  wrapChildrenWithOption(element, { devices, subscription, storeEvent });

  const product = document.createElement('bd-product');
  product.setAttribute('product-id', productId?.trim());

  return wrapChildren(element, product);
};

/**
 * @param {HTMLElement} element
 * @param {object} storeProperties
 * @param {string} storeProperties.productId
 * @param {number} storeProperties.devices
 * @param {number} storeProperties.subscription
 * @param {boolean} storeProperties.ignoreEventsParent
 * @param {string} storeProperties.storeEvent
 * @summary
 * Modifies element into the following structure:
 * ```html
 * <bd-context>
 *   <bd-product>
 *     <bd-option>
 *       initial element's children
 *     </bd-option>
 *   </bd-product>
 * </bd-context>
 * ```
 */
export const wrapChildrenWithStoreContext = (element, {
  productId,
  devices,
  subscription,
  ignoreEventsParent = false,
  storeEvent = '',
}) => {
  if (!element || element.firstElementChild?.matches('bd-context')) {
    return;
  }

  wrapChildrenWithProduct(element, {
    productId, devices, subscription, storeEvent,
  });

  const context = document.createElement('bd-context');
  if (ignoreEventsParent) {
    context.setAttribute('ignore-events-parent', '');
  }

  wrapChildren(element, context);
};

/**
 * Legacy product aliases still used in content
 * @param {string} name
 * @returns {string}
 */
export function productAliases(name) {
  let newName = name.trim();
  if (newName === 'elite') {
    newName = 'elite_1000';
  } else if (newName === 'bs') {
    newName = 'bus-security';
  }

  return newName;
}

/**
 * Trial duration as keyed in triallinks.json ('30 days').
 * Falls back to the page's `trialbuylinks` metadata, which turns every buy link into a trial link.
 * @param {string} [trialPeriod] e.g. '30' or '30 days'
 * @returns {string} '' when there is no trial
 */
export function getTrialDuration(trialPeriod = '') {
  const days = parseInt(trialPeriod || getMetadata('trialbuylinks'), 10);
  return days ? `${days} days` : '';
}

/**
 * Parses an authored product, e.g. `tsmd/5/1` or `tsmd/5/1/30`
 * (alias / devices / years / optional trial period).
 * Devices and years are passed to the store as authored, the store maps them to vlaicu options.
 * @param {string} productString
 * @returns {{productId: string, devices: string, subscription: string, trialDuration: string}}
 */
export function parseStoreProduct(productString = '') {
  const [alias = '', devices = '', subscription = '', trialPeriod = ''] = productString
    .split('/')
    .map((part) => part.trim());

  return {
    productId: productAliases(alias),
    devices,
    subscription,
    trialDuration: getTrialDuration(trialPeriod),
  };
}

/**
 * Max discount of all the products on the page, rendered by the root bd-context.
 * @param {string} [tag]
 * @returns {string}
 */
export function maxDiscountHtml(tag = 'span') {
  return `<${tag} class="max-discount" data-store-render data-store-context-discount="max-percentage"></${tag}>`;
}

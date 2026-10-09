import Launch from '@repobit/dex-launch';
import { AdobeDataLayerService, PageLoadedEvent, ProductLoadedEvent } from '@repobit/dex-data-layer';
import {
  registerActionNodes,
  registerContextNodes,
  registerRenderNodes,
} from '@repobit/dex-store-elements';
import { targetPromise, getDefaultLanguage, getPageExperimentKey } from './target.js';
// import { VisitorIdEvent, AdobeDataLayerService } from '@repobit/dex-data-layer';
import pagePromise from './page.js';
import {
  sampleRUM,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
  getMetadata,
  decorateTags,
} from './lib-franklin.js';
import {
  sendAnalyticsPageEvent, sendAnalyticsUserInfo, sendAnalyticsPageLoadedEvent,
  sendTrialDownloadedEvent,
  sendAnalyticsErrorEvent,
} from './adobeDataLayer.js';
import {
  addScript,
  GLOBAL_EVENTS,
  adobeMcAppendVisitorId,
  getInstance,
  getTrialDuration,
  parseStoreProduct,
  updateVATinfo,
  wrapChildrenWithProduct,
} from './utils.js';
import store from './store.js';

const page = await pagePromise;
const target = await targetPromise;
const DEFAULT_LANGUAGE = getDefaultLanguage();
window.DEFAULT_LANGUAGE = DEFAULT_LANGUAGE;
window.ADOBE_MC_EVENT_LOADED = false;

export { productAliases } from './utils.js';

export function productAliasesNames(name) {
  let newName = name.trim();
  if (newName === 'ps_f') {
    newName = 'Bitdefender Premium Security Family';
  } else if (newName === 'ps_i') {
    newName = 'Bitdefender Premium Security Individual';
  } else if (newName === 'ts_i') {
    newName = 'Bitdefender Total Security Individual';
  } else if (newName === 'ts_f') {
    newName = 'Bitdefender Total Security Family';
  } else if (newName === 'us_i') {
    newName = 'Bitdefender Ultimate Security Individual';
  } else if (newName === 'us_f') {
    newName = 'Bitdefender Ultimate Security Family';
  } else if (newName === 'us_pf') {
    newName = 'Bitdefender Ultimate Security Plus Family Standard';
  } else if (newName === 'us_pfe') {
    newName = 'Bitdefender Ultimate Security Plus Family Extended';
  } else if (newName === 'av') {
    newName = 'Bitdefender Antivirus Plus Multiplatform';
  } else if (newName === 'avpm') {
    newName = 'Bitdefender Antivirus Plus';
  } else if (newName === 'is') {
    newName = 'Bitdefender Internet Security';
  } else if (newName === 'tsmd') {
    newName = 'Bitdefender Total Security';
  }

  return newName;
}

// TODO: use the function from adobeDataLayer.js
export function getParam(param) {
  const gUrlParams = {};
  try {
    (() => {
      let e;
      const a = /\+/g;
      const r = /([^&=]+)=?([^&]*)/g;
      const d = (s) => decodeURIComponent(s.replace(a, ' '));
      const q = window.location.search.substring(1);

      // eslint-disable-next-line no-cond-assign
      while (e = r.exec(q)) gUrlParams[d(e[1])] = d(e[2]);
    })();

    if (typeof gUrlParams[param] || gUrlParams[param] !== '') {
      return gUrlParams[param];
    }
    return false;
  } catch (ex) { return false; }
}

const LCP_BLOCKS = ['banner', 'b-banner', 'c-banner']; // add your LCP blocks to the list

/**
 * Word/SharePoint turns in-page anchors like "#summary" into "https://#summary".
 * Rewrite them back to relative anchors so they work on any page/locale.
 * @param {Element} main The container element
 */
export function decorateAnchorLinks(main) {
  main.querySelectorAll('a[href^="http://#"], a[href^="https://#"]').forEach((link) => {
    link.setAttribute('href', link.getAttribute('href').replace(/^https?:\/\//, ''));
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  decorateAnchorLinks(main);
  // hopefully forward compatible button decoration
  decorateButtons(main);
  // decorateIcons2(main);
  decorateIcons(main);
  decorateTags(main);
  decorateSections(main);
  decorateBlocks(main);
}

export async function createModal(path, template) {
  const modalContainer = document.createElement('div');
  modalContainer.classList.add('modal-container');

  const modalContent = document.createElement('div');
  modalContent.classList.add('modal-content');

  // this makes fragments work on the www.bitdefender.com/pages domain
  if (path.includes('www.bitdefender.com') && !path.includes('www.bitdefender.com/pages')) {
    // eslint-disable-next-line no-param-reassign
    path = path.replace('www.bitdefender.com', 'www.bitdefender.com/pages');

    // sometime the path might have a query string,
    // we need to remove it in order to get the correct path,
    // so the modal content can be fetched
    // eslint-disable-next-line no-param-reassign
    path = path.split('?')[0];
  }

  // fetch modal content
  const resp = await fetch(`${path}.plain.html`);

  if (!resp.ok) {
    // eslint-disable-next-line no-console
    console.error(`modal url cannot be loaded: ${path}`);
    return modalContainer;
  }

  const html = await resp.text();
  modalContent.innerHTML = html;

  decorateMain(modalContent);
  await loadBlocks(modalContent);
  modalContainer.append(modalContent);

  // add class to modal container for opportunity to add custom modal styling
  if (template) modalContainer.classList.add(template);

  const closeModal = () => modalContainer.remove();
  const close = document.createElement('div');
  close.classList.add('modal-close');
  close.addEventListener('click', closeModal);
  modalContent.append(close);
  return modalContainer;
}

export async function detectModalButtons(element) {
  element.querySelectorAll('a.button.button--modal').forEach((link) => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      document.body.append(await createModal(link.href));
    });
  });
}

export async function go2Anchor() {
  if (window.location.hash) {
    const hash = window.location.hash.substring(1);
    const element = document.getElementById(hash);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */

export async function loadTrackers() {
  const isPageNotInDraftsFolder = window.location.pathname.indexOf('/drafts/') === -1;

  const onAdobeMcLoaded = () => {
    document.dispatchEvent(new Event(GLOBAL_EVENTS.ADOBE_MC_LOADED));
    window.ADOBE_MC_EVENT_LOADED = true;
  };

  if (isPageNotInDraftsFolder) {
    try {
      await Launch.load(page.environment);
    } catch {
      target.abort();
    }

    onAdobeMcLoaded();
  } else {
    target.abort();
    onAdobeMcLoaded();
  }
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = DEFAULT_LANGUAGE === 'se' ? 'sv' : DEFAULT_LANGUAGE;
  decorateTemplateAndTheme();

  const templateMetadata = getMetadata('template');
  const hasTemplate = getMetadata('template') !== '';
  if (hasTemplate) {
    loadCSS(`${window.hlx.codeBasePath}/scripts/template-factories/${templateMetadata}/${templateMetadata}.css`);
    addScript(`${window.hlx.codeBasePath}/scripts/template-factories/${templateMetadata}/${templateMetadata}.js`, {}, 'defer', undefined, undefined, 'module');
  }

  if (getPageExperimentKey()) {
    await loadTrackers();
    await sendAnalyticsPageEvent();
    await sendAnalyticsUserInfo();
  }

  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    detectModalButtons(main);
    document.body.classList.add('appear');
    await waitForLCP(LCP_BLOCKS);
  }

  if (getInstance() === 'prod' && Math.random() < 0.01) {
    window.sentryOnLoad = () => {
      /* eslint-disable-next-line no-undef */
      Sentry.init({
        tracesSampleRate: 1.0,
        allowUrls: ['www.bitdefender.com'],
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
      });
    };

    const script = document.createElement('script');
    script.src = 'https://js.sentry-cdn.com/31155ca43cab4235b06e5da92992eef0.min.js';
    script.crossOrigin = 'anonymous';
    script.async = true;
    document.head.appendChild(script);
  }
}

export async function loadLazy(doc) {
  // eslint-disable-next-line import/no-unresolved
  // const fpPromise = import('https://fpjscdn.net/v3/V9XgUXnh11vhRvHZw4dw')
  //   .then((FingerprintJS) => FingerprintJS.load({
  //     region: 'eu',
  //   }));
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));

  if (!getPageExperimentKey()) {
    loadTrackers();
    await sendAnalyticsPageEvent();
    await sendAnalyticsUserInfo();
  }
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    'gtm.start': new Date().getTime(),
    event: 'gtm.js',
  });

  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);

  adobeMcAppendVisitorId('main');
  go2Anchor();

  if (getMetadata('free-product')) sendTrialDownloadedEvent();

  // Get the visitorId when you need it.
  // await fpPromise
  //   .then((fp) => fp.get())
  //   .then((result) => {
  //     const { visitorId } = result;
  //     AdobeDataLayerService.push(new VisitorIdEvent(visitorId));
  //   });

  await sendAnalyticsErrorEvent();

  window.sentryOnLoad = () => {
    /* eslint-disable-next-line no-undef */
    Sentry.init({
      tracesSampleRate: 1.0,
      allowUrls: ['www.bitdefender.com'],
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
  };

  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

/**
 * Loads a fragment.
 * @param {string} path The path to the fragment
 * @returns {HTMLElement} The root element of the fragment
 */
export async function loadFragment(path) {
  if (path && path.startsWith('/')) {
    /**
     * this makes fragments work on the www.bitdefender.com domain
     * once we move everything to www, we sghould remove this
     */
    if (window.location.hostname === 'www.bitdefender.com' && !path.startsWith('/pages')) {
      // eslint-disable-next-line no-param-reassign
      path = `/pages${path}`;
    }

    const resp = await fetch(`${path}.plain.html`);
    if (resp.ok) {
      const main = document.createElement('main');
      main.innerHTML = await resp.text();
      decorateMain(main);
      await loadBlocks(main);
      return main;
    }
  }
  return null;
}

function addIdsToEachSection() {
  document.querySelectorAll('main .section').forEach((section) => {
    const { id: dataId } = section.dataset;

    if (dataId) {
      section.id = dataId;
      section.removeAttribute('data-id');
      return;
    }

    let componentWrapper = section.querySelector(':scope > div:first-of-type');

    while (componentWrapper?.classList.contains('default-content-wrapper')) {
      componentWrapper = componentWrapper.nextElementSibling;
    }

    if (!componentWrapper) {
      return;
    }

    const getIdentity = componentWrapper.className.split('-wrapper')[0];
    section.id = document.getElementById(getIdentity)
      ? `${getIdentity}-2`
      : getIdentity;
  });
}

function eventOnDropdownSlider() {
  document.querySelectorAll('.dropdownSlider').forEach((slider) => {
    const titles = slider.querySelectorAll('.title');
    const loadingBars = slider.querySelectorAll('.loading-bar');
    let activeIndex = 0;
    let interval;
    let loadingInterval;

    function showLoadingBar(index) {
      clearInterval(loadingInterval); // Clear any existing loading animation
      const loadingBar = loadingBars[index];
      if (loadingBar) {
        loadingBar.style.width = '0';
        let width = 0;
        loadingInterval = setInterval(() => {
          width += 1;
          loadingBar.style.width = `${width}%`;
          if (width >= 100) {
            clearInterval(loadingInterval);
          }
        }, 30); // Adjust the interval for smoother animation
      }
    }

    function moveToNextItem() {
      titles.forEach((title, index) => {
        if (index === activeIndex) {
          title.parentNode.classList.add('active');
          title.closest('.dropdownSlider').setAttribute('style', `min-height: ${title.parentNode.querySelector('.description').offsetHeight + 50}px`);
          showLoadingBar(index);
        } else {
          title.parentNode.classList.remove('active');
        }
      });

      activeIndex = (activeIndex + 1) % titles.length; // Move to the next item and handle wrapping
    }

    function startAutomaticMovement() {
      clearInterval(interval);
      interval = setInterval(moveToNextItem, 4000); // Set the interval
    }

    function stopAutomaticMovement() {
      clearInterval(interval); // Clear the interval
    }

    function moveToNextItemNoLoader() {
      titles.forEach((title, index) => {
        if (index === activeIndex) {
          title.parentNode.classList.add('active');
          title.closest('.dropdownSlider').setAttribute('style', `min-height: ${title.parentNode.querySelector('.description').offsetHeight + 50}px`);
        } else {
          title.parentNode.classList.remove('active');
        }
      });
    }

    if (slider.classList.contains('no-loader')) {
      moveToNextItemNoLoader();
      titles.forEach((title, index) => {
        title.addEventListener('click', () => {
          activeIndex = index;
          moveToNextItemNoLoader();
        });
      });

      window.addEventListener('resize', () => {
        moveToNextItemNoLoader();
      });
    }

    if (!slider.classList.contains('no-loader')) {
      // Set the initial active item
      moveToNextItem();

      // Start automatic movement after the loading is complete
      setTimeout(() => {
        startAutomaticMovement();
      }, 1000);

      // Click event listener on titles
      titles.forEach((title, index) => {
        title.addEventListener('click', () => {
          stopAutomaticMovement();
          activeIndex = index;
          showLoadingBar(index);
          moveToNextItem();
          startAutomaticMovement();
        });
      });
    }
  });
}

function appendMetaReferrer() {
  const metaTag = document.createElement('meta');
  metaTag.name = 'referrer';
  metaTag.content = 'no-referrer-when-downgrade';

  const head = document.head || document.getElementsByTagName('head')[0];

  head.appendChild(metaTag);
}

function setBFCacheListener() {
  window.addEventListener('pageshow', (event) => {
    // Send another page loaded if the page is restored from bfcache.
    if (event.persisted) {
      AdobeDataLayerService.push(new PageLoadedEvent());
    }
  });
}

/**
 * Adds click event listeners to multiple elements with Adobe Data Layer tracking
 * @param {string} selector - CSS selector to find elements
 * @param {string} assetName - Asset name for Adobe Data Layer tracking
 * @param {string} eventType - Event type (default: 'click')
 */
function addTrackingEventListeners(selector, assetName, eventType = 'click') {
  function getSectionId(element) {
    const parentSection = element.closest('.section');
    if (parentSection?.id) {
      return parentSection.id;
    }

    if (element.closest('header')) {
      return 'header';
    }

    if (element.closest('.they-wear-our-faces-sticky-section')) {
      return 'they-wear-our-faces-sticky-section';
    }

    return null;
  }

  const elements = document.querySelectorAll(`a[href*="${selector}"]`);

  elements.forEach((element, idx) => {
    element.addEventListener(eventType, () => {
      const sectionID = getSectionId(element);
      AdobeDataLayerService.push({
        event: eventType,
        asset: `${assetName}_${sectionID}_${idx + 1}`,
      });
    });
  });

  return elements.length;
}

/**
 * Sections with the `trial-link-prod` metadata (e.g. ts_i/5/1) point their buttons
 * to the trial link set by the `trialbuylinks` metadata.
 * @param {HTMLElement} main
 */
function decorateTrialLinkSections(main) {
  const trialDuration = getTrialDuration();
  if (!trialDuration) return;

  main.querySelectorAll('[data-trial-link-prod]').forEach((section) => {
    const { productId, devices, subscription } = parseStoreProduct(section.dataset.trialLinkProd);
    section.querySelectorAll('p.button-container, a.button.primary').forEach((element) => {
      const button = element.matches('a') ? element : element.querySelector('a');
      if (!button || button.closest('bd-option')) return;

      button.setAttribute('data-store-render', '');
      button.setAttribute('data-store-buy-link', trialDuration);
      wrapChildrenWithProduct(button.parentElement, { productId, devices, subscription });
    });
  });
}

/**
 * `.max-discount` shows the biggest discount of all the products on the page,
 * and its container is hidden when there is no discount.
 * @param {HTMLElement} main
 */
function decorateMaxDiscount(main) {
  main.querySelectorAll('.max-discount').forEach((element) => {
    element.setAttribute('data-store-render', '');
    element.setAttribute('data-store-context-discount', 'max-percentage');
    element.closest('em, table')?.setAttribute('data-store-hide', '!it.state.discount.percentage.max');
  });

  main.querySelectorAll('.max-discount-content .block, .max-discount-content .default-content-wrapper').forEach((element) => {
    element.innerHTML = element.innerHTML.replace(/0%/g, '<span data-store-render data-store-context-discount="max-percentage"></span>');
  });
}

/**
 * Values the store elements don't provide, available in templates and the hide DSL
 * as `it.option.price.*`
 * @type {import('@repobit/dex-store-elements').BdScopeDeriveFn}
 */
const deriveStoreValues = async ({ option }) => {
  if (!option) return {};

  const currency = option.getProduct().getCurrency();
  const format = (price) => store.formatPrice({ price, currency, locale: page.locale });
  const fullPrice = option.getPrice({ currency: false });
  const discountedPrice = option.getDiscountedPrice({ currency: false }) || fullPrice;

  return {
    option: {
      price: {
        fullYearly: format(fullPrice * 12),
        discountedYearly: format(discountedPrice * 12),
        zero: format(0),
      },
    },
  };
};

async function pushPromotionId() {
  const promotionID = (await target.configMbox)?.promotion;
  if (promotionID) {
    window.adobeDataLayer.push({
      page: { attributes: { promotionID } },
    });
  }
}

async function loadPage() {
  setBFCacheListener();
  const main = document.querySelector('main');
  /**
   * @type {import('@repobit/dex-store-elements').ContextNode}
   */
  const storeRoot = document.createElement('bd-context');
  storeRoot.dataLayer = ({ option, event }) => {
    AdobeDataLayerService.push(new ProductLoadedEvent(option, event, 'campaign product'));
  };
  storeRoot.derived = deriveStoreValues;
  document.body.replaceChild(storeRoot, main);
  storeRoot.appendChild(main);
  storeRoot.store = store;

  registerContextNodes();

  await loadEager(document);
  await loadLazy(document);

  decorateTrialLinkSections(main);
  decorateMaxDiscount(main);

  registerActionNodes(main);
  registerRenderNodes(main);
  await storeRoot.updateComplete;

  document.querySelectorAll('.await-loader').forEach((element) => {
    element.classList.remove('await-loader');
  });

  // DEX-17703 - replacing VAT INFO text for en regions
  if (DEFAULT_LANGUAGE === 'en') updateVATinfo(page.country === 'us' ? 8 : 0, '[data-store-buy-link]');

  pushPromotionId();
  sendAnalyticsPageLoadedEvent();

  addIdsToEachSection();

  // Asset tracking - adding event listeners to all the links that contain the specified selector
  // this tracks links that are in the page, directing the user to a buy flow, like a product card
  // this pattern should not be replicated
  // this currently will work only in the they-wear-our-faces page
  const selectorForTracking = getMetadata('selectors-for-asset-tracking');
  if (selectorForTracking) {
    addTrackingEventListeners(selectorForTracking, 'trial');
  }

  addScript('/_src-lp/scripts/vendor/bootstrap/bootstrap.bundle.min.js', {}, 'defer');

  eventOnDropdownSlider();

  appendMetaReferrer();

  loadDelayed();

  go2Anchor();

  window.addEventListener('UC_UI_INITIALIZED', () => {
    if (window.UC_UI) {
      const controllerId = window.UC_UI.getControllerId();
      document.querySelectorAll('a[data-store-buy-link]').forEach((button) => {
        const buyLink = new URL(button.getAttribute('href'), window.location.href);
        buyLink.searchParams.set('ucControllerId', controllerId);
        button.href = buyLink.toString();
      });
    }
  });

  document.dispatchEvent(new Event('bd_page_ready'));
  window.bd_page_ready = true;
}

/*
* @viewport: 'mobile' | 'tablet' | 'desktop'
* */
function initMobileDetector(viewport) {
  const mobileDetectorDiv = document.createElement('div');
  mobileDetectorDiv.setAttribute(`data-${viewport}-detector`, '');
  document.body.prepend(mobileDetectorDiv);
}

/*
* @viewport: 'mobile' | 'tablet' | 'desktop'
* */
export function isView(viewport) {
  const element = document.querySelectorAll(`[data-${viewport}-detector]`)[0];
  return !!(element && getComputedStyle(element).display !== 'none');
}

function initBaseUri() {
  const domainName = 'bitdefender';
  const domainExtension = window.location.hostname.split('.').pop(); // com | ro | other

  window.BASE_URI = ['com', 'ro'].includes(domainExtension) ? `${window.location.protocol}//www.${domainName}.${domainExtension}/site` : `https://www.${domainName}.com/site`;
}

initMobileDetector('mobile');
initMobileDetector('tablet');
initMobileDetector('desktop');

initBaseUri();

loadPage();

// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './lib-franklin.js';

import { sendAnalyticsPageLoadedEvent, sendAnalyticsProducts, getParamValue } from './adobeDataLayer.js';
import {
  addScript, getInstance, GLOBAL_EVENTS, isZuoraForNetherlandsLangMode, productsList, showLoaderSpinner, showPrices,
} from './utils.js';
import { productAliases } from './scripts.js';
import ZuoraNLClass from './zuora.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here
function initZuoraProductPriceLogic() {
  window.config = ZuoraNLClass.config();
  showLoaderSpinner(false);

  addScript('https://checkout.bitdefender.com/static/js/sdk.js', {}, 'async', () => {
    if (productsList.length) {
      productsList.forEach(async (item) => {
        const prodSplit = item.split('/');
        const prodAlias = productAliases(prodSplit[0].trim());
        const prodUsers = prodSplit[1].trim();
        const prodYears = prodSplit[2].trim();
        const onSelectorClass = `${prodAlias}-${prodUsers}${prodYears}`;

        const zuoraResult = await ZuoraNLClass.loadProduct(item);
        showPrices(zuoraResult);
        showLoaderSpinner(true, onSelectorClass);
        sendAnalyticsProducts(zuoraResult, 'nl');
      });
    }
  });
}

function enableTrackingScripts() {
  const isTrackingFlagInUrlParamPresent = getParamValue('t') !== '1';
  if (isTrackingFlagInUrlParamPresent) {
    addScript(getInstance() === 'prod'
      ? 'https://assets.adobedtm.com/8a93f8486ba4/5492896ad67e/launch-b1f76be4d2ee.min.js'
      : 'https://assets.adobedtm.com/8a93f8486ba4/5492896ad67e/launch-3e7065dd10db-staging.min.js', {}, 'async', () => {
      document.dispatchEvent(new Event(GLOBAL_EVENTS.ADOBE_MC_LOADED));
    });

    if (getParamValue('tt') !== '1') {
      addScript('https://www.googletagmanager.com/gtm.js?id=GTM-PLJJB3', {}, 'async');
    }
  }
}

if (isZuoraForNetherlandsLangMode()) {
  initZuoraProductPriceLogic();
}

sendAnalyticsPageLoadedEvent();

if (getParamValue('tt') !== '1') {
  addScript('https://consent.cookiebot.com/uc.js', { culture: window.DEFAULT_LANGUAGE || 'en', cbid: '4a55b566-7010-4633-9b03-7ba7735be0b6' }, 'async');
}

enableTrackingScripts();

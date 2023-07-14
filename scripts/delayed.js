// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './lib-franklin.js';

import { sendAnalyticsPageLoadedEvent, sendAnalyticsProducts, getParamValue } from './adobeDataLayer.js';
import {
  addScript, instance, GLOBAL_EVENTS, isZuoraForNetherlandsLangMode, productsList, showPrices,
} from './utils.js';
import initZuoraNL from './zuora.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here
function initZuoraProductPriceLogic() {
  window.config = initZuoraNL.config();

  addScript('https://checkout.bitdefender.com/static/js/sdk.js', {}, 'async', () => {
    if (productsList.length) {
      productsList.forEach(async (item) => {
        const zuoraResult = await initZuoraNL.loadProduct(item);
        showPrices(zuoraResult);
        sendAnalyticsProducts(zuoraResult, 'nl');
      });
    }
  });
}

function enableTrackingScripts() {
  const isTrackingFlagInUrlParamPresent = getParamValue('t') !== '1';
  if (isTrackingFlagInUrlParamPresent) {
    addScript(instance === 'prod'
      ? 'https://assets.adobedtm.com/8a93f8486ba4/5492896ad67e/launch-b1f76be4d2ee.min.js'
      : 'https://assets.adobedtm.com/8a93f8486ba4/5492896ad67e/launch-3e7065dd10db-staging.min.js', {}, 'async', () => {
      document.dispatchEvent(new Event(GLOBAL_EVENTS.ADOBE_MC_LOADED));
    });

    addScript('https://www.googletagmanager.com/gtm.js?id=GTM-PLJJB3', {}, 'async');
  }
}

if (isZuoraForNetherlandsLangMode()) {
  initZuoraProductPriceLogic();
}

sendAnalyticsPageLoadedEvent();

addScript('https://consent.cookiebot.com/uc.js', { culture: 'en', cbid: '4a55b566-7010-4633-9b03-7ba7735be0b6' }, 'async');

enableTrackingScripts();

// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './lib-franklin.js';

import { sendAnalyticsProducts } from './adobeDataLayer.js';
import {
  addScript, isZuoraForNetherlandsLangMode, productsList, showLoaderSpinner, showPrices,
} from './utils.js';
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
        const prodAlias = prodSplit[0].trim();
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

if (isZuoraForNetherlandsLangMode()) {
  initZuoraProductPriceLogic();
}

if (window.location.pathname.indexOf('/drafts/') === -1) {
  addScript('https://consent.cookiebot.com/uc.js', { culture: window.DEFAULT_LANGUAGE || 'en', cbid: '4a55b566-7010-4633-9b03-7ba7735be0b6' }, 'async');
}

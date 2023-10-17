// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './lib-franklin.js';

import { sendAnalyticsProducts } from './adobeDataLayer.js';
import {
  adobeMcAppendVisitorId, isZuoraForNetherlandsLangMode, productsList, showLoaderSpinner, showPrices,
} from './utils.js';
import ZuoraNLClass from './zuora.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here
async function initZuoraProductPriceLogic() {
  // window.config = ZuoraNLClass.config();
  showLoaderSpinner(false);

  if (productsList.length) {
    try {
      await Promise.all(
        productsList.map(async (item) => {
          const prodSplit = item.split('/');
          const prodAlias = prodSplit[0].trim();
          const prodUsers = prodSplit[1].trim();
          const prodYears = prodSplit[2].trim();
          const onSelectorClass = `${prodAlias}-${prodUsers}${prodYears}`;

          const zuoraResult = await ZuoraNLClass.loadProduct(item);
          showPrices(zuoraResult);
          adobeMcAppendVisitorId('main');
          showLoaderSpinner(true, onSelectorClass);
          sendAnalyticsProducts(zuoraResult, 'nl');

          return zuoraResult;
        }),
      );

      // results is an array of the resolved promises
      // console.log(results);
    } catch (error) {
      console.error(error);
    }
  }
}

if (isZuoraForNetherlandsLangMode()) {
  initZuoraProductPriceLogic();
}

// DEX-15092 - Deazctivare Cookiebot - Old CMS si Franklin
/* if (window.location.pathname.indexOf('/drafts/') === -1) {
  addScript('https://consent.cookiebot.com/uc.js', { culture: window.DEFAULT_LANGUAGE || 'en', cbid: '4a55b566-7010-4633-9b03-7ba7735be0b6' }, 'async');
} */

import { data, assertedProductData, zuoraNL, zuoraNlPriceVariationData } from './mock-data.js';
import ZuoraNLClass from "../../_src-lp/scripts/zuora.js";

// mock everything that is not related to the actual main scope
jest.mock('../../_src-lp/scripts/lib-franklin.js', () => ({
  ...jest.requireActual('../../_src-lp/scripts/lib-franklin.js'),
  loadHeader: jest.fn(),
  loadFooter: jest.fn(),
  // loadBlock:  jest.fn().mockResolvedValue(undefined),
  loadBlocks: jest.fn(),
}));

jest.mock('../../_src-lp/scripts/utils.js', () => ({
  ...jest.requireActual('../../_src-lp/scripts/utils.js'),
  appendAdobeMcLinks: jest.fn(),
  adobeMcAppendVisitorId: jest.fn(),
  isZuoraForNetherlandsLangMode: jest.fn(() => true),
  productsList: [
    "av/3/1",
    "tsmd/5/1",
    "is/3/1",
    "vpn/10/1"
  ],
  addScript: jest.fn((src, data, loadStrategy, onLoadCallback, onErrorCallback, type) => {
    // Call the onLoadCallback and/or onErrorCallback directly
    if (onLoadCallback) {
      onLoadCallback();
    }
  }),
  showPrices: jest.fn(),
}));

jest.mock('../../_src-lp/scripts/adobeDataLayer.js', () => ({
  ...jest.requireActual('../../_src-lp/scripts/adobeDataLayer.js'),
  sendAnalyticsUserInfo: jest.fn(() => Promise.resolve(undefined)),
  sendAnalyticsProducts: jest.fn(() => Promise.resolve(undefined)),
}));

describe('scripts.js', () => {
  describe('Zuora NL workflow', () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(zuoraNlPriceVariationData),
      })
    );

    const zuoraFetchCampaignNameSpy = jest.spyOn(ZuoraNLClass, 'fetchZuoraConfig');
    const zuoraGetProductVariationsSpy = jest.spyOn(ZuoraNLClass, 'getProductVariations');
    const zuoraGetProductVariationsPriceSpy = jest.spyOn(ZuoraNLClass, 'getProductVariationsPrice');
    const zuoraLoadProductSpy = jest.spyOn(ZuoraNLClass, 'loadProduct');

    jest.spyOn(HTMLImageElement.prototype, 'addEventListener').mockImplementation((event, callback) => {
      if (event === 'load' || event === 'error') {
        // Simulate immediate resolution for load and error events
        callback();
      }
    });

    beforeEach(() => {
      window = Object.create(window);
      Object.defineProperty(window, 'adobe', {
        value: {
          target: {}
        },
        writable: true
      });
    });

    it('should load stable for Zuora NL', async () => {
      // init / bootstrap page()
      document.body.innerHTML = zuoraNL;
      await import('../../_src-lp/scripts/scripts.js');

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(window.StoreProducts.product).toBeTruthy();
      expect(window.StoreProducts.product).toEqual(assertedProductData);

      expect(zuoraFetchCampaignNameSpy).toHaveBeenCalledTimes(4);
      expect(zuoraGetProductVariationsSpy).toHaveBeenCalledTimes(4);
      expect(zuoraGetProductVariationsPriceSpy).toHaveBeenCalledTimes(4);
      expect(zuoraLoadProductSpy).toHaveBeenCalledTimes(4);
    });
  });
});


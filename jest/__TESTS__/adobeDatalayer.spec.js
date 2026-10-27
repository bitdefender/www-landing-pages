import {sendAnalyticsPageEvent, sendAnalyticsPageLoadedEvent} from "../../_src-lp/scripts/adobeDataLayer";
import userPromise from "../../_src-lp/scripts/user";
import { targetPromise } from "../../_src-lp/scripts/target";

describe('adobeDatalayer.js', () => {
  describe('sendAnalyticsPageEvent function', () => {
    beforeEach(() => {
      window.adobeDataLayer = [];
      window = Object.create(window);
      Object.defineProperty(window, 'location', {
        value: {
          host: '',
          hostname: '',
          pathname: ''
        },
        writable: true
      });
    });

    it('should create the correct page.info.name for bitdefender.com/pages environment', async () => {
      window.location.host = 'www.bitdefender.com';
      window.location.hostname = 'www.bitdefender.com';
      window.location.pathname = '/pages/consumer/en/new/new-campaign';
      const user = await userPromise;

      await sendAnalyticsPageEvent();
      const [pageLoadStartedEvent] = window.adobeDataLayer;

      expect(pageLoadStartedEvent.page.info.name).toBe(`${await user.locale}:offers:consumer:new:new-campaign`);
    });

    it('should create the correct page.info.name for pages.bitdefender.com environment', async () => {
      window.location.host = 'pages.bitdefender.com';
      window.location.hostname = 'pages.bitdefender.com';
      window.location.pathname = '/consumer/en/new/new-campaign';
      const user = await userPromise;

      await sendAnalyticsPageEvent();
      const [pageLoadStartedEvent] = window.adobeDataLayer;

      expect(pageLoadStartedEvent.page.info.name).toBe(`${await user.locale}:offers:consumer:new:new-campaign`);
    });
  });

  describe('sendAnalyticsPageLoadedEvent function', () => {
    beforeEach(async () => {
      window.adobeDataLayer = [];
      // CDP data waits on Adobe alloy, which isn't loaded here
      vi.spyOn(await targetPromise, 'cdpData', 'get').mockResolvedValue(null);
    });

    afterEach(() => {
      delete window.BD.loginAttempted;
      vi.restoreAllMocks();
    });

    it('should send the page loaded event', async () => {
      await sendAnalyticsPageLoadedEvent(true);

      expect(window.adobeDataLayer.some((obj) => obj.event === 'page loaded')).toBe(true);
    });

    it('should not send the page loaded event while redirecting to Login', async () => {
      window.BD.loginAttempted = true;

      await sendAnalyticsPageLoadedEvent(true);

      expect(window.adobeDataLayer.some((obj) => obj.event === 'page loaded')).toBe(false);
    });
  });
});

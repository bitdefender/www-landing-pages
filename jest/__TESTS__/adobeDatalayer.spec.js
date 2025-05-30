import {sendAnalyticsPageEvent} from "../../_src-lp/scripts/adobeDataLayer";
import { User } from "@repobit/dex-utils";

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

      await sendAnalyticsPageEvent();
      const [pageLoadStartedEvent] = window.adobeDataLayer;

      expect(pageLoadStartedEvent.page.info.name).toBe(`${await User.locale}:offers:consumer:new:new-campaign`);
    });

    it('should create the correct page.info.name for pages.bitdefender.com environment', async () => {
      window.location.host = 'pages.bitdefender.com';
      window.location.hostname = 'pages.bitdefender.com';
      window.location.pathname = '/consumer/en/new/new-campaign';

      await sendAnalyticsPageEvent();
      const [pageLoadStartedEvent] = window.adobeDataLayer;

      expect(pageLoadStartedEvent.page.info.name).toBe(`${await User.locale}:offers:consumer:new:new-campaign`);
    });
  });
});

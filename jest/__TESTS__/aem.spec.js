// eslint-disable-next-line import/extensions
import { data } from './mock-data.js';

// mock everything that is not related to the actual main scope
jest.mock('../../_src-lp/scripts/aem.js', () => ({
  ...jest.requireActual('../../_src-lp/scripts/aem.js'),
  loadHeader: jest.fn(),
  loadFooter: jest.fn(),
}));

describe('aem.js', () => {
  describe('internalDecorateIcons function', () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({}),
      })
    );

    beforeEach(() => {
      jest.resetModules();
      jest.clearAllMocks();
      fetch.mockClear();
    });

    it('fetch should be called with /pages/ prefix under bitdefender.com/pages/', async () => {
      window = Object.create(window);
      Object.defineProperty(window, 'location', {
        value: {
          host: 'www.bitdefender.com',
          hostname: 'www.bitdefender.com',
          pathname: '/pages/consumer/en/new/new-campaign'
        },
        writable: true
      });

      // init / bootstrap page()
      document.body.innerHTML = data;
      await import('../../_src-lp/scripts/scripts.js');

      expect(fetch).toHaveBeenCalledWith("/pages/icons/keeps-you-informed.svg");
    });

    it('fetch should be called without /pages/ prefix under pages.bitdefender.com', async () => {
      window = Object.create(window);
      Object.defineProperty(window, 'location', {
        value: {
          host: 'pages.bitdefender.com',
          hostname: 'pages.bitdefender.com',
          pathname: '/consumer/en/new/new-campaign'
        },
        writable: true
      });

      // init / bootstrap page()
      document.body.innerHTML = data;
      await import('../../_src-lp/scripts/scripts.js');

      expect(fetch).toHaveBeenCalledWith("/icons/keeps-you-informed.svg");
    });
  });
});

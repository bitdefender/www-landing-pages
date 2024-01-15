// eslint-disable-next-line import/extensions
import mockData from './mock-data.json';

// mock everything that is not related to the actual main scope
jest.mock('../../_src-lp/scripts/lib-franklin.js', () => ({
  ...jest.requireActual('../../_src-lp/scripts/lib-franklin.js'),
  loadHeader: jest.fn(),
  loadFooter: jest.fn(),
}));

describe('lib-franklin.js', () => {
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

    it('should match the url correctly ', async () => {
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
      document.body.innerHTML = mockData.data;
      await import('../../_src-lp/scripts/scripts.js');

      expect(fetch).toHaveBeenCalledWith("/pages/icons/keeps-you-informed.svg");
    });

    it('should create the correct page.info.name for bitdefender.com/pages environment', async () => {
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
      document.body.innerHTML = mockData.data;
      await import('../../_src-lp/scripts/scripts.js');

      expect(fetch).toHaveBeenCalledWith("/icons/keeps-you-informed.svg");
    });
  });
});

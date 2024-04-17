import {
  addScript,
  DOMAIN_NAME_MAP,
  getDefaultBaseUrl,
  getLocalizedResourceUrl
} from "../../_src-lp/scripts/utils.js";

describe('utils.js', () => {
  describe('addScript function', () => {
    let scriptTag;
    const mockCallback = jest.fn();
    const scriptUrl = 'https://example.com/script.js';
    const scriptData = { test: 'value' };

    beforeEach(() => {
      document.body.innerHTML = '';
      scriptTag = null;
      mockCallback.mockClear();
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should add a script tag to the document body', () => {
      addScript(scriptUrl);
      scriptTag = document.querySelector(`script[src="${scriptUrl}"]`);
      expect(scriptTag).not.toBeNull();
    });

    it('should add a script tag with the correct src', () => {
      addScript(scriptUrl);
      scriptTag = document.querySelector(`script[src="${scriptUrl}"]`);
      expect(scriptTag.src).toEqual(scriptUrl);
    });

    it('should add a script tag with correct type when type is provided', () => {
      const type = 'async';
      addScript(scriptUrl, {}, type);
      scriptTag = document.querySelector(`script[src="${scriptUrl}"]`);
      expect(scriptTag.getAttribute(type)).toBeTruthy();
    });

    it('should set the correct data attributes when data is provided', () => {
      addScript(scriptUrl, scriptData);
      scriptTag = document.querySelector(`script[src="${scriptUrl}"]`);
      expect(scriptTag.dataset.test).toEqual('value');
    });

    it('should not set data attributes when data is not an object', () => {
      addScript(scriptUrl, 'notAnObject');
      scriptTag = document.querySelector(`script[src="${scriptUrl}"]`);
      expect(scriptTag.dataset.test).toBeUndefined();
    });
  });

  describe('getLocalizedResourceUrl', () => {
    beforeEach(() => {
      window = Object.create(window);
      Object.defineProperty(window, 'location', {
        value: {
          pathname: ''
        },
        writable: true
      });
    })

    it('should generate resource path from folder when pathname ends with slash', () => {
      const pathname = "/consumer/en/new/ps-ts-vpn-opt/";
      window.location.pathname = pathname;

      const footerPath = getLocalizedResourceUrl('footer');

      expect(footerPath).toEqual(`${pathname}footer`);
    });

    it('should generate resource path from region language when pathname does not end with slash', () => {
      const regionPathNameBasePath = '/consumer/it';

      window.location.pathname = `${regionPathNameBasePath}/new/ps-ts-vpn-opt`;

      const footerPath = getLocalizedResourceUrl('footer');

      expect(footerPath).toEqual(`${regionPathNameBasePath}/footer`);
    });
  });

  describe('getDefaultBaseUrl', () => {
    beforeEach(() => {
      window = Object.create(window);
      Object.defineProperty(window, 'location', {
        value: {
          pathname: '',
          hostname: 'pages.bitdefender.com',
        },
        writable: true
      });
    })

    it.each(Array.from(DOMAIN_NAME_MAP))(
      'returns the correct domain for locale "%s" => %p',
      (locale, expectedDomain) => {
        window.location.pathname = `/${locale}/consumer/lp-1`;
        const result = getDefaultBaseUrl();
        expect(result).toEqual(expectedDomain);
      }
    );
  });
});

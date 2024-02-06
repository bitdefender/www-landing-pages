// eslint-disable-next-line import/extensions
import mockData from './mock-data.json';

// mock everything that is not related to the actual main scope
jest.mock('../../../scripts/aem.js', () => ({
  ...jest.requireActual('../../../scripts/aem.js'),
  loadHeader: jest.fn(),
  loadFooter: jest.fn(),
}));

describe('Banner block', () => {
  describe('Normal banner', () => {

    // init / bootstrap page()
    document.body.innerHTML = mockData.normalBanner;
    import('../../../scripts/scripts.js');

    let bannerContainer;

    beforeEach(() => {
      bannerContainer = document.querySelector('.banner-container');
    });

    test('Section should match background color defined in metadata', () => {
      const bgColor = bannerContainer.style.backgroundColor;
      expect(bgColor).toBe('white');
    });

    test('Block styles should match styles defined in metadata', () => {
      const block = bannerContainer.querySelector('.block');
      expect(block.style.color).toBe('black');
      expect(block.style.paddingBottom).toBe('1rem');
      expect(block.style.marginBottom).toBe('2rem');
    });

    test('Should display a h1 title', () => {
      const title = bannerContainer.querySelector('h1');
      expect(title).toBeTruthy();
    });

    test('Should display a background image', () => {
      const image = bannerContainer.querySelector('img');
      expect(image).toBeTruthy();
    });

    test('Should have test styled if underlinedInclinedTextColor is present', () => {
      const underlinedText = bannerContainer.querySelector('em u');
      expect(underlinedText.style.color).toBe('rgb(0, 110, 255)');
      expect(underlinedText.style.fontStyle).toBe('normal');
      expect(underlinedText.style.textDecoration).toBe('none');
    });
  });
});

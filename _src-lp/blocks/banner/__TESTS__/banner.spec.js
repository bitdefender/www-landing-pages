import { waitFor } from '@testing-library/dom';
// eslint-disable-next-line import/extensions
import mockData from './mock-data.json';
import { describe, test, expect, beforeEach, vi } from 'vitest';

// mock everything that is not related to the actual main scope
vi.mock('../../../scripts/lib-franklin.js', () => (
  // Return the promise so Vitest will await it
  vi
    .importActual('../../../scripts/lib-franklin.js')
    .then((actual) => ({
      ...actual,
      loadHeader: vi.fn(),
      loadFooter: vi.fn(),
    }))
));

describe('Banner block', () => {
  describe('Normal banner', () => {
    let bannerContainer;

    beforeEach(async () => {
      // 1. inject your HTML fixture
      document.body.innerHTML = mockData.normalBanner;
      // 2. load your scripts (it will pick up the mocked lib-franklin)
      await import('../../../scripts/scripts.js');
    });

    it('waits for the block to decorate itself', async () => {
      // this will retry until the callback doesn't throw or times out
      await waitFor(() => {
        bannerContainer = document.querySelector('.banner-container');
        expect(bannerContainer.querySelector('em u')).toBeTruthy();
      });
    });

    test('Section should match background color defined in metadata', async () => {
      await waitFor(() => {
        const bgColor = bannerContainer.style.backgroundColor;
        expect(bgColor).toBe('white');
      });
    });

    test('Block styles should match styles defined in metadata', async () => {
      await waitFor(() => {
        const block = bannerContainer.querySelector('.block');
        expect(block.style.color).toBe('black');
        expect(block.style.paddingBottom).toBe('1rem');
        expect(block.style.marginBottom).toBe('2rem');
      });
    });

    test('Should display a h1 title', async () => {
      await waitFor(() => {
        const title = bannerContainer.querySelector('h1');
        expect(title).toBeTruthy();
      });
    });

    test('Should display a background image', async () => {
      await waitFor(() => {
        const image = bannerContainer.querySelector('img');
        expect(image).toBeTruthy();
      });
    });

    test('Should have test styled if underlinedInclinedTextColor is present', async () => {
      await waitFor(() => {
        const underlinedText = bannerContainer.querySelector('em u');
        expect(underlinedText.style.color).toBe('rgb(0, 110, 255)');
        expect(underlinedText.style.fontStyle).toBe('normal');
        expect(underlinedText.style.textDecoration).toBe('none');
      });
    });
  });
});

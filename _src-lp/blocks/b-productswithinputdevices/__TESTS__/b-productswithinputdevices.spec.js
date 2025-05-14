import { waitFor } from '@testing-library/dom';
// tests/b-productswithinputdevices.test.js
import { describe, test, expect, beforeEach, vi } from 'vitest';
// eslint-disable-next-line import/extensions
import mockData from './mock-data.json';

// 1️⃣ Mock Franklin loader (factory returning a promise)
vi.mock('../../../scripts/lib-franklin.js', () =>
  // Return the promise so Vitest will await it
  vi
    .importActual('../../../scripts/lib-franklin.js')
    .then((actual) => ({
      ...actual,
      loadHeader: vi.fn(),
      loadFooter: vi.fn(),
    }))
);

// 2️⃣ Mock the external fingerprint library as a virtual module
vi.mock(
  'https://fpjscdn.net/v3/V9XgUXnh11vhRvHZw4dw',
  () => ({
    load: vi.fn().mockReturnValue({
      get: vi.fn().mockResolvedValue({ visitorId: 'mock-visitor-id' }),
    }),
  }),
  { virtual: true }
);

describe('b-productswithinputdevices block', () => {
  beforeEach(() => {
    // reset module registry & clear all mocks
    vi.resetModules();
    vi.clearAllMocks();
  });

  describe('b-productswithinputdevices', () => {
    let container;

    beforeEach(async () => {
      // 1. inject your HTML fixture
      document.body.innerHTML = mockData.b_productswithinputdevices;
      // 2. load your scripts (it will pick up the mocked lib-franklin)
      await import('../../../scripts/scripts.js');
    });

    it('waits for the block to decorate itself', async () => {
      // this will retry until the callback doesn't throw or times out
      await waitFor(() => {
        container = document.querySelector('.b-productswithinputdevices-container');
        // for example, expect that the plus button exists
        expect(container.querySelector('fieldset button:nth-child(4)')).toBeTruthy();
      });
    });

    test('check if products have been added to the window.productsListCount', async () => {
      await waitFor(() => {
        expect(window.productsListCount).toBeTruthy();
      });
    });

    test('Green tag text should match the one defined in metadata', async () => {
      await waitFor(() => {
        const greenTag = container.querySelector('.greenTag');
        expect(greenTag.innerText).toBe('NEW');
      });
    });

    test('Metadata property bulinaText should create the block containing proper classes', async () => {
      await waitFor(() => {
        const badge = container.querySelector('.prod-percent.green_bck_circle.bigger.has2txt');
        expect(badge.innerHTML).toBeTruthy();
      });
    });

    test('Clicking the + button updates the input value correctly', async () => {
      await waitFor(() => {
        const plusButton = container.querySelector('fieldset button:nth-child(4)');
        const inputField = container.querySelector('fieldset input');
        plusButton.click();
        expect(inputField.value).toBe('11');
      });
    });

    test('Clicking the - button updates the input value correctly', async () => {
      await waitFor(() => {
        const minusButton = container.querySelector('fieldset button');
        const inputField = container.querySelector('fieldset input');
        // input was 11 from previous test; click twice to get back to 9
        minusButton.click();
        minusButton.click();
        expect(inputField.value).toBe('9');
      });
    });
  });
});
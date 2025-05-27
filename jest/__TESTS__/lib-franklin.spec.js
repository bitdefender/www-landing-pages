// tests/lib-franklin.internalDecorateIcons.test.js
import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
// eslint-disable-next-line import/extensions
import { data } from './mock-data.js';

// 1️⃣ Mock lib-franklin.js: pull in the real module asynchronously, then override only loadHeader/loadFooter
vi.mock('../../_src-lp/scripts/lib-franklin.js', () =>
  // Return a promise; Vitest will await it under the hood
  vi
    .importActual('../../_src-lp/scripts/lib-franklin.js')
    .then((actual) => ({
      ...actual,
      loadHeader: vi.fn(),
      loadFooter: vi.fn(),
    }))
);

describe('lib-franklin.js → internalDecorateIcons', () => {
  // Provide a global fetch stub once for all tests
  beforeAll(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({}),
      })
    );
  });

  beforeEach(() => {
    // Clear module registry so our script import picks up fresh mocks
    vi.resetModules();
    // Clear any previous calls to fetch or our mock functions
    vi.clearAllMocks();
  });

  it('fetches `/pages/icons/...` when on www.bitdefender.com/pages/... path', async () => {
    // Simulate window.location at a /pages/ URL on bitdefender.com
    delete window.location;
    window.location = new URL(
      'https://www.bitdefender.com/pages/consumer/en/new/new-campaign'
    );

    // Inject your HTML fixture
    document.body.innerHTML = data;
    // Import your runtime—this will trigger internalDecorateIcons()
    await import('../../_src-lp/scripts/scripts.js');

    expect(fetch).toHaveBeenCalledWith(
      '/pages/icons/keeps-you-informed.svg'
    );
  });

  it('fetches `/icons/...` when on pages.bitdefender.com without the /pages/ prefix', async () => {
    // Simulate window.location on pages.bitdefender.com
    delete window.location;
    window.location = new URL(
      'https://pages.bitdefender.com/consumer/en/new/new-campaign'
    );

    document.body.innerHTML = data;
    await import('../../_src-lp/scripts/scripts.js');

    expect(fetch).toHaveBeenCalledWith(
      '/icons/keeps-you-informed.svg'
    );
  });
});
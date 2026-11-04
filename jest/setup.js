// eslint-disable-next-line import/no-extraneous-dependencies
import { vi } from 'vitest';

// jsdom never loads external scripts, so Adobe Launch would never load and every page would wait
// for Target forever. Failing to load is what a real page does when Launch is blocked: Target is
// aborted and the page is shown at once.
vi.mock('@repobit/dex-launch', () => ({
  default: { load: () => Promise.reject(new Error('Launch is not loaded in unit tests')) },
}));

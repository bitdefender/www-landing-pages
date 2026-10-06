// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    passWithNoTests: true,
    globals: true, // Use globals like describe, it, expect
    environment: 'jsdom', // Provides DOM APIs; you can also use 'jsdom'
    // Vendored agent skills ship their own tests (some run git), not part of this project.
    exclude: ['**/node_modules/**', '**/dist/**', '.agents/**'],
  },
});

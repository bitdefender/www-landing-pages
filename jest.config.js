// Using CommonJS format for the Jest config even with type:module in package.json
/** @type {import('jest').Config} */
export default {
  verbose: true,
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[jt]sx?$': ['babel-jest', { rootMode: 'upward' }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(\\@repobit/dex-launch|@repobit/dex-utils|@repobit/dex-data-layer|@repobit/dex-target|@repobit/dex-store)/)',
  ],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
};

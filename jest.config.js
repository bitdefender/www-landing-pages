/** @type {import('jest').Config} */
const config = {
  verbose: true,
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(\\@repobit/dex-launch|@repobit/dex-utils|@repobit/dex-data-layer|@repobit/dex-target|@repobit/dex-store)/)',
  ],
};

module.exports = config;

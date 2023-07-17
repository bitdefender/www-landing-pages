module.exports = {
  root: true,
  extends: 'airbnb-base',
  env: {
    browser: true,
    jquery: true,
  },
  globals: {
    StoreProducts: true,
    adobeDataLayer: true,
    Visitor: true,
    BitCheckoutSDK: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    allowImportExportEverywhere: true,
    sourceType: 'module',
    requireConfigFile: false,
  },
  rules: {
    // allow reassigning param
    'no-param-reassign': [2, { props: false }],
    'prefer-destructuring': ['error', { object: false, array: false }],
    'linebreak-style': ['error', 'unix'],
    'import/extensions': ['error', {
      js: 'always',
    }],
    'max-len': 'off',
    'no-console': 'off',
  },
};

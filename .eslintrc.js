module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: ['airbnb-base', 'prettier'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    // semi: ['error', 'always'],
    // quotes: ['error', 'single'],
    // 'import/extensions': [
    //   'error',
    //   'ignorePackages',
    //   {
    //     js: 'never',
    //     jsx: 'never',
    //     ts: 'never',
    //     tsx: 'never',
    //   },
    // ],
    // 'import/no-dynamic-require': 0,
    // 'global-require': 0,
    // 'import/prefer-default-export': 0,
    // 'no-underscore-dangle': 0,
    // 'no-await-in-loop': 0,
    // 'no-restricted-syntax': 0,
    // 'no-return-await': 0,
    // 'no-console': 0,
    'prettier/prettier': 'error',
  },
  plugins: ['prettier'],
};

'use strict';

module.exports = {
  plugins: ['prettier'],
  env: {
    node: true,
    mocha: true,
  },
  extends: ['google'],
  parserOptions: {
    ecmaVersion: 9,
    sourceType: 'script',
    ecmaFeatures: {
      modules: false,
    },
  },
  rules: {
    'quote-props': ['error', 'as-needed'],
    strict: ['error', 'global'],
    'arrow-parens': ['error', 'as-needed'],
    'max-len': [
      'error',
      {
        code: 120,
      },
    ],
    indent: ['error', 2],
    'object-curly-spacing': ['error', 'always'],
    'require-jsdoc': 'off',
  },
};

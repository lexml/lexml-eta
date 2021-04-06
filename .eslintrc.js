module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    project: './tsconfig.json',
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
    },
  },
  plugins: ['@typescript-eslint', 'import', 'html'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'prettier/@typescript-eslint',
  ],
  rules: {
    eqeqeq: 'error',
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error"],
    'no-extra-semi': 'error',
    semi: 'error',
    'no-trailing-spaces': 'error',
    indent: ['error', 2, { SwitchCase: 1 }],
    'max-len': [
      'error',
      {
        code: 250,
        ignoreComments: true,
        ignoreTrailingComments: true,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreRegExpLiterals: true,
      },
    ],
    // disable the rule for all files
    'default-case': 'off',
    'no-console': 'off',
    'no-explicit-any': 'off',
    'no-cond-assign': 'off',
    'import/named': 'off',
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'import/prefer-default-export': 'off',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off'
  },
};

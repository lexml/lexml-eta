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
    extraFileExtensions: '.html',
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
    },
  },
  ignorePatterns: ['**/*.js'],
  plugins: ['@typescript-eslint', 'import', 'html'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
  ],
  rules: {
    eqeqeq: 'error',
    'no-unused-vars': 'off',
    // `catch (error)` sem uso do parâmetro é idioma corrente na base.
    '@typescript-eslint/no-unused-vars': ['error', { caughtErrors: 'none' }],
    // `cond ? a() : b();` e `cond && a();` como statement são idioma corrente na base.
    '@typescript-eslint/no-unused-expressions': ['error', { allowTernary: true, allowShortCircuit: true }],
    'no-extra-semi': 'error',
    semi: 'error',
    'no-trailing-spaces': 'error',
    'max-len': [
      'error',
      {
        code: 450,
        ignoreComments: true,
        ignoreTrailingComments: true,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreRegExpLiterals: true,
      },
    ],
    // disable the rule for all the following files
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
    '@typescript-eslint/explicit-module-boundary-types': 'off',
  },
  overrides: [
    {
      // Asserções do chai (expect(x).to.be.true) são expressões, não chamadas.
      files: ['test/**/*.ts', 'cypress/**/*.ts'],
      rules: {
        '@typescript-eslint/no-unused-expressions': 'off',
      },
    },
  ],
};

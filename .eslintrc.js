module.exports = {
  env: {
    browser: true,
    node: true,
    jest: true,
  },
  extends: ['eslint:recommended'],
  plugins: ['import'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    indent: 0,
    'no-redeclare': 'off',
    'no-dupe-class-members': 0,
    'no-unused-vars': 0,
    'comma-dangle': [
      2,
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'only-multiline',
        exports: 'only-multiline',
        functions: 'only-multiline',
      },
    ],
    'import/prefer-default-export': 0,
    'no-async-promise-executor': 0,
    'no-bitwise': [
      0,
      {
        allow: ['~'],
        int32Hint: true,
      },
    ],
    'no-multiple-empty-lines': [
      2,
      {
        max: 1,
      },
    ],
    'no-trailing-spaces': 2,
    'prefer-arrow-callback': [
      2,
      {
        allowNamedFunctions: true,
      },
    ],
    quotes: [2, 'single'],
    'quote-props': [2, 'as-needed'],
  },
  overrides: [
    {
      files: ['./**/*.{ts}'],
      extends: ['airbnb-typescript', 'plugin:@typescript-eslint/recommended'],
      plugins: ['@typescript-eslint'],
      parserOptions: {
        project: './tsconfig.*?.json',
      },
      rules: {
        '@typescript-eslint/indent': [2, 2],
        '@typescript-eslint/no-unused-vars': [
          2,
          {
            varsIgnorePattern: '^_',
            argsIgnorePattern: '^_',
            ignoreRestSiblings: true,
          },
        ],
      },
    },
    {
      files: ['./**/*.spec.{ts,tsx}'],
      rules: {
        '@typescript-eslint/ban-ts-ignore': 0,
        'import/no-extraneous-dependencies': 0,
      },
    },
  ],
};

import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['node_modules', 'out', '.vscode-test', 'dist'],
  },
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
      },
    },
    rules: {
      ...js.configs.recommended.rules,
    },
  },
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: ['**/*.ts', '**/*.tsx'],
  })),
  ...tseslint.configs.stylisticTypeChecked.map((config) => ({
    ...config,
    files: ['**/*.ts', '**/*.tsx'],
  })),
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // TypeScript ESLint - Type checking rules
      '@typescript-eslint/only-throw-error': 'error',
      '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/explicit-member-accessibility': 'off',
      '@typescript-eslint/member-ordering': 'warn',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE'],
          leadingUnderscore: 'forbid',
          trailingUnderscore: 'forbid',
        },
      ],
      '@typescript-eslint/no-base-to-string': 'error',
      '@typescript-eslint/no-confusing-non-null-assertion': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-for-in-array': 'error',
      '@typescript-eslint/no-implied-eval': 'error',
      '@typescript-eslint/no-misused-new': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-namespace': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/no-unnecessary-type-constraint': 'error',
      '@typescript-eslint/no-unsafe-declaration-merging': 'error',
      '@typescript-eslint/no-var-requires': 'error',
      '@typescript-eslint/prefer-as-const': 'error',
      '@typescript-eslint/prefer-function-type': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/restrict-plus-operands': 'error',
      '@typescript-eslint/restrict-template-expressions': 'warn',
      '@typescript-eslint/unbound-method': 'error',
      '@typescript-eslint/unified-signatures': 'error',

      // TypeScript ESLint - Style rules (non-formatting)
      '@typescript-eslint/consistent-generic-constructors': 'warn',
      '@typescript-eslint/dot-notation': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-empty-interface': 'error',
      '@typescript-eslint/no-inferrable-types': [
        'error',
        {
          ignoreParameters: true,
        },
      ],
      '@typescript-eslint/no-shadow': [
        'error',
        {
          hoist: 'all',
        },
      ],
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/no-unnecessary-qualifier': 'warn',
      '@typescript-eslint/no-unnecessary-type-arguments': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/no-unused-expressions': 'error',
      '@typescript-eslint/prefer-readonly': 'warn',

      // ESLint rules - Logic & Best Practices
      'array-callback-return': 'error',
      curly: 'error',
      eqeqeq: ['error', 'smart'],
      'guard-for-in': 'error',
      'no-bitwise': 'error',
      'no-caller': 'error',
      'no-console': [
        'error',
        {
          allow: ['log', 'debug', 'warn', 'error'],
        },
      ],
      'no-debugger': 'error',
      'no-eval': 'error',
      'no-fallthrough': 'error',
      'no-new-wrappers': 'error',
      'no-redeclare': 'off',
      'no-throw-literal': 'off',
      'no-underscore-dangle': 'off',
      'no-unused-labels': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      radix: 'error',

      // ESLint rules - Disabled (handled by @stylistic or not needed for Node/extension)
      'dot-notation': 'off',
      'id-denylist': 'off',
      'id-match': 'off',
      'no-empty': 'off',
      'no-empty-function': 'off',
      'no-restricted-imports': 'off',
      'no-shadow': 'off',
      'no-unused-expressions': 'off',
    },
  },
];

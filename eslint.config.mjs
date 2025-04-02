import js from '@eslint/js';
import pluginSimpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import ts from 'typescript-eslint';

export default ts.config(
  { ignores: ['**/build/**', '**/dist/**'] },

  js.configs.recommended,
  ...ts.configs.recommended,
  ...ts.configs.stylistic,

  {
    languageOptions: {
      globals: {
        ...globals.globals,
      },
    },
  },

  {
    plugins: {
      'simple-import-sort': pluginSimpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },

  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
);

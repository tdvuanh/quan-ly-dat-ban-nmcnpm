import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import prettier from 'eslint-plugin-prettier';

const compat = new FlatCompat();

export default [
  // eslint:recommended
  js.configs.recommended,

  // plugin:react/recommended
  ...compat.extends('plugin:react/recommended'),

  // plugin:@typescript-eslint/recommended
  ...compat.extends('plugin:@typescript-eslint/recommended'),

  // plugin:prettier/recommended
  ...compat.extends('plugin:prettier/recommended'),

  {
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        process: 'readonly',
        __dirname: 'readonly',
      },
    },

    plugins: {
      react,
      '@typescript-eslint': tseslint,
      prettier,
    },

    rules: {
      'prettier/prettier': 'warn',
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'react/prop-types': 'off',
    },
  },
];

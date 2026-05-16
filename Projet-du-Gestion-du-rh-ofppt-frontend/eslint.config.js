import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import hooksPlugin from 'eslint-plugin-react-hooks';

export default [
  js.configs.recommended,
  {
    plugins: { react: reactPlugin, 'react-hooks': hooksPlugin },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        window: true, document: true, localStorage: true, console: true, fetch: true,
        Blob: true, CustomEvent: true, File: true, FileReader: true, FormData: true,
        btoa: true,
        Date: true, Math: true, URL: true, URLSearchParams: true, Object: true,
        Promise: true, Array: true, String: true, Number: true, Boolean: true,
        setTimeout: true, clearTimeout: true, alert: true,
      },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: '19' } },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...hooksPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': 'off',
    },
  },
];

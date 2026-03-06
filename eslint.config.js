import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';
import importX from 'eslint-plugin-import-x'


export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: {
      js,
      import: importX
    },
    extends: ['js/recommended'],
    languageOptions: {
      globals: globals.node,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      // Konsistensi kode
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'eqeqeq': ['error', 'always'],

      // Style
      'semi': ['off'],
      'quotes': ['error', 'single'],
      'indent': ['error', 2],

      // Import — penting untuk Clean Architecture
      'import/no-cycle': 'error',        // cegah circular dependency antar layer
      'import/order': ['warn', {
        groups: ['builtin', 'external', 'internal'],
        'newlines-between': 'always',
      }],
    },
  },
  {
    // Khusus file test — matikan beberapa rule yang ganggu
    files: ['**/*.test.js', '**/*.spec.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.vitest ?? {},
      },
    },
    rules: {
      'no-unused-vars': 'warn',
    },
  },

]);

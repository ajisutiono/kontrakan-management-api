// eslint.config.js — versi simpel yang pasti jalan
import js from '@eslint/js'
import globals from 'globals'
import { defineConfig } from 'eslint/config'
import vitest from '@vitest/eslint-plugin'

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: {
      globals: globals.node,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'eqeqeq': ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
      'semi': ['error', 'never'],
      'quotes': ['error', 'single'],
      'indent': ['error', 2],
    },
  },
  {
    files: ['**/*.test.js', '**/*.spec.js', 'tests/**/*.js'],
    plugins: { vitest },
    languageOptions: {
      globals: {
        ...globals.node,
        ...vitest.environments.env.globals,
      },
    },
    rules: {
      ...vitest.configs.recommended.rules,
      'no-unused-vars': 'warn',
    },
  },
  {
    ignores: ['node_modules/**', 'coverage/**', 'dist/**'],
  },
])
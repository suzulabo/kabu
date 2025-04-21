import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import type { InfiniteDepthConfigWithExtends } from 'typescript-eslint';
import ts from 'typescript-eslint';

const jsConfig: InfiniteDepthConfigWithExtends = {
  files: ['**/*.js'],
  extends: [js.configs.recommended],
  rules: {
    eqeqeq: 'error',
  },
};

const tsConfig: InfiniteDepthConfigWithExtends = {
  files: ['**/*.ts'],
  extends: [
    js.configs.recommended,
    ...ts.configs.strictTypeChecked,
    ...ts.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    parserOptions: {
      project: true,
    },
  },
  rules: {
    ...jsConfig.rules,
    '@typescript-eslint/restrict-template-expressions': [
      'error',
      {
        allowNumber: true,
      },
    ],
    '@typescript-eslint/consistent-type-definitions': 'off',
  },
};

const unicornConfig: InfiniteDepthConfigWithExtends = {
  extends: [eslintPluginUnicorn.configs.recommended],
  rules: {
    'unicorn/filename-case': 'off',
    'unicorn/prefer-dom-node-text-content': 'off',
  },
};

const config = ts.config(
  {
    ignores: ['pnpm-lock.yaml', '**/node_modules'],
  },
  jsConfig,
  tsConfig,
  unicornConfig,
  prettier,
);

export default config;

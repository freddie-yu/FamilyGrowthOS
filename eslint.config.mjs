import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '.tools/**',
      '.agents/**',
      'coverage/**',
      '**/tokens.scss',
      '**/tokens.css',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { languageOptions: { globals: { ...globals.node, ...globals.jest } } },
  {
    files: ['miniprogram/**/*.ts', 'miniprogram/**/*.tsx'],
    languageOptions: {
      globals: {
        defineAppConfig: 'readonly',
        definePageConfig: 'readonly',
        __FG_ENVIRONMENT__: 'readonly',
        __FG_API_BASE_URL__: 'readonly',
      },
    },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            'react-dom',
            'react-dom/*',
            'animal-island-ui',
            'animal-island-ui/*',
            'naive-icons',
            'framer-motion',
          ],
        },
      ],
      'no-restricted-globals': ['error', 'window', 'document', 'localStorage'],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'JSXOpeningElement[name.name=/^(div|span|button|input|select)$/]',
          message: '小程序使用 @tarojs/components 和本地适配器。',
        },
      ],
    },
  },
  {
    files: ['web-admin/**/*.ts', 'web-admin/**/*.tsx'],
    languageOptions: { globals: globals.browser },
  },
  { files: ['**/*.cjs'], rules: { '@typescript-eslint/no-require-imports': 'off' } },
);

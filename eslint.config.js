import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig([
    {
        files: ['**/*.{js,mjs,cjs}'],
        plugins: { js },
        extends: ['js/recommended'],
    },
    {
        files: ['**/*.{js,mjs,cjs}'],
        languageOptions: { globals: globals.browser },
    },
    {
        rules: {
            'no-unused-vars': 'warn',
            'no-undef': 'warn',
            indent: ['warn', 'tab'],
            quotes: ['error', 'single'],
            semi: ['error', 'always'],
            'prettier/prettier': [
                'error',
                {
                    endOfLine: 'auto',
                },
            ],
            'import/extensions': [
                'error',
                'ignorePackages',
                {
                    js: 'always',
                    mjs: 'never',
                },
            ],
            'key-spacing': [
                'error',
                {
                    afterColon: true,
                    beforeColon: false,
                },
            ],
            'keyword-spacing': [
                'error',
                {
                    before: true,
                    after: true,
                },
            ],
            'no-multiple-empty-lines': 1,
            'linebreak-style': 0,
            'space-before-function-paren': [
                'error',
                {
                    anonymous: 'always',
                    named: 'always',
                    asyncArrow: 'always',
                },
            ],
            'no-trailing-whitespace': 0,
            'import/no-dynamic-require': 0,
            'global-require': 0,
            'import/prefer-default-export': 0,
            'no-underscore-dangle': 0,
            'no-restricted-syntax': 0,
            'max-len': [
                2,
                {
                    code: 200,
                    tabWidth: 4,
                    ignoreUrls: true,
                },
            ],
            'no-param-reassign': [
                2,
                {
                    props: false,
                },
            ],
            'no-console': 1,
        },
    },
]);

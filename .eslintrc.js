module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 2018,
        sourceType: 'module',
        project: './tsconfig.json',
    },
    extends: [
        'airbnb-typescript',
        'airbnb/hooks',
        'plugin:@typescript-eslint/recommended',
        'prettier',
        'plugin:prettier/recommended',
    ],
    plugins: ['react', '@typescript-eslint'],
    env: {
        browser: true,
        es6: true,
    },
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
    },
    rules: {
        'no-console': 1,
        '@typescript-eslint/no-unused-vars': 2,
        'react/jsx-props-no-spreading': 'off',
        'linebreak-style': 'off',
        'prettier/prettier': [
            'error',
            {
                endOfLine: 'auto',
            },
        ],
    },
};

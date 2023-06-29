/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
    root: true,
    extends: [
        'plugin:vue/vue3-essential',
        'eslint:recommended',
        '@vue/eslint-config-typescript'
    ],
    overrides: [
        {
            files: [
                'cypress/e2e/**/*.{cy,spec}.{js,ts,jsx,tsx}'
            ],
            extends: [
                'plugin:cypress/recommended'
            ],
        },
    ],
    parserOptions: {
        ecmaVersion: 'latest'
    },
    rules: {
        "@typescript-eslint/explicit-function-return-type": 2,
        "@typescript-eslint/consistent-type-assertions": 2,
        "vue/no-mutating-props": "off",
        "vue/multi-word-component-names": ["error", {
            "ignores": [
                "Input",
                "Card",
                "Section",
                "Defense",
                "Pet",
                "Shards",
            ]
        }],
    }
}

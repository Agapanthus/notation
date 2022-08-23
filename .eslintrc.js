/*
👋 Hi! This file was autogenerated by tslint-to-eslint-config.
https://github.com/typescript-eslint/tslint-to-eslint-config

It represents the closest reasonable ESLint configuration to this
project's original TSLint configuration.

We recommend eventually switching this configuration to extend from
the recommended rulesets in typescript-eslint. 
https://github.com/typescript-eslint/tslint-to-eslint-config/blob/master/docs/FAQs.md

Happy linting! 💖
*/
module.exports = {
    env: {
        browser: true,
        es6: true,
        node: false
    },
    extends: [
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "plugin:vue/recommended",
        "@vue/typescript",
        "plugin:@typescript-eslint/all"
    ],
    parser: "vue-eslint-parser", // "@typescript-eslint/parser",
    parserOptions: {
        parser: "@typescript-eslint/parser",
        project: "./resources/tsconfig.json",
        sourceType: "module"
    },
    plugins: [
        "eslint-plugin-import",
        "eslint-plugin-jsdoc",
        "@typescript-eslint",
        "vuetify",
        "babel",
        "chai-friendly"
    ],
    rules: {
        "@typescript-eslint/adjacent-overload-signatures": "error",
        "@typescript-eslint/array-type": [
            "error",
            {
                default: "array"
            }
        ],
        "@typescript-eslint/ban-types": [
            "error",
            {
                types: {
                    Object: {
                        message:
                            "Avoid using the `Object` type. Did you mean `object`?"
                    },
                    Function: {
                        message:
                            "Avoid using the `Function` type. Prefer a specific function type, like `() => void`."
                    },
                    Boolean: {
                        message:
                            "Avoid using the `Boolean` type. Did you mean `boolean`?"
                    },
                    Number: {
                        message:
                            "Avoid using the `Number` type. Did you mean `number`?"
                    },
                    String: {
                        message:
                            "Avoid using the `String` type. Did you mean `string`?"
                    },
                    Symbol: {
                        message:
                            "Avoid using the `Symbol` type. Did you mean `symbol`?"
                    }
                }
            }
        ],
        "@typescript-eslint/consistent-type-assertions": "error",
        "@typescript-eslint/dot-notation": "error",
        "@typescript-eslint/naming-convention": "error",
        "@typescript-eslint/no-empty-interface": "error",
        "@typescript-eslint/no-floating-promises": "error",
        "@typescript-eslint/no-misused-new": "error",
        "@typescript-eslint/no-namespace": "error",
        "@typescript-eslint/no-shadow": [
            "error",
            {
                hoist: "all"
            }
        ],
        "@typescript-eslint/no-this-alias": "error",
        "@typescript-eslint/no-unused-expressions": "error",
        "@typescript-eslint/prefer-for-of": "error",
        "@typescript-eslint/prefer-function-type": "error",
        "@typescript-eslint/prefer-namespace-keyword": "error",
        "@typescript-eslint/triple-slash-reference": [
            "error",
            {
                path: "always",
                types: "prefer-import",
                lib: "always"
            }
        ],
        "@typescript-eslint/unified-signatures": "error",

        "constructor-super": "error",
        "dot-notation": "error",
        eqeqeq: ["error", "smart"],
        "guard-for-in": "error",
        "id-blacklist": [
            "error",
            "any",
            "Number",
            "number",
            "String",
            "string",
            "Boolean",
            "boolean",
            "Undefined",
            "undefined"
        ],
        "id-match": "error",
        "import/order": "off",
        "jsdoc/check-alignment": "error",
        "jsdoc/check-indentation": "error",
        "jsdoc/newline-after-description": "error",
        "max-classes-per-file": "off",
        "new-parens": "error",
        "no-bitwise": "error",
        "no-caller": "error",
        "no-cond-assign": "error",
        "no-console": "warn",
        "no-debugger": "error",
        "no-duplicate-imports": "error",
        "no-multiple-empty-lines": "off",
        "no-new-wrappers": "error",
        "no-shadow": "error",
        "no-throw-literal": "error",
        "no-undef-init": "error",
        "no-underscore-dangle": "error",
        "no-unsafe-finally": "error",
        "no-unused-expressions": "error",
        "no-unused-labels": "error",
        "no-var": "error",
        "one-var": ["error", "never"],
        "prefer-const": "error",
        radix: "error",
        "use-isnan": "error",
        "vue/html-indent": "off",
        "vue/max-attributes-per-line": "off",
        "@typescript-eslint/object-curly-spacing": "off",
        "@typescript-eslint/lines-between-class-members": "off",
        "@typescript-eslint/space-before-function-paren": "off",
        "@typescript-eslint/explicit-member-accessibility": "warn",
        "@typescript-eslint/no-magic-numbers": "off",
        "@typescript-eslint/no-unused-vars": "warn",
        "vue/html-closing-bracket-newline": "off",
        "vue/multiline-html-element-content-newline": "off",
        "vue/singleline-html-element-content-newline": "off",
        "@typescript-eslint/prefer-readonly-parameter-types": "off",
        "@typescript-eslint/strict-boolean-expressions": "off",
        "@typescript-eslint/no-implicit-any-catch": "off",
        "@typescript-eslint/restrict-plus-operands": "off",
        "@typescript-eslint/member-ordering": "off",
        "no-duplicate-imports": "off",
        "@typescript-eslint/no-inferrable-types": "off",
        "@typescript-eslint/naming-convention": "off",
        "@typescript-eslint/consistent-type-imports": "off",
        "@typescript-eslint/no-confusing-void-expression": "off",
        "@typescript-eslint/no-parameter-properties": "off",
        "@typescript-eslint/indent": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-type-alias": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-extra-parens": "off",
        quotes: "off",
        "@typescript-eslint/quotes": "off",
        "@typescript-eslint/explicit-function-return-type": [
            "warn",
            {
                allowExpressions: true,
                allowTypedFunctionExpressions: false,
                allowHigherOrderFunctions: false
            }
        ],
        "no-unused-expressions": "off",
        "@typescript-eslint/no-unused-expressions": "off",
        "@typescript-eslint/comma-dangle": "off",
        "chai-friendly/no-unused-expressions": "error",
    }
};

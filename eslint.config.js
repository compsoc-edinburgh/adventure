/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigFile} */
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";
import importPlugin from "eslint-plugin-import";
import reactPlugin from "eslint-plugin-react";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import stylistic from "@stylistic/eslint-plugin";

const __dirname = new URL(".", import.meta.url).pathname;

export default [
  js.configs.recommended,
  importPlugin.flatConfigs.recommended,
  {
    ignores: [
      "build/*",
      "build/**/*",
      "**/build/**/*",
      "eslint.config.mjs",
      "coverage/*",
      "coverage/**/*",
      "node_modules/*",
      "node_modules/**/*",
      "global.d.ts",
      "**/*.test.ts",
      "**/*.test.js",
      "**/*.test.tsx",
      "**/*.test.jsx",
      "**/*.spec.ts",
      "**/*.spec.js",
      "**/*.spec.tsx",
      "**/*.spec.jsx",
    ],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.commonjs,
        ...globals.es6,
        ...globals.jest,
        process: "readonly",
      },
    },
    plugins: {
      "react": reactPlugin,
      "jsx-a11y": jsxA11yPlugin,
      "react-hooks": reactHooksPlugin,
    },
    rules: {
      ...reactHooksPlugin.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...jsxA11yPlugin.configs.recommended.rules,
      "react/no-unescaped-entities": "off",
      "react/display-name": "off",
      "react/prop-types": "off",
      "no-prototype-builtins": "off",
    },
    settings: {
      "react": {
        version: "detect",
      },
      "jest": {
        version: 27,
      },
      "formComponents": ["Form"],
      "linkComponents": [
        { name: "Link", linkAttribute: "to" },
        { name: "NavLink", linkAttribute: "to" },
      ],
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
      },
      "import/ignore": [".(css)$"],
    },
  },
  // TypeScript configuration
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ["./tsconfig.json"],
      },
      globals: {
        ...globals.node,
        React: "readonly",
        NodeJS: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/ban-ts-comment": "off",
    },
  },
  // Node environment for eslint.config.mjs
  {
    files: ["eslint.config.mjs"],
    env: {
      node: true,
    },
  },
  stylistic.configs["disable-legacy"],
  stylistic.configs.customize({
    flat: true,
    indent: 2,
    quotes: "double",
    semi: true,
    commaDangle: "always-multiline",
    jsx: true,
  }),
];

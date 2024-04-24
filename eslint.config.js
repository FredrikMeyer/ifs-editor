import globals from "globals";
import eslint from "@eslint/js";
/* import eslintReact from "eslint-plugin-react/configs/recommended.js"; */
/* import eslintReactJsx from "eslint-plugin-react/configs/jsx-runtime.js"; */
import tseslint from "typescript-eslint";
/* import eslintReactHooks from "eslint-plugin-react-hooks/configs/"; */

/** @type {import('eslint').Linter.FlatConfig[]} */
export default tseslint.config(
  eslint.configs.recommended,
  /* eslintReactJsx, */
  ...tseslint.configs.recommendedTypeChecked,
  /* eslintReact, */
  /* eslintReactHooks, */
  {
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser.parser,
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
      },
    },
    files: ["**/*.ts", "**/*.tsx", "**/*.js"],
    ignores: [],
    rules: {},
  },
);

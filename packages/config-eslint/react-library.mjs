import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export const reactLibraryConfig = [
  {
    ignores: ["dist/**", "build/**"]
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },
  js.configs.recommended,
  ...tseslint.configs.recommended
];

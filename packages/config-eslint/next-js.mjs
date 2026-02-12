import js from "@eslint/js";
import nextVitals from "eslint-config-next/core-web-vitals.js";
import nextTs from "eslint-config-next/typescript.js";
import globals from "globals";
import tseslint from "typescript-eslint";

export const nextJsConfig = [
  {
    ignores: [
      ".next/**",
      "dist/**",
      "build/**",
      "next-env.d.ts"
    ]
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
  ...tseslint.configs.recommended,
  ...nextVitals,
  ...nextTs
];

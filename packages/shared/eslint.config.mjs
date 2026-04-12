import { baseConfig } from "@repo/eslint/base";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...baseConfig,
  {
    languageOptions: {
      globals: {
        window: "readonly",
        document: "readonly",
        TradingViewApi: "readonly",
        TradingView: "readonly",
      },
    },
  },
];

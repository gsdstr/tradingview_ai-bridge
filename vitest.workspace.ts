import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  {
    test: {
      include: ["apps/*/src/**/*.test.ts", "packages/*/src/**/*.test.ts"],
    },
  },
]);

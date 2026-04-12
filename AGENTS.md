# TradingView AI Desk

Refer to `README.md`.

## Monorepo Architecture

Turborepo is used to manage the monorepo.

### 📦 Project Status

- **`apps/mcp`**: MCP Server. Supports `stdio` mode via `pnpm mcp`.
- **`apps/cli`**: CLI tool. Accessible via `pnpm cli`.
- **`packages/shared`**: Core logic and CDP communication. Accessible via `pnpm shared`.
- **`tooling/*`**: Shared configurations for ESLint, Prettier, and TypeScript.

## 🛠️ Developer Workflow (PNPM + Turbo)

**ALWAYS** use `pnpm` from the root for workspace-wide commands.

## 📝 Coding Patterns

### Error Handling

**ALWAYS** use `getErrorMessage(error: unknown)` from `@repo/shared` in catch blocks. This pattern ensures robust error extraction even if the caught exception is not a standard `Error` instance.
Ref: [Kent C. Dodds - Get a catch block error message](https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript)

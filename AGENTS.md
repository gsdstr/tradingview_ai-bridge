# TradingView AI Desk

Refer to `README.md`.

## Monorepo Architecture

Turborepo is used to manage the monorepo.

### 📦 Project Status

- **`apps/mcp`**: MCP Server. Supports `stdio` mode via `pnpm mcp`.
- **`apps/cli`**: CLI tool. Accessible via `pnpm cli`.
- **`packages/core`**: Core logic and CDP communication. Accessible via `pnpm core`.

## 🛠️ Developer Workflow (PNPM + Turbo)

**ALWAYS** use `pnpm` from the root for workspace-wide commands.

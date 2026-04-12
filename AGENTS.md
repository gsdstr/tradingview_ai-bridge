# TradingView AI Desk

Refer to `README.md`.

## Monorepo Architecture

Turborepo is used to manage the monorepo.

### 📦 Project Status

- **`apps/mcp`**: MCP Server. Supports `stdio` mode via `pnpm mcp`.
- **`apps/cli`**: CLI tool. Accessible via `pnpm cli`.
- **`packages/shared`**: Core logic and CDP communication. Accessible via `pnpm shared`.
- **`tooling/*`**: Shared configurations for ESLint, Prettier, and TypeScript.

## 🤖 Note for AI Agents

This repository is designed to be highly discoverable for AI assistants.

### How to Interact
1.  **Shared Actions**: All business logic is centralized in `@repo/shared/src/actions/`. If you need to add a new capability, create a new Action there using the `StandardSchemaV1` pattern.
2.  **CLI Discovery**: The `apps/cli` dynamically generates its command tree from the shard registry. Run `pnpm dev --help` from the root or `apps/cli` to see the current command structure.
3.  **MCP Integration**: The `apps/mcp` server dynamically exposes these same actions as tools. If you are running as an MCP client, you should see these tools populated automatically.
4.  **Source of Truth**: The `actionRegistry` in `packages/shared/src/actions/index.ts` is the master list of all available operations.

### Key Patterns
- **StandardSchemaV1 (Zod)**: All inputs and outputs are strictly validated. Refer to the schemas in the `actions/` directory for expected parameter types.
- **Dynamic Routing**: Do not look for hardcoded command handlers in the CLI or MCP server. They are generated at runtime.

### Development Workflow
- **Adding a Feature**: Define the Zod schemas and `Action` object in `packages/shared/src/actions/`. Export it in `index.ts`. It will instantly be available in both the CLI and MCP.
- **Execution**: Always prefer using the `pnpm dev` script from the root to run the CLI or MCP server for latest changes.

## 🛠️ Developer Workflow (PNPM + Turbo)

**ALWAYS** use `pnpm` from the root for workspace-wide commands.

## 📝 Coding Patterns

### Error Handling

**ALWAYS** use `getErrorMessage(error: unknown)` from `@repo/shared` in catch blocks. This pattern ensures robust error extraction even if the caught exception is not a standard `Error` instance.
Ref: [Kent C. Dodds - Get a catch block error message](https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript)

# TradingView AI Bridge

## Monorepo Architecture

Turbo manage monorepo.

### 📦 Project Status

- **`apps/mcp`**: MCP Server. `stdio` mode via `pnpm mcp`.
- **`apps/cli`**: CLI tool. `pnpm cli`.
- **`packages/shared`**: Logic + CDP. `pnpm shared`.
- **`tooling/*`**: ESLint, Prettier, TS configs.

## 🤖 Note for AI Agents

Repo discoverable for AI.

### How to Interact

1. **Shared Actions**: Business logic in `@repo/shared/src/actions/`. Create Action with `StandardSchemaV1`.
2. **CLI Discovery**: `apps/cli` dynamic cmd tree. `pnpm dev --help` for structure.
3. **MCP Integration**: `apps/mcp` expose actions as tools automatically.
4. **Source of Truth**: `actionRegistry` in `packages/shared/src/actions/index.ts` list all ops.

### Key Patterns

- **StandardSchemaV1 (Zod)**: Inputs/outputs validated. Check schemas in `actions/`.
- **Dynamic Routing**: No hardcoded handlers. Generated at runtime.

### Development Workflow

- **Adding Feature**: Define Zod schemas + `Action` in `packages/shared/src/actions/`. Export in `index.ts`. Available in CLI + MCP.
- **Execution**: `pnpm dev` from root for CLI/MCP.

## 🛠️ Developer Workflow (PNPM + Turbo)

**ALWAYS** use `pnpm` from root.

## 📝 Coding Patterns

### Error Handling

**ALWAYS** use `getErrorMessage(error: unknown)` from `@repo/shared` in catch blocks. Robust error extraction.
Ref: [Kent C. Dodds](https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript)

## 📚 Documentation

If you have lack of information, read `README.md`.

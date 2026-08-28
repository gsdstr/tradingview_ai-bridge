# TradingView AI Bridge

## Agent Infrastructure Adapter

Reads `AGENTS.md` before doing any work. This file points it at
the portable brain in `.agents/`.

### Startup (read in order)

1. `.agents/AGENTS.md` — the map
2. `.agents/memory/personal/PREFERENCES.md` — user conventions
3. `.agents/memory/semantic/LESSONS.md` — distilled lessons
4. `.agents/protocols/permissions.md` — hard rules

### Hard rules

- No force push to `main`, `production`, `staging`.
- No modification of `.agents/protocols/permissions.md`.

## Monorepo Architecture

Turbo manage monorepo.

### 📦 Project Status

- **`apps/mcp`**: MCP Server. `stdio` mode via `bun run mcp`.
- **`apps/cli`**: CLI tool. `bun run cli`.
- **`packages/shared`**: Logic + CDP. `bun run shared` runs its unit tests.
- **`tooling/*`**: ESLint, Prettier, TS configs.

## 🤖 Note for AI Agents

Repo discoverable for AI.

### How to Interact

1. **Shared Actions**: Business logic in `@repo/shared/src/actions/`. Create Action with `StandardSchemaV1`.
2. **CLI Discovery**: `apps/cli` dynamic cmd tree. `bun run dev --help` for structure.
3. **MCP Integration**: `apps/mcp` expose actions as tools automatically.
4. **Source of Truth**: `actionRegistry` in `packages/shared/src/actions/index.ts` list all ops.

### Key Patterns

- **StandardSchemaV1 (Zod)**: Inputs/outputs validated. Check schemas in `actions/`.
- **Dynamic Routing**: No hardcoded handlers. Generated at runtime.

### Development Workflow

- **Adding Feature**: Define Zod schemas + `Action` in `packages/shared/src/actions/`. Export in `index.ts`. Available in CLI + MCP.
- **Execution**: `bun run dev` from root for CLI/MCP.

## 🛠️ Developer Workflow (Bun + Turbo)

**ALWAYS** use `bun` from root.

## 🧪 Testing

- **Unit Tests**: Colocated in `packages/shared/src/`. Use `bun --filter @repo/shared test`.
- **E2E Tests**: Managed in `apps/e2e`. Require TradingView app with `--remote-debugging-port=9222`.
- **Turbo**: Use `bunx turbo test` for workspace-wide execution.

## 📝 Coding Patterns

### Error Handling

**ALWAYS** use `getErrorMessage(error: unknown)` from `@repo/shared` in catch blocks. Robust error extraction.
Ref: [Kent C. Dodds](https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript)

## 📚 Documentation

If you have lack of information, read `README.md`.

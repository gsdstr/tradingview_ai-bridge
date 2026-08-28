# TradingView AI Bridge (via Chrome DevTools Protocol)

Bridge to connect your AI assistant to your TradingView Desktop charts. Connects agents (Claude Code, Antigravity, etc.) to your locally running TradingView app via Chrome DevTools Protocol for AI-assisted chart analysis, Pine Script development, and workflow automation.

> [!TIP]
> Base on idea from [TradingView MCP Bridge](https://github.com/tradesdontlie/tradingview-mcp)

> [!WARNING]
> **This tool is not affiliated with, endorsed by, or associated with TradingView Inc.** It interacts with your locally running TradingView Desktop application via Chrome DevTools Protocol. Review the [Disclaimer](#disclaimer) before use.

> [!IMPORTANT]
> **Requires a valid TradingView subscription.** This tool does not bypass or circumvent any TradingView paywall or access control. It reads from and controls the TradingView Desktop app already running on your machine.

> [!NOTE]
> **All data processing occurs locally on your machine.** No TradingView data is transmitted, stored, or redistributed externally by this tool.

> [!CAUTION]
> This tool accesses undocumented internal TradingView APIs via the Electron debug interface. These can change or break without notice in any TradingView update. Pin your TradingView Desktop version if stability matters to you.

## How It Works (and why it's safe to run)

This tool does not connect to TradingView's servers, modify any TradingView files, or intercept any network traffic. It communicates exclusively with your locally running TradingView Desktop instance via Chrome DevTools Protocol (CDP) — a standard debugging interface built into all Chromium/Electron applications by Google, including VS Code, Slack, and Discord.

The debug port is disabled by default and must be explicitly enabled by you using a standard Chromium flag (`--remote-debugging-port=9222`). Nothing happens without that deliberate step.

## Structure

This monorepo is managed by [Turborepo](https://turbo.build/) and uses the **Shared Action Architecture**. All core functionality is defined as atomic, schema-validated actions in the shared package.

### Apps and Packages

- **`apps/cli`**: A dynamic CLI built with [Yargs](https://yargs.js.org/). It automatically transforms shared actions into commands and subcommands (e.g., `watchlist get`).
- **`apps/mcp`**: A [Model Context Protocol](https://modelcontextprotocol.io/) server that dynamically exposes shared actions as tools for AI agents.
- **`apps/skills`**: Pre-configured **Agent Skills** that bundle tools (like the CLI) and instructions for autonomous agents.
- **`apps/e2e`**: E2E tests for the bridge.
- **`packages/shared`**: The heart of the project. Contains:
  - `src/actions/`: Core business logic defined using the `Action` interface and `StandardSchemaV1` (Zod).
  - `src/core/`: Internal TradingView bridge logic (CDP, watchlist manipulation, etc.).
- **`tooling/*`**: Shared configurations for ESLint, Prettier, and TypeScript.

### Available Actions

The following actions are defined in `@repo/shared` and available via both the CLI and MCP:

| Domain          | CLI Command     | Description                                                        |
| :-------------- | :-------------- | :----------------------------------------------------------------- |
| **TradingView** | `tv launch`     | Launch TradingView Desktop with remote debugging (CDP) enabled.    |
| **Watchlist**   | `watchlist get` | Fetch the currently open symbol watchlist from the TradingView UI. |
| **Watchlist**   | `watchlist add` | Add a new symbol to your current TradingView watchlist.            |

...

## 🤖 Agent Skills

This repository provides pre-built "Skills" for AI agents (like Claude Code or Antigravity) to enable autonomous interaction with TradingView.

### CLI Skill (`apps/skills/tv-bridge-cli`)

A standalone, dependency-free bundle of the `tv-bridge-cli`. It includes a dedicated `SKILL.md` that teaches the agent how to launch TradingView, check chart status, and manipulate watchlists.

### MCP Skill (`apps/skills/tv-bridge-mcp`)

A standalone bundle of the TradingView MCP server. It provides all bridge actions as tools to the agent via the Model Context Protocol.

To build skills:

```bash
bun --filter @repo/skill-tv-bridge-cli run build
bun --filter @repo/skill-tv-bridge-mcp run build
```

## Utilities

This project uses modern tooling for developer experience:

- [Bun](https://bun.sh/) for package management and workspace scripts.
- [TypeScript](https://www.typescriptlang.org/) for strict type safety.
- [Zod](https://zod.dev/) and [StandardSchemaV1](https://github.com/standard-schema/spec) for runtime validation.
- [ESLint](https://eslint.org/) and [Prettier](https://prettier.io) for code quality.

## 🧪 Testing Architecture

This monorepo follows modern testing best practices to ensure stability across core logic and E2E automation.

### 🧩 Unit Testing (Colocated)

Unit tests for core logic are colocated with the source code in `packages/shared/src/`. This ensures that logic and its verification stay in sync.

- **Location**: `packages/shared/src/**/*.test.ts`
- **Runner**: [Vitest](https://vitest.dev/)
- **Command**: `bun --filter @repo/shared test`

### 🏗️ End-to-End (E2E) Testing

E2E tests interact with a real TradingView Desktop instance. They are isolated in a dedicated package to separate environment-dependent tests from pure logic.

- **Location**: `apps/e2e/src/`
- **Requirements**: TradingView Desktop running with `--remote-debugging-port=9222`.
- **Runner**: [Vitest](https://vitest.dev/)
- **Command**: `bun --filter @repo/e2e test`

## ⚡ Monorepo Execution (Turborepo)

We use [Turborepo](https://turbo.build/) to manage tests across all packages. This enables caching and parallel execution.

- **Command**: `bunx turbo test` (runs all unit, integration, and E2E tests).

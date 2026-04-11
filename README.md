# TradingView Bridge (via Chrome DevTools Protocol)

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

This Turborepo

### Apps and Packages

### Apps and Packages

- `apps/cli`: CLI tool for TradingView interaction
- `packages/core`: Core logic and CDP communication
- `tooling/eslint`: Shared ESLint configurations (@repo/eslint)
- `tooling/typescript`: Shared TypeScript configurations (@repo/typescript)
- `tooling/prettier`: Shared Prettier configuration (@repo/prettier)

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

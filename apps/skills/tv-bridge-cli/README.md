# TradingView AI Bridge CLI Skill

This skill provides AI agents with a standalone, dependency-free CLI tool for interacting with TradingView Desktop via Chrome DevTools Protocol.

## Overview

The `tv-bridge-cli` allows agents to:

- **Launch TradingView** with remote debugging enabled.
- **Manage Watchlists**: Retrieve and add symbols to the current watchlist in the UI.
- **Check Health**: Verify connections to the TradingView app.
- **Get Info**: Retrieve bridge metadata and connection status.

## Contents

- `scripts/tv-bridge-cli.mjs`: The standalone bundled CLI.
- `SKILL.md`: Detailed instructions for the agent on how to use the tool.

## Installation for Agents

This skill is designed to be added to an agent's workspace. Once added, the agent should refer to `SKILL.md` for specific command documentation and usage patterns.

## Development

To rebuild the standalone CLI script within this skill:

```bash
pnpm run build
```

This will bundle the core CLI from `apps/cli` and copy it to the local `scripts/` directory.

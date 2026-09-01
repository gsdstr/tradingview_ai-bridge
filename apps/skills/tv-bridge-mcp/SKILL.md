---
name: tv-bridge-mcp
description: Configure and interact with TradingView AI Bridge via Model Context Protocol (MCP) server over CDP. Provides health checks, watchlist management, and bridge details.
metadata:
  version: 0.1.0
  category: tradingview
  tags: [tradingview, cdp, mcp, bridge, automation]
---

# Skill: TradingView Bridge MCP

Instructions for AI agents to configure and interact with the TradingView AI Bridge via the Model Context Protocol (MCP).

## Configuration

`npx skills` installs this skill but does not define a portable MCP path variable. Resolve the installed directory first (for a project installation, run `pwd` from `.agents/skills/tv-bridge-mcp`) and replace `<ABSOLUTE_SKILL_PATH>` below with that absolute directory. Do not use a relative path: MCP hosts resolve it from their own working directory.

Add the resulting entry to your MCP configuration file (for example, `claude_desktop_config.json` or `.mcp.json`):

```json
{
  "mcpServers": {
    "tradingview": {
      "command": "node",
      "args": ["<ABSOLUTE_SKILL_PATH>/scripts/tv-bridge-mcp.js"]
    }
  }
}
```

## Available Tools

Once connected, the following tools will be available:

### `bridge_health-check`
- **Purpose**: Verify CDP connection status and chart metadata.
- **Output**: JSON containing `cdp_connected`, `api_available`, and active chart info.

### `watchlist_get`
- **Purpose**: Retrieve the current watchlist from the TradingView UI.
- **Output**: Array of symbol strings.

### `watchlist_add`
- **Purpose**: Add a new symbol to the active watchlist.
- **Input**: `{ "symbol": "NASDAQ:AAPL" }`

### `bridge_get-info`
- **Purpose**: Show bridge metadata.

### `strategy_update-report`
- **Purpose**: Click the "Update report" button in the Strategy Tester snackbar if present.
- **Output**: JSON with `updated: true/false`, `reason` when absent/disabled, and execution status.

### Strategy report workflow

- After `indicator_set-inputs` changes a strategy, call `data_get-strategy-performance` for recalculated metrics; it does not require a UI report update.
- Call `strategy_update-report` only when the visible Strategy Tester report also needs synchronization.

## Usage Guidelines

1. **Automation**: Always check `bridge_health-check` before suggesting TradingView UI interactions.
2. **Launch Requirement**: If `bridge_health-check` shows `cdp_connected: false`, use the CLI skill (`tv bridge launch`) first to open TradingView with the correct debugging flags.
3. **Validation**: The server uses strict Zod validation (StandardSchemaV1). Ensure inputs match the required schema.

## Example Workflow

1.  **Agent Action**: Call `bridge_health-check`.
2.  **Response**: "Status: Connected, Symbol: BTCUSD".
3.  **Agent Action**: Prompt user - "I see you are on BTCUSD, would you like me to add it to your watchlist?".
4.  **Agent Action**: Call `watchlist_add` with symbol.

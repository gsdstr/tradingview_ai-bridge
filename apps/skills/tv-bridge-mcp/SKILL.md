# Skill: TradingView Bridge MCP

Instructions for AI agents to configure and interact with the TradingView AI Bridge via the Model Context Protocol (MCP).

## Tool Location

The MCP server is located at: `scripts/tv-bridge-mcp.js`.

## Configuration

To use this skill, add the following entry to your MCP configuration file (e.g., `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "tradingview": {
      "command": "node",
      "args": ["/path/to/apps/skills/tv-bridge-mcp/scripts/tv-bridge-mcp.js"]
    }
  }
}
```

## Available Tools

Once connected, the following tools will be available:

### `tv_health`
- **Purpose**: Verify CDP connection status and chart metadata.
- **Output**: JSON containing `cdp_connected`, `api_available`, and active chart info.

### `watchlist_get`
- **Purpose**: Retrieve the current watchlist from the TradingView UI.
- **Output**: Array of symbol strings.

### `watchlist_add`
- **Purpose**: Add a new symbol to the active watchlist.
- **Input**: `{ "symbol": "NASDAQ:AAPL" }`

### `info`
- **Purpose**: Show bridge metadata.

## Usage Guidelines

1. **Automation**: Always check `tv_health` before suggesting TradingView UI interactions.
2. **Launch Requirement**: If `tv_health` shows `cdp_connected: false`, you may need to use the CLI skill (`tv launch`) first to open TradingView with the correct debugging flags.
3. **Validation**: The server uses strict Zod validation (StandardSchemaV1). Ensure inputs match the required schema.

## Example Workflow

1.  **Agent Action**: Call `tv_health`.
2.  **Response**: "Status: Connected, Symbol: BTCUSD".
3.  **Agent Action**: Prompt user - "I see you are on BTCUSD, would you like me to add it to your watchlist?".
4.  **Agent Action**: Call `watchlist_add` with symbol.

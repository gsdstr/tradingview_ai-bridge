# Skill: TradingView Bridge CLI

Instructions for AI agents to interact with the TradingView AI Bridge via the command line tool.

## Tool Location

The CLI is located at: `scripts/tv-bridge-cli.mjs`.
Execute it using Node.js: `node scripts/tv-bridge-cli.mjs <command> [args]`.

## Core Commands

### `tv` (TradingView Operations)

- **`node scripts/tv-bridge-cli.mjs tv launch`**: Launches TradingView Desktop with CDP enabled (default port 9222).
  - Optional flag: `--kill-existing` (bool) to kill running instances first.

- **`node scripts/tv-bridge-cli.mjs tv health`**: Verifies the connection to TradingView.
  - Returns JSON with `cdp_connected`, `api_available`, and current chart details (symbol, resolution).

### `watchlist` (Watchlist Management)

- **`node scripts/tv-bridge-cli.mjs watchlist get`**: Returns the list of symbols in the currently open TradingView watchlist.

- **`node scripts/tv-bridge-cli.mjs watchlist add --symbol <SYMBOL>`**: Adds a symbol to the current watchlist.
  - Example: `node scripts/tv-bridge-cli.mjs watchlist add --symbol NASDAQ:TSLA`.

### `info` (System Information)

- **`node scripts/tv-bridge-cli.mjs info`**: Returns application metadata and connection status.

## Usage Guidelines

1. **Check Health First**: Before performing any UI actions, run `tv health` to ensure the bridge is connected and TradingView is responsive.
2. **JSON Output**: All successful commands return structured JSON. Parse the output to extract required information.
3. **Validation Errors**: If input is invalid (e.g., missing `--symbol`), the CLI will exit with code 1 and print a validation error.
4. **Platform Support**: Commands are tested on macOS with TradingView Desktop.

## Example Workflow

1.  Check status: `node scripts/tv-bridge-cli.mjs tv health`.
2.  If not connected: `node scripts/tv-bridge-cli.mjs tv launch`.
3.  Add symbol: `node scripts/tv-bridge-cli.mjs watchlist add --symbol TSLA`.
4.  Verify list: `node scripts/tv-bridge-cli.mjs watchlist get`.

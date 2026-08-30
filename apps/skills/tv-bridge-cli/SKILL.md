---
name: tv-bridge-cli
description: Operate and interact with TradingView Desktop via the standalone tv-bridge-cli tool over Chrome DevTools Protocol (CDP). Use for discovering actions, launching TradingView with debugging flags, verifying CDP connection health, querying chart state, reading data/indicators/drawings, running replays, managing watchlists, and troubleshooting bridge connection issues.
metadata:
  version: 1.0.0
  category: tradingview
  tags: [tradingview, cdp, cli, bridge, automation, chart]
---

# Skill: TradingView Bridge CLI

Comprehensive guide for AI agents to operate the TradingView AI Bridge using the standalone CLI tool (`tv-bridge-cli.mjs`).

---

## 1. Tool Location & Execution

The standalone, bundled CLI script is located at:
```
apps/skills/tv-bridge-cli/scripts/tv-bridge-cli.mjs
```

### Execution Runtimes

Execute using Node.js (>=22) or Bun:

```bash
# Using Node.js
node apps/skills/tv-bridge-cli/scripts/tv-bridge-cli.mjs <command> [subcommand] [flags]

# Using Bun
bun apps/skills/tv-bridge-cli/scripts/tv-bridge-cli.mjs <command> [subcommand] [flags]

# If operating from within the apps/skills/tv-bridge-cli directory:
node scripts/tv-bridge-cli.mjs <command> [subcommand] [flags]
```

---

## 2. Dynamic Command Discovery

The CLI dynamically discovers and routes commands from the underlying action registry using `yargs`. Commands are grouped by action prefix (e.g., `tv_launch` becomes `tv launch`, `chart_get-state` becomes `chart get-state`).

### Listing Commands

1. **List all top-level command groups & standalone commands**:
   ```bash
   node scripts/tv-bridge-cli.mjs --help
   ```

2. **List subcommands within a specific group**:
   ```bash
   node scripts/tv-bridge-cli.mjs <group> --help
   # Examples:
   node scripts/tv-bridge-cli.mjs tv --help
   node scripts/tv-bridge-cli.mjs chart --help
   node scripts/tv-bridge-cli.mjs data --help
   node scripts/tv-bridge-cli.mjs drawing --help
   node scripts/tv-bridge-cli.mjs indicator --help
   node scripts/tv-bridge-cli.mjs pane --help
   node scripts/tv-bridge-cli.mjs pine --help
   node scripts/tv-bridge-cli.mjs replay --help
   node scripts/tv-bridge-cli.mjs watchlist --help
   ```

3. **Inspect specific command arguments and options**:
   ```bash
   node scripts/tv-bridge-cli.mjs <group> <subcommand> --help
   # Examples:
   node scripts/tv-bridge-cli.mjs tv launch --help
   node scripts/tv-bridge-cli.mjs chart get-state --help
   node scripts/tv-bridge-cli.mjs chart set_symbol --help
   node scripts/tv-bridge-cli.mjs watchlist add --help
   ```

---

## 3. Core Lifecycle Operations

### Step A: Launch TradingView Desktop

Launches TradingView Desktop with remote debugging enabled (CDP).

```bash
# Standard launch (default CDP port: 9223)
node scripts/tv-bridge-cli.mjs tv launch

# Launch on a custom port
node scripts/tv-bridge-cli.mjs tv launch --port 9223

# Kill existing running TradingView instances first to ensure clean CDP attachment
node scripts/tv-bridge-cli.mjs tv launch --kill_existing true
```

**Options**:
- `--port` (number, default: `9223`): CDP remote debugging port.
- `--kill_existing` (boolean, default: `false`): Terminates active TradingView processes before launching.

**Output Structure (`stdout`)**:
```json
{
  "success": true,
  "platform": "darwin",
  "binary": "/Applications/TradingView.app/Contents/MacOS/TradingView",
  "pid": 12345,
  "cdp_port": 9223,
  "cdp_url": "http://localhost:9223",
  "browser": "Chrome/...",
  "user_agent": "Mozilla/..."
}
```

---

### Step B: Check Health & Wait for CDP Readiness

Verifies the CDP connection to TradingView, finds the active chart page target, and checks that `window.TradingViewApi` is initialized.

```bash
node scripts/tv-bridge-cli.mjs tv health
```

**Health Response Structure**:
```json
{
  "success": true,
  "cdp_connected": true,
  "target_id": "9B4A...",
  "target_url": "https://www.tradingview.com/chart/...",
  "target_title": "TradingView - BTCUSD",
  "chart_symbol": "BINANCE:BTCUSDT",
  "chart_resolution": "1D",
  "chart_type": 1,
  "api_available": true
}
```

**Health Check Evaluation Pattern**:
1. Run `tv health`.
2. Check `cdp_connected`:
   - `false` / error: CDP is not listening. Launch TradingView using `tv launch`.
3. Check `api_available`:
   - `true`: Chart API is ready for interactions.
   - `false` (with `chart_symbol: "unknown"`): CDP connected to page, but TradingView chart canvas or UI components are still loading. Sleep 2-3 seconds and retry `tv health`.

---

### Step C: Get Current Chart State

Retrieves the active symbol, resolution, chart type, and all active indicator studies on the current chart layout.

```bash
# Note: command uses hyphenated 'get-state'
node scripts/tv-bridge-cli.mjs chart get-state
```

**Output Structure**:
```json
{
  "success": true,
  "symbol": "BINANCE:BTCUSDT",
  "resolution": "1D",
  "chartType": 1,
  "studies": [
    {
      "id": "Volume@tv-basicstudies-1",
      "name": "Volume"
    },
    {
      "id": "MASimple@tv-basicstudies-2",
      "name": "Moving Average"
    }
  ]
}
```

**Additional Chart Queries**:
- **Get Symbol Details**:
  ```bash
  node scripts/tv-bridge-cli.mjs chart symbol_info
  ```
- **Get Visible Bars Range**:
  ```bash
  node scripts/tv-bridge-cli.mjs chart get_visible_range
  ```

---

## 4. Full Action Group Reference

### `chart` — Chart Control & Navigation
- `chart get-state`: Current symbol, resolution, chart type, and indicator list.
- `chart set_symbol --symbol <SYMBOL>`: Change active chart symbol (e.g. `NASDAQ:AAPL`, `BINANCE:BTCUSDT`).
- `chart set_timeframe --timeframe <TF>`: Change timeframe (e.g. `1`, `5`, `60`, `D`, `1W`).
- `chart set_type --chart_type <TYPE>`: Change chart style (e.g. `0` = Bars, `1` = Candles, `2` = Line, `3` = Area, `9` = Hollow Candles).
- `chart manage_indicator --action <add|remove> [--indicator <NAME>] [--entity_id <ID>]`: Add indicator by name or remove by entity ID.
- `chart get_visible_range`: Retrieve visible time range timestamps (`from`, `to`).
- `chart set_visible_range --from <UNIX_SEC> --to <UNIX_SEC>`: Zoom/scroll to timestamp window.
- `chart scroll_to_date --date <DATE_STRING_OR_TIMESTAMP>`: Center chart on date.
- `chart symbol_info`: Detailed instrument specs (exchange, minmov, pricescale, currency).
- `chart symbol_search --query <QUERY> [--type <TYPE>]`: Search TradingView symbol directory.

### `data` — Market & Strategy Data Extraction
- `data get_ohlcv [--count <N>] [--summary <BOOL>]`: Fetch historical OHLCV bars (up to 500 bars).
- `data get_quote`: Current ticker quote (bid, ask, spread, high, low, volume).
- `data get_depth`: Order book depth / DOM data.
- `data get_indicator --entity_id <ID>`: State and parameters of a specific indicator.
- `data get_study_values --entity_id <ID>`: Computed plot values for an indicator.
- `data get_strategy_results`: Strategy report metrics (Net Profit, Win Rate, Max Drawdown).
- `data get_strategy_performance`: Performance summary breakdown.
- `data get_trades [--limit <N>]`: List executed strategy trades.
- `data get_pine_lines`: Extract drawn Pine Script lines.
- `data get_pine_labels`: Extract Pine Script labels.
- `data get_pine_tables`: Extract Pine Script UI tables.

### `drawing` — Chart Drawings
- `drawing draw_shape --type <SHAPE> --points <JSON>`: Draw trendlines, rectangles, ray lines, etc.
- `drawing list`: List all user drawings on the chart.
- `drawing get_properties --drawing_id <ID>`: Inspect properties of a drawing.
- `drawing remove --drawing_id <ID>`: Delete a specific drawing.
- `drawing clear_all`: Remove all drawings.

### `indicator` — Indicator Management
- `indicator list`: List all loaded indicators.
- `indicator get_inputs --entity_id <ID>`: Read user inputs/parameters for an indicator.
- `indicator get_inputs_info --entity_id <ID>`: Inspect schema/types of inputs.
- `indicator set_inputs --entity_id <ID> --inputs <JSON>`: Update inputs (e.g. length, source).
- `indicator toggle_visibility --entity_id <ID>`: Toggle show/hide for an indicator.

### `pine` — Pine Script Editor & Compiler
- `pine get_source`: Get current script in Pine Editor.
- `pine set_source --source <CODE>`: Load Pine code into Pine Editor.
- `pine compile`: Trigger compilation in Pine Editor.
- `pine get_errors`: Read compiler errors / warnings.
- `pine save [--name <NAME>]`: Save script to user library.
- `pine check`: Validate script syntax.
- `pine analyze`: Static analysis of Pine code structure.

### `replay` — Bar Replay Simulator
- `replay start --date <UNIX_TIMESTAMP_OR_DATE>`: Start replay mode at specified date.
- `replay step [--count <N>]`: Advance replay by N bars.
- `replay autoplay --speed <SPEED>`: Start automatic playback.
- `replay stop`: Exit replay mode.
- `replay status`: Check active replay state.
- `replay trade --action <buy|sell> --quantity <N>`: Simulate order execution in replay.

### `watchlist` — Watchlist Management
- `watchlist get`: Retrieve list of symbols and prices from the open watchlist panel.
- `watchlist add --symbol <SYMBOL>`: Add a ticker symbol to the current watchlist.

### `pane` — Multi-Chart Panes & Layouts
- `pane list`: List panes in current multi-chart layout.
- `pane focus --index <INDEX>`: Set focus to a specific pane.
- `pane set_layout --layout <LAYOUT>`: Switch grid layout (e.g. `single`, `2h`, `2v`, `4`).
- `pane set_symbol --index <INDEX> --symbol <SYMBOL>`: Set symbol on a specific pane.

### `capture` — Screenshots
- `capture screenshot [--region <chart|full|strategy_tester>] [--filename <PATH>] [--method <cdp|api>]`: Save screenshot.

### `alert` — Alerts
- `alert list`: List active alerts.
- `alert create --condition <CONDITION> ...`: Create alert.
- `alert delete --id <ALERT_ID>`: Delete alert.

### `stream` — Real-Time Streaming Polling
- `stream fetch_quote`: Stream snapshot of quote.
- `stream fetch_bar`: Latest streaming bar.
- `stream fetch_values`: Stream current indicator values.

### `batch` — Batch Operations
- `batch run --actions <JSON_ARRAY>`: Execute multiple bridge actions in a single atomic CDP call.

### `info` — System & Bridge Information
- `info`: Application metadata and connection placeholder status.

---

## 5. Safe Troubleshooting & Error Handling

### Environment Variables

Configure behavior using environment variables:
- `TV_CDP_PORT`: Override default CDP port (default: `9223`).
- `TV_CDP_HOST`: Override default CDP host (default: `localhost`).
- `TV_DEBUG`: Set to `1` to enable verbose CDP protocol logging in console.

### Common Diagnostics & Resolutions

| Issue | Cause | Resolution |
|---|---|---|
| `CDP connection failed after 5 attempts` / `Unexpected server response: 101` / `ECONNREFUSED` | TradingView is not running or CDP is listening on a different port. | 1. Run `tv launch --kill_existing true`.<br>2. Or launch manually: `/Applications/TradingView.app/Contents/MacOS/TradingView --remote-debugging-port=9223`.<br>3. Check `TV_CDP_PORT` if running on non-default port. |
| `No TradingView chart target found. Is TradingView open with a chart?` | TradingView is open, but only showing home page, settings, or a non-chart tab. | Navigate to any chart layout in TradingView (e.g., `https://www.tradingview.com/chart/...`). |
| `api_available: false` / `chart_symbol: "unknown"` in `tv health` | Page is still loading `window.TradingViewApi` or chart widget. | Wait 2-3 seconds and re-check with `tv health` or `chart get-state`. |
| `❌ Validation Error for '<action>': - <field>: ...` | Missing required flag or incorrect type (e.g., missing `--symbol`). | Run `<group> <subcommand> --help` to check schema requirements and provide valid arguments. |
| `JS evaluation timeout after 15000ms` | Modal dialog blocking UI or TradingView frozen. | Check TradingView window for open modal popups (e.g. save confirmation) and close them. |

### Exit Code Protocol

- **Exit Code 0**: Action executed successfully. JSON output printed to `stdout`.
- **Exit Code 1**: Validation failed or execution threw an error. Failure summary printed to `stderr`.

---

## 6. Verified End-to-End Operation Workflow

Follow this standard sequence for operating TradingView from AI agent scripts:

```bash
# 1. Discover available tools & syntax
node scripts/tv-bridge-cli.mjs --help
node scripts/tv-bridge-cli.mjs chart --help

# 2. Check connection health
node scripts/tv-bridge-cli.mjs tv health

# 3. If disconnected, launch TradingView Desktop with CDP
node scripts/tv-bridge-cli.mjs tv launch --kill_existing true

# 4. Wait for healthy CDP connection and API readiness
# Repeat health check until cdp_connected: true AND api_available: true
node scripts/tv-bridge-cli.mjs tv health

# 5. Query active chart state
node scripts/tv-bridge-cli.mjs chart get-state

# 6. Execute chart / data operations
node scripts/tv-bridge-cli.mjs chart set_symbol --symbol BINANCE:ETHUSDT
node scripts/tv-bridge-cli.mjs chart set_timeframe --timeframe 60
node scripts/tv-bridge-cli.mjs data get_ohlcv --count 100 --summary true

# 7. Safe troubleshooting on error
# Check metadata status or inspect parameters if command fails
node scripts/tv-bridge-cli.mjs info
node scripts/tv-bridge-cli.mjs <group> <subcommand> --help
```

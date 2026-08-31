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
scripts/tv-bridge-cli.mjs
```

### Execution Runtimes

Execute using Node.js (>=22) or Bun:

```bash
# Using Node.js
node scripts/tv-bridge-cli.mjs <command> [subcommand] [flags]

# Using Bun
bun scripts/tv-bridge-cli.mjs <command> [subcommand] [flags]
```

---

## 2. Dynamic Command Discovery

The CLI dynamically discovers commands from explicit public metadata using `yargs`. Every command follows `tv <domain> <verb[-object]>` (for example, `bridge_launch` becomes `tv bridge launch`).

### Listing Commands

1. **List all top-level command groups & standalone commands**:
   ```bash
   node scripts/tv-bridge-cli.mjs --help
   ```

2. **List subcommands within a specific group**:
   ```bash
   node scripts/tv-bridge-cli.mjs <group> --help
   # Examples:
   node scripts/tv-bridge-cli.mjs bridge --help
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
   node scripts/tv-bridge-cli.mjs bridge launch --help
   node scripts/tv-bridge-cli.mjs chart get-state --help
   node scripts/tv-bridge-cli.mjs chart set-symbol --help
   node scripts/tv-bridge-cli.mjs watchlist add --help
   ```

---

## 3. Core Lifecycle Operations

### Step A: Launch TradingView Desktop

Launches TradingView Desktop with remote debugging enabled (CDP).

```bash
# Standard launch (default CDP port: 9223)
node scripts/tv-bridge-cli.mjs bridge launch

# Launch on a custom port
node scripts/tv-bridge-cli.mjs bridge launch --port 9223

# Kill existing running TradingView instances first to ensure clean CDP attachment
node scripts/tv-bridge-cli.mjs bridge launch --kill-existing true
```

**Options**:
- `--port` (number, default: `9223`): CDP remote debugging port.
- `--kill-existing` (boolean, default: `false`): Terminates active TradingView processes before launching.

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
node scripts/tv-bridge-cli.mjs bridge health-check
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
1. Run `bridge health-check`.
2. Check `cdp_connected`:
  - `false` / error: CDP is not listening. Launch TradingView using `bridge launch`.
3. Check `api_available`:
   - `true`: Chart API is ready for interactions.
   - `false` (with `chart_symbol: "unknown"`): CDP connected to page, but TradingView chart canvas or UI components are still loading. Sleep 2-3 seconds and retry `bridge health-check`.

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
  node scripts/tv-bridge-cli.mjs chart get-symbol-info
  ```
- **Get Visible Bars Range**:
  ```bash
  node scripts/tv-bridge-cli.mjs chart get-visible-range
  ```

---

## 4. Full Action Group Reference

### `chart` — Chart Control & Navigation
- `chart get-state`: Current symbol, resolution, chart type, and indicator list.
- `chart set-symbol --symbol <SYMBOL>`: Change active chart symbol.
- `chart set-timeframe --timeframe <TF>`: Change timeframe.
- `chart set-type --chart-type <TYPE>`: Change chart style.
- `chart manage-indicator --action <add|remove> [--indicator <NAME>] [--entity-id <ID>]`: Add or remove indicator.
- `chart get-visible-range`: Retrieve visible time range timestamps.
- `chart set-visible-range --from <UNIX_SEC> --to <UNIX_SEC>`: Zoom/scroll to timestamp window.
- `chart scroll-to-date --date <DATE_STRING_OR_TIMESTAMP>`: Center chart on date.
- `chart get-symbol-info`: Detailed instrument specs.
- `chart search-symbol --query <QUERY> [--type <TYPE>]`: Search TradingView symbol directory.

### `data` — Market & Strategy Data Extraction
- `data get-ohlcv [--count <N>] [--summary <BOOL>]`: Fetch historical OHLCV bars.
- `data get_quote`: Current ticker quote (bid, ask, spread, high, low, volume).
- `data get_depth`: Order book depth / DOM data.
- `data get-indicator --entity-id <ID>`: State and parameters of an indicator.
- `data get-study-values --entity-id <ID>`: Computed plot values.
- `data get-strategy-results`: Strategy report metrics.
- `data get-strategy-performance`: Performance summary.
- `data get-trades [--limit <N>]`: List strategy trades.
- `data get-pine-lines`: Extract Pine lines.
- `data get-pine-labels`: Extract Pine labels.
- `data get-pine-tables`: Extract Pine tables.

### `drawing` — Chart Drawings
- `drawing draw_shape --type <SHAPE> --points <JSON>`: Draw trendlines, rectangles, ray lines, etc.
- `drawing list`: List all user drawings on the chart.
- `drawing get_properties --drawing_id <ID>`: Inspect properties of a drawing.
- `drawing remove --drawing_id <ID>`: Delete a specific drawing.
- `drawing clear_all`: Remove all drawings.

### `indicator` — Indicator Management
- `indicator list`: List all loaded indicators.
- `indicator get-inputs --entity-id <ID>`: Read inputs for an indicator.
- `indicator get-inputs-info --entity-id <ID>`: Inspect input schema.
- `indicator set-inputs --entity-id <ID> --inputs <JSON>`: Update inputs.
- `indicator toggle-visibility --entity-id <ID>`: Toggle visibility.

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
- `pane set-symbol --index <INDEX> --symbol <SYMBOL>`: Set pane symbol.

### `capture` — Screenshots
- `capture screenshot [--region <chart|full|strategy_tester>] [--filename <PATH>] [--method <cdp|api>]`: Save screenshot.

### `alert` — Alerts
- `alert list`: List active alerts.
- `alert create --condition <CONDITION> ...`: Create alert.
- `alert delete --id <ALERT_ID>`: Delete alert.

### `stream` — Real-Time Streaming Polling
- `stream fetch-quote`: Stream quote snapshot.
- `stream fetch_bar`: Latest streaming bar.
- `stream fetch_values`: Stream current indicator values.

### `batch` — Batch Operations
- `batch run --actions <JSON_ARRAY>`: Execute multiple bridge actions in a single atomic CDP call.

### `bridge` — System & Bridge Information
- `bridge get-info`: Application metadata and connection status.

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
| `CDP connection failed after 5 attempts` / `Unexpected server response: 101` / `ECONNREFUSED` | TradingView is not running or CDP is listening on a different port. | 1. Run `bridge launch --kill-existing true`.<br>2. Or launch manually: `/Applications/TradingView.app/Contents/MacOS/TradingView --remote-debugging-port=9223`.<br>3. Check `TV_CDP_PORT` if running on non-default port. |
| `No TradingView chart target found. Is TradingView open with a chart?` | TradingView is open, but only showing home page, settings, or a non-chart tab. | Navigate to any chart layout in TradingView (e.g., `https://www.tradingview.com/chart/...`). |
| `api_available: false` / `chart_symbol: "unknown"` in `bridge health-check` | Page is still loading `window.TradingViewApi` or chart widget. | Wait 2-3 seconds and re-check with `bridge health-check` or `chart get-state`. |
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
node scripts/tv-bridge-cli.mjs bridge health-check

# 3. If disconnected, launch TradingView Desktop with CDP
node scripts/tv-bridge-cli.mjs bridge launch --kill-existing true

# 4. Wait for healthy CDP connection and API readiness
# Repeat health check until cdp_connected: true AND api_available: true
node scripts/tv-bridge-cli.mjs bridge health-check

# 5. Query active chart state
node scripts/tv-bridge-cli.mjs chart get-state

# 6. Execute chart / data operations
node scripts/tv-bridge-cli.mjs chart set-symbol --symbol BINANCE:ETHUSDT
node scripts/tv-bridge-cli.mjs chart set-timeframe --timeframe 60
node scripts/tv-bridge-cli.mjs data get-ohlcv --count 100 --summary true

# 7. Safe troubleshooting on error
# Check metadata status or inspect parameters if command fails
node scripts/tv-bridge-cli.mjs bridge get-info
node scripts/tv-bridge-cli.mjs <group> <subcommand> --help
```

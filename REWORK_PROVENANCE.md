# Rework provenance and agent instructions

## Purpose

`tv-bridge` is a local rework of TradingView MCP. It is **not** a checkout,
fork branch, or automatic downstream of the upstream repository.

The current product lives in this directory. The nested `./tradingview-mcp/`
directory is a Git-ignored, read-only reference snapshot retained only for
comparison.

## Baseline

- Canonical source: <https://github.com/tradesdontlie/tradingview-mcp>
- Rework baseline commit: `79e2f735391000b14bcb45e1c533073092befecc`
- Local reference checkout: `./tradingview-mcp/`
- Reference checkout remote when verified:
  `https://github.com/gsdstr/tradingview-mcp`

The reference checkout's `main` must resolve to the baseline commit before it
is used for a review. If it does not, stop and report the mismatch; do not
silently compare against another revision.

## What is current implementation

Treat files under this directory, excluding `./tradingview-mcp/`, as current
`tv-bridge` implementation:

- `packages/shared/` — bridge logic and action definitions
- `apps/cli/` — generated CLI adapter
- `apps/mcp/` — generated MCP adapter
- `apps/e2e/` — integration tests
- `tooling/` and root config — Bun/Turbo workspace tooling

Do not edit files inside `./tradingview-mcp/` while working on the bridge,
unless user explicitly asks to update the reference checkout.

### Public name mapping

The bridge intentionally does not preserve baseline MCP names. Its public
naming agreement is documented in [`docs/naming-agreement.md`](docs/naming-agreement.md).

#### Baseline tools retained by the bridge

| Baseline / current name | Canonical bridge name | CLI |
| --- | --- | --- |
| `alert_create` | `alert_create` | `tv alert create` |
| `alert_delete` | `alert_delete` | `tv alert delete` |
| `alert_list` | `alert_list` | `tv alert list` |
| `batch_run` | `batch_run` | `tv batch run` |
| `capture_screenshot` | `capture_screenshot` | `tv capture screenshot` |
| `chart_get_state` / `chart_get-state` | `chart_get-state` | `tv chart get-state` |
| `chart_get_visible_range` | `chart_get-visible-range` | `tv chart get-visible-range` |
| `chart_manage_indicator` | `chart_manage-indicator` | `tv chart manage-indicator` |
| `chart_scroll_to_date` | `chart_scroll-to-date` | `tv chart scroll-to-date` |
| `chart_set_symbol` | `chart_set-symbol` | `tv chart set-symbol` |
| `chart_set_timeframe` | `chart_set-timeframe` | `tv chart set-timeframe` |
| `chart_set_type` | `chart_set-type` | `tv chart set-type` |
| `chart_set_visible_range` | `chart_set-visible-range` | `tv chart set-visible-range` |
| `symbol_info` / `chart_symbol_info` | `chart_get-symbol-info` | `tv chart get-symbol-info` |
| `symbol_search` / `chart_symbol_search` | `chart_search-symbol` | `tv chart search-symbol` |
| `data_get_indicator` | `data_get-indicator` | `tv data get-indicator` |
| `data_get_ohlcv` | `data_get-ohlcv` | `tv data get-ohlcv` |
| `data_get_pine_labels` | `data_get-pine-labels` | `tv data get-pine-labels` |
| `data_get_pine_lines` | `data_get-pine-lines` | `tv data get-pine-lines` |
| `data_get_pine_tables` | `data_get-pine-tables` | `tv data get-pine-tables` |
| `data_get_strategy_performance` / `data_get-strategy-performance` | `data_get-strategy-performance` | `tv data get-strategy-performance` |
| `data_get_strategy_results` | `data_get-strategy-results` | `tv data get-strategy-results` |
| `data_get_study_values` | `data_get-study-values` | `tv data get-study-values` |
| `data_get_trades` | `data_get-trades` | `tv data get-trades` |
| `depth_get` / `data_get_depth` | `data_get-depth` | `tv data get-depth` |
| `quote_get` / `data_get_quote` | `data_get-quote` | `tv data get-quote` |
| `draw_clear` / `drawing_clear_all` | `drawing_clear-all` | `tv drawing clear-all` |
| `draw_get_properties` / `drawing_get_properties` | `drawing_get-properties` | `tv drawing get-properties` |
| `draw_list` / `drawing_list` | `drawing_list` | `tv drawing list` |
| `draw_remove_one` / `drawing_remove` | `drawing_remove` | `tv drawing remove` |
| `draw_shape` / `drawing_draw_shape` | `drawing_draw-shape` | `tv drawing draw-shape` |
| `indicator_set_inputs` / `indicator_set-inputs` | `indicator_set-inputs` | `tv indicator set-inputs` |
| `indicator_toggle_visibility` | `indicator_toggle-visibility` | `tv indicator toggle-visibility` |
| `pane_focus` | `pane_focus` | `tv pane focus` |
| `pane_list` | `pane_list` | `tv pane list` |
| `pane_set_layout` | `pane_set-layout` | `tv pane set-layout` |
| `pane_set_symbol` | `pane_set-symbol` | `tv pane set-symbol` |
| `pine_analyze` | `pine_analyze` | `tv pine analyze` |
| `pine_check` | `pine_check` | `tv pine check` |
| `pine_compile` | `pine_compile` | `tv pine compile` |
| `pine_get_errors` | `pine_get-errors` | `tv pine get-errors` |
| `pine_get_source` | `pine_get-source` | `tv pine get-source` |
| `pine_save` | `pine_save` | `tv pine save` |
| `pine_set_source` | `pine_set-source` | `tv pine set-source` |
| `replay_autoplay` | `replay_autoplay` | `tv replay autoplay` |
| `replay_start` | `replay_start` | `tv replay start` |
| `replay_status` | `replay_status` | `tv replay status` |
| `replay_step` | `replay_step` | `tv replay step` |
| `replay_stop` | `replay_stop` | `tv replay stop` |
| `replay_trade` | `replay_trade` | `tv replay trade` |
| `tv_health_check` / `tv_health` | `bridge_health-check` | `tv bridge health-check` |
| `tv_launch` | `bridge_launch` | `tv bridge launch` |
| `watchlist_add` | `watchlist_add` | `tv watchlist add` |
| `watchlist_get` | `watchlist_get` | `tv watchlist get` |

#### Bridge-only tools

| Current name | Canonical bridge name | CLI |
| --- | --- | --- |
| `indicator_get-inputs` | `indicator_get-inputs` | `tv indicator get-inputs` |
| `indicator_get-inputs-info` | `indicator_get-inputs-info` | `tv indicator get-inputs-info` |
| `indicator_list` | `indicator_list` | `tv indicator list` |
| `info` | `bridge_get-info` | `tv bridge get-info` |
| `stream_fetch_bar` | `stream_fetch-bar` | `tv stream fetch-bar` |
| `stream_fetch_quote` | `stream_fetch-quote` | `tv stream fetch-quote` |
| `stream_fetch_values` | `stream_fetch-values` | `tv stream fetch-values` |

#### Baseline tools deliberately absent from the bridge

| Baseline name | Canonical bridge name | Status |
| --- | --- | --- |
| `data_get_equity` | — | removed |
| `data_get_pine_boxes` | — | removed |
| `layout_list` | — | removed |
| `layout_switch` | — | removed |
| `pine_get_console` | — | removed |
| `pine_list_scripts` | — | removed |
| `pine_new` | — | removed |
| `pine_open` | — | removed |
| `pine_smart_compile` | — | removed |
| `tab_close` | — | removed |
| `tab_list` | — | removed |
| `tab_new` | — | removed |
| `tab_switch` | — | removed |
| `tv_discover` | — | removed |
| `tv_ui_state` | — | removed |
| `ui_click` | — | removed |
| `ui_evaluate` | — | removed |
| `ui_find_element` | — | removed |
| `ui_fullscreen` | — | removed |
| `ui_hover` | — | removed |
| `ui_keyboard` | — | removed |
| `ui_mouse_click` | — | removed |
| `ui_open_panel` | — | removed |
| `ui_scroll` | — | removed |
| `ui_type_text` | — | removed |

Pattern: legacy `<domain>_<verb>_<object>` becomes canonical
`<domain>_<verb>-<object>`. For a one-word operation or object, retain only
the single required underscore: `watchlist_add`, `bridge_launch`.

## How to review a rework or upstream change

1. Verify baseline: `git -C ./tradingview-mcp rev-parse HEAD` must equal the
   hash above.
2. Compare baseline source (`./tradingview-mcp/`) with current bridge source
   (this directory, excluding the nested checkout and generated files).
3. Review behavior, not just file paths: architecture, MCP tool names, CLI
   commands, schemas, validation, and tests can change during a rework.
4. Classify every difference as preserved, intentionally changed, removed, or
   new. Check public names against `docs/naming-agreement.md`; do not infer
   compatibility from matching implementation behavior.
5. Never merge, copy, or sync changes from the reference automatically.
   Propose each adoption separately after reviewing its compatibility and test
   impact.

## Do not confuse these operations

| Task | Correct comparison |
| --- | --- |
| Audit this rework | baseline commit above → current `tv-bridge` source |
| Prepare an upstream update | new upstream revision → baseline, then selectively port into current bridge |
| Debug current bridge | current bridge source only; reference is context, not runtime code |

`tv-bridge` is intentionally structurally different from the baseline.
Large path-level diffs are expected and do not by themselves indicate a
regression.

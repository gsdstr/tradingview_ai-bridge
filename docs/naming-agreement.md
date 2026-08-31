# Public naming agreement

## Scope

This agreement defines public names for `tv-bridge` MCP tools and CLI
commands. It does not prescribe TypeScript identifiers.

## Canonical grammar

```text
MCP tool: <domain>_<verb>[-<object>]
CLI:      tv <domain> <verb>[-<object>]
flag:     --<kebab-case-name>
```

`domain` is one lowercase noun. The part after `_` is one kebab-case action
phrase: its first word is a verb and following words describe its object.

```text
chart_get-state           -> tv chart get-state
chart_set-symbol          -> tv chart set-symbol
data_get-pine-lines       -> tv data get-pine-lines
indicator_set-inputs      -> tv indicator set-inputs
bridge_health-check       -> tv bridge health-check
```

Tool names must match:

```regex
^[a-z][a-z0-9]*_[a-z][a-z0-9]*(?:-[a-z0-9]+)*$
```

## Rules

- Use exactly one underscore: it separates the domain from the action phrase.
- Use hyphens only inside the action phrase; never use additional underscores.
- Use lowercase ASCII only. No spaces, dots, or abbreviations unless they are
  established domain terms (`ohlcv`, `cdp`, `tv`).
- Use one primary domain. Prefer `data_get-pine-lines`, not
  `pine_data-get-lines`. Use `bridge` for lifecycle and CDP-connection
  operations; it avoids a redundant `tv tv` CLI path.
- Reuse verbs consistently: `get`, `list`, `set`, `add`, `remove`, `create`,
  `delete`, `start`, `stop`, `check`, `search`, `capture`.
- Names describe an operation, not implementation: `chart_get-state`, not
  `chart_read-widget`.
- CLI flags are kebab-case, including flags derived from MCP input properties:
  `entity_id` is exposed as `--entity-id`.
- TypeScript stays camelCase: `chartGetState`, `entityId`.

## Public contract

MCP names and CLI paths are public APIs. A rename requires a release note and
an explicit migration decision. This project does not retain baseline aliases
unless a future user-facing compatibility requirement is approved.

Human-readable MCP `title` and `description` are separate from the machine
name. Titles use normal prose, for example `Get chart state`.

## Examples

| Domain | MCP tool | CLI command |
| --- | --- | --- |
| chart | `chart_get-state` | `tv chart get-state` |
| chart | `chart_set-visible-range` | `tv chart set-visible-range` |
| data | `data_get-ohlcv` | `tv data get-ohlcv` |
| data | `data_get-strategy-performance` | `tv data get-strategy-performance` |
| drawing | `drawing_clear-all` | `tv drawing clear-all` |
| watchlist | `watchlist_add` | `tv watchlist add` |
| bridge | `bridge_health-check` | `tv bridge health-check` |
| bridge | `bridge_launch` | `tv bridge launch` |

## Enforcement

Each action must declare its MCP name explicitly. The CLI adapter derives
`<domain>` and `<verb>[-<object>]` by splitting on the single underscore.
Add a unit test that rejects names which do not match the canonical regex and
snapshot-tests the generated MCP and CLI surfaces.

# Architecture Evolution: Yargs + StandardSchemaV1 Actions

We have successfully overhauled the TradingView AI Desk to use a unified, validation-library-agnostic architecture based on the `StandardSchemaV1` spec. This change decouples our business logic from terminal and agent-protocol frameworks.

## Key Accomplishments

### 1. Unified Action Registry (`packages/shared`)
- **Abstract Action Interface**: Defined a contract in `src/actions/action.ts` that enforces `inputSchema` and `outputSchema` using `StandardSchemaV1`.
- **Atomic Actions**: Created discrete action modules for all core features:
  - `tv_launch`: Application startup.
  - `health`: System connectivity verification.
  - `info`: Metadata retrieval.
  - `price`: price data formatting.
  - `tv_watchlist_get`: Watchlist extraction.
  - `tv_watchlist_add`: Watchlist modification.
- **Global Registry**: Aggregated all available functionality into an `actionRegistry` which acts as the single source of truth for the entire monorepo.

### 2. Dynamic CLI (`apps/cli`)
- **Migrated to Yargs**: Replaced Oclified architecture with a simplified, dynamic `yargs` setup.
- **Git-style Subcommands**: Implemented smart command grouping based on action name prefixes (delimited by `_`).
  - Standalone actions like `health` remain top-level commands.
  - Grouped actions like `watchlist_get` and `watchlist_add` are automatically nested as `watchlist get` and `watchlist add`.
- **Zero-Boilerplate Routing**: Adding a new action with a prefix to the shared package instantly creates the corresponding subcommand in the terminal.
- **Runtime Validation**: Leverages the action's `inputSchema` for strict parameter validation before execution.

### 3. Dynamic MCP Server (`apps/mcp`)
- **Automated Tool Registration**: The MCP server now automatically registers all tools by mapping the `actionRegistry` directly into the MCP SDK.
- **Protocol Consistency**: Effectively ensures that the AI agents have access to the exact same logic and validation constraints as the human CLI.

## Verification
- **Type Safety**: Full monorepo typecheck passed across `@repo/shared`, `apps/cli`, and `apps/mcp`.
- **CLI Testing**: Verified `info`, `price --price <val>`, and `tv_watchlist_get` commands, all returning perfectly structured JSON responses.
- **Scalability**: The system is now ready for dozens of additional actions with virtually zero overhead in the implementation layer.

> [!IMPORTANT]
> When adding new features in the future, **only update `packages/shared/src/actions/`**. The CLI and MCP server will detect and expose your new action automatically on the next run.

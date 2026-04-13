# TradingView AI Bridge MCP Skill

This skill provides AI agents with a standalone, dependency-free Model Context Protocol (MCP) server for interacting with TradingView Desktop.

## Overview

The `tv-bridge-mcp` allows agents to access all TradingView bridge actions as unified "tools". It supports the following features via MCP:
- **Watching Charts**: Automatically syncs with the active chart in TradingView.
- **Watchlist Access**: Get and modify symbols in the UI.
- **System Checks**: Verify CDP bridge health.

## Contents

- `scripts/tv-bridge-mcp.js`: The standalone bundled MCP server.
- `SKILL.md`: Instructions for agents on how to configure and run the MCP server.

## Installation for Agents

Agents should add this MCP server to their configuration file (e.g., `clap.json`, `claude.json`, or `mcp_config.json`). The server runs over standard input/output (stdio).

## Development

To rebuild the standalone MCP script within this skill:
```bash
pnpm run build
```
This will bundle the core MCP server from `apps/mcp` and copy it to the local `scripts/` directory.

import { PassThrough } from "node:stream";
import { describe, expect, it, vi } from "vitest";
import { StdioServerTransport } from "@modelcontextprotocol/server";
import { actionCliMetadata, actionRegistry } from "@repo/shared";
import {
  MCP_TOOL_NAME_PATTERN,
  createServer,
  getMcpToolNames,
  startServer,
} from "./index.js";

describe("public tool contract", () => {
  it("exposes only canonical MCP names with an explicit CLI path for each action", () => {
    expect(getMcpToolNames()).toEqual(Object.keys(actionRegistry).sort());
    for (const name of getMcpToolNames()) {
      expect(name).toMatch(MCP_TOOL_NAME_PATTERN);
      expect(actionCliMetadata[name]).toBeDefined();
    }
  });
});

describe("MCP server startup", () => {
  it("registers shared actions and starts with supported stdio transport", async () => {
    const server = createServer();
    const transport = new StdioServerTransport(
      new PassThrough(),
      new PassThrough(),
    );
    const error = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    await expect(startServer(server, transport)).resolves.toBe(server);
    expect(Object.keys(actionRegistry)).not.toHaveLength(0);
    expect(error).toHaveBeenCalledWith(
      "TradingView AI Desk MCP Server running on stdio",
    );

    await transport.close();
    error.mockRestore();
  });
});

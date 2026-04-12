import { McpServer, StdioServerTransport } from "@modelcontextprotocol/server";
import { actionRegistry, getErrorMessage } from "@repo/shared";

/**
 * TradingView AI Desk MCP Server
 * 
 * This server dynamically registers all tools from the shared Action registry,
 * ensuring architectural consistency between the CLI and the MCP interface.
 */
const server = new McpServer(
  {
    name: "tradingview-ai-desk",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Dynamically register all shared actions as MCP tools
for (const action of Object.values(actionRegistry)) {
  server.registerTool(
    action.name,
    {
      description: action.description,
      // Pass the schema if it exists. 
      // The MCP SDK accepts Zod schemas directly.
      inputSchema: action.inputSchema as any,
    },
    async (input: any) => {
      try {
        const result = await (action.action as any)(input);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error: unknown) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error executing ${action.name}: ${getErrorMessage(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("TradingView AI Desk MCP Server running on stdio");
}

run().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});

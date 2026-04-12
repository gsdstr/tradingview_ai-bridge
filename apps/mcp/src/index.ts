import { McpServer, StdioServerTransport } from "@modelcontextprotocol/server";
import { z } from "zod";
import { checkHealth, launch, get, add, getErrorMessage } from "@repo/shared";

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

server.registerTool(
  "tv_health_check",
  {
    description: "Check the TradingView connection status and CDP connectivity."
  },
  async () => {
    try {
      const result = await checkHealth();
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (e: unknown) {
      return { content: [{ type: "text", text: `Error: ${getErrorMessage(e)}` }], isError: true };
    }
  }
);

server.registerTool(
  "tv_launch",
  {
    description: "Launch the TradingView Electron App manually."
  },
  async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await launch();
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (e: unknown) {
      return { content: [{ type: "text", text: `Error: ${getErrorMessage(e)}` }], isError: true };
    }
  }
);

server.registerTool(
  "tv_watchlist_get",
  {
    description: "Fetch the currently open symbol watchlist from TradingView."
  },
  async () => {
    try {
      const result = await get();
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (e: unknown) {
      return { content: [{ type: "text", text: `Error: ${getErrorMessage(e)}` }], isError: true };
    }
  }
);

server.registerTool(
  "tv_watchlist_add",
  {
    description: "Add a new symbol to your TradingView watchlist.",
    inputSchema: z.object({
      symbol: z.string().describe("The ticker symbol to add (e.g., AAPL).")
    })
  },
  async ({ symbol }) => {
    try {
      const result = await add({ symbol });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (e: unknown) {
      return { content: [{ type: "text", text: `Error: ${getErrorMessage(e)}` }], isError: true };
    }
  }
);

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("TradingView MCP Server running on stdio");
}

run().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});

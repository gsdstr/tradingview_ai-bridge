import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import type { Action } from "@repo/shared";
import { actionRegistry, getErrorMessage } from "@repo/shared";
import type { StandardSchemaV1 } from "@standard-schema/spec";

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
  },
);

type ToolInputSchema = NonNullable<
  Parameters<McpServer["registerTool"]>[1]["inputSchema"]
>;

function registerAction<
  I extends StandardSchemaV1 | undefined,
  O extends StandardSchemaV1 | undefined,
>(action: Action<I, O>) {
  if (action.inputSchema) {
    server.registerTool(
      action.name,
      {
        description: action.description,
        inputSchema: action.inputSchema as unknown as ToolInputSchema,
      },
      async (input: unknown) => {
        try {
          const actionFn = action.action as (arg: unknown) => Promise<unknown>;
          const result = await actionFn(input);
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
      },
    );
  } else {
    server.registerTool(
      action.name,
      {
        description: action.description,
      },
      async () => {
        try {
          const actionFn = action.action as () => Promise<unknown>;
          const result = await actionFn();
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
      },
    );
  }
}

// Dynamically register all shared actions as MCP tools
for (const action of Object.values(actionRegistry)) {
  registerAction(action);
}

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("TradingView AI Desk MCP Server running on stdio");
}

run().catch((error: unknown) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});

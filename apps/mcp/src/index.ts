import { McpServer, StdioServerTransport } from "@modelcontextprotocol/server";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { Action } from "@repo/shared";
import { actionRegistry, getErrorMessage } from "@repo/shared";
import type { StandardSchemaV1 } from "@standard-schema/spec";

/**
 * TradingView AI Desk MCP Server
 *
 * This server dynamically registers all tools from the shared Action registry,
 * ensuring architectural consistency between the CLI and the MCP interface.
 */
type ToolInputSchema = NonNullable<
  Parameters<McpServer["registerTool"]>[1]["inputSchema"]
>;

type ToolHandler = (input: unknown) => Promise<{
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
}>;

type ActionRegistrar = (
  name: string,
  config: { description: string; inputSchema?: ToolInputSchema },
  handler: ToolHandler,
) => unknown;

export const MCP_TOOL_NAME_PATTERN =
  /^[a-z][a-z0-9]*_[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

export function getMcpToolNames() {
  return Object.keys(actionRegistry).sort();
}

function registerAction<
  I extends StandardSchemaV1 | undefined,
  O extends StandardSchemaV1 | undefined,
>(server: McpServer, action: Action<I, O>) {
  const registerTool = server.registerTool.bind(
    server,
  ) as unknown as ActionRegistrar;

  if (action.inputSchema) {
    registerTool(
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
    registerTool(
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

export function createServer() {
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

  for (const action of Object.values(actionRegistry)) {
    if (!MCP_TOOL_NAME_PATTERN.test(action.name)) {
      throw new Error(`Invalid canonical MCP tool name: ${action.name}`);
    }
    registerAction(server, action);
  }

  return server;
}

export async function startServer(
  server = createServer(),
  transport = new StdioServerTransport(),
) {
  await server.connect(transport);
  console.error("TradingView AI Desk MCP Server running on stdio");
  return server;
}

const isMainModule =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isMainModule) {
  startServer().catch((error: unknown) => {
    console.error("Fatal error running server:", error);
    process.exit(1);
  });
}

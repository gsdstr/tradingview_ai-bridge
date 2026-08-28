import { createRequire } from "module";
import type { Action } from "@repo/shared";
import { actionRegistry, disconnect, getErrorMessage } from "@repo/shared";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import yargs from "yargs";

const require = createRequire(import.meta.url);
const pkg = require("../package.json") as { version?: string };

type AnyAction = Action<
  StandardSchemaV1 | undefined,
  StandardSchemaV1 | undefined
>;

interface SchemaField {
  description?: string;
  _def?: {
    typeName?: string;
  };
}

interface ShapeHolder {
  shape?: Record<string, SchemaField>;
  "~standard"?: {
    types?: {
      input?: Record<string, SchemaField>;
    };
  };
}

function getOptionsFromSchema(
  inputSchema: unknown,
): Record<string, { describe: string; type: "string" | "boolean" }> {
  if (!inputSchema || typeof inputSchema !== "object") {
    return {};
  }
  const holder = inputSchema as ShapeHolder;
  const shape = holder["~standard"]?.types?.input ?? holder.shape;
  if (!shape || typeof shape !== "object") {
    return {};
  }

  const options: Record<
    string,
    { describe: string; type: "string" | "boolean" }
  > = {};
  for (const [key, value] of Object.entries(shape)) {
    const isBoolean = value._def?.typeName === "ZodBoolean";
    options[key] = {
      describe: value.description ?? "",
      type: isBoolean ? "boolean" : "string",
    };
  }
  return options;
}

/**
 * Shared action handler logic factory
 */
const createHandler =
  (action: AnyAction) => async (argv: Record<string, unknown>) => {
    try {
      // Extract only the relevant inputs (exclude yargs metadata)
      const { _ = [], $0: _cmd = "", ...rawInputs } = argv;

      // Validate input schema if it exists
      let validatedInput: unknown = rawInputs;
      if (action.inputSchema) {
        const standardProps = action.inputSchema["~standard"];
        const result = await standardProps.validate(rawInputs);
        if (result.issues) {
          const msg =
            `\n❌ Validation Error for '${action.name}':\n` +
            result.issues
              .map((issue) => {
                const pathStr = Array.isArray(issue.path)
                  ? issue.path.join(".")
                  : "";
                return `  - ${pathStr !== "" ? pathStr : "input"}: ${issue.message}`;
              })
              .join("\n");
          if (!process.env.VITEST) {
            console.error(msg);
            process.exit(1);
          }
          throw new Error(msg);
        }
        validatedInput = result.value;
      }

      // Execute the action
      const actionFn = action.action as (input?: unknown) => Promise<unknown>;
      const output = await actionFn(validatedInput);

      // Format and print output
      if (output !== undefined) {
        console.log(JSON.stringify(output, null, 2));
      } else {
        console.log("✅ Success");
      }
    } catch (error: unknown) {
      console.error(`\n❌ Execution Failed:`, getErrorMessage(error));
      process.exit(1);
    } finally {
      // Shared cleanup
      try {
        await disconnect();
      } catch {
        // Ignore cleanup errors
      }
    }
  };

/**
 * Create and configure the Yargs parser
 */
export function createParser() {
  const parser = yargs()
    .scriptName("tv-cli")
    .usage("$0 <cmd> [args]")
    .demandCommand(1, "Please provide a valid command.")
    .strict() // Fail on unknown commands
    .help()
    .alias("h", "help")
    .version(pkg.version ?? "0.1.0")
    .alias("v", "version")
    .exitProcess(false) // Do not exit process directly on parse; better for tests
    .fail((msg, err) => {
      // Custom failure handler to avoid unintended process exits in tests
      const failureErr = err as unknown as Error | undefined;
      if (failureErr) throw failureErr;
      const error = new Error(msg);
      if (!process.env.VITEST) {
        console.error(msg);
        process.exit(1);
      }
      throw error;
    });

  // Organize actions into standalone and grouped (by prefix)
  const standaloneActions: AnyAction[] = [];
  const groupedActions: Record<string, AnyAction[]> = {};

  for (const action of Object.values(actionRegistry) as AnyAction[]) {
    const parts = action.name.split("_");
    const group = parts[0];
    if (parts.length > 1 && group) {
      groupedActions[group] ??= [];
      groupedActions[group].push(action);
    } else {
      standaloneActions.push(action);
    }
  }

  // Register standalone commands (e.g., 'health', 'info')
  for (const action of standaloneActions) {
    parser.command(
      action.name,
      action.shortDescription,
      (y) => {
        const options = getOptionsFromSchema(action.inputSchema);
        for (const [key, opt] of Object.entries(options)) {
          y.option(key, {
            describe: opt.describe,
            type: opt.type,
          });
        }
        return y;
      },
      createHandler(action),
    );
  }

  // Register grouped commands as subcommands (e.g., 'watchlist get')
  for (const [groupName, actions] of Object.entries(groupedActions)) {
    parser.command(
      groupName,
      `${groupName.charAt(0).toUpperCase() + groupName.slice(1)} operations`,
      (yargsGroup) => {
        for (const action of actions) {
          // Use the part after the group name as the subcommand name
          const subCommandName = action.name.slice(groupName.length + 1);
          yargsGroup.command(
            subCommandName,
            action.shortDescription,
            (sub) => {
              const options = getOptionsFromSchema(action.inputSchema);
              for (const [key, opt] of Object.entries(options)) {
                sub.option(key, {
                  describe: opt.describe,
                  type: opt.type,
                });
              }
              return sub;
            },
            createHandler(action),
          );
        }
        return yargsGroup.demandCommand(
          1,
          `Please specify a ${groupName} subcommand.`,
        );
      },
    );
  }

  return parser;
}

import { createRequire } from "module";
import type { Action } from "@repo/shared";
import {
  actionCliMetadata,
  actionRegistry,
  disconnect,
  getErrorMessage,
} from "@repo/shared";
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
    type?: string;
    typeName?: string;
    innerType?: SchemaField;
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

type OptionType = "string" | "boolean" | "number";

function getOptionType(field: SchemaField): OptionType {
  const type = field._def?.type ?? field._def?.typeName;

  if (type === "boolean" || type === "ZodBoolean") {
    return "boolean";
  }
  if (type === "number" || type === "ZodNumber") {
    return "number";
  }

  if (
    (type === "optional" ||
      type === "default" ||
      type === "nullable" ||
      type === "catch" ||
      type === "ZodOptional" ||
      type === "ZodDefault" ||
      type === "ZodNullable" ||
      type === "ZodCatch") &&
    field._def?.innerType
  ) {
    return getOptionType(field._def.innerType);
  }

  return "string";
}

function getOptionsFromSchema(
  inputSchema: unknown,
): Record<string, { describe: string; type: OptionType }> {
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
    { describe: string; type: OptionType }
  > = {};
  for (const [key, value] of Object.entries(shape)) {
    options[key] = {
      describe: value.description ?? "",
      type: getOptionType(value),
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
      const normalizedInputs = Object.fromEntries(
        Object.entries(rawInputs).map(([key, value]) => [
          key.replaceAll("-", "_"),
          value,
        ]),
      );

      // Validate input schema if it exists
      let validatedInput: unknown = normalizedInputs;
      if (action.inputSchema) {
        const standardProps = action.inputSchema["~standard"];
        const result = await standardProps.validate(normalizedInputs);
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
      if (!process.env.VITEST) {
        process.exitCode = 1;
      }
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
    .scriptName("tv")
    .usage("$0 <cmd> [args]")
    .demandCommand(1, "Please provide a valid command.")
    .strict() // Fail on unknown commands
    .parserConfiguration({ "camel-case-expansion": false })
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
        process.exitCode = 1;
      }
      throw error;
    });

  const groupedActions: Record<
    string,
    Array<{ action: AnyAction; command: string }>
  > = {};

  for (const action of Object.values(actionRegistry) as AnyAction[]) {
    const metadata = actionCliMetadata[action.name];
    if (!metadata) {
      throw new Error(`Missing CLI metadata for ${action.name}`);
    }
    const actions = (groupedActions[metadata.domain] ??= []);
    actions.push({
      action,
      command: metadata.command,
    });
  }

  // Register public CLI paths from explicit metadata.
  for (const [groupName, actions] of Object.entries(groupedActions)) {
    parser.command(
      groupName,
      `${groupName.charAt(0).toUpperCase() + groupName.slice(1)} operations`,
      (yargsGroup) => {
        for (const { action, command } of actions) {
          yargsGroup.command(
            command,
            action.shortDescription,
            (sub) => {
              const options = getOptionsFromSchema(action.inputSchema);
              for (const [key, opt] of Object.entries(options)) {
                sub.option(key.replaceAll("_", "-"), {
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

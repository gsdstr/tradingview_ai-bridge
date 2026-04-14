import yargs from "yargs";
import { actionRegistry, getErrorMessage, disconnect } from "@repo/shared";
import type { Action } from "@repo/shared";

/**
 * Shared action handler logic factory
 */
const createHandler = (action: Action<any, any>) => async (argv: any) => {
  try {
    // Extract only the relevant inputs (exclude yargs metadata)
    const { _, $0, ...rawInputs } = argv;

    // Validate input schema if it exists
    let validatedInput: unknown = rawInputs;
    if (action.inputSchema) {
      const result = await action.inputSchema["~standard"].validate(rawInputs);
      if (result.issues) {
        const msg =
          `\n❌ Validation Error for '${action.name}':\n` +
          result.issues
            .map(
              (issue: any) =>
                `  - ${issue.path?.join(".") || "input"}: ${issue.message}`,
            )
            .join("\n");
        if (!process.env.VITEST) {
          console.error(msg);
          process.exit(1);
        }
        throw new Error(msg);
      }
      validatedInput = result.value as unknown;
    }

    // Execute the action
    const output = await (action.action as any)(validatedInput);

    // Format and print output
    if (output !== undefined) {
      console.log(JSON.stringify(output, null, 2));
    } else {
      console.log("✅ Success");
    }
  } catch (error) {
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
    .exitProcess(false) // Do not exit process directly on parse; better for tests
    .fail((msg, err) => {
      // Custom failure handler to avoid unintended process exits in tests
      if (err) throw err;
      const error = new Error(msg || "Command failed");
      if (!process.env.VITEST) {
        console.error(msg);
        process.exit(1);
      }
      throw error;
    });

  // Organize actions into standalone and grouped (by prefix)
  const standaloneActions: Action<any, any>[] = [];
  const groupedActions: Record<string, Action<any, any>[]> = {};

  for (const action of Object.values(actionRegistry)) {
    const parts = action.name.split("_");
    if (parts.length > 1) {
      const group = parts[0]!;
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
      (y) => y,
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
            (sub) => sub,
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

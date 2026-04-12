#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { actionRegistry, getErrorMessage } from "@repo/shared";

const parser = yargs(hideBin(process.argv))
  .scriptName("tv-cli")
  .usage("$0 <cmd> [args]")
  .demandCommand(1, "Please provide a valid command.")
  .help()
  .alias("h", "help");

/**
 * Shared action handler logic factory
 */
const createHandler = (action: any) => async (argv: any) => {
  try {
    // Extract only the relevant inputs (exclude yargs metadata)
    const { _, $0, ...rawInputs } = argv;

    // Validate input schema if it exists
    let validatedInput = rawInputs;
    if (action.inputSchema) {
      const result = await action.inputSchema["~standard"].validate(rawInputs);
      if (result.issues) {
        console.error(`\n❌ Validation Error for '${action.name}':`);
        result.issues.forEach((issue: any) => {
          const path = issue.path?.join(".") || "input";
          console.error(`  - ${path}: ${issue.message}`);
        });
        process.exit(1);
      }
      validatedInput = result.value;
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
      const { disconnect } = await import("@repo/shared");
      await disconnect();
    } catch {
      // Ignore cleanup errors
    }
  }
};

// Organize actions into standalone and grouped (by prefix)
const standaloneActions: any[] = [];
const groupedActions: Record<string, any[]> = {};

for (const action of Object.values(actionRegistry)) {
  const parts = action.name.split("_");
  if (parts.length > 1) {
    const group = parts[0]!;
    if (!groupedActions[group]) groupedActions[group] = [];
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
    createHandler(action)
  );
}

// Register grouped commands as subcommands (e.g., 'watchlist get')
for (const [groupName, actions] of Object.entries(groupedActions)) {
  parser.command(
    groupName,
    `${groupName.charAt(0).toUpperCase() + groupName.slice(1)} operations`,
    (yargsGroup) => {
      for (const action of actions) {
        // Use the part after the first underscore as the subcommand name
        const subCommandName = action.name.split("_").slice(1).join("_");
        yargsGroup.command(
          subCommandName,
          action.shortDescription,
          (sub) => sub,
          createHandler(action)
        );
      }
      return yargsGroup.demandCommand(
        1,
        `Please specify a ${groupName} subcommand.`
      );
    }
  );
}

// Execute the parser
await parser.parse();

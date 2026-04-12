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

// Dynamically register all actions from the shared registry
for (const action of Object.values(actionRegistry)) {
  parser.command(
    action.name,
    action.shortDescription,
    (yargsCmd) => {
      // If we wanted to auto-generate help for flags, we would need to
      // introspect the schema. StandardSchemaV1 is a black box,
      // but since we know we use Zod in this repo, we could cast it
      // if we needed to. For now, we'll let yargs parse everything
      // and let the schema validate it.
      return yargsCmd;
    },
    async (argv) => {
      try {
        // Extract only the relevant inputs (exclude yargs metadata)
        const { _, $0, ...rawInputs } = argv;

        // Validate input schema if it exists
        let validatedInput = rawInputs;
        if (action.inputSchema) {
          const result =
            await action.inputSchema["~standard"].validate(rawInputs);
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
        // Shared cleanup if needed (e.g., closing connections)
        try {
          const { disconnect } = await import("@repo/shared");
          await disconnect();
        } catch {
          // Ignore cleanup errors
        }
      }
    },
  );
}

// Execute the parser
await parser.parse();

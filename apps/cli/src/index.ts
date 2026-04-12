#!/usr/bin/env node
import { Command } from "commander";
import { APP_NAME, formatPrice, getErrorMessage } from "@repo/shared";

const program = new Command();

program
  .name("tv-cli")
  .description("TradingView AI Desk Command Line Interface")
  .version("0.1.0")
  .hook("postAction", async () => {
    const { disconnect } = await import("@repo/shared");
    await disconnect();
  });

program
  .command("info")
  .description("Show app information")
  .action(() => {
    console.log(`Application: ${APP_NAME}`);
    console.log(`Current Status: Connected (Placeholder)`);
  });

program
  .command("health")
  .description("Check TradingView connection health")
  .action(async () => {
    try {
      const { checkHealth } = await import("@repo/shared");
      const status = await checkHealth();
      console.log("Health Status:", JSON.stringify(status, null, 2));
    } catch (error: unknown) {
      console.error("Health check failed:", getErrorMessage(error));
      process.exit(1);
    }
  });

program
  .command("launch")
  .description("Launch TradingView with remote debugging enabled")
  .option("-p, --port <number>", "CDP port (default: 9222)", "9222")
  .option("--kill", "Kill existing TradingView instances")
  .action(async (options) => {
    try {
      const { launch } = await import("@repo/shared");
      const result = await launch({
        port: parseInt(options.port, 10),
        kill_existing: options.kill,
      });
      console.log("Launch Success:", JSON.stringify(result, null, 2));
    } catch (error: unknown) {
      console.error("Launch failed:", getErrorMessage(error));
      process.exit(1);
    }
  });

program
  .command("price")
  .description("Test price formatting from shared library")
  .argument("<number>", "Price to format")
  .action((num) => {
    const price = parseFloat(num);
    if (isNaN(price)) {
      console.error("Invalid number provided");
      process.exit(1);
    }
    console.log(`Formatted Price: ${formatPrice(price)}`);
  });

await program.parseAsync();

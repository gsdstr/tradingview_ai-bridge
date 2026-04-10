#!/usr/bin/env node
import { Command } from "commander";
import { APP_NAME, formatPrice } from "@repo/core";

const program = new Command();

program
  .name("tv-cli")
  .description("TradingView AI Desk Command Line Interface")
  .version("0.1.0")
  .hook("postAction", async () => {
    const { disconnect } = await import("@repo/core");
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
      const { checkHealth } = await import("@repo/core");
      const status = await checkHealth();
      console.log("Health Status:", JSON.stringify(status, null, 2));
    } catch (error: any) {
      console.error("Health check failed:", error.message);
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

program.parseAsync();

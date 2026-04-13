import { z } from "zod";
import type { Action } from "./action.js";
import { batchRun } from "../core/batch.js";

const batchInputSchema = z.object({
  symbols: z.array(z.string()).describe("List of symbols to iterate over"),
  timeframes: z.array(z.string()).optional().describe("List of timeframes to iterate over"),
  action: z.enum(["screenshot", "get_ohlcv", "get_strategy_results"]).describe("Action to perform on each combination"),
  delay_ms: z.number().optional().describe("Delay between iterations in milliseconds"),
  ohlcv_count: z.number().optional().describe("Number of bars to fetch if action is get_ohlcv"),
});

const batchOutputSchema = z.object({
  success: z.boolean(),
  total_iterations: z.number(),
  successful: z.number(),
  failed: z.number(),
  results: z.array(z.any()),
});

export const batchRunAction: Action<typeof batchInputSchema, typeof batchOutputSchema> = {
  name: "batch_run",
  shortDescription: "Run a batch of actions across symbols/timeframes",
  description: "Iterates through symbols and timeframes, performing a specified action (screenshot, OHLCV, or strategy results) on each.",
  inputSchema: batchInputSchema,
  outputSchema: batchOutputSchema,
  action: async (input) => {
    return batchRun(input);
  },
};

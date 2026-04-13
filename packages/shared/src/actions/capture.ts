import { z } from "zod";
import type { Action } from "./action.js";
import { captureScreenshot } from "../core/capture.js";

const captureInputSchema = z.object({
  region: z.enum(["chart", "full", "strategy_tester"]).optional().describe("Region to capture"),
  filename: z.string().optional().describe("Output filename"),
  method: z.enum(["cdp", "api"]).optional().describe("Capture method (CDP or TV API)"),
});

const captureOutputSchema = z.object({
  success: z.boolean(),
  method: z.enum(["cdp", "api"]),
  note: z.string().optional(),
  file_path: z.string().optional(),
  region: z.string().optional(),
  size_bytes: z.number().optional(),
});

export const captureScreenshotAction: Action<typeof captureInputSchema, typeof captureOutputSchema> = {
  name: "capture_screenshot",
  shortDescription: "Capture a screenshot of TradingView",
  description: "Captures a screenshot of the current TradingView window, specific chart, or strategy tester.",
  inputSchema: captureInputSchema,
  outputSchema: captureOutputSchema,
  action: async (input) => {
    return captureScreenshot(input);
  },
};

import { z } from "zod";
import type { Action } from "./action.js";
import { launch } from "../core/tv.js";
import { checkHealth } from "../core/tv.js";

const inputSchema = z.object({
  port: z
    .number()
    .optional()
    .default(9223)
    .describe("CDP port (default: 9223)"),
  kill_existing: z
    .boolean()
    .optional()
    .default(false)
    .describe("Kill existing TradingView instances (default: false)"),
});

const launchOutputSchema = z.object({
  success: z.boolean(),
  platform: z.string(),
  binary: z.string(),
  pid: z.number().optional(),
  cdp_port: z.number(),
  cdp_url: z.string().optional(),
  browser: z.string().optional(),
  user_agent: z.string().optional(),
  cdp_ready: z.boolean().optional(),
  warning: z.string().optional(),
});

export const tvLaunch: Action<typeof inputSchema, typeof launchOutputSchema> = {
  name: "tv_launch",
  shortDescription: "Launch TradingView with remote debugging",
  description:
    "Launches the TradingView Desktop application with the Chrome DevTools Protocol enabled on the specified port. Optionally kills existing instances first.",
  inputSchema,
  outputSchema: launchOutputSchema,
  action: async (input) => {
    return launch({
      port: input.port,
      kill_existing: input.kill_existing,
    });
  },
};

const healthOutputSchema = z.object({
  success: z.boolean(),
  cdp_connected: z.boolean(),
  target_id: z.string().optional(),
  target_url: z.string().optional(),
  target_title: z.string().optional(),
  chart_symbol: z.string().optional(),
  chart_resolution: z.string().optional(),
  chart_type: z.number().optional(),
  api_available: z.boolean(),
  error: z.string().optional(),
});

export const tvHealthCheck: Action<undefined, typeof healthOutputSchema> = {
  name: "tv_health",
  shortDescription: "Check TradingView connection health",
  description:
    "Verifies the CDP connection to TradingView and ensures APIs are available.",
  outputSchema: healthOutputSchema,
  action: async () => {
    return checkHealth() as any;
  },
};

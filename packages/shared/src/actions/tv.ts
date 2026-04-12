import { z } from "zod";
import type { Action } from "./action.js";
import { launch } from "../core/tv.js";

const inputSchema = z.object({
  port: z
    .number()
    .optional()
    .default(9222)
    .describe("CDP port (default: 9222)"),
  kill_existing: z
    .boolean()
    .optional()
    .default(false)
    .describe("Kill existing TradingView instances (default: false)"),
});

const outputSchema = z.object({
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

export const tvLaunch: Action<typeof inputSchema, typeof outputSchema> = {
  name: "tv_launch",
  shortDescription: "Launch TradingView with remote debugging",
  description:
    "Launches the TradingView Desktop application with the Chrome DevTools Protocol enabled on the specified port. Optionally kills existing instances first.",
  inputSchema,
  outputSchema,
  action: async (input) => {
    return launch({
      port: input.port,
      kill_existing: input.kill_existing,
    });
  },
};

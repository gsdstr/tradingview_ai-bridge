import { z } from "zod";
import type { Action } from "./action.js";
import { checkHealth } from "../core/tv.js";

const outputSchema = z.object({
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

export const healthCheck: Action<undefined, typeof outputSchema> = {
  name: "health",
  shortDescription: "Check TradingView connection health",
  description: "Verifies the CDP connection to TradingView and ensures APIs are available.",
  outputSchema,
  action: async () => {
    return checkHealth() as any;
  },
};

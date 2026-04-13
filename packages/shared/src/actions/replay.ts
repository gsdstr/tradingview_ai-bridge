import { z } from "zod";
import type { Action } from "./action.js";
import { start, step, autoplay, stop, trade, status } from "../core/replay.js";

const startInputSchema = z.object({
  date: z.string().optional().describe("Start date (YYYY-MM-DD)"),
});

export const replayStart: Action<typeof startInputSchema, z.ZodAny> = {
  name: "replay_start",
  shortDescription: "Start Bar Replay mode",
  description: "Enables Replay mode and jumps to a specific date.",
  inputSchema: startInputSchema,
  action: async (input) => {
    return start(input);
  },
};

export const replayStep: Action<undefined, z.ZodAny> = {
  name: "replay_step",
  shortDescription: "Step forward in replay",
  description: "Moves forward one bar in Replay mode.",
  action: async () => {
    return step();
  },
};

const autoplayInputSchema = z.object({
  speed: z.number().optional().describe("Autoplay delay in ms (100, 200, 1000, etc.)"),
});

export const replayAutoplay: Action<typeof autoplayInputSchema, z.ZodAny> = {
  name: "replay_autoplay",
  shortDescription: "Toggle replay autoplay",
  description: "Starts or stops automatic playback in Replay mode.",
  inputSchema: autoplayInputSchema,
  action: async (input) => {
    return autoplay(input);
  },
};

export const replayStop: Action<undefined, z.ZodAny> = {
  name: "replay_stop",
  shortDescription: "Exit Replay mode",
  description: "Stops Replay and returns to real-time data.",
  action: async () => {
    return stop();
  },
};

const tradeInputSchema = z.object({
  action: z.enum(["buy", "sell", "close"]),
});

export const replayTrade: Action<typeof tradeInputSchema, z.ZodAny> = {
  name: "replay_trade",
  shortDescription: "Paper trade in replay",
  description: "Executes a buy, sell, or close order using the Replay mode's built-in paper trading.",
  inputSchema: tradeInputSchema,
  action: async (input) => {
    return trade(input);
  },
};

export const replayStatus: Action<undefined, z.ZodAny> = {
  name: "replay_status",
  shortDescription: "Get replay status",
  description: "Retrieves the current state, date, and PnL of the Bar Replay session.",
  action: async () => {
    return status();
  },
};

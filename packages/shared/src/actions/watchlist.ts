import { z } from "zod";
import type { Action } from "./action.js";
import { get, add } from "../core/watchlist.js";

// --- Watchlist Get Action ---

const getOutputSchema = z.object({
  success: z.boolean(),
  count: z.number(),
  source: z.string(),
  symbols: z.array(
    z.object({
      symbol: z.string(),
      last: z.string().nullable(),
      change: z.string().nullable(),
      change_percent: z.string().nullable(),
    }),
  ),
});

export const watchlistGet: Action<undefined, typeof getOutputSchema> = {
  name: "watchlist_get",
  shortDescription:
    "Fetch the currently open symbol watchlist from TradingView",
  description:
    "Retrieves the list of symbols and their current price data from the active watchlist panel.",
  outputSchema: getOutputSchema,
  action: async () => {
    return await get();
  },
};

// --- Watchlist Add Action ---

const addInputSchema = z.object({
  symbol: z.string().describe("The ticker symbol to add (e.g., AAPL)"),
});

const addOutputSchema = z.object({
  success: z.boolean(),
  symbol: z.string(),
  action: z.string(),
});

export const watchlistAdd: Action<
  typeof addInputSchema,
  typeof addOutputSchema
> = {
  name: "watchlist_add",
  shortDescription: "Add a new symbol to your TradingView watchlist",
  description:
    "Opens the search box and adds the specified symbol to the current watchlist.",
  inputSchema: addInputSchema,
  outputSchema: addOutputSchema,
  action: async (input) => {
    return await add(input);
  },
};

import type { z } from "zod";
import type { Action } from "./action.js";
import { fetchQuote, fetchLastBar, fetchIndicatorValues } from "../core/stream.js";

export const streamFetchQuote: Action<undefined, z.ZodAny> = {
  name: "stream_fetch-quote",
  shortDescription: "Fetch current quote (for streaming)",
  description: "Polls the current symbol's latest price and volume. Used by streaming tools.",
  action: async () => {
    return fetchQuote();
  },
};

export const streamFetchBar: Action<undefined, z.ZodAny> = {
  name: "stream_fetch-bar",
  shortDescription: "Fetch latest bar (for streaming)",
  description: "Polls the latest completed or developing bar. Used by streaming tools.",
  action: async () => {
    return fetchLastBar();
  },
};

export const streamFetchValues: Action<undefined, z.ZodAny> = {
  name: "stream_fetch-values",
  shortDescription: "Fetch latest study values (for streaming)",
  description: "Polls current values of all visible indicators. Used by streaming tools.",
  action: async () => {
    return fetchIndicatorValues();
  },
};

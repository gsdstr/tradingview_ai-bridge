import { z } from "zod";
import type { Action } from "./action.js";
import { getSource, setSource, compile, getErrors, save, check, analyze } from "../core/pine.js";

const sourceOutputSchema = z.object({
  success: z.boolean(),
  source: z.string(),
  line_count: z.number(),
  char_count: z.number(),
});

export const pineGetSource: Action<undefined, typeof sourceOutputSchema> = {
  name: "pine_get_source",
  shortDescription: "Get Pine Editor source",
  description: "Retrieves the current script source code from the Pine Editor.",
  outputSchema: sourceOutputSchema,
  action: async () => {
    return getSource();
  },
};

const setSourceInputSchema = z.object({
  source: z.string().describe("Pine Script source code"),
});

export const pineSetSource: Action<typeof setSourceInputSchema, z.ZodAny> = {
  name: "pine_set_source",
  shortDescription: "Set Pine Editor source",
  description: "Updates the source code in the Pine Editor.",
  inputSchema: setSourceInputSchema,
  action: async (input) => {
    return setSource(input);
  },
};

export const pineCompile: Action<undefined, z.ZodAny> = {
  name: "pine_compile",
  shortDescription: "Compile and add to chart",
  description: "Triggers the 'Add to chart' or 'Update on chart' button in the Pine Editor.",
  action: async () => {
    return compile();
  },
};

export const pineGetErrors: Action<undefined, z.ZodAny> = {
  name: "pine_get_errors",
  shortDescription: "Get editor errors",
  description: "Retrieves lint/compile errors directly from the Monaco editor markers.",
  action: async () => {
    return getErrors();
  },
};

export const pineSave: Action<undefined, z.ZodAny> = {
  name: "pine_save",
  shortDescription: "Save Pine Script",
  description: "Saves the current script in the Pine Editor.",
  action: async () => {
    return save();
  },
};

export const pineCheck: Action<typeof setSourceInputSchema, z.ZodAny> = {
  name: "pine_check",
  shortDescription: "Check Pine Script (API)",
  description: "Validates Pine Script source code using TradingView's translation API.",
  inputSchema: setSourceInputSchema,
  action: async (input) => {
    return check(input);
  },
};

export const pineAnalyze: Action<typeof setSourceInputSchema, z.ZodAny> = {
  name: "pine_analyze",
  shortDescription: "Static analysis of script",
  description: "Performs local static analysis (e.g. array bounds, version checks) on Pine source.",
  inputSchema: setSourceInputSchema,
  action: async (input) => {
    return analyze(input);
  },
};

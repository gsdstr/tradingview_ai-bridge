import { z } from "zod";
import type { Action } from "./action.js";
import { list, setLayout, focus, setSymbol } from "../core/pane.js";

export const paneList: Action<undefined, z.ZodAny> = {
  name: "pane_list",
  shortDescription: "List all chart panes",
  description: "Retrieves symbols and resolutions for all panes in a multi-chart layout.",
  action: async () => {
    return list();
  },
};

const layoutInputSchema = z.object({
  layout: z.string().describe("Layout code (s, 2h, 2v, 2-1, 1-2, 3h, 3v, 4, etc.)"),
});

export const paneSetLayout: Action<typeof layoutInputSchema, z.ZodAny> = {
  name: "pane_set_layout",
  shortDescription: "Set chart layout",
  description: "Changes the multi-chart layout grid (e.g. 2x2, vertical split).",
  inputSchema: layoutInputSchema,
  action: async (input) => {
    return setLayout(input);
  },
};

const focusInputSchema = z.object({
  index: z.union([z.number(), z.string()]).describe("Pane index (starting from 0)"),
});

export const paneFocus: Action<typeof focusInputSchema, z.ZodAny> = {
  name: "pane_focus",
  shortDescription: "Focus a chart pane",
  description: "Activates a specific pane in the multi-chart layout.",
  inputSchema: focusInputSchema,
  action: async (input) => {
    return focus(input);
  },
};

const symInputSchema = z.object({
  index: z.union([z.number(), z.string()]).describe("Pane index"),
  symbol: z.string().describe("Symbol to set"),
});

export const paneSetSymbol: Action<typeof symInputSchema, z.ZodAny> = {
  name: "pane_set_symbol",
  shortDescription: "Set symbol on pane",
  description: "Changes the symbol for a specific pane in the layout.",
  inputSchema: symInputSchema,
  action: async (input) => {
    return setSymbol(input);
  },
};

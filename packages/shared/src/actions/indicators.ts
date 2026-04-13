import { z } from "zod";
import type { Action } from "./action.js";
import { setInputs, toggleVisibility } from "../core/indicators.js";

const inputsInputSchema = z.object({
  entity_id: z.string().describe("Indicator ID"),
  inputs: z.any().describe("Settings object (e.g. { length: 20 })"),
});

export const indicatorSetInputs: Action<typeof inputsInputSchema, z.ZodAny> = {
  name: "indicator_set_inputs",
  shortDescription: "Change indicator settings",
  description: "Updates the input parameters (props) for a specific indicator.",
  inputSchema: inputsInputSchema,
  action: async (input) => {
    return setInputs(input);
  },
};

const visibilityInputSchema = z.object({
  entity_id: z.string().describe("Indicator ID"),
  visible: z.boolean().describe("Visibility state"),
});

export const indicatorToggleVisibility: Action<typeof visibilityInputSchema, z.ZodAny> = {
  name: "indicator_toggle_visibility",
  shortDescription: "Show/hide indicator",
  description: "Toggles the visibility of a specific indicator on the chart.",
  inputSchema: visibilityInputSchema,
  action: async (input) => {
    return toggleVisibility(input);
  },
};

import { z } from "zod";
import type { Action } from "./action.js";
import {
  getInputs,
  getInputsInfo,
  list,
  setInputs,
  toggleVisibility,
} from "../core/indicators.js";

const inputsInputSchema = z.object({
  entity_id: z.string().describe("Indicator ID"),
  inputs: z
    .any()
    .describe('JSON string of inputs (ex. \'{"in_0": 4, "in_2": 170}\')'),
});

export const indicatorSetInputs: Action<typeof inputsInputSchema, z.ZodAny> = {
  name: "indicator_set-inputs",
  shortDescription: "Change indicator settings",
  description: "Updates the input parameters (props) for a specific indicator.",
  inputSchema: inputsInputSchema,
  action: async (input) => {
    return setInputs(input);
  },
};

const getInputsInputSchema = z.object({
  entity_id: z.string().describe("Indicator ID"),
});

export const indicatorGetInputs: Action<typeof getInputsInputSchema, z.ZodAny> =
  {
    name: "indicator_get-inputs",
    shortDescription: "Get current indicator settings",
    description:
      "Returns the current input parameters for a specific indicator.",
    inputSchema: getInputsInputSchema,
    action: async (input) => {
      return getInputs(input);
    },
  };

const getInputsInfoSchema = z.object({
  entity_id: z.string().describe("Indicator ID"),
  hidden: z.boolean().optional().describe("Include hidden inputs"),
});

export const indicatorGetInputsInfo: Action<
  typeof getInputsInfoSchema,
  z.ZodAny
> = {
  name: "indicator_get-inputs-info",
  shortDescription: "Get detailed indicator input metadata",
  description:
    "Returns metadata (names, types, groups) for a specific indicator's inputs.",
  inputSchema: getInputsInfoSchema,
  action: async (input) => {
    return getInputsInfo(input);
  },
};

const visibilityInputSchema = z.object({
  entity_id: z.string().describe("Indicator ID"),
  visible: z.boolean().describe("Visibility state"),
});

export const indicatorToggleVisibility: Action<
  typeof visibilityInputSchema,
  z.ZodAny
> = {
  name: "indicator_toggle_visibility",
  shortDescription: "Show/hide indicator",
  description: "Toggles the visibility of a specific indicator on the chart.",
  inputSchema: visibilityInputSchema,
  action: async (input) => {
    return toggleVisibility(input);
  },
};

const listInputSchema = z.object({
  name: z
    .string()
    .optional()
    .describe("Filter by indicator name (case-insensitive)"),
});

export const indicatorList: Action<typeof listInputSchema, z.ZodAny> = {
  name: "indicator_list",
  shortDescription: "List all indicators on the chart",
  description:
    "Returns a list of all indicators/studies currently active on the chart.",
  inputSchema: listInputSchema,
  action: async (input) => {
    return list(input);
  },
};

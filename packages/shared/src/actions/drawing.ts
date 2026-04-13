import { z } from "zod";
import type { Action } from "./action.js";
import { drawShape, listDrawings, getProperties, removeOne, clearAll } from "../core/drawing.js";

const pointSchema = z.object({
  time: z.number().describe("Unix timestamp (seconds)"),
  price: z.number().describe("Price level"),
});

const drawInputSchema = z.object({
  shape: z.string().describe("Shape type (e.g. 'horizontal_line', 'trend_line', 'arrow_up')"),
  point: pointSchema,
  point2: pointSchema.optional(),
  overrides: z.any().optional().describe("Styling overrides"),
  text: z.string().optional().describe("Labels for the shape"),
});

export const drawingDrawShape: Action<typeof drawInputSchema, z.ZodAny> = {
  name: "drawing_draw_shape",
  shortDescription: "Draw a shape on chart",
  description: "Creates a drawing object (line, arrow, etc.) at specific time/price coordinates.",
  inputSchema: drawInputSchema,
  action: async (input) => {
    return drawShape(input);
  },
};

export const drawingList: Action<undefined, z.ZodAny> = {
  name: "drawing_list",
  shortDescription: "List all drawings",
  description: "Retrieves a list of all drawing objects currently on the active chart.",
  action: async () => {
    return listDrawings();
  },
};

const propertiesInputSchema = z.object({
  entity_id: z.string().describe("Drawing ID"),
});

export const drawingGetProperties: Action<typeof propertiesInputSchema, z.ZodAny> = {
  name: "drawing_get_properties",
  shortDescription: "Get drawing properties",
  description: "Retrieves coordinates and styling properties for a specific drawing.",
  inputSchema: propertiesInputSchema,
  action: async (input) => {
    return getProperties(input);
  },
};

export const drawingRemove: Action<typeof propertiesInputSchema, z.ZodAny> = {
  name: "drawing_remove",
  shortDescription: "Remove a drawing",
  description: "Deletes a specific drawing from the chart.",
  inputSchema: propertiesInputSchema,
  action: async (input) => {
    return removeOne(input);
  },
};

export const drawingClearAll: Action<undefined, z.ZodAny> = {
  name: "drawing_clear_all",
  shortDescription: "Clear all drawings",
  description: "Removes all drawing objects from the active chart.",
  action: async () => {
    return clearAll();
  },
};

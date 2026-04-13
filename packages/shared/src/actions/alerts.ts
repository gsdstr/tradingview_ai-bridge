import { z } from "zod";
import type { Action } from "./action.js";
import { create, list, deleteAlerts } from "../core/alerts.js";

const createInputSchema = z.object({
  condition: z.string().optional().describe("Alert condition"),
  price: z.number().describe("Alert price"),
  message: z.string().optional().describe("Alert message"),
});

const createOutputSchema = z.object({
  success: z.boolean(),
  price: z.number(),
  condition: z.string().optional(),
  message: z.string(),
  price_set: z.boolean(),
  source: z.string(),
});

export const alertCreate: Action<typeof createInputSchema, typeof createOutputSchema> = {
  name: "alert_create",
  shortDescription: "Create a price alert",
  description: "Creates a new price alert on the current chart symbol.",
  inputSchema: createInputSchema,
  outputSchema: createOutputSchema,
  action: async (input) => {
    return create(input);
  },
};

const listOutputSchema = z.object({
  success: z.boolean(),
  alert_count: z.number(),
  source: z.string(),
  alerts: z.array(z.any()),
  error: z.string().optional(),
});

export const alertList: Action<undefined, typeof listOutputSchema> = {
  name: "alert_list",
  shortDescription: "List price alerts",
  description: "Retrieves a list of all price alerts from TradingView.",
  outputSchema: listOutputSchema,
  action: async () => {
    return list();
  },
};

const deleteInputSchema = z.object({
  delete_all: z.boolean().describe("Delete all alerts (requires confirmation)"),
});

const deleteOutputSchema = z.object({
  success: z.boolean(),
  note: z.string(),
  context_menu_opened: z.boolean(),
  source: z.string(),
});

export const alertDelete: Action<typeof deleteInputSchema, typeof deleteOutputSchema> = {
  name: "alert_delete",
  shortDescription: "Delete price alerts",
  description: "Deletes price alerts. Currently only support delete_all=true with manual confirmation.",
  inputSchema: deleteInputSchema,
  outputSchema: deleteOutputSchema,
  action: async (input) => {
    return deleteAlerts(input);
  },
};

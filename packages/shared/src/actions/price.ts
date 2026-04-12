import { z } from "zod";
import type { Action } from "./action.js";
import { formatPrice } from "../index.js";

const inputSchema = z.object({
  price: z.number().positive().describe("Price to format"),
});

const outputSchema = z.object({
  formatted: z.string(),
});

export const priceFormat: Action<typeof inputSchema, typeof outputSchema> = {
  name: "price",
  shortDescription: "Test price formatting from shared library",
  description: "Formats a numeric price into a currency string.",
  inputSchema,
  outputSchema,
  action: async (input) => {
    return {
      formatted: formatPrice(input.price),
    };
  },
};

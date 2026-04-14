import { z } from "zod";
import type { Action } from "./action.js";
import {
  getOhlcv,
  getIndicatorData,
  getStrategyResults,
  getStrategyPerformance,
  getTrades,
  getQuote,
  getDepth,
  getStudyValues,
  getPineLines,
  getPineLabels,
  getPineTables,
} from "../core/data.js";

const ohlcvInputSchema = z.object({
  count: z.number().optional().describe("Number of bars to fetch (max 500)"),
  summary: z
    .boolean()
    .optional()
    .describe("Return a high-level summary instead of raw bars"),
});

export const dataGetOhlcv: Action<typeof ohlcvInputSchema, z.ZodAny> = {
  name: "data_get_ohlcv",
  shortDescription: "Get OHLCV bar data",
  description: "Retrieves historical OHLCV bar data from the active chart.",
  inputSchema: ohlcvInputSchema,
  action: async (input) => {
    return getOhlcv(input);
  },
};

const indicatorDataInputSchema = z.object({
  entity_id: z.string().describe("Indicator ID from chart_get_state"),
});

export const dataGetIndicator: Action<
  typeof indicatorDataInputSchema,
  z.ZodAny
> = {
  name: "data_get_indicator",
  shortDescription: "Get indicator data",
  description:
    "Retrieves inputs and visibility state for a specific indicator.",
  inputSchema: indicatorDataInputSchema,
  action: async (input) => {
    return getIndicatorData(input);
  },
};

export const dataGetStrategyResults: Action<undefined, z.ZodAny> = {
  name: "data_get_strategy_results",
  shortDescription: "Get strategy metrics",
  description:
    "Retrieves performance metrics from the strategy tester (Profit, Drawdown, etc.).",
  action: async () => {
    return getStrategyResults();
  },
};

export const dataGetStrategyPerformance: Action<undefined, z.ZodAny> = {
  name: "data_get-strategy-performance",
  shortDescription: "Get detailed strategy performance",
  description:
    "Retrieves full performance metrics directly from the strategy tester internal API.",
  action: async () => {
    return getStrategyPerformance();
  },
};

const tradesInputSchema = z.object({
  max_trades: z.number().optional().describe("Max number of trades to return"),
});

export const dataGetTrades: Action<typeof tradesInputSchema, z.ZodAny> = {
  name: "data_get_trades",
  shortDescription: "Get strategy trades",
  description: "Retrieves the list of recent trades from the strategy tester.",
  inputSchema: tradesInputSchema,
  action: async (input) => {
    return getTrades(input);
  },
};

const quoteInputSchema = z.object({
  symbol: z
    .string()
    .optional()
    .describe("Optional symbol (defaults to current)"),
});

export const dataGetQuote: Action<typeof quoteInputSchema, z.ZodAny> = {
  name: "data_get_quote",
  shortDescription: "Get real-time quote",
  description: "Retrieves the latest price, bid, ask, and volume for a symbol.",
  inputSchema: quoteInputSchema,
  action: async (input) => {
    return getQuote(input);
  },
};

export const dataGetDepth: Action<undefined, z.ZodAny> = {
  name: "data_get_depth",
  shortDescription: "Get market depth (DOM)",
  description:
    "Retrieves the Order Book / Depth of Market data if the panel is open.",
  action: async () => {
    return getDepth();
  },
};

export const dataGetStudyValues: Action<undefined, z.ZodAny> = {
  name: "data_get_study_values",
  shortDescription: "Get latest study values",
  description:
    "Retrieves the most recent values for all visible indicators on the chart.",
  action: async () => {
    return getStudyValues();
  },
};

const pineGraphicsInputSchema = z.object({
  study_filter: z.string().optional().describe("Filter by study name"),
  verbose: z.boolean().optional().describe("Include detailed coordinate data"),
});

export const dataGetPineLines: Action<
  typeof pineGraphicsInputSchema,
  z.ZodAny
> = {
  name: "data_get_pine_lines",
  shortDescription: "Get Pine Script lines",
  description:
    "Retrieves line drawings created by Pine Scripts (e.g. SR levels).",
  inputSchema: pineGraphicsInputSchema,
  action: async (input) => {
    return getPineLines(input);
  },
};

const pineLabelsInputSchema = pineGraphicsInputSchema.extend({
  max_labels: z.number().optional(),
});

export const dataGetPineLabels: Action<typeof pineLabelsInputSchema, z.ZodAny> =
  {
    name: "data_get_pine_labels",
    shortDescription: "Get Pine Script labels",
    description: "Retrieves label drawings create by Pine Scripts.",
    inputSchema: pineLabelsInputSchema,
    action: async (input) => {
      return getPineLabels(input);
    },
  };

export const dataGetPineTables: Action<
  z.ZodObject<{ study_filter: z.ZodOptional<z.ZodString> }>,
  z.ZodAny
> = {
  name: "data_get_pine_tables",
  shortDescription: "Get Pine Script tables",
  description: "Retrieves table data created by Pine Scripts.",
  inputSchema: z.object({ study_filter: z.string().optional() }),
  action: async (input) => {
    return getPineTables(input);
  },
};

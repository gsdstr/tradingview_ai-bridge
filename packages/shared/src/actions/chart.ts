import { z } from "zod";
import type { Action } from "./action.js";
import {
  getState,
  setSymbol,
  setTimeframe,
  setType,
  manageIndicator,
  getVisibleRange,
  setVisibleRange,
  scrollToDate,
  symbolInfo,
  symbolSearch,
} from "../core/chart.js";

const stateOutputSchema = z.object({
  success: z.boolean(),
  symbol: z.string(),
  resolution: z.string(),
  chartType: z.number(),
  studies: z.array(z.object({ id: z.string(), name: z.string() })),
});

export const chartGetState: Action<undefined, typeof stateOutputSchema> = {
  name: "chart_get_state",
  shortDescription: "Get current chart state",
  description: "Retrieves the current symbol, resolution, chart type, and list of indicators.",
  outputSchema: stateOutputSchema,
  action: async () => {
    return getState();
  },
};

const symbolInputSchema = z.object({
  symbol: z.string().describe("Symbol to search and set"),
});

const symbolOutputSchema = z.object({
  success: z.boolean(),
  symbol: z.string(),
  chart_ready: z.boolean(),
});

export const chartSetSymbol: Action<typeof symbolInputSchema, typeof symbolOutputSchema> = {
  name: "chart_set_symbol",
  shortDescription: "Set chart symbol",
  description: "Changes the symbol on the active chart.",
  inputSchema: symbolInputSchema,
  outputSchema: symbolOutputSchema,
  action: async (input) => {
    return setSymbol(input);
  },
};

const timeframeInputSchema = z.object({
  timeframe: z.string().describe("Resolution (e.g. 1, 60, D, 1W)"),
});

const timeframeOutputSchema = z.object({
  success: z.boolean(),
  timeframe: z.string(),
  chart_ready: z.boolean(),
});

export const chartSetTimeframe: Action<typeof timeframeInputSchema, typeof timeframeOutputSchema> = {
  name: "chart_set_timeframe",
  shortDescription: "Set chart timeframe",
  description: "Changes the timeframe (resolution) on the active chart.",
  inputSchema: timeframeInputSchema,
  outputSchema: timeframeOutputSchema,
  action: async (input) => {
    return setTimeframe(input);
  },
};

const typeInputSchema = z.object({
  chart_type: z.union([z.string(), z.number()]).describe("Type name (Candles, Line, etc.) or number (0-9)"),
});

export const chartSetType: Action<typeof typeInputSchema, z.ZodAny> = {
  name: "chart_set_type",
  shortDescription: "Set chart type",
  description: "Changes the chart type (e.g. Candles, Bars, Line).",
  inputSchema: typeInputSchema,
  action: async (input) => {
    return setType(input);
  },
};

const indicatorInputSchema = z.object({
  action: z.enum(["add", "remove"]),
  indicator: z.string().optional().describe("Indicator name (for add)"),
  entity_id: z.string().optional().describe("Indicator ID (for remove)"),
  inputs: z.any().optional().describe("Simplified inputs object"),
});

export const chartManageIndicator: Action<typeof indicatorInputSchema, z.ZodAny> = {
  name: "chart_manage_indicator",
  shortDescription: "Add or remove indicator",
  description: "Adds a new indicator or removes an existing one from the chart.",
  inputSchema: indicatorInputSchema,
  action: async (input) => {
    return manageIndicator(input);
  },
};

export const chartGetVisibleRange: Action<undefined, z.ZodAny> = {
  name: "chart_get_visible_range",
  shortDescription: "Get visible bars range",
  description: "Retrieves the time range and bar indices currently visible on the chart.",
  action: async () => {
    return getVisibleRange();
  },
};

const rangeInputSchema = z.object({
  from: z.number().describe("Unix timestamp (seconds)"),
  to: z.number().describe("Unix timestamp (seconds)"),
});

export const chartSetVisibleRange: Action<typeof rangeInputSchema, z.ZodAny> = {
  name: "chart_set_visible_range",
  shortDescription: "Set visible range",
  description: "Zooms/scrolls the chart to the specified unix timestamp range.",
  inputSchema: rangeInputSchema,
  action: async (input) => {
    return setVisibleRange(input);
  },
};

const scrollInputSchema = z.object({
  date: z.union([z.string(), z.number()]).describe("Date string or unix timestamp"),
});

export const chartScrollToDate: Action<typeof scrollInputSchema, z.ZodAny> = {
  name: "chart_scroll_to_date",
  shortDescription: "Scroll to date",
  description: "Centers the chart view on a specific date or timestamp.",
  inputSchema: scrollInputSchema,
  action: async (input) => {
    return scrollToDate(input);
  },
};

export const chartSymbolInfo: Action<undefined, z.ZodAny> = {
  name: "chart_symbol_info",
  shortDescription: "Get symbol info",
  description: "Retrieves detailed information about the current chart symbol.",
  action: async () => {
    return symbolInfo();
  },
};

const searchInputSchema = z.object({
  query: z.string().describe("Search query"),
  type: z.string().optional().describe("Filter by type (stock, crypto, etc.)"),
});

export const chartSymbolSearch: Action<typeof searchInputSchema, z.ZodAny> = {
  name: "chart_symbol_search",
  shortDescription: "Search for symbols",
  description: "Searches for symbols using TradingView's public search API.",
  inputSchema: searchInputSchema,
  action: async (input) => {
    return symbolSearch(input);
  },
};

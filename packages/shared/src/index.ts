// Shared utilities and types for TradingView AI Desk

export const APP_NAME = "TradingView AI Desk";

/**
 * Common types shared across the monorepo
 */
export interface StrategyResult {
  winRate: number;
  netProfit: number;
  drawdown: number;
}

export interface ChartPosition {
  symbol: string;
  interval: string;
  price: number;
}

export interface Indicator {
  name: string;
  params: Record<string, any>;
  value: number[];
}

export * from "./connection.js";
export * from "./known.js";
export * from "./paths.js";
export * from "./core/tv.js";
export * from "./core/watchlist.js";
export * from "./error.js";
export * from "./actions/index.js";

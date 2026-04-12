// Shared utilities and types for TradingView AI Desk

export const APP_NAME = "TradingView AI Desk";

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

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
export * from "./core/tv.js";
export * from "./core/watchlist.js";
export * from "./error.js";
export * from "./actions/action.js";
export * from "./actions/tv.js";

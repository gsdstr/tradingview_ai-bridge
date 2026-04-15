import { evaluate } from "./connection.js";
import { KNOWN_PATHS } from "./paths.js";

/**
 * Internal helper to verify if a TradingView API path exists before returning it.
 */
async function verifyAndReturn(path: string, name: string): Promise<string> {
  const exists = await evaluate(
    `typeof (${path}) !== 'undefined' && (${path}) !== null`,
  );
  if (!exists) {
    throw new Error(`${name} not available at ${path}`);
  }
  return path;
}

export async function getChartApi(): Promise<string> {
  return verifyAndReturn(KNOWN_PATHS.chartApi, "Chart API");
}

export async function getChartCollection(): Promise<string> {
  return verifyAndReturn(
    KNOWN_PATHS.chartWidgetCollection,
    "Chart Widget Collection",
  );
}

export async function getBottomBar(): Promise<string> {
  return verifyAndReturn(KNOWN_PATHS.bottomWidgetBar, "Bottom Widget Bar");
}

export async function getReplayApi(): Promise<string> {
  return verifyAndReturn(KNOWN_PATHS.replayApi, "Replay API");
}

export async function getMainSeriesBars(): Promise<string> {
  return verifyAndReturn(KNOWN_PATHS.mainSeriesBars, "Main Series Bars");
}

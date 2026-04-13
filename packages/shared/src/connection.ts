import CDP from "chrome-remote-interface";

interface Target {
  id: string;
  type: string;
  url: string;
  title: string;
}

interface EvaluateOptions {
  awaitPromise?: boolean;
  returnByValue?: boolean;
  [key: string]: any;
}

let client: CDP.Client | null = null;
let targetInfo: Target | null = null;
const CDP_HOST = "localhost";
const CDP_PORT = 9222;
const MAX_RETRIES = 5;
const BASE_DELAY = 500;

// Known direct API paths discovered via live probing
export const KNOWN_PATHS = {
  chartApi: "window.TradingViewApi._activeChartWidgetWV.value()",
  chartWidgetCollection: "window.TradingViewApi._chartWidgetCollection",
  bottomWidgetBar: "window.TradingView.bottomWidgetBar",
  replayApi: "window.TradingViewApi._replayApi",
  alertService: "window.TradingViewApi._alertService",
  chartApiInstance: "window.ChartApiInstance",
  mainSeriesBars:
    "window.TradingViewApi._activeChartWidgetWV.value()._chartWidget.model().mainSeries().bars()",
  strategyStudy: "chart._chartWidget.model().model().dataSources()",
  layoutManager: "window.TradingViewApi.getSavedCharts",
  symbolSearchApi: "window.TradingViewApi.searchSymbols",
  pineFacadeApi: "https://pine-facade.tradingview.com/pine-facade",
};

/**
 * Sanitize a string for safe interpolation into JavaScript code evaluated via CDP.
 */
export function safeString(str: string): string {
  return JSON.stringify(String(str));
}

/**
 * Validate that a value is a finite number.
 */
export function requireFinite(value: any, name: string): number {
  const n = Number(value);
  if (!Number.isFinite(n))
    throw new Error(`${name} must be a finite number, got: ${value}`);
  return n;
}

export async function getClient(): Promise<CDP.Client> {
  if (client) {
    try {
      if (await isConnected()) {
        return client;
      }
    } catch {
      client = null;
      targetInfo = null;
    }
  }
  return connect();
}

/**
 * Internal helper to perform a single connection attempt to a CDP target.
 */
async function attemptConnection(): Promise<CDP.Client> {
  const target = await findChartTarget();
  if (!target) {
    throw new Error(
      "No TradingView chart target found. Is TradingView open with a chart?",
    );
  }

  const newClient = await CDP({
    host: CDP_HOST,
    port: CDP_PORT,
    target: target.id,
  });

  // Enable required domains
  await Promise.all([
    newClient.Runtime.enable(),
    newClient.Page.enable(),
    newClient.DOM.enable(),
  ]);

  // Inject the Bridge Configuration into the renderer's global scope.
  const bootstrap = `
    window.TV_CONFIG = ${JSON.stringify(KNOWN_PATHS)};
    window.TV_CONFIG.isDebug = ${process.env.TV_DEBUG === "1"};
    console.log('--- TradingView MCP Bridge Initialized ---');
  `;

  // We need to set targetInfo/client before calling evaluate
  targetInfo = target;
  client = newClient;

  try {
    await evaluate(bootstrap);
  } catch (err) {
    client = null;
    targetInfo = null;
    throw err;
  }

  return newClient;
}

/**
 * Establish a CDP connection with retry logic.
 */
export async function connect(): Promise<CDP.Client> {
  let lastError: Error | unknown;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await attemptConnection();
    } catch (err) {
      lastError = err;
      const delay = Math.min(BASE_DELAY * Math.pow(2, attempt), 30000);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  const errorMessage =
    lastError instanceof Error ? lastError.message : String(lastError);
  throw new Error(
    `CDP connection failed after ${MAX_RETRIES} attempts: ${errorMessage}`,
  );
}

async function findChartTarget(): Promise<Target | undefined> {
  const resp = await globalThis.fetch(
    `http://${CDP_HOST}:${CDP_PORT}/json/list`,
  );
  const targets = (await resp.json()) as Target[];
  // Prefer targets with tradingview.com/chart in the URL
  return (
    targets.find(
      (t) => t.type === "page" && /tradingview\.com\/chart/i.test(t.url),
    ) || targets.find((t) => t.type === "page" && /tradingview/i.test(t.url))
  );
}

export async function getTargetInfo(): Promise<Target> {
  if (!targetInfo) {
    await getClient();
  }
  if (!targetInfo) {
    throw new Error("Target info not established after client initialization");
  }
  return targetInfo;
}

export async function evaluate<T = any>(
  expression: string,
  opts: EvaluateOptions = {},
): Promise<T> {
  const c = await getClient();
  const result = await c.Runtime.evaluate({
    expression,
    returnByValue: true,
    awaitPromise: opts.awaitPromise ?? false,
    ...opts,
  });
  if (result.exceptionDetails) {
    const msg =
      result.exceptionDetails.exception?.description ||
      result.exceptionDetails.text ||
      "Unknown evaluation error";
    throw new Error(`JS evaluation error: ${msg}`);
  }
  return result.result?.value;
}

export async function evaluateFnc<T = any>(
  fn: Function | string,
  opts: EvaluateOptions = {},
): Promise<T> {
  return evaluate<T>(`(${fn})()`, opts);
}

export async function evaluateAsync<T = any>(expression: string): Promise<T> {
  return evaluate<T>(expression, { awaitPromise: true });
}

export async function disconnect(): Promise<void> {
  if (!client) return;

  try {
    await client.close();
  } catch {
    //TODO: log error to debug
  }
  client = null;
  targetInfo = null;
}

export async function isConnected(): Promise<boolean> {
  if (!client) return false;
  try {
    await client.Runtime.evaluate({ expression: "1", returnByValue: true });
    return true;
  } catch {
    //TODO: log error to debug
  }
  return false;
}

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

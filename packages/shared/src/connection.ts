import CDP from "chrome-remote-interface";
import { getErrorMessage } from "./error.js";
import { KNOWN_PATHS } from "./paths.js";

interface Target {
  id: string;
  type: string;
  url: string;
  title: string;
}

interface EvaluateOptions {
  awaitPromise?: boolean;
  returnByValue?: boolean;
  userGesture?: boolean;
  timeout?: number;
  [key: string]: any;
}

let client: CDP.Client | null = null;
let targetInfo: Target | null = null;

const CDP_HOST = process.env.TV_CDP_HOST ?? "localhost";
const CDP_PORT = Number(process.env.TV_CDP_PORT) || 9223;
const MAX_RETRIES = 5;
const BASE_DELAY = 500;

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

  // Handle disconnection event
  newClient.on("disconnect", () => {
    if (client === newClient) {
      client = null;
      targetInfo = null;
    }
  });

  // Enable required domains
  await Promise.all([
    newClient.Runtime.enable(),
    newClient.Page.enable(),
    newClient.DOM.enable(),
  ]);

  // Persistent configuration: ensures TV_CONFIG survives refreshes
  const bootstrap = `
      window.TV_CONFIG = ${JSON.stringify(KNOWN_PATHS)};
      window.TV_CONFIG.isDebug = ${process.env.TV_DEBUG === "1"};
      console.log('--- TradingView MCP Bridge Initialized ---');
    `;

  await newClient.Page.addScriptToEvaluateOnNewDocument({ source: bootstrap });

  // Update shared state
  targetInfo = target;
  client = newClient;

  try {
    // Immediate injection for current page state
    await evaluate(bootstrap);
  } catch (err) {
    // Only cleanup if bootstrap fails during initial connection
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
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await attemptConnection();
    } catch (err) {
      lastError = err as Error;
      const delay = Math.min(BASE_DELAY * Math.pow(2, attempt), 30000);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw new Error(
    `CDP connection failed after ${MAX_RETRIES} attempts: ${getErrorMessage(lastError)}`,
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

async function evaluateRaw<T = any>(
  expression: string,
  opts: EvaluateOptions = {},
): Promise<T> {
  const timeoutMs = opts.timeout ?? 15000;
  const c = await getClient();

  let timeout: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(
      () => reject(new Error(`JS evaluation timeout after ${timeoutMs}ms`)),
      timeoutMs,
    );
  });

  // Implement real timeout using Promise.race and release its timer on settle.
  let result: Awaited<ReturnType<typeof c.Runtime.evaluate>>;
  try {
    result = await Promise.race([
      c.Runtime.evaluate({
        expression,
        returnByValue: true,
        awaitPromise: opts.awaitPromise ?? false,
        userGesture: opts.userGesture ?? true,
        ...opts,
      }),
      timeoutPromise,
    ]);
  } finally {
    if (timeout !== undefined) clearTimeout(timeout);
  }

  if (result.exceptionDetails) {
    let msg =
      (result.exceptionDetails.exception?.description ??
        result.exceptionDetails.text) ||
      "Unknown evaluation error";

    if (result.exceptionDetails.stackTrace) {
      const stack = result.exceptionDetails.stackTrace.callFrames
        .map(
          (f) =>
            `  at ${f.functionName} (${f.url}:${f.lineNumber}:${f.columnNumber})`,
        )
        .join("\n");
      msg += `\nStack:\n${stack}`;
    }

    throw new Error(`JS evaluation error: ${msg}`);
  }
  return result.result.value as T;
}

export async function evaluate<T = any>(
  fn: Function | string,
  opts: EvaluateOptions = {},
): Promise<T> {
  const isFunc = typeof fn === "function";
  if (!isFunc) return evaluateRaw<T>(fn, opts);

  const sourceName = fn.name || "anonymous";
  const expression = `
    (${fn.toString()})()
    //# sourceURL=${sourceName}.js
  `;

  return evaluateRaw<T>(expression, opts);
}

export async function evaluateAsync<T = any>(expression: string): Promise<T> {
  return evaluateRaw<T>(expression, { awaitPromise: true });
}

export async function disconnect(): Promise<void> {
  if (!client) return;

  try {
    await client.close();
  } catch {
    // Best effort cleanup
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
    return false;
  }
}

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import CDP from "chrome-remote-interface";
import { chartGetState, chartSetSymbol } from "@repo/shared";

describe("TradingView E2E — Chart Control", () => {
  let client: any;

  beforeAll(async () => {
    try {
      const targets = await CDP.List({ host: "localhost", port: 9222 });
      const chartTarget = targets.find((t: any) => t.url && t.url.includes("tradingview.com/chart"));
      if (chartTarget) {
        client = await CDP({ host: "localhost", port: 9222, target: chartTarget.id });
      }
    } catch {}
  });

  afterAll(async () => {
    if (client) await client.close();
  });

  it("chart_get_state — retrieves symbol and timeframe", async () => {
    if (!client) return;
    const result = await chartGetState.action(undefined as any);
    expect(result.success).toBe(true);
    expect(result.symbol).toBeDefined();
    expect(result.resolution).toBeDefined();
  });

  it("chart_set_symbol — changes the symbol", async () => {
    if (!client) return;
    const testSymbol = "AAPL";
    const result = await chartSetSymbol.action({ symbol: testSymbol });
    expect(result.success).toBe(true);
    expect(result.symbol).toBe(testSymbol);
  });
});

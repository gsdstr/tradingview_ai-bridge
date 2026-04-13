import { describe, it, expect, beforeAll, afterAll } from "vitest";
import CDP from "chrome-remote-interface";
import { dataGetOhlcv, dataGetQuote } from "@repo/shared";

describe("TradingView E2E — Data Access", () => {
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

  it("data_get_ohlcv — retrieves bar data", async () => {
    if (!client) return;
    const result = await dataGetOhlcv.action({ count: 5 });
    expect(result.success).toBe(true);
    expect(result.bars.length).toBeGreaterThan(0);
  });

  it("data_get_quote — retrieves ticker info", async () => {
    if (!client) return;
    const result = await dataGetQuote.action({});
    expect(result.success).toBe(true);
    expect(result.symbol).toBeDefined();
  });
});

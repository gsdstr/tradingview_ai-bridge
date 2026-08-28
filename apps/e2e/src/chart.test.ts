import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getCDPConnection } from "./test-utils.js";
import { chartGetState, chartSetSymbol } from "@repo/shared";

describe("TradingView E2E — Chart Control", () => {
  let client: any;

  beforeAll(async () => {
    client = await getCDPConnection();
  });

  afterAll(async () => {
    if (client) await client.close();
  });

  it("chart_get_state — retrieves symbol and timeframe", async () => {
    if (!client) return;
    const result = await chartGetState.action();
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

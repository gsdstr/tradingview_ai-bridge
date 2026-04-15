import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getCDPConnection } from "./test-utils.js";
import { dataGetOhlcv, dataGetQuote } from "@repo/shared";

describe("TradingView E2E — Data Access", () => {
  let client: any;

  beforeAll(async () => {
    client = await getCDPConnection();
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

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import CDP from "chrome-remote-interface";
import { tvHealthCheck } from "@repo/shared";

describe("TradingView E2E — Health & Connection", () => {
  let client: any;

  beforeAll(async () => {
    try {
      const targets = await CDP.List({ host: "localhost", port: 9222 });
      const chartTarget = targets.find((t: any) => t.url && t.url.includes("tradingview.com/chart"));
      if (!chartTarget) throw new Error("No TradingView chart target found");

      client = await CDP({ host: "localhost", port: 9222, target: chartTarget.id });
      await client.Runtime.enable();
    } catch (err) {
      console.warn("CDP connection failed. E2E tests will be skipped. Ensure TradingView runs with --remote-debugging-port=9222");
    }
  });

  afterAll(async () => {
    if (client) await client.close();
  });

  it("tv_health_check — reports connection status", async () => {
    if (!client) return; // Skip if not connected
    const result = await tvHealthCheck.action(undefined as any);
    expect(result.success).toBe(true);
    expect(result.app).toBe("TradingView");
  });
});

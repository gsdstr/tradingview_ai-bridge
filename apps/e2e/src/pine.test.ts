import { describe, it, expect, beforeAll, afterAll } from "vitest";
import CDP from "chrome-remote-interface";
import { pineGetSource } from "@repo/shared";

describe("TradingView E2E — Pine Script", () => {
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

  it("pine_get_source — reads editor content", async () => {
    if (!client) return;
    try {
      const result = await pineGetSource.action(undefined as any);
      expect(result.success).toBe(true);
      expect(typeof result.source).toBe("string");
    } catch (e: any) {
      if (e.message.includes("Could not open Pine Editor")) {
        console.warn("Pine Editor not open, skipping source fetch test.");
      } else {
        throw e;
      }
    }
  });
});

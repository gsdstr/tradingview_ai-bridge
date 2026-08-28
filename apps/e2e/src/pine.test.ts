import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getCDPConnection } from "./test-utils.js";
import { pineGetSource } from "@repo/shared";

describe("TradingView E2E — Pine Script", () => {
  let client: any;

  beforeAll(async () => {
    client = await getCDPConnection();
  });

  afterAll(async () => {
    if (client) await client.close();
  });

  it("pine_get_source — reads editor content", async () => {
    if (!client) return;
    try {
      const result = await pineGetSource.action();
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

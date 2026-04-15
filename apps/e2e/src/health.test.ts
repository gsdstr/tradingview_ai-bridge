import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getCDPConnection } from "./test-utils.js";
import { tvHealthCheck } from "@repo/shared";

describe("TradingView E2E — Health & Connection", () => {
  let client: any;

  beforeAll(async () => {
    client = await getCDPConnection();
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

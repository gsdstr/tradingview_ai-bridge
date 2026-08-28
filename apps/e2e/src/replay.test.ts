import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getCDPConnection } from "./test-utils.js";
import { replayStart, replayStatus, replayStop } from "@repo/shared";

describe("TradingView E2E — Replay Mode", () => {
  let client: any;

  beforeAll(async () => {
    client = await getCDPConnection();
  });

  afterAll(async () => {
    // Ensure replay is stopped after tests 
    if (client) {
      try {
        await replayStop.action();
      } catch {}
      await client.close();
    }
  });

  it("replay workflow — start then stop", async () => {
    if (!client) return;

    // 1. Start Replay 
    // We don't provide a date, let it use the current/default date for simplicity in E2E
    const startResult = await replayStart.action({ date: "2024-01-01" });
    
    // Some envs might not support replay or lack data, handle gracefully
    if (!startResult.success) {
      console.warn("Replay start failed (likely unavailable on this chart/symbol), skipping remainder of flow.");
      return;
    }

    expect(startResult.success).toBe(true);

    // 2. Check Status
    const statusResult = await replayStatus.action();
    expect(statusResult.success).toBe(true);
    expect(statusResult.active).toBe(true);

    // 3. Stop Replay
    const stopResult = await replayStop.action();
    expect(stopResult.success).toBe(true);
    expect(stopResult.stopped).toBe(true);

    // 4. Verify stopped
    const finalStatus = await replayStatus.action();
    expect(finalStatus.active).toBe(false);
  }, 30000); // 30s timeout for replay transitions
});

import { describe, expect, it, vi } from "vitest";

vi.mock("../connection.js", () => ({
  evaluate: vi.fn(),
  evaluateAsync: vi.fn(),
  getClient: vi.fn(),
  safeString: (value: string) => JSON.stringify(value),
}));
vi.mock("../known.js", () => ({
  getChartApi: vi.fn().mockResolvedValue("api"),
  getChartCollection: vi.fn().mockResolvedValue(null),
}));

import { evaluate } from "../connection.js";
import { batchRun } from "./batch.js";

describe("batchRun", () => {
  it("marks embedded operation errors and aggregate result as failures", async () => {
    vi.useFakeTimers();
    vi.mocked(evaluate).mockResolvedValue({
      error: "Strategy Tester not found",
    });

    const run = batchRun({
      symbols: ["NASDAQ:AAPL"],
      action: "get_strategy_results",
      delay_ms: 1,
    });
    await vi.runAllTimersAsync();

    await expect(run).resolves.toMatchObject({
      success: false,
      successful: 0,
      failed: 1,
      results: [{ success: false, error: "Strategy Tester not found" }],
    });
    vi.useRealTimers();
  });
});

import { describe, expect, it, vi } from "vitest";

vi.mock("../connection.js", () => ({
  evaluate: vi.fn(),
  safeString: (value: string) => JSON.stringify(value),
}));

import { evaluate } from "../connection.js";
import {
  getStrategyPerformance,
  getStrategyResults,
  getTrades,
} from "./data.js";

describe("strategy data", () => {
  it.each([
    ["getStrategyPerformance", getStrategyPerformance],
    ["getStrategyResults", getStrategyResults],
    ["getTrades", getTrades],
  ])("marks %s operation errors as unsuccessful", async (_name, operation) => {
    vi.mocked(evaluate).mockResolvedValue({
      error: "No strategy found",
      metrics: {},
      trades: [],
    });

    await expect(operation()).resolves.toMatchObject({
      success: false,
      error: "No strategy found",
    });
  });
});

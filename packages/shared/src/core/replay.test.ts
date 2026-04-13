import { describe, it, expect, vi } from "vitest";
import { start, step, stop, VALID_AUTOPLAY_DELAYS } from "./replay.js";
import * as connection from "../connection.js";

// Mock connection helpers
vi.mock("../connection.js", () => ({
  evaluate: vi.fn(),
  evaluateAsync: vi.fn(),
  getClient: vi.fn(),
  safeString: (s: any) => JSON.stringify(String(s)),
}));

describe("replay core", () => {
  it("start() — date selection", async () => {
    const evaluateMock = vi.mocked(connection.evaluate);
    evaluateMock.mockImplementation(async (expr) => {
      if (expr.includes("isReplayAvailable")) return true;
      if (expr.includes("showReplayToolbar")) return undefined;
      if (expr.includes("selectDate")) return "ok";
      if (expr.includes("selectFirstAvailableDate")) return "ok";
      if (expr.includes("isReplayStarted")) return true;
      if (expr.includes("currentDate")) return 1700000000;
      return undefined;
    });

    const result = await start({ date: "2026-03-15" });
    expect(result.success).toBe(true);
    expect(result.replay_started).toBe(true);
    expect(evaluateMock).toHaveBeenCalledWith(expect.stringContaining("selectDate"));
  });

  it("step() — doStep", async () => {
    const evaluateMock = vi.mocked(connection.evaluate);
    evaluateMock.mockImplementation(async (expr) => {
      if (expr.includes("isReplayStarted")) return true;
      if (expr.includes("currentDate")) return 1000;
      if (expr.includes("doStep")) return undefined;
      return undefined;
    });

    const result = await step();
    expect(result.success).toBe(true);
    expect(result.action).toBe("step");
  });

  it("stop() — stopReplay", async () => {
    const evaluateMock = vi.mocked(connection.evaluate);
    evaluateMock.mockImplementation(async (expr) => {
      if (expr.includes("isReplayStarted")) return true;
      if (expr.includes("stopReplay")) return undefined;
      return undefined;
    });

    const result = await stop();
    expect(result.success).toBe(true);
    expect(result.action).toBe("replay_stopped");
  });

  it("defines valid autoplay delays", () => {
    expect(VALID_AUTOPLAY_DELAYS).toContain(100);
    expect(VALID_AUTOPLAY_DELAYS).toContain(1000);
  });
});

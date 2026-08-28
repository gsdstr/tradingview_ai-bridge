import { beforeEach, describe, expect, it, vi } from "vitest";
import { createParser } from "./cli.js";

// Mock the action functions to avoid real side effects during unit tests
vi.mock("@repo/shared", () => {
  return {
    actionRegistry: {
      tv_health: {
        name: "tv_health",
        shortDescription: "health",
        action: vi.fn().mockResolvedValue({ success: true }),
      },
      watchlist_get: {
        name: "watchlist_get",
        shortDescription: "get",
        action: vi.fn().mockResolvedValue([{ symbol: "AAPL" }]),
      },
      info: {
        name: "info",
        shortDescription: "info",
        action: vi.fn().mockResolvedValue({ application: "test" }),
      },
    },
    getErrorMessage: (err: unknown) =>
      err instanceof Error ? err.message : String(err),
    disconnect: vi.fn().mockResolvedValue(undefined),
  };
});

describe("CLI Routing and Validation", () => {
  let parser: ReturnType<typeof createParser>;

  beforeEach(() => {
    vi.clearAllMocks();
    parser = createParser();
  });

  it("shows root help with all command groups", async () => {
    const helpOutput = await parser.getHelp();
    expect(helpOutput).toContain("tv");
    expect(helpOutput).toContain("watchlist");
    expect(helpOutput).toContain("info");
  });

  it("routes 'tv health' to tv_health action", async () => {
    await parser.parse(["tv", "health"]);

    const { actionRegistry } = await import("@repo/shared");
    expect(actionRegistry.tv_health?.action).toHaveBeenCalled();
  });

  it("routes 'watchlist get' to watchlist_get action", async () => {
    await parser.parse(["watchlist", "get"]);

    const { actionRegistry } = await import("@repo/shared");
    expect(actionRegistry.watchlist_get?.action).toHaveBeenCalled();
  });

  it("fails on unknown command", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {
      // Mock error output to keep test output clean
    });
    // Should throw due to .strict() and our .fail() wrapper
    await expect(async () => {
      await parser.parse(["nonexistent"]);
    }).rejects.toThrow();
    spy.mockRestore();
  });
});

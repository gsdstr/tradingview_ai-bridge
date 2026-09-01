import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { createParser } from "./cli.js";

// Mock the action functions to avoid real side effects during unit tests
vi.mock("@repo/shared", () => {
  return {
    actionRegistry: {
      "bridge_health-check": {
        name: "bridge_health-check",
        shortDescription: "health",
        action: vi.fn().mockResolvedValue({ success: true }),
      },
      watchlist_get: {
        name: "watchlist_get",
        shortDescription: "get",
        action: vi.fn().mockResolvedValue([{ symbol: "AAPL" }]),
      },
      "bridge_get-info": {
        name: "bridge_get-info",
        shortDescription: "info",
        action: vi.fn().mockResolvedValue({ application: "test" }),
      },
      "strategy_update-report": {
        name: "strategy_update-report",
        shortDescription: "Update strategy report",
        action: vi.fn().mockResolvedValue({
          success: true,
          updated: true,
          message: "Update report button clicked successfully.",
        }),
      },
    },
    actionCliMetadata: {
      "bridge_health-check": { domain: "bridge", command: "health-check" },
      watchlist_get: { domain: "watchlist", command: "get" },
      "bridge_get-info": { domain: "bridge", command: "get-info" },
      "strategy_update-report": { domain: "strategy", command: "update-report" },
    },
    getErrorMessage: (err: unknown) =>
      err instanceof Error ? err.message : String(err),
    disconnect: vi.fn().mockResolvedValue(undefined),
  };
});

describe("CLI Routing and Validation", () => {
  let parser: ReturnType<typeof createParser>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { actionRegistry } = await import("@repo/shared");
    const registry: Record<string, any> = actionRegistry;

    registry.typed = {
      name: "typed",
      shortDescription: "typed flags",
      inputSchema: z.object({
        enabled: z.boolean().optional().default(false),
        count: z.number().optional().default(1),
        label: z.string(),
        entity_id: z.string().optional(),
      }),
      action: vi.fn().mockResolvedValue({ success: true }),
    };
    registry.failure = {
      name: "failure",
      shortDescription: "failing action",
      action: vi.fn().mockRejectedValue(new Error("action failed")),
    };
    const metadata = (await import("@repo/shared")).actionCliMetadata;
    metadata.typed = { domain: "test", command: "typed" };
    metadata.failure = { domain: "test", command: "failure" };
    parser = createParser();
  });

  it("shows root help with all command groups", async () => {
    const helpOutput = await parser.getHelp();
    expect(helpOutput).toContain("bridge");
    expect(helpOutput).toContain("watchlist");
    expect(helpOutput).toContain("strategy");
    expect(helpOutput).toContain("test");
  });

  it("routes 'bridge health-check' to bridge_health-check action", async () => {
    await parser.parse(["bridge", "health-check"]);

    const { actionRegistry } = await import("@repo/shared");
    expect(actionRegistry["bridge_health-check"]?.action).toHaveBeenCalled();
  });

  it("routes 'strategy update-report' to strategy_update-report action", async () => {
    await parser.parse(["strategy", "update-report"]);

    const { actionRegistry } = await import("@repo/shared");
    expect(actionRegistry["strategy_update-report"]?.action).toHaveBeenCalled();
  });

  it("routes 'watchlist get' to watchlist_get action", async () => {
    await parser.parse(["watchlist", "get"]);

    const { actionRegistry } = await import("@repo/shared");
    expect(actionRegistry.watchlist_get?.action).toHaveBeenCalled();
  });

  it("passes Zod 4 boolean, number, and string flags with their typed values", async () => {
    await parser.parse([
      "test",
      "typed",
      "--enabled",
      "--count",
      "7",
      "--label",
      "hello",
      "--entity-id",
      "study-1",
    ]);

    const { actionRegistry } = await import("@repo/shared");
    expect((actionRegistry as Record<string, any>).typed?.action).toHaveBeenCalledWith({
      enabled: true,
      count: 7,
      label: "hello",
      entity_id: "study-1",
    });
  });

  it("disconnects after an action failure", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    await parser.parse(["test", "failure"]);

    const { disconnect } = await import("@repo/shared");
    expect(disconnect).toHaveBeenCalledTimes(1);
    spy.mockRestore();
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

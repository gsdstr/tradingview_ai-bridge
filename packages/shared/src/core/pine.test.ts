import { describe, it, expect } from "vitest";
import { analyze } from "./pine.js";

describe("pine core static analysis", () => {
  it("clean v6 script — no issues", () => {
    const result = analyze({
      source: `//@version=6
indicator("Test", overlay=true)
a = array.from(1, 2, 3)
val = array.get(a, 1)
plot(close)`,
    });
    expect(result.issue_count).toBe(0);
  });

  it("array.get out of bounds", () => {
    const result = analyze({
      source: `//@version=6
indicator("Test")
a = array.from(1, 2, 3)
val = array.get(a, 5)`,
    });
    expect(result.issue_count).toBe(1);
    expect(result.diagnostics[0].severity).toBe("error");
    expect(result.diagnostics[0].message).toContain("index 5 out of bounds");
  });

  it("array.set out of bounds", () => {
    const result = analyze({
      source: `//@version=6
indicator("Test")
a = array.new_float(3)
array.set(a, 10, 99.0)`,
    });
    expect(result.issue_count).toBe(1);
    expect(result.diagnostics[0].message).toContain("array.set");
  });

  it("old version v3 warning", () => {
    const result = analyze({
      source: `//@version=3
study("Test")
plot(close)`,
    });
    expect(result.issue_count).toBe(1);
    expect(result.diagnostics[0].severity).toBe("info");
    expect(result.diagnostics[0].message).toContain("uses Pine v3");
  });

  it("handles null/empty lines gracefully", () => {
    const result = analyze({ source: "\n\n" });
    expect(result.issue_count).toBe(0);
  });
});

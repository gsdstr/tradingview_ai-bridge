import { describe, it, expect } from "vitest";
import { formatPrice } from "@repo/shared";

describe("formatPrice", () => {
  it("correctly formats USD", () => {
    const result = formatPrice(123.45);
    expect(result).toBe("$123.45");
  });

  it("handles zero correctly", () => {
    const result = formatPrice(0);
    expect(result).toBe("$0.00");
  });
});

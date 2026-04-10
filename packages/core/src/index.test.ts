import { describe, it, expect } from "vitest";
import { APP_NAME } from "./index.js";

describe("shared exports", () => {
  it("has correct APP_NAME", () => {
    expect(APP_NAME).toBe("TradingView AI Desk");
  });
});

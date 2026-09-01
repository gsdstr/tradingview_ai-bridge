import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("../connection.js", () => ({
  evaluate: vi.fn(),
}));

import { evaluate } from "../connection.js";
import { updateReport } from "./strategy.js";
import { strategyUpdateReport } from "../actions/strategy.js";

describe("strategy update-report", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns updated: true when snackbar button is clicked successfully", async () => {
    vi.mocked(evaluate).mockResolvedValue({
      success: true,
      updated: true,
      message: "Update report button clicked successfully.",
    });

    const result = await updateReport();
    expect(result).toEqual({
      success: true,
      updated: true,
      message: "Update report button clicked successfully.",
    });
  });

  it("returns updated: false and reason: button_not_found when snackbar button is absent", async () => {
    vi.mocked(evaluate).mockResolvedValue({
      success: true,
      updated: false,
      reason: "button_not_found",
      message: "Update report button not found in snackbar.",
    });

    const result = await updateReport();
    expect(result).toEqual({
      success: true,
      updated: false,
      reason: "button_not_found",
      message: "Update report button not found in snackbar.",
    });
  });

  it("returns updated: false and reason: button_disabled when button is disabled", async () => {
    vi.mocked(evaluate).mockResolvedValue({
      success: true,
      updated: false,
      reason: "button_disabled",
      message: "Update report button is disabled.",
    });

    const result = await updateReport();
    expect(result).toEqual({
      success: true,
      updated: false,
      reason: "button_disabled",
      message: "Update report button is disabled.",
    });
  });

  it("returns success: false and reason: click_failed on error during click", async () => {
    vi.mocked(evaluate).mockResolvedValue({
      success: false,
      updated: false,
      reason: "click_failed",
      error: "DOMException: Element detached",
    });

    const result = await updateReport();
    expect(result).toEqual({
      success: false,
      updated: false,
      reason: "click_failed",
      error: "DOMException: Element detached",
    });
  });

  it("handles null evaluation response gracefully", async () => {
    vi.mocked(evaluate).mockResolvedValue(null);

    const result = await updateReport();
    expect(result).toEqual({
      success: false,
      updated: false,
      reason: "evaluation_failed",
      error: "No response from CDP evaluation.",
    });
  });

  it("action executes core updateReport function", async () => {
    vi.mocked(evaluate).mockResolvedValue({
      success: true,
      updated: true,
      message: "Update report button clicked successfully.",
    });

    const result = await (strategyUpdateReport.action as () => Promise<unknown>)();
    expect(result).toEqual({
      success: true,
      updated: true,
      message: "Update report button clicked successfully.",
    });
  });

  it("evaluates DOM logic with exact required selector", async () => {
    let capturedFunction: (() => unknown) | null = null;
    vi.mocked(evaluate).mockImplementation((fn: any) => {
      capturedFunction = fn;
      return Promise.resolve({ success: true, updated: false, reason: "button_not_found" });
    });

    await updateReport();
    expect(capturedFunction).not.toBeNull();
    const fnString = (capturedFunction as unknown as () => void).toString();
    expect(fnString).toContain('backtesting-updated-report-snackbar');
    expect(fnString).toContain('ui-lib-snackbar-action-button');
  });
});

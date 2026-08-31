import { describe, expect, it, vi } from "vitest";

vi.mock("../connection.js", () => ({ evaluateAsync: vi.fn() }));

import { evaluateAsync } from "../connection.js";
import { list } from "./alerts.js";

describe("alert list", () => {
  it("reports an embedded API error as unsuccessful", async () => {
    vi.mocked(evaluateAsync).mockResolvedValue({
      alerts: [],
      error: "Unauthorized",
    });

    await expect(list()).resolves.toMatchObject({
      success: false,
      alert_count: 0,
      error: "Unauthorized",
    });
  });
});

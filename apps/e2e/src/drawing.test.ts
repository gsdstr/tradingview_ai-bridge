import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getCDPConnection } from "./test-utils.js";
import { drawingDrawShape, drawingList, drawingRemove, chartGetState } from "@repo/shared";

describe("TradingView E2E — Drawings", () => {
  let client: any;

  beforeAll(async () => {
    client = await getCDPConnection();
  });

  afterAll(async () => {
    if (client) await client.close();
  });

  it("drawing workflow — draw, list, then remove", async () => {
    if (!client) return;

    // 1. Get current state for coordinates
    const state = await chartGetState.action();
    expect(state.success).toBe(true);

    const now = Math.floor(Date.now() / 1000);
    const price = 150.0; // fallback price coordinate

    // 2. Draw a shape (Horizontal Line)
    const drawResult = await drawingDrawShape.action({
      shape: "Horizontal Line",
      point: { time: now, price: price }
    });

    expect(drawResult.success).toBe(true);
    expect(drawResult.entity_id).toBeDefined();

    const shapeId = drawResult.entity_id;

    // 3. Verify it appears in the list
    const listResult = await drawingList.action();
    expect(listResult.success).toBe(true);
    expect(listResult.shapes.some((s: any) => s.id === shapeId)).toBe(true);

    // 4. Remove it
    const removeResult = await drawingRemove.action({ entity_id: shapeId });
    expect(removeResult.success).toBe(true);
    expect(removeResult.removed).toBe(true);

    // 5. Verify it is gone
    const finalResult = await drawingList.action();
    expect(finalResult.shapes.some((s: any) => s.id === shapeId)).toBe(false);
  });
});

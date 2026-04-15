import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getCDPConnection } from "./test-utils.js";
import { indicatorList, indicatorToggleVisibility, indicatorGetInputsInfo } from "@repo/shared";

describe("TradingView E2E — Indicators", () => {
  let client: any;

  beforeAll(async () => {
    client = await getCDPConnection();
  });

  afterAll(async () => {
    if (client) await client.close();
  });

  it("indicator_list — retrieves active indicators", async () => {
    if (!client) return;
    const result = await indicatorList.action({});
    expect(result.studies).toBeDefined();
    expect(Array.isArray(result.studies)).toBe(true);
  });

  it("indicator_get_inputs_info — retrieves metadata for an indicator", async () => {
    if (!client) return;
    const listResult = await indicatorList.action({});
    if (listResult.studies.length === 0) return;

    const targetId = listResult.studies[0].id;
    const result = await indicatorGetInputsInfo.action({ entity_id: targetId });
    expect(result.success).toBe(true);
    expect(result.inputs).toBeDefined();
  });

  it("indicator_toggle_visibility — changes visibility state", async () => {
    if (!client) return;
    const listResult = await indicatorList.action({});
    if (listResult.studies.length === 0) return;

    const targetId = listResult.studies[0].id;
    const result = await indicatorToggleVisibility.action({ 
      entity_id: targetId, 
      visible: false 
    });
    expect(result.success).toBe(true);
    expect(result.visible).toBe(false);

    // cleanup: toggle back
    await indicatorToggleVisibility.action({ 
      entity_id: targetId, 
      visible: true 
    });
  });
});

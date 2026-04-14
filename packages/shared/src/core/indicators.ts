import { evaluate, safeString } from "../connection.js";

const CHART_API = "window.TradingViewApi._activeChartWidgetWV.value()";

export async function list(options: { name?: string }): Promise<any> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const result = await evaluate(function listIndicators() {
    const activeChart = window.TradingViewApi._activeChartWidgetWV.value();

    if (!activeChart) return { error: "Chart widget not found" };

    if (window.TV_CONFIG.isDebug) debugger;

    return activeChart.getAllStudies().map(function (s) {
      return { id: s.id, name: s.name || s.title || "unknown" };
    });
  });
  if (options?.name) {
    return result.filter((s) => s.name?.includes(options.name));
  }
  return result;
}

export async function setInputs(options: {
  entity_id: string;
  inputs: any;
}): Promise<any> {
  const { entity_id, inputs: inputsRaw } = options;
  const inputs = inputsRaw
    ? typeof inputsRaw === "string"
      ? JSON.parse(inputsRaw)
      : inputsRaw
    : undefined;
  if (!entity_id)
    throw new Error(
      "entity_id is required. Use chart_get_state to find study IDs.",
    );
  if (
    !inputs ||
    typeof inputs !== "object" ||
    Object.keys(inputs).length === 0
  ) {
    throw new Error("inputs must be a non-empty object, e.g. { length: 50 }");
  }

  const inputsJson = JSON.stringify(inputs);

  const result = await evaluate(`
    (function() {
      var chart = ${CHART_API};
      var study = chart.getStudyById(${safeString(entity_id)});
      if (!study) return { error: 'Study not found: ' + ${safeString(entity_id)} };
      var currentInputs = study.getInputValues();
      var overrides = ${inputsJson};
      var updatedKeys = {};
      for (var i = 0; i < currentInputs.length; i++) {
        if (overrides.hasOwnProperty(currentInputs[i].id)) {
          currentInputs[i].value = overrides[currentInputs[i].id];
          updatedKeys[currentInputs[i].id] = overrides[currentInputs[i].id];
        }
      }
      study.setInputValues(currentInputs);
      return { updated_inputs: updatedKeys };
    })()
  `);

  if (result?.error) throw new Error(result.error);
  return { success: true, entity_id, updated_inputs: result.updated_inputs };
}

export async function toggleVisibility(options: {
  entity_id: string;
  visible: boolean;
}): Promise<any> {
  const { entity_id, visible } = options;
  if (!entity_id)
    throw new Error(
      "entity_id is required. Use chart_get_state to find study IDs.",
    );
  if (typeof visible !== "boolean")
    throw new Error("visible must be a boolean (true or false)");

  const result = await evaluate(`
    (function() {
      var chart = ${CHART_API};
      var study = chart.getStudyById(${safeString(entity_id)});
      if (!study) return { error: 'Study not found: ' + ${safeString(entity_id)} };
      study.setVisible(${visible});
      var actualVisible = study.isVisible();
      return { visible: actualVisible };
    })()
  `);

  if (result?.error) throw new Error(result.error);
  return { success: true, entity_id, visible: result.visible };
}

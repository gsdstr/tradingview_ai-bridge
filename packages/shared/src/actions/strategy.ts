import type { Action } from "./action.js";
import { updateReport } from "../core/strategy.js";
import type { z } from "zod";

export const strategyUpdateReport: Action<undefined, z.ZodAny> = {
  name: "strategy_update-report",
  shortDescription: "Update strategy report",
  description:
    "Clicks the 'Update report' button in the Strategy Tester snackbar if present to apply updated script calculations.",
  action: async () => {
    return updateReport();
  },
};

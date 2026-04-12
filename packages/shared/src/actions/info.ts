import { z } from "zod";
import type { Action } from "./action.js";
import { APP_NAME } from "../index.js";

const outputSchema = z.object({
  application: z.string(),
  status: z.string(),
});

export const infoDetails: Action<undefined, typeof outputSchema> = {
  name: "info",
  shortDescription: "Show app information",
  description: "Retrieves basic application and status information.",
  outputSchema,
  action: async () => {
    return {
      application: APP_NAME,
      status: "Connected (Placeholder)",
    };
  },
};

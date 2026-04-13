export * from "./watchlist.js";

import { tvLaunch, tvHealthCheck } from "./tv.js";
import { infoDetails } from "./info.js";
import { watchlistGet, watchlistAdd } from "./watchlist.js";
import type { Action } from "./action.js";

// A registry of all available actions
export const actionRegistry: Record<string, Action<any, any>> = {
  [tvLaunch.name]: tvLaunch,
  [tvHealthCheck.name]: tvHealthCheck,
  [infoDetails.name]: infoDetails,
  [watchlistGet.name]: watchlistGet,
  [watchlistAdd.name]: watchlistAdd,
};

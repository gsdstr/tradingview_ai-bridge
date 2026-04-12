export * from "./price.js";
export * from "./watchlist.js";

import { tvLaunch } from "./tv.js";
import { healthCheck } from "./health.js";
import { infoDetails } from "./info.js";
import { priceFormat } from "./price.js";
import { watchlistGet, watchlistAdd } from "./watchlist.js";
import type { Action } from "./action.js";

// A registry of all available actions
export const actionRegistry: Record<string, Action<any, any>> = {
  [tvLaunch.name]: tvLaunch,
  [healthCheck.name]: healthCheck,
  [infoDetails.name]: infoDetails,
  [priceFormat.name]: priceFormat,
  [watchlistGet.name]: watchlistGet,
  [watchlistAdd.name]: watchlistAdd,
};

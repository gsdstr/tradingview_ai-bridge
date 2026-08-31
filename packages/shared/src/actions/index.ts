import type { Action } from "./action.js";
export type { Action };
export interface CliActionMetadata {
  domain: string;
  command: string;
}
import { tvLaunch, tvHealthCheck } from "./tv.js";
import { infoDetails } from "./info.js";
import { watchlistGet, watchlistAdd } from "./watchlist.js";
import { alertCreate, alertList, alertDelete } from "./alerts.js";
import { batchRunAction } from "./batch.js";
import { captureScreenshotAction } from "./capture.js";
import {
  chartGetState,
  chartSetSymbol,
  chartSetTimeframe,
  chartSetType,
  chartManageIndicator,
  chartGetVisibleRange,
  chartSetVisibleRange,
  chartScrollToDate,
  chartSymbolInfo,
  chartSymbolSearch,
} from "./chart.js";
import {
  dataGetOhlcv,
  dataGetIndicator,
  dataGetStrategyResults,
  dataGetStrategyPerformance,
  dataGetTrades,
  dataGetQuote,
  dataGetDepth,
  dataGetStudyValues,
  dataGetPineLines,
  dataGetPineLabels,
  dataGetPineTables,
} from "./data.js";
import {
  drawingDrawShape,
  drawingList,
  drawingGetProperties,
  drawingRemove,
  drawingClearAll,
} from "./drawing.js";
import {
  indicatorSetInputs,
  indicatorGetInputs,
  indicatorGetInputsInfo,
  indicatorToggleVisibility,
  indicatorList,
} from "./indicators.js";
import { paneList, paneSetLayout, paneFocus, paneSetSymbol } from "./pane.js";
import {
  pineGetSource,
  pineSetSource,
  pineCompile,
  pineGetErrors,
  pineSave,
  pineCheck,
  pineAnalyze,
} from "./pine.js";
import {
  replayStart,
  replayStep,
  replayAutoplay,
  replayStop,
  replayTrade,
  replayStatus,
} from "./replay.js";
import {
  streamFetchQuote,
  streamFetchBar,
  streamFetchValues,
} from "./stream.js";

export * from "./tv.js";
export * from "./info.js";
export * from "./watchlist.js";
export * from "./alerts.js";
export * from "./batch.js";
export * from "./capture.js";
export * from "./chart.js";
export * from "./data.js";
export * from "./drawing.js";
export * from "./indicators.js";
export * from "./pane.js";
export * from "./pine.js";
export * from "./replay.js";
export * from "./stream.js";

// A registry of all available actions
export const actionRegistry: Record<string, Action<any, any>> = {
  [tvLaunch.name]: tvLaunch,
  [tvHealthCheck.name]: tvHealthCheck,
  [infoDetails.name]: infoDetails,
  [watchlistGet.name]: watchlistGet,
  [watchlistAdd.name]: watchlistAdd,

  // Alerts
  [alertCreate.name]: alertCreate,
  [alertList.name]: alertList,
  [alertDelete.name]: alertDelete,

  // Batch
  [batchRunAction.name]: batchRunAction,

  // Capture
  [captureScreenshotAction.name]: captureScreenshotAction,

  // Chart
  [chartGetState.name]: chartGetState,
  [chartSetSymbol.name]: chartSetSymbol,
  [chartSetTimeframe.name]: chartSetTimeframe,
  [chartSetType.name]: chartSetType,
  [chartManageIndicator.name]: chartManageIndicator,
  [chartGetVisibleRange.name]: chartGetVisibleRange,
  [chartSetVisibleRange.name]: chartSetVisibleRange,
  [chartScrollToDate.name]: chartScrollToDate,
  [chartSymbolInfo.name]: chartSymbolInfo,
  [chartSymbolSearch.name]: chartSymbolSearch,

  // Data
  [dataGetOhlcv.name]: dataGetOhlcv,
  [dataGetIndicator.name]: dataGetIndicator,
  [dataGetStrategyResults.name]: dataGetStrategyResults,
  [dataGetStrategyPerformance.name]: dataGetStrategyPerformance,
  [dataGetTrades.name]: dataGetTrades,
  [dataGetQuote.name]: dataGetQuote,
  [dataGetDepth.name]: dataGetDepth,
  [dataGetStudyValues.name]: dataGetStudyValues,
  [dataGetPineLines.name]: dataGetPineLines,
  [dataGetPineLabels.name]: dataGetPineLabels,
  [dataGetPineTables.name]: dataGetPineTables,

  // Drawing
  [drawingDrawShape.name]: drawingDrawShape,
  [drawingList.name]: drawingList,
  [drawingGetProperties.name]: drawingGetProperties,
  [drawingRemove.name]: drawingRemove,
  [drawingClearAll.name]: drawingClearAll,

  // Indicators
  [indicatorSetInputs.name]: indicatorSetInputs,
  [indicatorGetInputs.name]: indicatorGetInputs,
  [indicatorGetInputsInfo.name]: indicatorGetInputsInfo,
  [indicatorToggleVisibility.name]: indicatorToggleVisibility,
  [indicatorList.name]: indicatorList,

  // Pane
  [paneList.name]: paneList,
  [paneSetLayout.name]: paneSetLayout,
  [paneFocus.name]: paneFocus,
  [paneSetSymbol.name]: paneSetSymbol,

  // Pine
  [pineGetSource.name]: pineGetSource,
  [pineSetSource.name]: pineSetSource,
  [pineCompile.name]: pineCompile,
  [pineGetErrors.name]: pineGetErrors,
  [pineSave.name]: pineSave,
  [pineCheck.name]: pineCheck,
  [pineAnalyze.name]: pineAnalyze,

  // Replay
  [replayStart.name]: replayStart,
  [replayStep.name]: replayStep,
  [replayAutoplay.name]: replayAutoplay,
  [replayStop.name]: replayStop,
  [replayTrade.name]: replayTrade,
  [replayStatus.name]: replayStatus,

  // Stream
  [streamFetchQuote.name]: streamFetchQuote,
  [streamFetchBar.name]: streamFetchBar,
  [streamFetchValues.name]: streamFetchValues,
};

// CLI paths are deliberate public metadata, not inferred from MCP tool names.
export const actionCliMetadata: Record<string, CliActionMetadata> = {
  [tvLaunch.name]: { domain: "bridge", command: "launch" },
  [tvHealthCheck.name]: { domain: "bridge", command: "health-check" },
  [infoDetails.name]: { domain: "bridge", command: "get-info" },
  [watchlistGet.name]: { domain: "watchlist", command: "get" },
  [watchlistAdd.name]: { domain: "watchlist", command: "add" },
  [alertCreate.name]: { domain: "alert", command: "create" },
  [alertList.name]: { domain: "alert", command: "list" },
  [alertDelete.name]: { domain: "alert", command: "delete" },
  [batchRunAction.name]: { domain: "batch", command: "run" },
  [captureScreenshotAction.name]: { domain: "capture", command: "screenshot" },
  [chartGetState.name]: { domain: "chart", command: "get-state" },
  [chartSetSymbol.name]: { domain: "chart", command: "set-symbol" },
  [chartSetTimeframe.name]: { domain: "chart", command: "set-timeframe" },
  [chartSetType.name]: { domain: "chart", command: "set-type" },
  [chartManageIndicator.name]: { domain: "chart", command: "manage-indicator" },
  [chartGetVisibleRange.name]: { domain: "chart", command: "get-visible-range" },
  [chartSetVisibleRange.name]: { domain: "chart", command: "set-visible-range" },
  [chartScrollToDate.name]: { domain: "chart", command: "scroll-to-date" },
  [chartSymbolInfo.name]: { domain: "chart", command: "get-symbol-info" },
  [chartSymbolSearch.name]: { domain: "chart", command: "search-symbol" },
  [dataGetOhlcv.name]: { domain: "data", command: "get-ohlcv" },
  [dataGetIndicator.name]: { domain: "data", command: "get-indicator" },
  [dataGetStrategyResults.name]: { domain: "data", command: "get-strategy-results" },
  [dataGetStrategyPerformance.name]: { domain: "data", command: "get-strategy-performance" },
  [dataGetTrades.name]: { domain: "data", command: "get-trades" },
  [dataGetQuote.name]: { domain: "data", command: "get-quote" },
  [dataGetDepth.name]: { domain: "data", command: "get-depth" },
  [dataGetStudyValues.name]: { domain: "data", command: "get-study-values" },
  [dataGetPineLines.name]: { domain: "data", command: "get-pine-lines" },
  [dataGetPineLabels.name]: { domain: "data", command: "get-pine-labels" },
  [dataGetPineTables.name]: { domain: "data", command: "get-pine-tables" },
  [drawingDrawShape.name]: { domain: "drawing", command: "draw-shape" },
  [drawingList.name]: { domain: "drawing", command: "list" },
  [drawingGetProperties.name]: { domain: "drawing", command: "get-properties" },
  [drawingRemove.name]: { domain: "drawing", command: "remove" },
  [drawingClearAll.name]: { domain: "drawing", command: "clear-all" },
  [indicatorSetInputs.name]: { domain: "indicator", command: "set-inputs" },
  [indicatorGetInputs.name]: { domain: "indicator", command: "get-inputs" },
  [indicatorGetInputsInfo.name]: { domain: "indicator", command: "get-inputs-info" },
  [indicatorToggleVisibility.name]: { domain: "indicator", command: "toggle-visibility" },
  [indicatorList.name]: { domain: "indicator", command: "list" },
  [paneList.name]: { domain: "pane", command: "list" },
  [paneSetLayout.name]: { domain: "pane", command: "set-layout" },
  [paneFocus.name]: { domain: "pane", command: "focus" },
  [paneSetSymbol.name]: { domain: "pane", command: "set-symbol" },
  [pineGetSource.name]: { domain: "pine", command: "get-source" },
  [pineSetSource.name]: { domain: "pine", command: "set-source" },
  [pineCompile.name]: { domain: "pine", command: "compile" },
  [pineGetErrors.name]: { domain: "pine", command: "get-errors" },
  [pineSave.name]: { domain: "pine", command: "save" },
  [pineCheck.name]: { domain: "pine", command: "check" },
  [pineAnalyze.name]: { domain: "pine", command: "analyze" },
  [replayStart.name]: { domain: "replay", command: "start" },
  [replayStep.name]: { domain: "replay", command: "step" },
  [replayAutoplay.name]: { domain: "replay", command: "autoplay" },
  [replayStop.name]: { domain: "replay", command: "stop" },
  [replayTrade.name]: { domain: "replay", command: "trade" },
  [replayStatus.name]: { domain: "replay", command: "status" },
  [streamFetchQuote.name]: { domain: "stream", command: "fetch-quote" },
  [streamFetchBar.name]: { domain: "stream", command: "fetch-bar" },
  [streamFetchValues.name]: { domain: "stream", command: "fetch-values" },
};

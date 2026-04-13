import type { Action } from "./action.js";
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
import { indicatorSetInputs, indicatorToggleVisibility } from "./indicators.js";
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
import { streamFetchQuote, streamFetchBar, streamFetchValues } from "./stream.js";

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
  [indicatorToggleVisibility.name]: indicatorToggleVisibility,

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

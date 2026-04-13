/*
TradingView
Version 2.14.0 • 10/16/2025
*/

export interface ChartWidget {
  symbol(): string;
  resolution(): string;
  chartType(): number | null;
  /**
   * Internal model abstraction, dynamically discovered via CDP.
   */
  _chartWidget?: {
    model(): {
      mainSeries(): {
        bars(): unknown;
      };
      model(): {
        dataSources(): unknown;
      };
    };
  };
}

export interface TradingViewApi {
  _activeChartWidgetWV: {
    value(): ChartWidget;
  };
  _chartWidgetCollection?: unknown;
  _replayApi?: unknown;
  _alertService?: unknown;
  getSavedCharts?: () => unknown;
  searchSymbols?: () => unknown;
}

export interface TradingViewGlobal {
  bottomWidgetBar?: unknown;
}

declare global {
  interface Window {
    TradingViewApi: TradingViewApi;
    TradingView: TradingViewGlobal;
    ChartApiInstance?: unknown;
    TV_CONFIG: {
      isDebug: boolean;
      [key: string]: any;
    };
  }

  // // Make the global variable directly accessible without `window.` as well
  // var TradingViewApi: TradingViewApi;
  // var TradingView: TradingViewGlobal;
}

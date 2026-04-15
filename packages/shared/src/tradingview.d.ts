/*
TradingView
Version 2.14.0 • 10/16/2025
*/

export interface DataSource {
  isStarted(): boolean;
  name: string;
  reportData?: (() => { performance: any }) | { performance: any };
  performance?: any;
  _id?: string;
  price?(): number;
  index?(): number;
  visible?(): boolean;
  zorder?(): number;
}

export interface Study {
  id: string;
  name: string;
  title: string;
  setVisible(visible: boolean): void;
  isVisible(): boolean;
  getInputValues(): { id: string; value: any }[];
  setInputValues(values: { id: string; value: any }[]): void;
  getInputsInfo(): {
    id: string;
    name: string;
    type: string;
    value: any;
    isHidden: boolean;
    groupId: string;
    min?: number;
    max?: number;
  }[];
}

export interface ChartWidget {
  symbol(): string;
  resolution(): string;
  chartType(): number | null;
  getAllStudies(): Study[];
  getStudyById(id: string): Study | null;
  /**
   * Internal model abstraction, dynamically discovered via CDP.
   */
  _chartWidget?: {
    symbol(): string;
    getAllStudies(): any[];
    model(): {
      mainSeries(): {
        bars(): unknown;
      };
      model(): {
        dataSources(): DataSource[];
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

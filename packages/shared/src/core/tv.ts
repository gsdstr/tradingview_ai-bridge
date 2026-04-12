/**
 * Core health/discovery/launch logic.
 */
/// <reference path="../tradingview.d.ts" />
import { getClient, getTargetInfo, evaluateFnc } from "../connection.js";
import { existsSync } from "fs";
import { execSync, spawn } from "child_process";
import http from "http";

export interface HealthStatus {
  success: boolean;
  cdp_connected: boolean;
  target_id: string;
  target_url: string;
  target_title: string;
  chart_symbol: string;
  chart_resolution: string;
  chart_type: number | null;
  api_available: boolean;
}

export async function checkHealth(): Promise<HealthStatus> {
  await getClient();
  const target = await getTargetInfo();

  interface HealthStateResult {
    url: string;
    title: string;
    symbol?: string;
    resolution?: string;
    chartType?: number | null;
    apiAvailable?: boolean;
    apiError?: string;
  }

  const state = await evaluateFnc<HealthStateResult>(function () {
    const result: HealthStateResult = {
      url: window.location.href,
      title: document.title,
    };
    try {
      const chart = window.TradingViewApi._activeChartWidgetWV.value();
      result.symbol = chart.symbol();
      result.resolution = chart.resolution();
      result.chartType = chart.chartType();
      result.apiAvailable = true;
    } catch (e: unknown) {
      result.symbol = "unknown";
      result.resolution = "unknown";
      result.chartType = null;
      result.apiAvailable = false;
      result.apiError = e instanceof Error ? e.message : String(e);
    }
    return result;
  });

  return {
    success: true,
    cdp_connected: true,
    target_id: target.id,
    target_url: target.url,
    target_title: target.title,
    chart_symbol: state?.symbol || "unknown",
    chart_resolution: state?.resolution || "unknown",
    chart_type: state?.chartType ?? null,
    api_available: state?.apiAvailable ?? false,
  };
}

function findTradingViewExecutable(platform: string): string | null {
  const pathMap: Record<string, string[]> = {
    darwin: [
      "/Applications/TradingView.app/Contents/MacOS/TradingView",
      `${process.env.HOME}/Applications/TradingView.app/Contents/MacOS/TradingView`,
    ],
    win32: [
      `${process.env.LOCALAPPDATA}\\TradingView\\TradingView.exe`,
      `${process.env.PROGRAMFILES}\\TradingView\\TradingView.exe`,
      `${process.env["PROGRAMFILES(X86)"]}\\TradingView\\TradingView.exe`,
    ],
    linux: [
      "/opt/TradingView/tradingview",
      "/opt/TradingView/TradingView",
      `${process.env.HOME}/.local/share/TradingView/TradingView`,
      "/usr/bin/tradingview",
      "/snap/tradingview/current/tradingview",
    ],
  };

  const candidates = pathMap[platform] || pathMap.linux || [];
  let tvPath = candidates.find((p) => existsSync(p)) || null;

  if (!tvPath) {
    try {
      const cmd =
        platform === "win32" ? "where TradingView.exe" : "which tradingview";
      tvPath =
        execSync(cmd, { timeout: 3000 }).toString().trim().split("\n")[0] ||
        null;
      if (tvPath && !existsSync(tvPath)) tvPath = null;
    } catch {
      /* ignore */
    }
  }

  if (!tvPath && platform === "darwin") {
    try {
      const found = execSync(
        'mdfind "kMDItemFSName == TradingView.app" | head -1',
        {
          timeout: 5000,
        },
      )
        .toString()
        .trim();
      if (found) {
        const candidate = `${found}/Contents/MacOS/TradingView`;
        if (existsSync(candidate)) tvPath = candidate;
      }
    } catch {
      /* ignore */
    }
  }
  //TODO log if tvPath is null. `Searched: ${(candidates || []).join(", ")}`
  return tvPath;
}

export interface LaunchResult {
  success: boolean;
  platform: NodeJS.Platform | string;
  binary: string;
  pid?: number;
  cdp_port: number;
  cdp_url?: string;
  browser?: string;
  user_agent?: string;
  cdp_ready?: boolean;
  warning?: string;
}

export async function launch(
  options: { port?: number; kill_existing?: boolean } = {},
): Promise<LaunchResult> {
  const cdpPort = options.port ?? 9222;
  const killFirst = options.kill_existing !== false;
  const platform = process.platform;
  const tvPath = findTradingViewExecutable(platform);

  if (!tvPath) {
    throw new Error(
      `TradingView not found on ${platform}. Launch manually with: /path/to/TradingView --remote-debugging-port=${cdpPort}`,
    );
  }

  if (killFirst) {
    try {
      if (platform === "win32")
        execSync("taskkill /F /IM TradingView.exe", { timeout: 5000 });
      else execSync("pkill -f TradingView", { timeout: 5000 });
      await new Promise((r) => setTimeout(r, 1500));
    } catch {
      /* may not be running */
    }
  }

  const child = spawn(tvPath, [`--remote-debugging-port=${cdpPort}`], {
    detached: true,
    stdio: "ignore",
  });
  child.unref();

  for (let i = 0; i < 15; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    try {
      const ready = await new Promise<string | null>((resolve) => {
        http
          .get(
            `http://localhost:${cdpPort}/json/version`,
            (res: http.IncomingMessage) => {
              let data = "";
              res.on("data", (chunk: any) => (data += chunk));
              res.on("end", () => resolve(data));
            },
          )
          .on("error", () => resolve(null));
      });
      if (ready) {
        const info = JSON.parse(ready);
        return {
          success: true,
          platform,
          binary: tvPath,
          pid: child.pid,
          cdp_port: cdpPort,
          cdp_url: `http://localhost:${cdpPort}`,
          browser: info.Browser,
          user_agent: info["User-Agent"],
        };
      }
    } catch {
      /* retry */
    }
  }

  return {
    success: true,
    platform,
    binary: tvPath,
    pid: child.pid,
    cdp_port: cdpPort,
    cdp_ready: false,
    warning:
      "TradingView launched but CDP not responding yet. It may still be loading. Try checkHealth in a few seconds.",
  };
}

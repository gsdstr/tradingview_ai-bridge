import { getClient, evaluate, getChartCollection } from "../connection.js";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCREENSHOT_DIR = join(dirname(dirname(dirname(__dirname))), "screenshots");

export interface CaptureOptions {
  region?: "chart" | "full" | "strategy_tester";
  filename?: string;
  method?: "cdp" | "api";
}

export interface CaptureResult {
  success: boolean;
  method: "cdp" | "api";
  note?: string;
  file_path?: string;
  region?: string;
  size_bytes?: number;
}

export async function captureScreenshot(options: CaptureOptions = {}): Promise<CaptureResult> {
  const { region, filename, method } = options;
  mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const fname = (filename || `tv_${region || "full"}_${ts}`).replace(/[\/\\]/g, "_");
  const filePath = join(SCREENSHOT_DIR, `${fname}.png`);

  if (method === "api") {
    try {
      const colPath = await getChartCollection();
      await evaluate(`${colPath}.takeScreenshot()`);
      return {
        success: true,
        method: "api",
        note: "takeScreenshot() triggered — TradingView will save/show the screenshot via its own UI",
      };
    } catch {
      // Fall through to CDP method
    }
  }

  const client = await getClient();
  let clip: { x: number; y: number; width: number; height: number; scale: number } | undefined = undefined;

  if (region === "chart") {
    const bounds = await evaluate<{ x: number; y: number; width: number; height: number } | null>(`
      (function() {
        var el = document.querySelector('[data-name="pane-canvas"]')
          || document.querySelector('[class*="chart-container"]')
          || document.querySelector('canvas');
        if (!el) return null;
        var rect = el.getBoundingClientRect();
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
      })()
    `);
    if (bounds) clip = { ...bounds, scale: 1 };
  } else if (region === "strategy_tester") {
    const bounds = await evaluate<{ x: number; y: number; width: number; height: number } | null>(`
      (function() {
        var el = document.querySelector('[data-name="backtesting"]')
          || document.querySelector('[class*="strategyReport"]');
        if (!el) return null;
        var rect = el.getBoundingClientRect();
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
      })()
    `);
    if (bounds) clip = { ...bounds, scale: 1 };
  }

  const params: any = { format: "png" };
  if (clip) params.clip = clip;

  const { data } = await client.Page.captureScreenshot(params);
  const buffer = Buffer.from(data, "base64");
  writeFileSync(filePath, buffer);

  return {
    success: true,
    method: "cdp",
    file_path: filePath,
    region,
    size_bytes: buffer.length,
  };
}

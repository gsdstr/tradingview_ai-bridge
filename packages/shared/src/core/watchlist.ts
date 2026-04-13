import { evaluate, getClient } from "../connection.js";

export interface WatchlistSymbol {
  symbol: string;
  last: string | null;
  change: string | null;
  change_percent: string | null;
}

export interface WatchlistGetResult {
  success: boolean;
  count: number;
  source: string;
  symbols: WatchlistSymbol[];
}

export async function get(): Promise<WatchlistGetResult> {
  const symbols = await evaluate<{
    symbols: WatchlistSymbol[];
    source: string;
  }>(function () {
    // Method 1: Try the watchlist widget's internal data
    try {
      const rightArea = document.querySelector(
        '[class*="layout__area--right"]',
      );
      if (!rightArea || (rightArea as HTMLElement).offsetWidth < 50)
        return { symbols: [], source: "panel_closed" };
    } catch {
      // ignore
    }

    // Method 2: Read data-symbol-full attributes from watchlist rows
    const results: {
      symbol: string;
      last: string | null;
      change: string | null;
      change_percent: string | null;
    }[] = [];
    const seen: Record<string, boolean> = {};
    const container = document.querySelector('[class*="layout__area--right"]');
    if (!container) return { symbols: [], source: "no_container" };

    // Find all elements with symbol data attributes
    const symbolEls = container.querySelectorAll("[data-symbol-full]");
    for (const el of Array.from(symbolEls)) {
      const sym = el.getAttribute("data-symbol-full");
      if (!sym || seen[sym]) continue;
      seen[sym] = true;

      // Find the row and extract price data
      const row = el.closest('[class*="row"]') ?? el.parentElement;
      const cells = row
        ? row.querySelectorAll('[class*="cell"], [class*="column"]')
        : [];
      const nums: string[] = [];
      for (const cell of Array.from(cells)) {
        const t = (cell.textContent ?? "").trim();
        if (t && /^[-+]?[\\d,]+\\.?\\d*%?$/.test(t.replace(/[\\s,]/g, "")))
          nums.push(t);
      }
      results.push({
        symbol: sym,
        last: nums[0] ?? null,
        change: nums[1] ?? null,
        change_percent: nums[2] ?? null,
      });
    }

    if (results.length > 0)
      return { symbols: results, source: "data_attributes" };

    // Method 3: Scan for ticker-like text in the right panel
    const items = container.querySelectorAll(
      '[class*="symbolName"], [class*="tickerName"], [class*="symbol-"]',
    );
    for (const item of Array.from(items)) {
      const text = (item.textContent ?? "").trim();
      if (text && /^[A-Z][A-Z0-9.:!]{0,20}$/.test(text) && !seen[text]) {
        seen[text] = true;
        results.push({
          symbol: text,
          last: null,
          change: null,
          change_percent: null,
        });
      }
    }

    return {
      symbols: results,
      source: results.length > 0 ? "text_scan" : "empty",
    };
  });

  return {
    success: true,
    count: symbols.symbols.length,
    source: symbols.source,
    symbols: symbols.symbols,
  };
}

export interface WatchlistAddOptions {
  symbol: string;
}

export interface WatchlistAddResult {
  success: boolean;
  symbol: string;
  action: string;
}

export async function add({
  symbol,
}: WatchlistAddOptions): Promise<WatchlistAddResult> {
  const c = await getClient();

  const panelState = await evaluate<{ error?: string; opened?: boolean }>(`
    (function() {
      var btn = document.querySelector('[data-name="base-watchlist-widget-button"]')
        || document.querySelector('[aria-label*="Watchlist"]');
      if (!btn) return { error: 'Watchlist button not found' };
      var isActive = btn.getAttribute('aria-pressed') === 'true'
        || btn.classList.toString().indexOf('Active') !== -1
        || btn.classList.toString().indexOf('active') !== -1;
      if (!isActive) { btn.click(); return { opened: true }; }
      return { opened: false };
    })()
  `);

  if (panelState.error) throw new Error(panelState.error);
  if (panelState.opened) await new Promise((r) => setTimeout(r, 500));

  const addClicked = await evaluate<{
    found: boolean;
    selector?: string;
    method?: string;
  }>(`
    (function() {
      var selectors = [
        '[data-name="add-symbol-button"]',
        '[aria-label="Add symbol"]',
        '[aria-label*="Add symbol"]',
        'button[class*="addSymbol"]',
      ];
      for (var s = 0; s < selectors.length; s++) {
        var btn = document.querySelector(selectors[s]);
        if (btn && btn.offsetParent !== null) { btn.click(); return { found: true, selector: selectors[s] }; }
      }
      // Fallback: find + button in right panel
      var container = document.querySelector('[class*="layout__area--right"]');
      if (container) {
        var buttons = container.querySelectorAll('button');
        for (var i = 0; i < buttons.length; i++) {
          var ariaLabel = buttons[i].getAttribute('aria-label') || '';
          if (/add.*symbol/i.test(ariaLabel) || buttons[i].textContent.trim() === '+') {
            buttons[i].click();
            return { found: true, method: 'fallback' };
          }
        }
      }
      return { found: false };
    })()
  `);

  if (!addClicked.found)
    throw new Error("Add symbol button not found in watchlist panel");
  await new Promise((r) => setTimeout(r, 300));

  await c.Input.insertText({ text: symbol });
  await new Promise((r) => setTimeout(r, 500));

  await c.Input.dispatchKeyEvent({
    type: "keyDown",
    key: "Enter",
    code: "Enter",
    windowsVirtualKeyCode: 13,
  });
  await c.Input.dispatchKeyEvent({
    type: "keyUp",
    key: "Enter",
    code: "Enter",
  });
  await new Promise((r) => setTimeout(r, 300));

  await c.Input.dispatchKeyEvent({
    type: "keyDown",
    key: "Escape",
    code: "Escape",
    windowsVirtualKeyCode: 27,
  });
  await c.Input.dispatchKeyEvent({
    type: "keyUp",
    key: "Escape",
    code: "Escape",
  });

  return { success: true, symbol, action: "added" };
}

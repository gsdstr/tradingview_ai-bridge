import { evaluate, evaluateAsync, getClient, safeString } from "../connection.js";

export interface CreateAlertOptions {
  condition?: string;
  price: number;
  message?: string;
}

export interface CreateAlertResult {
  success: boolean;
  price: number;
  condition?: string;
  message: string;
  price_set: boolean;
  source: string;
}

export async function create(options: CreateAlertOptions): Promise<CreateAlertResult> {
  const { condition, price, message } = options;
  const opened = await evaluate(`
    (function() {
      var btn = document.querySelector('[aria-label="Create Alert"]')
        || document.querySelector('[data-name="alerts"]');
      if (btn) { btn.click(); return true; }
      return false;
    })()
  `);

  if (!opened) {
    const client = await getClient();
    await client.Input.dispatchKeyEvent({ type: "keyDown", modifiers: 1, key: "a", code: "KeyA", windowsVirtualKeyCode: 65 });
    await client.Input.dispatchKeyEvent({ type: "keyUp", key: "a", code: "KeyA" });
  }

  await new Promise((r) => setTimeout(r, 1000));

  const priceSet = await evaluate(`
    (function() {
      var inputs = document.querySelectorAll('[class*="alert"] input[type="text"], [class*="alert"] input[type="number"]');
      for (var i = 0; i < inputs.length; i++) {
        var label = inputs[i].closest('[class*="row"]')?.querySelector('[class*="label"]');
        if (label && /value|price/i.test(label.textContent)) {
          var nativeSet = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
          nativeSet.call(inputs[i], ${safeString(String(price))});
          inputs[i].dispatchEvent(new Event('input', { bubbles: true }));
          inputs[i].dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        }
      }
      if (inputs.length > 0) {
        var nativeSet = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
        nativeSet.call(inputs[0], ${safeString(String(price))});
        inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      }
      return false;
    })()
  `);

  if (message) {
    await evaluate(`
      (function() {
        var textarea = document.querySelector('[class*="alert"] textarea')
          || document.querySelector('textarea[placeholder*="message"]');
        if (textarea) {
          var nativeSet = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
          nativeSet.call(textarea, ${JSON.stringify(message)});
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
        }
      })()
    `);
  }

  await new Promise((r) => setTimeout(r, 500));
  const created = await evaluate(`
    (function() {
      var btns = document.querySelectorAll('button[data-name="submit"], button');
      for (var i = 0; i < btns.length; i++) {
        if (/^create$/i.test(btns[i].textContent.trim())) { btns[i].click(); return true; }
      }
      return false;
    })()
  `);

  return {
    success: !!created,
    price,
    condition,
    message: message || "(none)",
    price_set: !!priceSet,
    source: "dom_fallback",
  };
}

export interface Alert {
  alert_id: string;
  symbol: string;
  type: string;
  message: string;
  active: boolean;
  condition: string;
  resolution: string;
  created: number;
  last_fired: number;
  expiration: number;
}

export interface ListAlertsResult {
  success: boolean;
  alert_count: number;
  source: string;
  alerts: Alert[];
  error?: string;
}

export async function list(): Promise<ListAlertsResult> {
  const result = await evaluateAsync<{ alerts: Alert[]; error?: string }>(`
    fetch('https://pricealerts.tradingview.com/list_alerts', { credentials: 'include' })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.s !== 'ok' || !Array.isArray(data.r)) return { alerts: [], error: data.errmsg || 'Unexpected response' };
        return {
          alerts: data.r.map(function(a) {
            var sym = '';
            try { sym = JSON.parse(a.symbol.replace(/^=/, '')).symbol || a.symbol; } catch(e) { sym = a.symbol; }
            return {
              alert_id: a.alert_id,
              symbol: sym,
              type: a.type,
              message: a.message,
              active: a.active,
              condition: a.condition,
              resolution: a.resolution,
              created: a.create_time,
              last_fired: a.last_fire_time,
              expiration: a.expiration,
            };
          })
        };
      })
      .catch(function(e) { return { alerts: [], error: e.message }; })
  `);
  return {
    success: true,
    alert_count: result?.alerts?.length || 0,
    source: "internal_api",
    alerts: result?.alerts || [],
    error: result?.error,
  };
}

export interface DeleteAlertsOptions {
  delete_all: boolean;
}

export interface DeleteAlertsResult {
  success: boolean;
  note: string;
  context_menu_opened: boolean;
  source: string;
}

export async function deleteAlerts(options: DeleteAlertsOptions): Promise<DeleteAlertsResult> {
  if (options.delete_all) {
    const result = await evaluate<{ context_menu_opened: boolean }>(`
      (function() {
        var alertBtn = document.querySelector('[data-name="alerts"]');
        if (alertBtn) alertBtn.click();
        var header = document.querySelector('[data-name="alerts"]');
        if (header) {
          header.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, clientX: 100, clientY: 100 }));
          return { context_menu_opened: true };
        }
        return { context_menu_opened: false };
      })()
    `);
    return {
      success: true,
      note: "Alert deletion requires manual confirmation in the context menu.",
      context_menu_opened: result?.context_menu_opened || false,
      source: "dom_fallback",
    };
  }
  throw new Error("Individual alert deletion not yet supported. Use delete_all: true.");
}

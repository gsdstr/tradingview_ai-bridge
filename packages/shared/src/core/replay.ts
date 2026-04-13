import { evaluate } from "../connection.js";

function wv(path: string) {
  return `(function(){ var v = ${path}; return (v && typeof v === 'object' && typeof v.value === 'function') ? v.value() : v; })()`;
}

export const VALID_AUTOPLAY_DELAYS = [100, 143, 200, 300, 1000, 2000, 3000, 5000, 10000];

export async function start(options: { date?: string } = {}): Promise<any> {
  const { date } = options;
  const rp = "window.TradingViewApi._replayApi";
  const available = await evaluate(wv(`${rp}.isReplayAvailable()`));
  if (!available) throw new Error("Replay is not available for the current symbol/timeframe");

  await evaluate(`${rp}.showReplayToolbar()`);

  if (date) {
    const ts = new Date(date).getTime();
    if (isNaN(ts)) throw new Error(`Invalid date: "${date}". Use YYYY-MM-DD format.`);
    await evaluate(`${rp}.selectDate(${ts}).then(function() { return 'ok'; })`);
  } else {
    await evaluate(`${rp}.selectFirstAvailableDate()`);
  }

  let started = false;
  let currentDate = null;
  for (let i = 0; i < 30; i++) {
    started = await evaluate(wv(`${rp}.isReplayStarted()`));
    currentDate = await evaluate(wv(`${rp}.currentDate()`));
    if (started && currentDate !== null) break;
    await new Promise((r) => setTimeout(r, 250));
  }

  if (!started) {
    try {
      await evaluate(`${rp}.stopReplay()`);
    } catch {
      /* ignore */
    }
    throw new Error(
      "Replay failed to start. The selected date may not have data for this timeframe. Try a more recent date or a higher timeframe (e.g., Daily).",
    );
  }

  return { success: true, replay_started: true, date: date || "(first available)", current_date: currentDate };
}

export async function step(): Promise<any> {
  const rp = "window.TradingViewApi._replayApi";
  const started = await evaluate(wv(`${rp}.isReplayStarted()`));
  if (!started) throw new Error("Replay is not started. Use replay_start first.");
  const before = await evaluate(wv(`${rp}.currentDate()`));
  await evaluate(`${rp}.doStep()`);

  let currentDate = before;
  for (let i = 0; i < 12; i++) {
    await new Promise((r) => setTimeout(r, 250));
    currentDate = await evaluate(wv(`${rp}.currentDate()`));
    if (currentDate !== before) break;
  }
  return { success: true, action: "step", current_date: currentDate };
}

export async function autoplay(options: { speed?: number } = {}): Promise<any> {
  const { speed } = options;
  const rp = "window.TradingViewApi._replayApi";
  if (speed && speed > 0 && !VALID_AUTOPLAY_DELAYS.includes(speed))
    throw new Error(`Invalid autoplay delay ${speed}ms. Valid values: ${VALID_AUTOPLAY_DELAYS.join(", ")}`);

  const started = await evaluate(wv(`${rp}.isReplayStarted()`));
  if (!started) throw new Error("Replay is not started. Use replay_start first.");
  if (speed && speed > 0) {
    await evaluate(`${rp}.changeAutoplayDelay(${speed})`);
  }
  await evaluate(`${rp}.toggleAutoplay()`);
  const isAutoplay = await evaluate(wv(`${rp}.isAutoplayStarted()`));
  const currentDelay = await evaluate(wv(`${rp}.autoplayDelay()`));
  return { success: true, autoplay_active: !!isAutoplay, delay_ms: currentDelay };
}

export async function stop(): Promise<any> {
  const rp = "window.TradingViewApi._replayApi";
  const started = await evaluate(wv(`${rp}.isReplayStarted()`));
  if (!started) {
    return { success: true, action: "already_stopped" };
  }
  await evaluate(`${rp}.stopReplay()`);
  return { success: true, action: "replay_stopped" };
}

export async function trade(options: { action: "buy" | "sell" | "close" }): Promise<any> {
  const { action } = options;
  const rp = "window.TradingViewApi._replayApi";
  const started = await evaluate(wv(`${rp}.isReplayStarted()`));
  if (!started) throw new Error("Replay is not started. Use replay_start first.");

  if (action === "buy") await evaluate(`${rp}.buy()`);
  else if (action === "sell") await evaluate(`${rp}.sell()`);
  else if (action === "close") await evaluate(`${rp}.closePosition()`);
  else throw new Error("Invalid action. Use: buy, sell, or close");

  const position = await evaluate(wv(`${rp}.position()`));
  const pnl = await evaluate(wv(`${rp}.realizedPL()`));
  return { success: true, action, position, realized_pnl: pnl };
}

export async function status(): Promise<any> {
  const rp = "window.TradingViewApi._replayApi";
  const st = await evaluate(`
    (function() {
      var r = window.TradingViewApi._replayApi;
      function unwrap(v) { return (v && typeof v === 'object' && typeof v.value === 'function') ? v.value() : v; }
      return {
        is_replay_available: unwrap(r.isReplayAvailable()),
        is_replay_started: unwrap(r.isReplayStarted()),
        is_autoplay_started: unwrap(r.isAutoplayStarted()),
        replay_mode: unwrap(r.replayMode()),
        current_date: unwrap(r.currentDate()),
        autoplay_delay: unwrap(r.autoplayDelay()),
      };
    })()
  `);
  const pos = await evaluate(wv(`${rp}.position()`));
  const pnl = await evaluate(wv(`${rp}.realizedPL()`));
  return { success: true, ...st, position: pos, realized_pnl: pnl };
}

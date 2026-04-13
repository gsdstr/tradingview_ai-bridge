import { evaluate, evaluateAsync, getClient } from "../connection.js";

const FIND_MONACO = `
  (function findMonacoEditor() {
    var container = document.querySelector('.monaco-editor.pine-editor-monaco');
    if (!container) return null;
    var el = container;
    var fiberKey;
    for (var i = 0; i < 20; i++) {
      if (!el) break;
      fiberKey = Object.keys(el).find(function(k) { return k.startsWith('__reactFiber$'); });
      if (fiberKey) break;
      el = el.parentElement;
    }
    if (!fiberKey) return null;
    var current = el[fiberKey];
    for (var d = 0; d < 15; d++) {
      if (!current) break;
      if (current.memoizedProps && current.memoizedProps.value && current.memoizedProps.value.monacoEnv) {
        var env = current.memoizedProps.value.monacoEnv;
        if (env.editor && typeof env.editor.getEditors === 'function') {
          var editors = env.editor.getEditors();
          if (editors.length > 0) return { editor: editors[0], env: env };
        }
      }
      current = current.return;
    }
    return null;
  })()
`;

export async function ensurePineEditorOpen(): Promise<boolean> {
  const already = await evaluate(`
    (function() {
      var m = ${FIND_MONACO};
      return m !== null;
    })()
  `);
  if (already) return true;

  await evaluate(`
    (function() {
      var bwb = window.TradingView && window.TradingView.bottomWidgetBar;
      if (!bwb) return;
      if (typeof bwb.activateScriptEditorTab === 'function') bwb.activateScriptEditorTab();
      else if (typeof bwb.showWidget === 'function') bwb.showWidget('pine-editor');
    })()
  `);

  await evaluate(`
    (function() {
      var btn = document.querySelector('[aria-label="Pine"]')
        || document.querySelector('[data-name="pine-dialog-button"]');
      if (btn) btn.click();
    })()
  `);

  for (let i = 0; i < 50; i++) {
    await new Promise((r) => setTimeout(r, 200));
    const ready = await evaluate(`(function() { return ${FIND_MONACO} !== null; })()`);
    if (ready) return true;
  }
  return false;
}

export interface PineDiagnostic {
  line: number;
  column: number;
  message: string;
  severity: "error" | "warning" | "info";
}

export function analyze(options: { source: string }): any {
  const { source } = options;
  const lines = source.split("\n");
  const diagnostics: PineDiagnostic[] = [];

  let isV6 = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("//@version=6")) {
      isV6 = true;
      break;
    }
    if (trimmed.startsWith("//@version=")) break;
    if (trimmed === "" || trimmed.startsWith("//")) continue;
    break;
  }

  const arrays = new Map();
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const fromMatch = line.match(/(\w+)\s*=\s*array\.from\(([^)]*)\)/);
    if (fromMatch) {
      const name = fromMatch[1]?.trim();
      const args = fromMatch[2]?.trim();
      if (!name || args === undefined) continue;
      const size = args === "" ? 0 : args.split(",").length;
      arrays.set(name, { name, size, line: i + 1 });
      continue;
    }
    const newMatch = line.match(/(\w+)\s*=\s*array\.new(?:<\w+>|_\w+)\((\d+)?/);
    if (newMatch) {
      const name = newMatch[1]?.trim();
      if (!name) continue;
      const size = newMatch[2] !== undefined ? parseInt(newMatch[2], 10) : null;
      arrays.set(name, { name, size, line: i + 1 });
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const pattern = /array\.(get|set)\(\s*(\w+)\s*,\s*(-?\d+)/g;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(line)) !== null) {
      const method = match[1];
      const arrName = match[2];
      const idxStr = match[3];
      if (!method || !arrName || !idxStr) continue;
      const idx = parseInt(idxStr, 10);
      const info = arrays.get(arrName);
      if (!info || info.size === null) continue;
      if (idx < 0 || idx >= info.size) {
        diagnostics.push({
          line: i + 1,
          column: match.index + 1,
          message: `array.${method}(${arrName}, ${idx}) — index ${idx} out of bounds (array size is ${info.size})`,
          severity: "error",
        });
      }
    }
  }

  if (!isV6 && source.includes("//@version=")) {
    const vMatch = source.match(/\/\/@version=(\d+)/);
    if (vMatch && vMatch[1] && parseInt(vMatch[1]) < 5) {
      diagnostics.push({
        line: 1,
        column: 1,
        message: `Script uses Pine v${vMatch[1]} — consider upgrading to v6 for latest features`,
        severity: "info",
      });
    }
  }

  return {
    success: true,
    issue_count: diagnostics.length,
    diagnostics,
    note:
      diagnostics.length === 0
        ? "No static analysis issues found. Use pine_compile or pine_smart_compile for full server-side compilation check."
        : undefined,
  };
}

export async function check(options: { source: string }): Promise<any> {
  const { source } = options;
  const formData = new URLSearchParams();
  formData.append("source", source);

  const response = await globalThis.fetch(
    "https://pine-facade.tradingview.com/pine-facade/translate_light?user_name=Guest&pine_id=00000000-0000-0000-0000-000000000000",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        Referer: "https://www.tradingview.com/",
      },
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(`TradingView API returned ${response.status}: ${response.statusText}`);
  }

  const result = (await response.json()) as any;
  const errors = [];
  const warnings = [];
  const inner = result?.result;

  if (inner) {
    if (inner.errors2 && inner.errors2.length > 0) {
      for (const e of inner.errors2) {
        errors.push({
          line: e.start?.line,
          column: e.start?.column,
          end_line: e.end?.line,
          end_column: e.end?.column,
          message: e.message,
        });
      }
    }
    if (inner.warnings2 && inner.warnings2.length > 0) {
      for (const w of inner.warnings2) {
        warnings.push({ line: w.start?.line, column: w.start?.column, message: w.message });
      }
    }
  }

  if (result.error && typeof result.error === "string") {
    errors.push({ message: result.error });
  }

  const compiled = errors.length === 0;
  return {
    success: true,
    compiled,
    error_count: errors.length,
    warning_count: warnings.length,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
    note: compiled ? "Pine Script compiled successfully." : undefined,
  };
}

export async function getSource(): Promise<any> {
  const editorReady = await ensurePineEditorOpen();
  if (!editorReady) throw new Error("Could not open Pine Editor or Monaco not found in React fiber tree.");

  const source = await evaluate(`
    (function() {
      var m = ${FIND_MONACO};
      if (!m) return null;
      return m.editor.getValue();
    })()
  `);

  if (source === null || source === undefined) {
    throw new Error("Monaco editor found but getValue() returned null.");
  }

  return { success: true, source, line_count: source.split("\n").length, char_count: (source as string).length };
}

export async function setSource(options: { source: string }): Promise<any> {
  const { source } = options;
  const editorReady = await ensurePineEditorOpen();
  if (!editorReady) throw new Error("Could not open Pine Editor.");

  const escaped = JSON.stringify(source);
  const set = await evaluate(`
    (function() {
      var m = ${FIND_MONACO};
      if (!m) return false;
      m.editor.setValue(${escaped});
      return true;
    })()
  `);

  if (!set) throw new Error("Monaco found but setValue() failed.");
  return { success: true, lines_set: source.split("\n").length };
}

export async function compile(): Promise<any> {
  const editorReady = await ensurePineEditorOpen();
  if (!editorReady) throw new Error("Could not open Pine Editor.");

  const clicked = await evaluate(`
    (function() {
      var btns = document.querySelectorAll('button');
      var fallback = null;
      var saveBtn = null;
      for (var i = 0; i < btns.length; i++) {
        var text = btns[i].textContent.trim();
        if (/save and add to chart/i.test(text)) {
          btns[i].click();
          return 'Save and add to chart';
        }
        if (!fallback && /^(Add to chart|Update on chart)/i.test(text)) {
          fallback = btns[i];
        }
        if (!saveBtn && btns[i].className.indexOf('saveButton') !== -1 && btns[i].offsetParent !== null) {
          saveBtn = btns[i];
        }
      }
      if (fallback) { fallback.click(); return fallback.textContent.trim(); }
      if (saveBtn) { saveBtn.click(); return 'Pine Save'; }
      return null;
    })()
  `);

  if (!clicked) {
    const c = await getClient();
    await (c as any).Input.dispatchKeyEvent({
      type: "keyDown",
      modifiers: 2,
      key: "Enter",
      code: "Enter",
      windowsVirtualKeyCode: 13,
    });
    await (c as any).Input.dispatchKeyEvent({ type: "keyUp", key: "Enter", code: "Enter" });
  }

  await new Promise((r) => setTimeout(r, 2000));
  return { success: true, button_clicked: clicked || "keyboard_shortcut", source: "dom_fallback" };
}

export async function getErrors(): Promise<any> {
  const editorReady = await ensurePineEditorOpen();
  if (!editorReady) throw new Error("Could not open Pine Editor.");

  const errors = await evaluate(`
    (function() {
      var m = ${FIND_MONACO};
      if (!m) return [];
      var model = m.editor.getModel();
      if (!model) return [];
      var markers = m.env.editor.getModelMarkers({ resource: model.uri });
      return markers.map(function(mk) {
        return { line: mk.startLineNumber, column: mk.startColumn, message: mk.message, severity: mk.severity };
      });
    })()
  `);

  return {
    success: true,
    has_errors: errors?.length > 0,
    error_count: errors?.length || 0,
    errors: errors || [],
  };
}

export async function save(): Promise<any> {
  const editorReady = await ensurePineEditorOpen();
  if (!editorReady) throw new Error("Could not open Pine Editor.");

  const c = await getClient();
  await (c as any).Input.dispatchKeyEvent({
    type: "keyDown",
    modifiers: 2,
    key: "s",
    code: "KeyS",
    windowsVirtualKeyCode: 83,
  });
  await (c as any).Input.dispatchKeyEvent({ type: "keyUp", key: "s", code: "KeyS" });
  await new Promise((r) => setTimeout(r, 800));

  const dialogHandled = await evaluate(`
    (function() {
      var saveBtn = null;
      var btns = document.querySelectorAll('button');
      for (var i = 0; i < btns.length; i++) {
        var text = btns[i].textContent.trim();
        if (text === 'Save' && btns[i].offsetParent !== null) {
          var parent = btns[i].closest('[class*="dialog"], [class*="modal"], [class*="popup"], [role="dialog"]');
          if (parent) { saveBtn = btns[i]; break; }
        }
      }
      if (saveBtn) { saveBtn.click(); return true; }
      return false;
    })()
  `);

  if (dialogHandled) await new Promise((r) => setTimeout(r, 500));

  return { success: true, action: dialogHandled ? "saved_with_dialog" : "Ctrl+S_dispatched" };
}

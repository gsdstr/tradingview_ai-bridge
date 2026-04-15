# Node.js CLI Best Practices Audit: `apps/cli`

## Summary
✅ 13 practices followed  ⚠️ 1 need attention  ❌ 15 not implemented  ➖ 8 not applicable

---

## Audit Report

### 1. Command Line Experience
| # | Practice | Status | Finding |
|---|----------|--------|---------|
| 1.1 | Respect POSIX args | ✅ | Uses `yargs` for standard flag parsing. |
| 1.2 | Build empathic CLIs | ❌ | No interactive prompts for missing input. |
| 1.3 | Stateful data | ❌ | No preference persistence (no `conf`/`configstore`). |
| 1.4 | Provide colorful experience | ✅ | Respects TTY; validation errors use icons. |
| 1.5 | Rich interactions | ❌ | No spinners or progress bars (`ora`). |
| 1.6 | Hyperlinks everywhere | ❌ | Direct URLs in errors, not clickable terminal links. |
| 1.7 | Zero configuration | ❌ | No auto-detection of env vars/configs. |
| 1.8 | Respect POSIX signals | ❌ | No `SIGINT`/`SIGTERM` handlers. |

### 2. Distribution
| # | Practice | Status | Finding |
|---|----------|--------|---------|
| 2.1 | Small footprint | ✅ | Minimal production dependencies (`yargs`). |
| 2.2 | Use the shrinkwrap | ❌ | No `npm-shrinkwrap.json` found. |
| 2.3 | Cleanup configuration | ❌ | No `--uninstall` support. |

### 3. Interoperability
| # | Practice | Status | Finding |
|---|----------|--------|---------|
| 3.1 | Accept STDIN | ❌ | Input only via flags/commands. |
| 3.2 | Structured output | ✅ | Always outputs JSON for action results. |
| 3.3 | Cross-platform | ✅ | Uses ESM, template strings, `path` module. |
| 3.4 | Config precedence | ❌ | No configuration file support (`cosmiconfig`). |

### 4. Accessibility
| # | Practice | Status | Finding |
|---|----------|--------|---------|
| 4.1 | Containerize | ➖ | Internal monorepo tool. |
| 4.2 | Graceful degradation | ✅ | JSON output works well in CI/pipes. |
| 4.3 | Node.js compatibility | ✅ | `engines` field added (`>=22`). |
| 4.4 | Shebang | ✅ | Added via `build.js` banner in bundle. |

### 5. Testing
| # | Practice | Status | Finding |
|---|----------|--------|---------|
| 5.1 | No trust in locales | ➖ | No visible i18n detected. |

### 6. Errors
| # | Practice | Status | Finding |
|---|----------|--------|---------|
| 6.1 | Trackable errors | ❌ | Error messages lack unique codes (e.g., E1001). |
| 6.2 | Actionable errors | ⚠️ | Validation errors clear, but generic "Execution Failed". |
| 6.3 | Provide debug mode | ❌ | Build has debug, but CLI lacks `--verbose` flag. |
| 6.4 | Proper exit codes | ✅ | Uses `process.exit(1)` on failures. |
| 6.5 | Effortless bug reports | ❌ | No GitHub issue link on crash. |

### 7. Development
| # | Practice | Status | Finding |
|---|----------|--------|---------|
| 7.1 | Use a bin object | ✅ | Correctly defined in `package.json`. |
| 7.2 | Relative paths | ✅ | Uses `__dirname` helper in bundle. |
| 7.3 | Use the `files` field | ✅ | `files` limited to bundle in `package.json`. |

### 9. Versioning
| # | Practice | Status | Finding |
|---|----------|--------|---------|
| 9.1 | Include `--version` flag | ✅ | Implemented via `yargs().version()`. |
| 9.2 | Semantic Versioning | ✅ | `0.1.0` used. |
| 9.3 | Version in pkg.json | ✅ | Present in `package.json`. |
| 9.4 | Version in errors | ❌ | Missing from error output. |

---

## 🛠️ Post-Audit Fixes Applied

1.  **§4.3 Node.js versions**: Added `engines: { "node": ">=22" }` to `package.json`.
2.  **§7.3 files field**: Added `files: ["dist/tv-bridge-cli.mjs"]` to `package.json`.
3.  **§9.1 --version flag**: Updated `src/cli.ts` to read `package.json` version and enable `-v, --version`.

---

## 🚀 Remaining Priorities

- **§3.1 STDIN support**: Enable piping data into commands.
- **§6.1 Trackable errors**: Implement unique error codes.
- **§3.4 Configuration**: Add support for configuration files via `cosmiconfig`.

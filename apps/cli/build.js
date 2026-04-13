import esbuild from "esbuild";

const args = process.argv.slice(2);
const isDebug = args.includes("--debug") || args.includes("--sourcemap");

const banner = `#!/usr/bin/env node
import { createRequire as _createRequire } from "module";
import { fileURLToPath as _fileURLToPath } from "url";
import { dirname as _dirname } from "path";
const require = _createRequire(import.meta.url);
const __filename = _fileURLToPath(import.meta.url);
const __dirname = _dirname(__filename);`;

/** @type {import('esbuild').BuildOptions} */
const config = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  outfile: "dist/tv-bridge-cli.js",
  minify: true,
  sourcemap: isDebug,
  banner: {
    js: banner,
  },
};

console.log(`🔨 Building CLI (mode: ${isDebug ? "debug" : "production"})...`);

try {
  await esbuild.build(config);
  console.log("✅ Build complete: dist/tv-bridge-cli.js");
} catch (error) {
  console.error("❌ Build failed:");
  console.error(error);
  process.exit(1);
}

import fsPromises from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SKILLS_DIR = __dirname;

const legacyActionNames = [
  "tv_launch",
  "tv_health",
  "chart_set_symbol",
  "chart_set_timeframe",
  "chart_set_type",
];

const requiredCanonicalNames = {
  cli: ["bridge_launch", "bridge_health-check", "chart_set-symbol", "chart_set-timeframe", "chart_set-type"],
  mcp: ["bridge_launch", "bridge_health-check"],
};

async function validateSkillFrontmatter(skillFolder, expectedName) {
  const skillMdPath = path.join(SKILLS_DIR, skillFolder, "SKILL.md");
  const content = await fsPromises.readFile(skillMdPath, "utf-8");

  if (!content.startsWith("---")) {
    throw new Error(`[${skillFolder}] SKILL.md is missing YAML frontmatter opening '---'`);
  }

  const closingDashIndex = content.indexOf("---", 3);
  if (closingDashIndex === -1) {
    throw new Error(`[${skillFolder}] SKILL.md is missing closing YAML frontmatter '---'`);
  }

  const frontmatter = content.slice(3, closingDashIndex);
  const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
  const descMatch = frontmatter.match(/^description:\s*(.+)$/m);

  if (!nameMatch || !nameMatch[1].trim()) {
    throw new Error(`[${skillFolder}] SKILL.md YAML frontmatter missing valid 'name' field`);
  }

  const actualName = nameMatch[1].trim();
  if (actualName !== expectedName) {
    throw new Error(`[${skillFolder}] SKILL.md frontmatter name '${actualName}' does not match expected '${expectedName}'`);
  }

  if (!descMatch || !descMatch[1].trim()) {
    throw new Error(`[${skillFolder}] SKILL.md YAML frontmatter missing valid 'description' field`);
  }

  if (content.includes("apps/skills/")) {
    throw new Error(`[${skillFolder}] SKILL.md contains non-portable hardcoded monorepo path 'apps/skills/'`);
  }

  console.log(`✅ [${skillFolder}] SKILL.md frontmatter & portability valid (name: ${actualName})`);
}

async function validateBundleArtifact(skillFolder, scriptFileName, type) {
  const scriptPath = path.join(SKILLS_DIR, skillFolder, "scripts", scriptFileName);
  const content = await fsPromises.readFile(scriptPath, "utf-8");

  for (const legacyName of legacyActionNames) {
    const legacyPattern = new RegExp(`name:\\s*["']${legacyName}["']`);
    if (legacyPattern.test(content)) {
      throw new Error(`[${skillFolder}] Bundle ${scriptFileName} contains forbidden legacy action name '${legacyName}'`);
    }
  }

  const requiredNames = requiredCanonicalNames[type] || [];
  for (const reqName of requiredNames) {
    const reqPattern = new RegExp(`name:\\s*["']${reqName}["']`);
    if (!reqPattern.test(content)) {
      throw new Error(`[${skillFolder}] Bundle ${scriptFileName} missing required canonical action name '${reqName}'`);
    }
  }

  console.log(`✅ [${skillFolder}] Bundle ${scriptFileName} passed action parity check`);
}

async function main() {
  console.log("🔍 Validating TradingView AI Bridge Skill Packages...");
  
  await validateSkillFrontmatter("tv-bridge-cli", "tv-bridge-cli");
  await validateSkillFrontmatter("tv-bridge-mcp", "tv-bridge-mcp");

  await validateBundleArtifact("tv-bridge-cli", "tv-bridge-cli.mjs", "cli");
  await validateBundleArtifact("tv-bridge-mcp", "tv-bridge-mcp.js", "mcp");

  console.log("🎉 All Skill Packages Parity & Validation Checks Passed Successfully!");
}

main().catch((err) => {
  console.error("❌ Validation Failed:", err.message);
  process.exit(1);
});

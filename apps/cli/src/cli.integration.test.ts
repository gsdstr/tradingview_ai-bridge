import { describe, it, expect } from "vitest";
import { execa } from "execa";
import { join } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const CLI_PATH = join(__dirname, "..", "src", "index.ts");

describe("CLI Integration", () => {
  it("shows help output", async () => {
    const { stdout } = await execa("bun", ["tsx", CLI_PATH, "--help"]);
    expect(stdout).toContain("tv-cli <cmd> [args]");
    expect(stdout).toContain("tv");
    expect(stdout).toContain("watchlist");
    expect(stdout).toContain("info");
  });

  it("shows help for subcommands", async () => {
    const { stdout } = await execa("bun", ["tsx", CLI_PATH, "tv", "--help"]);
    expect(stdout).toContain("tv-cli tv");
    expect(stdout).toContain("launch");
    expect(stdout).toContain("health");
  });

  it("returns non-zero exit code for unknown command", async () => {
    try {
      await execa("bun", ["tsx", CLI_PATH, "unknown-cmd"]);
      // Should not reach here
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error.exitCode).not.toBe(0);
      const combinedOutput = (error.stdout || "") + (error.stderr || "");
      // Yargs might say "Unknown argument" or "Please provide a valid command"
      expect(combinedOutput.length).toBeGreaterThan(0);
    }
  });

  it("executes standalone command (info)", async () => {
    const { stdout, exitCode } = await execa("bun", ["tsx", CLI_PATH, "info"]);
    expect(exitCode).toBe(0);
    const output = JSON.parse(stdout);
    expect(output.application).toBeDefined();
  });
});

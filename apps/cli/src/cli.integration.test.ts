import { join } from "path";
import { fileURLToPath } from "url";
import { execa } from "execa";
import { describe, expect, it } from "vitest";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const CLI_PATH = join(__dirname, "..", "src", "index.ts");

describe("CLI Integration", () => {
  it("shows help output", async () => {
    const { stdout } = await execa("bun", ["tsx", CLI_PATH, "--help"]);
    expect(stdout).toContain("tv <cmd> [args]");
    expect(stdout).toContain("bridge");
    expect(stdout).toContain("watchlist");
    expect(stdout).toContain("capture");
  });

  it("shows help for subcommands", async () => {
    const { stdout } = await execa("bun", ["tsx", CLI_PATH, "bridge", "--help"]);
    expect(stdout).toContain("tv bridge");
    expect(stdout).toContain("launch");
    expect(stdout).toContain("health-check");
  });

  it("returns non-zero exit code for unknown command", async () => {
    try {
      await execa("bun", ["tsx", CLI_PATH, "unknown-cmd"]);
      // Should not reach here
      expect(true).toBe(false);
    } catch (error: unknown) {
      const execaError = error as {
        exitCode?: number;
        stdout?: string;
        stderr?: string;
      };
      expect(execaError.exitCode).not.toBe(0);
      const combinedOutput =
        (execaError.stdout ?? "") + (execaError.stderr ?? "");
      // Yargs might say "Unknown argument" or "Please provide a valid command"
      expect(combinedOutput.length).toBeGreaterThan(0);
    }
  });

  it("executes bridge get-info", async () => {
    const { stdout, exitCode } = await execa("bun", ["tsx", CLI_PATH, "bridge", "get-info"]);
    expect(exitCode).toBe(0);
    const output = JSON.parse(stdout) as { application?: string };
    expect(output.application).toBeDefined();
  });
});

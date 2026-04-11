import { describe, test, expect, afterAll } from "bun:test";
import { resolve, join } from "path";
import { mkdirSync, writeFileSync, rmSync, readFileSync } from "fs";

const ROOT = resolve(import.meta.dir, "..");
const CLI = resolve(ROOT, "src/cli.ts");

async function runCli(args: string[]): Promise<{
  stdout: string;
  stderr: string;
  exitCode: number;
}> {
  const proc = Bun.spawn(["bun", "run", CLI, ...args], {
    cwd: ROOT,
    stdout: "pipe",
    stderr: "pipe",
  });
  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  const exitCode = await proc.exited;
  return { stdout, stderr, exitCode };
}

describe("CLI: version", () => {
  test("returns version string", async () => {
    const { stdout, exitCode } = await runCli(["version"]);
    expect(exitCode).toBe(0);
    expect(stdout.trim()).toMatch(/^super-aidlc v\d+\.\d+\.\d+$/);
  });
});

describe("CLI: validate", () => {
  test("passes on healthy repo", async () => {
    const { stdout, exitCode } = await runCli(["validate"]);
    expect(exitCode).toBe(0);
    expect(stdout).toContain("All checks passed");
  });
});

describe("CLI: metrics", () => {
  test("handles --days=abc without crashing", async () => {
    const { exitCode } = await runCli(["metrics", "--days=abc"]);
    // Should not crash -- should either use default or show error
    expect(exitCode).toBe(0);
  });

  test("handles --days=0 gracefully", async () => {
    const { exitCode } = await runCli(["metrics", "--days=0"]);
    expect(exitCode).toBe(0);
  });

  test("handles --days=-5 gracefully", async () => {
    const { exitCode } = await runCli(["metrics", "--days=-5"]);
    expect(exitCode).toBe(0);
  });
});

describe("CLI: default (no args)", () => {
  test("shows help with commands list", async () => {
    const { stdout, exitCode } = await runCli([]);
    expect(exitCode).toBe(0);
    expect(stdout).toContain("Commands:");
    expect(stdout).toContain("validate");
    expect(stdout).toContain("metrics");
    expect(stdout).toContain("version");
  });
});

describe("CLI: unknown command", () => {
  test("shows help for unknown command", async () => {
    const { stdout, exitCode } = await runCli(["nonexistent"]);
    expect(exitCode).toBe(0);
    expect(stdout).toContain("Commands:");
  });
});

// ---------------------------------------------------------------------------
// Additional tests
// ---------------------------------------------------------------------------

describe("CLI: validate details", () => {
  test("output includes skill and agent counts", async () => {
    const { stdout, exitCode } = await runCli(["validate"]);
    expect(exitCode).toBe(0);
    // Format: "✓ All checks passed (N skills, N agents, vX.Y.Z)"
    expect(stdout).toMatch(/\d+ skills/);
    expect(stdout).toMatch(/\d+ agents/);
  });

  test("output mentions the version number", async () => {
    const version = readFileSync(resolve(ROOT, "VERSION"), "utf-8").trim();
    const { stdout, exitCode } = await runCli(["validate"]);
    expect(exitCode).toBe(0);
    expect(stdout).toContain(`v${version}`);
  });
});

describe("CLI: metrics with build logs", () => {
  const tmpDir = join("/tmp", `super-aidlc-test-${Date.now()}`);
  const sessionName = "2026-04-10-fake-feature";
  const sessionDir = join(tmpDir, "aidlc-docs", sessionName);

  // Create a temporary aidlc-docs directory with a fake build log before tests
  const buildLogContent = [
    "# Build Log: fake-feature",
    "",
    "## Summary",
    "Implemented a fake feature for testing.",
    "Tests: 5",
    "",
    "## Metrics",
    "Complexity: medium",
    "Strategy: tdd",
    "Test count: 5",
    "Issues encountered: 1",
    "Verify iterations: 2",
    "Compound score: 8",
    "Compound action: keep",
    "",
  ].join("\n");

  mkdirSync(sessionDir, { recursive: true });
  writeFileSync(join(sessionDir, "build-log.md"), buildLogContent);

  afterAll(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  async function runCliInDir(args: string[], cwd: string): Promise<{
    stdout: string;
    stderr: string;
    exitCode: number;
  }> {
    const proc = Bun.spawn(["bun", "run", CLI, ...args], {
      cwd,
      stdout: "pipe",
      stderr: "pipe",
    });
    const [stdout, stderr] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
    ]);
    const exitCode = await proc.exited;
    return { stdout, stderr, exitCode };
  }

  test("finds and parses build log from aidlc-docs", async () => {
    const { stdout, exitCode } = await runCliInDir(
      ["metrics", "--days=30"],
      tmpDir,
    );
    expect(exitCode).toBe(0);
    expect(stdout).toContain("fake-feature");
    expect(stdout).toContain("tdd");
    expect(stdout).toContain("1 sessions");
  });

  test("build log metrics table includes expected columns", async () => {
    const { stdout, exitCode } = await runCliInDir(
      ["metrics", "--days=30"],
      tmpDir,
    );
    expect(exitCode).toBe(0);
    expect(stdout).toContain("Date");
    expect(stdout).toContain("Feature");
    expect(stdout).toContain("Strategy");
    expect(stdout).toContain("Tests");
    expect(stdout).toContain("Issues");
    expect(stdout).toContain("Score");
  });

  test("displays averages when metrics are present", async () => {
    const { stdout, exitCode } = await runCliInDir(
      ["metrics", "--days=30"],
      tmpDir,
    );
    expect(exitCode).toBe(0);
    expect(stdout).toContain("Avg tests/session:");
    expect(stdout).toContain("Avg issues/session:");
  });
});

describe("CLI: version consistency", () => {
  test("version command output matches VERSION file", async () => {
    const versionFile = readFileSync(resolve(ROOT, "VERSION"), "utf-8").trim();
    const { stdout, exitCode } = await runCli(["version"]);
    expect(exitCode).toBe(0);
    expect(stdout.trim()).toBe(`super-aidlc v${versionFile}`);
  });
});

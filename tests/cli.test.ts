import { describe, test, expect, afterAll } from "bun:test";
import { resolve, join } from "path";
import { mkdirSync, writeFileSync, rmSync, readFileSync } from "fs";
import {
  getVersion,
  validate,
  parseDays,
  computeMetrics,
  formatValidateOutput,
  formatMetricsOutput,
  formatHelp,
} from "../src/cli";

const ROOT = resolve(import.meta.dir, "..");

describe("CLI: version", () => {
  test("returns version string", () => {
    const version = getVersion();
    expect(version).toMatch(/^\d+\.\d+\.\d+$/);
  });
});

describe("CLI: validate", () => {
  test("passes on healthy repo", () => {
    const result = validate();
    expect(result.pass).toBe(true);
    expect(result.errors).toEqual([]);
  });
});

describe("CLI: parseDays", () => {
  test("handles --days=abc without crashing", () => {
    expect(parseDays(["metrics", "--days=abc"])).toBe(30);
  });

  test("handles --days=0 gracefully", () => {
    expect(parseDays(["metrics", "--days=0"])).toBe(30);
  });

  test("handles --days=-5 gracefully", () => {
    expect(parseDays(["metrics", "--days=-5"])).toBe(30);
  });

  test("accepts valid positive integer", () => {
    expect(parseDays(["metrics", "--days=60"])).toBe(60);
  });

  test("defaults to 30 when no flag", () => {
    expect(parseDays(["metrics"])).toBe(30);
  });
});

describe("CLI: help output", () => {
  test("formatHelp contains commands list", () => {
    const version = getVersion();
    const output = formatHelp(version);
    expect(output).toContain("Commands:");
    expect(output).toContain("validate");
    expect(output).toContain("metrics");
    expect(output).toContain("version");
  });

  test("formatHelp includes version", () => {
    const output = formatHelp("1.2.3");
    expect(output).toContain("v1.2.3");
  });
});

describe("CLI: validate details", () => {
  test("formatValidateOutput includes skill and agent counts", () => {
    const result = validate();
    const output = formatValidateOutput(result);
    expect(output).toMatch(/\d+ skills/);
    expect(output).toMatch(/\d+ agents/);
  });

  test("formatValidateOutput mentions the version number", () => {
    const version = readFileSync(resolve(ROOT, "VERSION"), "utf-8").trim();
    const result = validate();
    const output = formatValidateOutput(result);
    expect(output).toContain(`v${version}`);
  });

  test("formatValidateOutput for failure lists errors", () => {
    const failResult = {
      pass: false,
      errors: ["Missing SKILL.md in skills/foo/", "Bad frontmatter in skills/bar/"],
      skillCount: 0,
      agentCount: 0,
      version: "0.0.0",
    };
    const output = formatValidateOutput(failResult);
    expect(output).toContain("2 issues found");
    expect(output).toContain("Missing SKILL.md");
    expect(output).toContain("Bad frontmatter");
  });
});

describe("CLI: metrics with build logs", () => {
  const tmpDir = join("/tmp", `super-aidlc-test-${Date.now()}`);
  const sessionName = "2026-04-10-fake-feature";
  const aidlcDocsDir = join(tmpDir, "aidlc-docs");
  const sessionDir = join(aidlcDocsDir, sessionName);

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

  test("finds and parses build log from aidlc-docs", () => {
    const result = computeMetrics(30, aidlcDocsDir);
    expect(result.aidlcDocsExists).toBe(true);
    expect(result.sessions).toHaveLength(1);
    const session = result.sessions[0]!;
    expect(session.slug).toBe("fake-feature");
    expect(session.strategy).toBe("tdd");
    expect(session.testCount).toBe(5);
    expect(session.issueCount).toBe(1);
  });

  test("formatted output table includes expected columns", () => {
    const result = computeMetrics(30, aidlcDocsDir);
    const output = formatMetricsOutput(result);
    expect(output).toContain("1 sessions");
    expect(output).toContain("Date");
    expect(output).toContain("Feature");
    expect(output).toContain("Strategy");
    expect(output).toContain("Tests");
    expect(output).toContain("Issues");
    expect(output).toContain("Score");
  });

  test("formatted output displays averages when metrics are present", () => {
    const result = computeMetrics(30, aidlcDocsDir);
    const output = formatMetricsOutput(result);
    expect(output).toContain("Avg tests/session:");
    expect(output).toContain("Avg issues/session:");
  });

  test("formatted output shows 'no aidlc-docs' when missing", () => {
    const result = computeMetrics(30, "/tmp/definitely-does-not-exist-xyz");
    const output = formatMetricsOutput(result);
    expect(output).toContain("No aidlc-docs/ found");
  });

  test("formatted output shows 'no build logs' when empty", () => {
    const emptyDir = join("/tmp", `super-aidlc-empty-${Date.now()}`);
    mkdirSync(emptyDir, { recursive: true });
    try {
      const result = computeMetrics(30, emptyDir);
      const output = formatMetricsOutput(result);
      expect(output).toContain("No build logs found");
    } finally {
      rmSync(emptyDir, { recursive: true, force: true });
    }
  });
});

describe("CLI: version consistency", () => {
  test("getVersion matches VERSION file", () => {
    const versionFile = readFileSync(resolve(ROOT, "VERSION"), "utf-8").trim();
    expect(getVersion()).toBe(versionFile);
  });
});

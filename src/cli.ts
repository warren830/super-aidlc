#!/usr/bin/env bun
import { readFileSync, readdirSync, existsSync } from "fs";
import { join, resolve } from "path";

const ROOT = resolve(import.meta.dir, "..");

// ===== Pure functions (exported for direct testing) =====

export function getVersion(root: string = ROOT): string {
  return readFileSync(join(root, "VERSION"), "utf-8").trim();
}

export interface ValidateResult {
  pass: boolean;
  errors: string[];
  skillCount: number;
  agentCount: number;
  version: string;
}

export function validate(root: string = ROOT): ValidateResult {
  const errors: string[] = [];
  let pass = true;

  // Check skills
  const skillsDir = join(root, "skills");
  const skills = readdirSync(skillsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const skill of skills) {
    const skillFile = join(skillsDir, skill, "SKILL.md");
    if (!existsSync(skillFile)) {
      errors.push(`Missing SKILL.md in skills/${skill}/`);
      pass = false;
      continue;
    }
    const content = readFileSync(skillFile, "utf-8");
    if (!content.match(/^---\n/)) {
      errors.push(`skills/${skill}/SKILL.md missing YAML frontmatter`);
      pass = false;
    }
    const nameMatch = content.match(/^name:\s*(.+)$/m);
    if (!nameMatch || !nameMatch[1]?.startsWith("super-aidlc:")) {
      errors.push(`skills/${skill}/SKILL.md name should start with super-aidlc:`);
      pass = false;
    }
  }

  // Check agents
  const agentsDir = join(root, "agents");
  const agents = readdirSync(agentsDir).filter((f) => f.endsWith(".md"));
  for (const agent of agents) {
    const content = readFileSync(join(agentsDir, agent), "utf-8");
    if (!content.match(/^# .+/m)) {
      errors.push(`agents/${agent} missing title heading`);
      pass = false;
    }
    const lines = content.split("\n").length;
    if (lines > 270) {
      errors.push(`agents/${agent} is ${lines} lines (max 270)`);
      pass = false;
    }
  }

  // Check version consistency
  const version = getVersion(root);
  const versionFiles: Array<{ path: string; label: string }> = [
    { path: join(root, ".claude-plugin/plugin.json"), label: "plugin.json" },
    { path: join(root, "package.json"), label: "package.json" },
    { path: join(root, ".cursor-plugin/plugin.json"), label: ".cursor-plugin/plugin.json" },
  ];
  for (const { path, label } of versionFiles) {
    if (!existsSync(path)) continue;
    try {
      const json = JSON.parse(readFileSync(path, "utf-8"));
      if (json.version !== version) {
        errors.push(`Version mismatch: VERSION=${version}, ${label}=${json.version}`);
        pass = false;
      }
    } catch {
      errors.push(`Invalid JSON in ${label}`);
      pass = false;
    }
  }

  return {
    pass,
    errors,
    skillCount: skills.length,
    agentCount: agents.length,
    version,
  };
}

export function formatValidateOutput(result: ValidateResult): string {
  if (result.pass) {
    return `\u2713 All checks passed (${result.skillCount} skills, ${result.agentCount} agents, v${result.version})\n`;
  }
  const lines = [`\u2717 ${result.errors.length} issues found:`];
  for (const err of result.errors) lines.push(`  - ${err}`);
  return lines.join("\n") + "\n";
}

export interface SessionMetrics {
  date: string;
  slug: string;
  complexity?: string;
  strategy?: string;
  totalTime?: number;
  testCount?: number;
  issueCount?: number;
  verifyIterations?: number;
  compoundScore?: number;
  compoundAction?: string;
}

export function parseMetricsFromBuildLog(path: string): SessionMetrics | null {
  const content = readFileSync(path, "utf-8");
  const dirName = path.split("/").slice(-2, -1)[0] || "unknown";
  const fullDate = dirName.match(/^\d{4}-\d{2}-\d{2}/)?.[0] || "unknown";
  const slug = dirName.replace(/^\d{4}-\d{2}-\d{2}-/, "");

  const metrics: SessionMetrics = { date: fullDate, slug };

  // Extract from ## Metrics section
  const metricsSection = content.match(/## Metrics\n([\s\S]*?)(?=\n## |\n$)/);
  if (metricsSection && metricsSection[1]) {
    const lines = metricsSection[1];
    const extract = (key: string): string | undefined => {
      const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const m = lines.match(new RegExp(`${escaped}:\\s*(.+)`));
      return m && m[1] ? m[1].trim() : undefined;
    };
    metrics.complexity = extract("Complexity");
    metrics.strategy = extract("Strategy");
    const tryInt = (v: string | undefined): number | undefined => {
      const n = parseInt(v || "");
      return Number.isNaN(n) ? undefined : n;
    };
    metrics.testCount = tryInt(extract("Test count"));
    metrics.issueCount = tryInt(extract("Issues encountered"));
    metrics.verifyIterations = tryInt(extract("Verify iterations"));
    metrics.compoundScore = tryInt(extract("Compound score"));
    metrics.compoundAction = extract("Compound action");
  }

  // Fallback: extract from ## Summary
  if (metrics.testCount === undefined) {
    const testMatch = content.match(/Tests:\s*(\d+)/);
    if (testMatch && testMatch[1]) metrics.testCount = parseInt(testMatch[1]);
  }

  return metrics;
}

export interface MetricsResult {
  days: number;
  aidlcDocsDir: string;
  aidlcDocsExists: boolean;
  sessions: SessionMetrics[];
  avgTests: number | null;
  avgIssues: string | null;
  solutionCount: number | null;
}

export function computeMetrics(
  days: number,
  aidlcDocsDir: string = join(process.cwd(), "aidlc-docs"),
): MetricsResult {
  if (!existsSync(aidlcDocsDir)) {
    return {
      days,
      aidlcDocsDir,
      aidlcDocsExists: false,
      sessions: [],
      avgTests: null,
      avgIssues: null,
      solutionCount: null,
    };
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const dirs = readdirSync(aidlcDocsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((d) => d >= cutoffStr)
    .sort();

  const sessions: SessionMetrics[] = [];
  for (const dir of dirs) {
    const logPath = join(aidlcDocsDir, dir, "build-log.md");
    if (existsSync(logPath)) {
      const m = parseMetricsFromBuildLog(logPath);
      if (m) sessions.push(m);
    }
  }

  const withTests = sessions.filter((s) => s.testCount);
  const withIssues = sessions.filter((s) => s.issueCount !== undefined);
  const avgTests =
    withTests.length > 0
      ? Math.round(
          withTests.reduce((a, s) => a + (s.testCount || 0), 0) / withTests.length,
        )
      : null;
  const avgIssues =
    withIssues.length > 0
      ? (
          withIssues.reduce((a, s) => a + (s.issueCount || 0), 0) / withIssues.length
        ).toFixed(1)
      : null;

  const solutionsDir = join(aidlcDocsDir, "solutions");
  const solutionCount = existsSync(solutionsDir)
    ? readdirSync(solutionsDir, { recursive: true }).filter((f) =>
        String(f).endsWith(".md"),
      ).length
    : null;

  return {
    days,
    aidlcDocsDir,
    aidlcDocsExists: true,
    sessions,
    avgTests,
    avgIssues,
    solutionCount,
  };
}

export function formatMetricsOutput(result: MetricsResult): string {
  if (!result.aidlcDocsExists) {
    return "No aidlc-docs/ found in current directory.\n";
  }
  if (result.sessions.length === 0) {
    return `No build logs found in the last ${result.days} days.\n`;
  }
  const lines: string[] = [];
  lines.push("");
  lines.push(
    `Super-AIDLC Metrics (last ${result.days} days, ${result.sessions.length} sessions)`,
  );
  lines.push("");
  lines.push("| Date | Feature | Strategy | Tests | Issues | Score |");
  lines.push("|------|---------|----------|-------|--------|-------|");
  for (const s of result.sessions) {
    lines.push(
      `| ${s.date} | ${s.slug} | ${s.strategy || "-"} | ${s.testCount || "-"} | ${s.issueCount || "-"} | ${s.compoundScore || "-"} |`,
    );
  }
  if (result.avgTests !== null) {
    lines.push("");
    lines.push(`Avg tests/session: ${result.avgTests}`);
  }
  if (result.avgIssues !== null) {
    lines.push(`Avg issues/session: ${result.avgIssues}`);
  }
  if (result.solutionCount !== null) {
    lines.push(`Knowledge base: ${result.solutionCount} solution docs`);
  }
  return lines.join("\n") + "\n";
}

export function parseDays(args: string[]): number {
  const daysFlag = args.find((a) => a.startsWith("--days="));
  const parsed = daysFlag ? parseInt(daysFlag.split("=")[1] || "") : NaN;
  return Number.isNaN(parsed) || parsed <= 0 ? 30 : parsed;
}

export function formatHelp(version: string): string {
  return [
    `super-aidlc v${version}`,
    "",
    "Commands:",
    "  validate    Check skill/agent file integrity",
    "  metrics     Show session metrics trends (--days=N)",
    "  version     Show version",
    "",
  ].join("\n");
}

// ===== Imperative shell (CLI entry point) =====

export function main(args: string[] = process.argv.slice(2)): void {
  const command = args[0];

  switch (command) {
    case "version":
      process.stdout.write(`super-aidlc v${getVersion()}\n`);
      break;
    case "validate": {
      const result = validate();
      const output = formatValidateOutput(result);
      if (result.pass) {
        process.stdout.write(output);
      } else {
        process.stderr.write(output);
      }
      process.exit(result.pass ? 0 : 1);
    }
    // eslint-disable-next-line no-fallthrough
    case "metrics": {
      const days = parseDays(args);
      const result = computeMetrics(days);
      process.stdout.write(formatMetricsOutput(result));
      break;
    }
    default:
      process.stdout.write(formatHelp(getVersion()));
      break;
  }
}

if (import.meta.main) {
  main();
}

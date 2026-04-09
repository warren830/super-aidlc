#!/usr/bin/env bun
import { readFileSync, readdirSync, existsSync } from "fs";
import { join, resolve } from "path";

const ROOT = resolve(import.meta.dir, "..");

function getVersion(): string {
  return readFileSync(join(ROOT, "VERSION"), "utf-8").trim();
}

function validate(): boolean {
  let pass = true;
  const errors: string[] = [];

  // Check skills
  const skillsDir = join(ROOT, "skills");
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
    if (!nameMatch || !nameMatch[1].startsWith("super-aidlc:")) {
      errors.push(`skills/${skill}/SKILL.md name should start with super-aidlc:`);
      pass = false;
    }
  }

  // Check agents
  const agentsDir = join(ROOT, "agents");
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
  const version = getVersion();
  if (existsSync(join(ROOT, ".claude-plugin/plugin.json"))) {
    const pluginJson = JSON.parse(
      readFileSync(join(ROOT, ".claude-plugin/plugin.json"), "utf-8")
    );
    if (pluginJson.version !== version) {
      errors.push(
        `Version mismatch: VERSION=${version}, plugin.json=${pluginJson.version}`
      );
      pass = false;
    }
  }
  if (existsSync(join(ROOT, "package.json"))) {
    const packageJson = JSON.parse(
      readFileSync(join(ROOT, "package.json"), "utf-8")
    );
    if (packageJson.version !== version) {
      errors.push(
        `Version mismatch: VERSION=${version}, package.json=${packageJson.version}`
      );
      pass = false;
    }
  }

  if (pass) {
    console.log(`\u2713 All checks passed (${skills.length} skills, ${agents.length} agents, v${version})`);
  } else {
    console.error(`\u2717 ${errors.length} issues found:`);
    for (const err of errors) {
      console.error(`  - ${err}`);
    }
  }
  return pass;
}

interface SessionMetrics {
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

function parseMetricsFromBuildLog(path: string): SessionMetrics | null {
  const content = readFileSync(path, "utf-8");
  const dirName = path.split("/").slice(-2, -1)[0] || "unknown";
  const [date, ...slugParts] = dirName.split("-");
  const fullDate = dirName.match(/^\d{4}-\d{2}-\d{2}/)?.[0] || "unknown";
  const slug = dirName.replace(/^\d{4}-\d{2}-\d{2}-/, "");

  const metrics: SessionMetrics = { date: fullDate, slug };

  // Extract from ## Metrics section
  const metricsSection = content.match(/## Metrics\n([\s\S]*?)(?=\n## |\n$)/);
  if (metricsSection) {
    const lines = metricsSection[1];
    const extract = (key: string) => {
      const m = lines.match(new RegExp(`${key}:\\s*(.+)`));
      return m ? m[1].trim() : undefined;
    };
    metrics.complexity = extract("Complexity");
    metrics.strategy = extract("Strategy");
    metrics.testCount = parseInt(extract("Test count") || "0") || undefined;
    metrics.issueCount = parseInt(extract("Issues encountered") || "0") || undefined;
    metrics.verifyIterations = parseInt(extract("Verify iterations") || "0") || undefined;
    metrics.compoundScore = parseInt(extract("Compound score") || "0") || undefined;
    metrics.compoundAction = extract("Compound action");
  }

  // Fallback: extract from ## Summary
  if (!metrics.testCount) {
    const testMatch = content.match(/Tests:\s*(\d+)/);
    if (testMatch) metrics.testCount = parseInt(testMatch[1]);
  }

  return metrics;
}

function metrics(days: number): void {
  const aidlcDocs = join(process.cwd(), "aidlc-docs");
  if (!existsSync(aidlcDocs)) {
    console.log("No aidlc-docs/ found in current directory.");
    return;
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const dirs = readdirSync(aidlcDocs, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((d) => d >= cutoffStr)
    .sort();

  const sessions: SessionMetrics[] = [];
  for (const dir of dirs) {
    const logPath = join(aidlcDocs, dir, "build-log.md");
    if (existsSync(logPath)) {
      const m = parseMetricsFromBuildLog(logPath);
      if (m) sessions.push(m);
    }
  }

  if (sessions.length === 0) {
    console.log(`No build logs found in the last ${days} days.`);
    return;
  }

  console.log(`\nSuper-AIDLC Metrics (last ${days} days, ${sessions.length} sessions)\n`);
  console.log("| Date | Feature | Strategy | Tests | Issues | Score |");
  console.log("|------|---------|----------|-------|--------|-------|");
  for (const s of sessions) {
    console.log(
      `| ${s.date} | ${s.slug} | ${s.strategy || "-"} | ${s.testCount || "-"} | ${s.issueCount || "-"} | ${s.compoundScore || "-"} |`
    );
  }

  // Averages
  const withTests = sessions.filter((s) => s.testCount);
  const withIssues = sessions.filter((s) => s.issueCount !== undefined);
  if (withTests.length > 0) {
    const avgTests = Math.round(
      withTests.reduce((a, s) => a + (s.testCount || 0), 0) / withTests.length
    );
    console.log(`\nAvg tests/session: ${avgTests}`);
  }
  if (withIssues.length > 0) {
    const avgIssues = (
      withIssues.reduce((a, s) => a + (s.issueCount || 0), 0) / withIssues.length
    ).toFixed(1);
    console.log(`Avg issues/session: ${avgIssues}`);
  }

  // Knowledge base size
  const solutionsDir = join(aidlcDocs, "solutions");
  if (existsSync(solutionsDir)) {
    const solCount = readdirSync(solutionsDir, { recursive: true })
      .filter((f) => String(f).endsWith(".md")).length;
    console.log(`Knowledge base: ${solCount} solution docs`);
  }
}

// CLI entry point
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case "version":
    console.log(`super-aidlc v${getVersion()}`);
    break;
  case "validate":
    process.exit(validate() ? 0 : 1);
    break;
  case "metrics": {
    const daysFlag = args.find((a) => a.startsWith("--days="));
    const days = daysFlag ? parseInt(daysFlag.split("=")[1]) : 30;
    metrics(days);
    break;
  }
  default:
    console.log(`super-aidlc v${getVersion()}\n`);
    console.log("Commands:");
    console.log("  validate    Check skill/agent file integrity");
    console.log("  metrics     Show session metrics trends (--days=N)");
    console.log("  version     Show version");
    break;
}

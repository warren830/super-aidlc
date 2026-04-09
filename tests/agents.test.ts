import { describe, test, expect } from "bun:test";
import { readdirSync, readFileSync, existsSync } from "fs";
import { join, resolve } from "path";

const ROOT = resolve(import.meta.dir, "..");
const AGENTS_DIR = join(ROOT, "agents");

function getAgentFiles(): string[] {
  return readdirSync(AGENTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(".md", ""));
}

describe("Agents", () => {
  const agents = getAgentFiles();

  test("agents directory exists and has agents", () => {
    expect(agents.length).toBeGreaterThan(0);
  });

  for (const agent of agents) {
    describe(agent, () => {
      const agentPath = join(AGENTS_DIR, `${agent}.md`);
      const content = readFileSync(agentPath, "utf-8");

      test("file exists and is non-empty", () => {
        expect(content.length).toBeGreaterThan(100);
      });

      test("has a title heading", () => {
        expect(content).toMatch(/^# .+/m);
      });

      test("has process or focus section", () => {
        const hasProcess = /## Process|## Focus|## Four Phases|## Triggered When|## Approach|## Self-Check/i.test(content);
        expect(hasProcess).toBe(true);
      });

      test("has output or rules section", () => {
        const hasOutput = /## Output|## Rules|## Output Format/i.test(content);
        expect(hasOutput).toBe(true);
      });

      test("is under 260 lines", () => {
        const lines = content.split("\n").length;
        expect(lines).toBeLessThanOrEqual(260);
      });
    });
  }
});

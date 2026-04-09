import { describe, test, expect } from "bun:test";
import { readFileSync, existsSync } from "fs";
import { join, resolve } from "path";

const ROOT = resolve(import.meta.dir, "..");

describe("Cross-references", () => {
  test("SKILL.md references existing phase files", () => {
    const skill = readFileSync(join(ROOT, "SKILL.md"), "utf-8");
    const phaseRefs = skill.match(/phases\/\w+\.md/g) || [];
    for (const ref of phaseRefs) {
      expect(existsSync(join(ROOT, ref))).toBe(true);
    }
  });

  test("SKILL.md references existing agent files", () => {
    const skill = readFileSync(join(ROOT, "SKILL.md"), "utf-8");
    const agentRefs = skill.match(/agents\/[\w-]+\.md/g) || [];
    for (const ref of agentRefs) {
      expect(existsSync(join(ROOT, ref))).toBe(true);
    }
  });

  test("SKILL.md references existing rule files", () => {
    const skill = readFileSync(join(ROOT, "SKILL.md"), "utf-8");
    const ruleRefs = skill.match(/rules\/[\w-]+\.md/g) || [];
    for (const ref of ruleRefs) {
      expect(existsSync(join(ROOT, ref))).toBe(true);
    }
  });

  test("construction.md references existing agent files", () => {
    const construction = readFileSync(join(ROOT, "phases/construction.md"), "utf-8");
    const agentRefs = construction.match(/agents\/[\w-]+\.md/g) || [];
    for (const ref of agentRefs) {
      expect(existsSync(join(ROOT, ref))).toBe(true);
    }
  });

  test("review-protocol.md references existing reviewer agents", () => {
    const review = readFileSync(join(ROOT, "rules/review-protocol.md"), "utf-8");
    const agentRefs = review.match(/agents\/[\w-]+\.md/g) || [];
    for (const ref of agentRefs) {
      expect(existsSync(join(ROOT, ref))).toBe(true);
    }
  });

  test("compound schema files exist", () => {
    expect(existsSync(join(ROOT, "skills/compound/references/schema.yaml"))).toBe(true);
    expect(existsSync(join(ROOT, "skills/compound/references/yaml-schema.md"))).toBe(true);
    expect(existsSync(join(ROOT, "skills/compound/assets/resolution-template.md"))).toBe(true);
  });
});

describe("Version consistency", () => {
  test("VERSION file matches plugin.json", () => {
    const version = readFileSync(join(ROOT, "VERSION"), "utf-8").trim();
    const pluginJson = JSON.parse(
      readFileSync(join(ROOT, ".claude-plugin/plugin.json"), "utf-8")
    );
    expect(pluginJson.version).toBe(version);
  });

  test("VERSION file matches package.json", () => {
    const version = readFileSync(join(ROOT, "VERSION"), "utf-8").trim();
    const packageJson = JSON.parse(
      readFileSync(join(ROOT, "package.json"), "utf-8")
    );
    expect(packageJson.version).toBe(version);
  });
});

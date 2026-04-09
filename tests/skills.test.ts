import { describe, test, expect } from "bun:test";
import { readdirSync, readFileSync, existsSync } from "fs";
import { join, resolve } from "path";

const ROOT = resolve(import.meta.dir, "..");
const SKILLS_DIR = join(ROOT, "skills");

function getSkillDirs(): string[] {
  return readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

function readSkillFile(skillName: string): string {
  const path = join(SKILLS_DIR, skillName, "SKILL.md");
  return readFileSync(path, "utf-8");
}

function extractFrontmatter(content: string): Record<string, string> | null {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const fm: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const [key, ...rest] = line.split(":");
    if (key && rest.length) {
      fm[key.trim()] = rest.join(":").trim();
    }
  }
  return fm;
}

describe("Skills", () => {
  const skillDirs = getSkillDirs();

  test("skills directory exists and has skills", () => {
    expect(skillDirs.length).toBeGreaterThan(0);
  });

  for (const skill of skillDirs) {
    describe(skill, () => {
      const skillPath = join(SKILLS_DIR, skill, "SKILL.md");

      test("has SKILL.md", () => {
        expect(existsSync(skillPath)).toBe(true);
      });

      test("has valid YAML frontmatter", () => {
        const content = readSkillFile(skill);
        const fm = extractFrontmatter(content);
        expect(fm).not.toBeNull();
        expect(fm!.name).toBeDefined();
        expect(fm!.description).toBeDefined();
      });

      test("name follows super-aidlc: namespace", () => {
        const content = readSkillFile(skill);
        const fm = extractFrontmatter(content);
        expect(fm!.name).toStartWith("super-aidlc:");
      });

      test("has non-empty description", () => {
        const content = readSkillFile(skill);
        const fm = extractFrontmatter(content);
        expect(fm!.description.length).toBeGreaterThan(10);
      });

      test("has content after frontmatter", () => {
        const content = readSkillFile(skill);
        const body = content.replace(/^---\n[\s\S]*?\n---\n*/, "");
        expect(body.trim().length).toBeGreaterThan(50);
      });
    });
  }
});

describe("Root SKILL.md", () => {
  const rootSkill = join(ROOT, "SKILL.md");

  test("exists", () => {
    expect(existsSync(rootSkill)).toBe(true);
  });

  test("has name: super-aidlc", () => {
    const content = readFileSync(rootSkill, "utf-8");
    const fm = extractFrontmatter(content);
    expect(fm!.name).toBe("super-aidlc");
  });
});

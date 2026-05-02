---
name: super-aidlc:ship
description: Run the operations phase - verification, commit, push, and PR creation. Use after building when you're ready to ship.
argument-hint: "[optional: branch name or PR title]"
model: opus
---

# Ship

Ship context: $ARGUMENTS

## Prerequisite: Read `skills/verify/SKILL.md`

Ship is the most dangerous point for false completion claims. Before running any command in this skill, read `skills/verify/SKILL.md`. Every "tests pass" / "build succeeds" claim below must quote fresh evidence from a command run in this message. No exceptions.

**Iron Law**: If you did not run the verification command in this message, you cannot claim the result.

## Pre-Ship Verification (all must pass)

```bash
# 1. Run full test suite
{project test command from CLAUDE.md or package.json}

# 2. Build
{project build command}

# 3. Lint
{project lint command}
```

If any fail, fix and re-run (max 3 iterations). If still failing after 3, escalate to user with specific errors.

## Commit

- Meaningful commit message(s) following project conventions
- One commit per logical unit, or one combined commit
- Do NOT include unrelated changes

```bash
git add {specific files}
git commit -m "feat(scope): description"
```

## Push + PR

```bash
git push origin {branch}
```

Create PR with:
- Summary of what was built
- Link to design doc (if exists in `aidlc-docs/`)
- Test results
- QA results (if `/super-aidlc:qa` was run)

## Post-Ship

Suggest:
- `/super-aidlc:compound` if the session had non-trivial learnings
- Update `aidlc-docs/patterns.md` if new conventions were established

## Rules

- **All tests must pass before pushing.** No exceptions.
- **No force push to main/master.** Warn and refuse.
- **Commit messages in English.** Even if artifacts are in another language.

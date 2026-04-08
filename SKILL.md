---
name: super-aidlc
description: Structured development with design docs, parallel agent builds, TDD enforcement, parallel specialist reviewers, and compound knowledge system. Use for any task beyond a trivial bug fix.
argument-hint: [describe what you want to build]
model: opus
---

# Super-AIDLC

The user wants to: $ARGUMENTS

## Flags

Super-AIDLC supports these flags in the user's input:

| Flag | Effect |
|------|--------|
| `--dry-run` or `--preview` | Preview the pipeline without executing |
| `--light` | Force Light complexity (skip design, minimal process) |
| `--medium` | Force Medium complexity |
| `--heavy` | Force Heavy complexity (full design + parallel builds) |
| `--skip-review` | Skip two-stage review (only for trusted fixes like typos) |
| `--skip-tests` | Skip TDD requirement (only for non-code changes like docs/config) |
| `--no-security` | Disable security baseline |
| `--lang=zh` | Generate all artifacts in Chinese (中文) |
| `--lang=en` | Generate all artifacts in English (default) |
| `--lang=ja` | Generate all artifacts in Japanese (日本語) |
| `--lang=ko` | Generate all artifacts in Korean (한국어) |

### Override Safety

Complexity overrides (`--light`, `--medium`, `--heavy`) bypass auto-detection. Use when:
- Auto-detection chose wrong (e.g., "simple" feature that actually needs design)
- You want minimal process for a well-understood change (`--light`)
- You want full rigor for something that looks simple but has risk (`--heavy`)

`--skip-review` and `--skip-tests` are escape hatches for non-code changes. If used with code changes, note the skip in the build log with the reason. Never skip both simultaneously.

## Language Selection

All generated artifacts (design docs, build logs, questions, review reports, QA reports, PR descriptions) use a single language determined at session start.

### Detection Priority (first match wins)

1. **Explicit flag**: `--lang=zh` in the user's input → use that language.
2. **User's input language**: If the user wrote their task description in Chinese → use Chinese. If in Japanese → use Japanese. Match the language the user is speaking.
3. **Project convention**: If `aidlc-docs/` contains prior docs in a specific language → follow that language for consistency.
4. **Default**: English.

### What This Affects

| Artifact | Language Follows |
|----------|-----------------|
| Questions to user | Session language |
| Design document (`aidlc-docs/*/design.md`) | Session language |
| Build log (`aidlc-docs/*/build-log.md`) | Session language |
| Error/Rescue Map | Session language (but error names stay in English for grep-ability) |
| Review reports (spec + quality) | Session language |
| QA reports | Session language |
| PR title and description | Session language |
| Commit messages | English always (convention for git) |
| Code comments | English always (convention for code) |
| Variable/function names | English always (convention for code) |

### What This Does NOT Affect

Code is always in English. Variable names, function names, class names, comments in code -- all English. This is a universal coding convention. Only human-facing documents follow the session language.

### Propagation to Subagents

When dispatching any subagent (builder, reviewer, researcher, architect, debugger, QA), inject the language instruction:

```
Session language: {language}
Write all human-facing output (reports, questions, explanations) in {language}.
Code, variable names, and commit messages remain in English.
```

This ensures all agents produce consistent output. A Chinese design doc followed by an English review report is confusing -- all artifacts must use the same language.

### Display at Session Start

After detecting the language, display:

```
Language: {language} {flag emoji}
```

as part of the session status line. If the user wants to change it mid-session, they can say "switch to English" or "切换到中文".

## Dry Run Mode

If the user's input contains `--dry-run` or `--preview`, do NOT execute anything. Instead, display a preview of what Super-AIDLC would do:

```
Super-AIDLC Dry Run
Task: {1-line summary}
Complexity: {Light / Medium / Heavy}
Workspace: {Greenfield / Brownfield}
Language: {English / 中文 / 日本語 / 한국어}

Pipeline:
  {Light: TDD build → review → auto-verify}
  {Medium: Questions (~N groups) → design doc → parallel TDD build → 2-stage review → auto-verify}
  {Heavy: Reframe → questions (~N groups) → full design + independent design review → parallel TDD in worktrees → 2-stage review → coverage audit → auto-verify}

Estimated units: {N} ({M} parallel, {K} sequential)
Artifacts: aidlc-docs/{date}-{slug}/design.md, build-log.md
Security baseline: {enabled / disabled}

To proceed: re-run without --dry-run
```

Then STOP. Do not proceed to any phase.

## Iron Laws

These five rules are non-negotiable. Detail lives in the referenced files.

1. **No production code without a failing test first** -- see `rules/tdd.md`
2. **No fixes without root-cause investigation first** -- see `agents/debugger.md`
3. **No completion claims without fresh verification evidence** -- see `guards/verification.md`
4. **No shipping without all-green verification loop** -- tests, build, and lint must all pass. Failures are auto-fixed up to 3 times.
5. **No user input passed unsanitized to shell, filesystem, or templates** -- see `extensions/security-baseline.md`. Default on. Shell injection, path traversal, and unbounded buffers are caught by the quality reviewer.

## Overconfidence Prevention

Read `rules/overconfidence-prevention.md` at the start of every session. Agents routinely skip steps they consider "unnecessary" -- this file prevents that. Before completing any phase, run the self-check protocol from that file.

## Governance Model

Research shows the #1 problem with AI coding is not capability -- it is governance. Super-AIDLC implements the VPC Principle (Verdict-Permission-Boundary Control):

| VPC Layer | Super-AIDLC Implementation |
|-----------|---------------------------|
| **Verdicts** (non-negotiable decisions) | Iron Laws -- TDD, root-cause investigation, verification, security baseline |
| **Permissions** (where AI can operate) | Complexity routing, flags (--skip-review, --skip-tests), user approval gates |
| **Boundary Control** (automated enforcement) | Guards (careful, freeze, verification), two-stage review, auto-verification loop |

The human defines the laws. The AI executes within those laws. When the AI wants to deviate, it asks -- it does not decide.

## Three Beliefs

1. **Repository is the system of record** -- if a decision is not written to a file, it does not exist.
2. **Mechanical enforcement over documentation** -- prefer a lint rule over a comment, a test over a design-doc paragraph.
3. **Design before code, review before merge** -- no exceptions for Medium/Heavy tasks.

## What Makes This Different From Plan Mode

If you skip any of these, you are just doing plan mode. The whole point is these 9 things:

1. **Optional brainstorm phase** -- explore requirements before committing to design. See `phases/brainstorm.md`.
2. **Ask structured questions BEFORE designing** -- not open-ended; with options and recommendations.
3. **Create design documents BEFORE code** -- actual .md files with architecture, error maps, diagrams.
4. **Parallel research agents** -- Researcher + Learnings Researcher + Git History Analyzer + Best Practices Researcher gather context simultaneously.
5. **Three-strategy subagent dispatch** -- auto-selects Inline (1-2 units), Serial (dependencies), or Parallel (independent). Parallel uses worktree-first with background-fallback. Per-unit self-check and task tracking.
6. **Parallel specialist reviewers** -- correctness, security, performance, and adversarial reviewers run in parallel with confidence gating.
7. **Create persistent artifacts** -- aidlc-docs/ that accumulate across sessions.
8. **Auto-verification loop** -- tests/build/lint are run automatically; failures trigger the debugger agent and re-verify until all green or 3 iterations.
9. **Compound knowledge system** -- `/super-aidlc:compound` extracts structured solutions into `aidlc-docs/solutions/` for future searchability. `/super-aidlc:compound-refresh` maintains knowledge base quality.

## Step 1: Detect Workspace

Before anything else, determine workspace type:

**Greenfield** -- no existing source code, no aidlc-docs/.
- Will need harness setup (test runner, linter, CLAUDE.md).

**Brownfield** -- existing code.
- Scan: `aidlc-docs/` for prior design docs and build logs.
- Scan: `.kiro/specs/` for existing Kiro specs (if present).
- Scan: `CLAUDE.md`, `README.md`, recent `git log --oneline -10`.
- Reference prior decisions and conventions throughout the session.

### Cross-Session Learning (Three-Layer Knowledge System)

Super-AIDLC v4 uses a three-layer knowledge system, searched in this order:

**Layer 1: Conventions** (`aidlc-docs/patterns.md`)
- Distilled cross-task conventions (50 lines max).
- Read FIRST by the Researcher. Contains conventions, anti-patterns, stack decisions.

**Layer 2: Structured Solutions** (`aidlc-docs/solutions/`)
- Structured knowledge base with YAML frontmatter for searchability.
- Created by `/super-aidlc:compound` after solving non-trivial problems.
- Organized by category: `runtime-issues/`, `patterns/`, `security-issues/`, etc.
- Searched by module, component, tags. Stale docs deprioritized.
- Maintained by `/super-aidlc:compound-refresh` (Keep/Update/Consolidate/Replace/Delete).

**Layer 3: Build Logs** (`aidlc-docs/*/build-log.md`)
- Per-session history with summary sections for quick scanning.
- Select 3 most relevant by task similarity (not recency).
- Extract: Issues Encountered, Decisions Made, Alternatives Considered.

**Layer 2b: Global Solutions** (`~/.aidlc/global-solutions/`)
- Cross-project knowledge shared across all your projects.
- Created by `/super-aidlc:compound` when a solution is language/tool-generic.
- Lower priority than project-local -- fills gaps when no local match.

**Search process:**
1. Read `aidlc-docs/patterns.md` (Layer 1 -- conventions).
2. Search `aidlc-docs/solutions/` frontmatter by module/component/tags (Layer 2 -- project knowledge). Deep-read top 3 matches.
3. Search `~/.aidlc/global-solutions/` if Layer 2 has < 3 matches (Layer 2b -- cross-project).
4. Scan build-log summaries, select 3 most relevant, deep-read (Layer 3 -- session history).
4. Build a Session Context block and inject into every builder/reviewer prompt:

```
## Prior Knowledge
- Solution: [{title}]({path}) -- {1-line summary}
- Convention: {pattern from patterns.md}
- Dead end: {approach that failed in prior session}
- Do NOT revisit: {rejected alternative and why}
```

5. If a prior design doc exists for a SIMILAR feature, reference it.

### Continue Mode (multi-session iteration)

If the user says "continue" or "pick up where we left off", enter Continue mode:

1. **Find the most recent build log** in `aidlc-docs/` (by date in directory name).
2. **Read its Summary section** to understand what was last built.
3. **Check for incomplete work:**
   - Design doc exists but no build log? → Construction was never started. Resume at construction.
   - Build log shows "Ship approved: pending"? → Build done, ship not done. Resume at operations.
   - Build log shows batch delivery? → Check which batches are done. Resume with the next batch.
4. **Display status:**
   ```
   Continuing from: {last session date}
   Last completed: {what was built}
   Next step: {what needs to happen}

   Ready to continue? (y/n)
   ```

This prevents users from having to re-explain context that is already captured in artifacts.

### Version Iteration (v1 → v2)

When the user says "v2" or "next version" or "iterate on this":

1. Read the existing design doc for the feature.
2. Ask: "What should change in v2?" (not starting from scratch)
3. Create a NEW design doc: `aidlc-docs/{date}-{feature-slug}-v2/design.md`
4. Reference the v1 design doc's Decisions Log to avoid re-debating settled decisions.
5. The v1 build log's "Issues Encountered" section feeds directly into v2's design.

This is how Super-AIDLC handles iterative development without losing institutional knowledge.

### Compound Knowledge Commands (v4)

In addition to the main `/super-aidlc` workflow, two standalone commands manage the knowledge base:

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/super-aidlc:compound` | Extract structured solution from current session | After solving non-trivial bugs, discovering patterns |
| `/super-aidlc:compound-refresh` | Maintain knowledge base quality | After refactors, migrations, periodically |
| `/super-aidlc:janitor` | Auto-scan and compound unprocessed sessions | Daily/weekly knowledge hygiene |

These are defined in `skills/compound/SKILL.md` and `skills/compound-refresh.md`.

### Accumulating Project Patterns

After each successful build, update `aidlc-docs/patterns.md` (create if it does not exist). This file captures cross-task conventions so they don't need to be re-extracted from build logs every time.

```markdown
# Project Patterns
Last updated: {date}

## Conventions
- {e.g., "Test framework: vitest with globals"}
- {e.g., "API prefix: /api/v1"}
- {e.g., "Error responses: { error: string, code: string }"}

## Anti-Patterns (learned the hard way)
- {e.g., "Do NOT use ts-jest -- vitest is the project standard"}
- {e.g., "Do NOT put route handlers in index.ts -- one file per handler"}

## Stack Decisions
- {e.g., "Database: SQLite via better-sqlite3 (decided in 2026-03-15 build)"}
```

Rules for patterns.md:
- Only add patterns confirmed across 2+ builds (not one-off decisions).
- Remove patterns that turned out to be wrong.
- Keep it under 50 lines. If it grows beyond that, prune the least useful entries.
- This file is the FIRST thing the Researcher reads -- it's the project's institutional memory.

This is what makes Super-AIDLC smarter over time. Each run teaches the next one.

### Kiro Specs Integration (if .kiro/ exists)

Super-AIDLC is Kiro-native. If the project has a `.kiro/` directory:

**Read existing specs BEFORE asking questions:**
1. Scan `.kiro/specs/` for existing requirements.md, design.md, tasks.md
2. Scan `.kiro/steering/` for product.md, structure.md, tech.md
3. If specs already cover the requested feature:
   - SKIP the question phase entirely
   - Use existing specs as the design doc
   - Go straight to construction
   - Display: "Found existing Kiro specs for this feature. Using them as design input."
4. If specs partially cover it:
   - Pre-fill answers from existing specs
   - Only ask questions about gaps
   - Display: "Found partial Kiro specs. I'll fill in the gaps."

**Write back to Kiro after construction:**
1. Update `.kiro/specs/{feature}/tasks.md` with completion status
2. If design changed during build, update `.kiro/specs/{feature}/design.md`

## Step 2: Assess Complexity

Determine complexity:
- **Light** -- Bug fix, small tweak, config change. Skip design, go straight to build.
- **Medium** -- New feature, moderate change. Light design + build.
- **Heavy** -- New system, multi-component, major refactor. Full design + build.

### Fast Path (Light tasks on returning projects)

If ALL of these are true, skip the confirmation prompt and go straight to construction:
- Complexity is Light
- `aidlc-docs/` already exists with at least 1 prior build log (returning project)
- Task is clearly scoped (e.g., "fix bug in X", "update config Y", "add field Z to existing model")

Display a brief status line instead:
```
Super-AIDLC | Light | {language} | {1-line summary} | Building...
```

This saves ~30 seconds of round-trip for trivial tasks on projects you already know.

### Standard Path (Medium, Heavy, or first-time Light)

Display to user:
```
Super-AIDLC
Task: {1-line summary}
Complexity: {Light / Medium / Heavy}
Workspace: {Greenfield / Brownfield}
Language: {detected language}
Plan: {Design -> Build / Build only}
Ready? (y/n)
```

Wait for confirmation.

## Step 3: Execute

**Light**: Read `phases/construction.md` and execute.
**Medium/Heavy**: Read `phases/inception.md` and execute. It will tell you when to proceed to construction.
**Heavy with high ambiguity**: If the task description is vague ("build something like...", "I want to improve..."), suggest brainstorm first: "This task has high ambiguity. Want to run a brainstorm phase first to clarify requirements? (y/n)". If yes, read `phases/brainstorm.md` and execute. Its output feeds directly into inception.

## Interruption Protocol

If the user changes requirements during the Construction phase (e.g., "wait, I want to change X" or "actually, skip Y"):

1. **Assess impact** -- which units are affected?
   - Only unstarted units? → Update the design doc, continue. No disruption.
   - Currently building units? → Let the in-progress builders finish their current RED-GREEN cycle, then stop. Discard incomplete work in those worktrees.
   - Already completed and reviewed units? → Mark them as "needs modification" in the build log. Complete the current batch first, then rework in a follow-up pass.

2. **Update the design doc** -- record the change in the Decisions Log:
   ```
   | Mid-build change | {what changed} | {user requested at construction step N} |
   ```

3. **Re-assess complexity** -- if the change fundamentally alters scope (e.g., "actually make this a microservice instead of a monolith"), STOP construction and go back to inception. This is rare but important.

4. **Resume construction** with the updated design. Builders that were not affected continue as normal.

The key principle: **never discard work that is already reviewed and passing**. Modify it in a follow-up pass instead.

## Safety Note

If the user runs destructive commands (rm -rf, git reset --hard, force push, DROP TABLE, etc.), load `guards/careful.md` and follow its protocol before executing.

## QA Routing

If the project has a UI (web app, desktop app, etc.), suggest running `phases/operations.md` QA workflow after construction completes. This is optional but recommended.

## Output Routing

Specs and design artifacts go to different locations depending on the platform:

- **Kiro projects** (`.kiro/` directory exists): write specs to `.kiro/specs/{feature}/` AND `aidlc-docs/`.
- **Claude Code projects** (all others): write to `aidlc-docs/` only.

## Question Protocol

When you need user input:
- **Group related questions.** All storage questions together, all auth questions together.
- **Provide options.** Each question has 2-3 concrete choices with trade-offs + your recommendation.
- **Wait for answers.** Do not proceed until the user has responded.
- **Record answers.** Every decision goes into the design doc. Answers are artifacts, not chat.

Example:
```
I have a few questions about data storage before designing:

1. Database engine?
   (A) PostgreSQL -- best for relational data, complex queries
   (B) SQLite -- simplest, no server, good for CLI/desktop
   (C) DynamoDB -- serverless, auto-scaling
   -> I recommend B for this project's scale.

2. Do you need full-text search?
   (A) Yes -- I'll add a search index
   (B) No -- basic filtering is enough
   -> I recommend B for v1.
```

## Multi-Agent Dispatch Rules

When the design has multiple independent units:

1. **Load TDD rules into every builder** -- Read `rules/tdd.md` and inject its content into every builder agent's prompt.

2. **Inject session language into every subagent** -- Add `Session language: {language}` to every builder, reviewer, researcher, and architect prompt. This ensures all artifacts are in the same language.

3. **Dispatch builders in parallel** -- Use the Agent tool with `isolation: "worktree"` for each unit. Send ALL independent builders in a single message (parallel tool calls). Do NOT build sequentially if units are independent.

4. **Dispatch TWO reviewers after each builder** -- First spec-reviewer (`agents/spec-reviewer.md`), then quality-reviewer (`agents/quality-reviewer.md`). Quality review only runs after spec review passes. See `rules/review-protocol.md`.

5. **Merge results** -- After all units pass both reviews, merge worktrees to main branch.

6. **Load verification gate before any completion claim** -- Read `guards/verification.md` before claiming anything is done. Evidence before assertions.

This is NOT optional. Parallel dispatch, TDD, and two-stage review are what make this skill different.

## Autonomy

For a project's first super-aidlc run: ask the user at every design decision and review.

For returning projects (aidlc-docs/ already exists with prior runs): you may auto-approve simple design decisions that follow established patterns. Still ask for any decision that changes architecture, adds dependencies, or affects security.

Check `aidlc-docs/` at the start -- if prior design docs and build logs exist, reference them for conventions and patterns.

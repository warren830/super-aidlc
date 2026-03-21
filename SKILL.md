---
name: super-aidlc
description: Structured development with mandatory design docs, parallel agent builds, TDD enforcement, and two-stage code review. Use for any task beyond a trivial bug fix.
argument-hint: [describe what you want to build]
model: opus
---

# Super-AIDLC

The user wants to: $ARGUMENTS

## Iron Laws

These four rules are non-negotiable. Detail lives in the referenced files.

1. **No production code without a failing test first** -- see `rules/tdd.md`
2. **No fixes without root-cause investigation first** -- see `agents/debugger.md`
3. **No completion claims without fresh verification evidence** -- see `guards/verification.md`
4. **No shipping without all-green verification loop** -- tests, build, and lint must all pass. Failures are auto-fixed up to 3 times.

## Three Beliefs

1. **Repository is the system of record** -- if a decision is not written to a file, it does not exist.
2. **Mechanical enforcement over documentation** -- prefer a lint rule over a comment, a test over a design-doc paragraph.
3. **Design before code, review before merge** -- no exceptions for Medium/Heavy tasks.

## What Makes This Different From Plan Mode

If you skip any of these, you are just doing plan mode. The whole point is these 7 things:

1. **Ask structured questions BEFORE designing** -- not open-ended; with options and recommendations.
2. **Create design documents BEFORE code** -- actual .md files with architecture, error maps, diagrams.
3. **Dispatch parallel builder agents** -- independent units build simultaneously in worktrees.
4. **Dispatch TWO reviewer agents** -- spec-reviewer then quality-reviewer, sequentially, before merge.
5. **Create persistent artifacts** -- aidlc-docs/ that accumulate across sessions.
6. **Auto-verification loop** -- tests/build/lint are run automatically; failures trigger the debugger agent and re-verify until all green or 3 iterations.
7. **Cross-session learning** -- reads prior build logs to avoid repeating mistakes and follow established patterns.

## Step 1: Detect Workspace

Before anything else, determine workspace type:

**Greenfield** -- no existing source code, no aidlc-docs/.
- Will need harness setup (test runner, linter, CLAUDE.md).

**Brownfield** -- existing code.
- Scan: `aidlc-docs/` for prior design docs and build logs.
- Scan: `.kiro/specs/` for existing Kiro specs (if present).
- Scan: `CLAUDE.md`, `README.md`, recent `git log --oneline -10`.
- Reference prior decisions and conventions throughout the session.

### Cross-Session Learning

If `aidlc-docs/` contains prior build logs, extract and apply lessons:

1. **Read the last 3 build-log.md files** (most recent first)
2. Extract from each:
   - "Issues Encountered" -- avoid repeating the same mistakes
   - "Decisions Made During Build" -- follow established patterns
   - "Alternatives Considered" -- don't re-evaluate rejected options
3. **Build a Session Context block** and inject into every builder/reviewer prompt:

```
## Lessons from Prior Runs
- {issue from build-log-1}: {how it was resolved}
- Convention: {pattern established in prior run}
- Do NOT revisit: {rejected alternative and why}
```

4. If a prior design doc exists for a SIMILAR feature, reference it:
   "The {prior feature} used {pattern}. Follow the same pattern unless requirements differ."

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

Display to user:
```
Super-AIDLC
Task: {1-line summary}
Complexity: {Light / Medium / Heavy}
Workspace: {Greenfield / Brownfield}
Plan: {Design -> Build / Build only}
Ready? (y/n)
```

Wait for confirmation.

## Step 3: Execute

**Light**: Read `phases/construction.md` and execute.
**Medium/Heavy**: Read `phases/inception.md` and execute. It will tell you when to proceed to construction.

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

2. **Dispatch builders in parallel** -- Use the Agent tool with `isolation: "worktree"` for each unit. Send ALL independent builders in a single message (parallel tool calls). Do NOT build sequentially if units are independent.

3. **Dispatch TWO reviewers after each builder** -- First spec-reviewer (`agents/spec-reviewer.md`), then quality-reviewer (`agents/quality-reviewer.md`). Quality review only runs after spec review passes. See `rules/review-protocol.md`.

4. **Merge results** -- After all units pass both reviews, merge worktrees to main branch.

5. **Load verification gate before any completion claim** -- Read `guards/verification.md` before claiming anything is done. Evidence before assertions.

This is NOT optional. Parallel dispatch, TDD, and two-stage review are what make this skill different.

## Autonomy

For a project's first super-aidlc run: ask the user at every design decision and review.

For returning projects (aidlc-docs/ already exists with prior runs): you may auto-approve simple design decisions that follow established patterns. Still ask for any decision that changes architecture, adds dependencies, or affects security.

Check `aidlc-docs/` at the start -- if prior design docs and build logs exist, reference them for conventions and patterns.

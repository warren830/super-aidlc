# Phase: Construction

> When you read this file, output: `[CONSTRUCTION PHASE]`

## Pre-flight

If complexity is Medium/Heavy, verify design doc exists at `aidlc-docs/`. If it does not exist, STOP -- go back to `phases/inception.md` first.

If complexity is Light (bug fix), skip the pre-flight.

## Step 1: Set Up Harness (if needed)

Quick check -- does the project have:
- [ ] Test runner? (`npm test`, `pytest`, `go test`, etc.)
- [ ] Linter? (`eslint`, `ruff`, `golangci-lint`, etc.)
- [ ] CLAUDE.md or project docs?
- [ ] .gitignore?

### If this is a NEW project (greenfield Heavy), set up:

**Directory structure** -- follow the language's standard layout:
- Go: `cmd/`, `internal/`, `pkg/`
- Python: `src/{package}/`, `tests/`
- Node/TS: `src/`, `tests/` or colocated `*.test.ts`
- Other: follow the community convention, do not invent your own

**CLAUDE.md** -- create a concise project map (~50 lines max):
- What this project is (1-2 sentences)
- Directory structure
- Build/test/lint commands
- Key conventions
- What NOT to do (anti-patterns specific to this project)

**Test + Lint config** -- set up in the project's build tool (package.json, pyproject.toml, go.mod, etc.)

**Docs structure**:
```
aidlc-docs/          # Super-AIDLC artifacts (design docs, build logs)
docs/                # Project docs (if needed)
```

### If this is an EXISTING project, skip all of this. Use what is already there.

## Step 2: Gather Context (for existing projects)

If this is a brownfield project, dispatch a **Researcher Agent** (`agents/researcher.md`) to gather context for the builders:

```
Agent(
  prompt: "<agents/researcher.md content>
  Task: Building {feature} -- units: {list from design doc}
  Search scope: src/, tests/, existing code
  Question: What existing code, interfaces, and patterns should
  the builders follow or integrate with?",
  description: "Research for build: {feature}"
)
```

Pass the Researcher's summary into each Builder's prompt below. This prevents builders from wasting context on unrelated code.

Skip for greenfield projects.

## Step 3: Build Units

### CRITICAL: Load TDD Rules

Before dispatching ANY builder, read `rules/tdd.md` and inject its full content into every builder agent's prompt. TDD is not optional.

### If design has multiple independent units -- DISPATCH IN PARALLEL:

For each independent unit, dispatch a Builder Agent using the Agent tool:

```
Agent(
  prompt: "<paste agents/builder.md content here>

  --- TDD Rules (mandatory) ---
  <paste rules/tdd.md content here>

  --- Context ---
  Project context: <CLAUDE.md or Researcher summary>
  Unit to build: <unit name and description from design doc>
  Design doc: <relevant section of design doc>
  Error/Rescue Map: <relevant rows from error map>

  Build this unit following TDD: write failing test first, then minimal
  implementation, verify at each step. Run tests and lint before finishing.",

  isolation: "worktree",
  description: "Build unit: {name}"
)
```

### Parallel Dispatch Protocol

When the design doc marks N units as independent (Can Parallel? = Yes):

1. Read ALL builder prompts in advance
2. Send ALL N Agent() calls in a SINGLE message -- this is what makes them parallel
3. Each builder gets: isolation: "worktree", its own unit spec, TDD rules, project context
4. DO NOT await one builder before dispatching the next
5. After ALL builders complete, collect results and proceed to review

Example for 3 parallel units:

In a SINGLE message, send these three tool calls:

```
Agent(prompt: "...", isolation: "worktree", description: "Build unit: U1")
Agent(prompt: "...", isolation: "worktree", description: "Build unit: U2")
Agent(prompt: "...", isolation: "worktree", description: "Build unit: U3")
```

This is NOT the same as running them sequentially. The Agent tool runs all three
simultaneously when they appear in the same message. This is Super-AIDLC's key
speed advantage on Heavy tasks.

After all builders complete, check results. If any failed, fix and retry (max 2 attempts, then escalate to user with diagnosis).

### Merge Protocol for Worktree Results

After all parallel builders complete:
1. Check each builder's report for PASS/FAIL
2. If any FAIL: fix in the failed worktree, do NOT restart others
3. When all PASS: merge each worktree branch to main sequentially
4. After merge: run full test suite to catch integration issues
5. If integration tests fail: use agents/debugger.md to investigate

### If only one unit or sequential dependencies -- build directly:

Follow TDD: write failing tests first, then implementation, then run tests + lint.

## Step 4: Two-Stage Review

After code is written (whether by parallel agents or directly), run the two-stage review protocol. See `rules/review-protocol.md` for the full rationale.

### Stage 1: Spec Compliance Review

Dispatch the spec reviewer:

```
Agent(
  prompt: "<paste agents/spec-reviewer.md content here>

  ## What Was Requested
  <design doc / unit spec -- full text of requirements>

  ## What Builder Claims They Built
  <builder's report>

  ## Code Changes
  <git diff or file list>

  Read the actual code. Do not trust the builder's report.
  Verify: missing requirements, extra features, misunderstandings.",

  description: "Spec review: {what was built}"
)
```

If FAIL: fix the specific issues, re-run spec review (max 2 rounds). If still failing, escalate to user.

### Stage 2: Code Quality Review

**Only dispatch after Stage 1 passes.**

```
Agent(
  prompt: "<paste agents/quality-reviewer.md content here>

  Review the following changes:
  <git diff or file list>

  Design doc for context:
  <design doc content>

  Spec review has already passed. Focus on code quality:
  security, correctness, data integrity, edge cases, performance.",

  description: "Quality review: {what was built}"
)
```

If FAIL: fix the specific issues, re-run quality review (max 2 rounds). If still failing, escalate to user.

**This two-stage review is NOT optional.** Every piece of code gets both reviews before the user sees it.

## Step 5: Coverage Audit

After all units pass both reviews, before integration:

1. Run test coverage: `npm test -- --coverage` (or equivalent for the project's language).
2. Flag any new code with less than 80% line coverage.
3. If coverage gaps exist, write additional tests to cover them (following TDD).
4. Re-run coverage to confirm.

If coverage tooling is not available, note it in the build log and proceed.

## Step 6: Auto-Verification Loop

After all units pass review and coverage audit, run the verification loop:

### The Loop

```
REPEAT until all green OR max 3 iterations:
  1. Run full test suite -> if FAIL -> dispatch debugger agent -> fix -> continue
  2. Run build/compile -> if FAIL -> read errors -> fix -> continue
  3. Run linter -> if FAIL -> fix lint errors -> continue
  4. All pass? -> EXIT loop (success)
```

### Implementation

```
# Iteration 1
Run: {test command from CLAUDE.md or package.json}
If exit code != 0:
  Read error output
  Dispatch debugger: Agent(prompt: "<agents/debugger.md> Fix: {error}", description: "Fix test: {error summary}")
  After fix: go to step 1 (re-run tests)

Run: {build command}
If exit code != 0:
  Read error output
  Fix compilation errors directly (these are usually straightforward)
  After fix: go to step 1 (re-run from tests)

Run: {lint command}
If exit code != 0:
  Fix lint errors directly
  After fix: go to step 1 (re-run from tests)

All pass? -> DONE. Proceed to Step 7.
```

### Max iterations: 3

If still failing after 3 iterations, STOP and escalate to user:
```
Verification loop failed after 3 iterations.

Remaining issues:
- {list of failing tests or errors}

What I've tried:
- Iteration 1: {what was fixed}
- Iteration 2: {what was fixed}
- Iteration 3: {what was fixed}

I need your help to resolve this.
```

This auto-fix loop is what makes Super-AIDLC deliver WORKING code, not just code
that was "written and reviewed." The loop continues until tests/build/lint all pass
or the maximum iterations are reached.

## Step 7: Ship Offer

After integration passes, offer to ship:

```
Build complete. Ready to ship?
- I can create a PR with summary, test results, and design doc link.
- Or you can review the changes first.

Ship? (y/n)
```

If yes, follow `phases/operations.md` ship workflow (if available) or:
1. Create meaningful commit(s) -- one per unit or one combined.
2. Push branch.
3. Create PR (if applicable).

## Step 8: Record

Append to `aidlc-docs/{date}-{feature-slug}/build-log.md`:

```markdown
# Build Log: {feature name}

## Summary
- Date: {date}
- Units: {count} ({count parallel} / {count sequential})
- Tests: {count} passing, coverage: {percent}
- Spec Review: {PASS / FAIL -> PASS after N rounds}
- Quality Review: {PASS / FAIL -> PASS after N rounds}

## What Was Built
{1-2 sentences per unit}

## Issues Encountered
{Any problems and how they were resolved. "None" if clean.}

## Approvals
- Design approved: {timestamp or "auto-proceed for Light complexity"}
- Security baseline: {enabled / skipped (reason)}
- Ship approved: {timestamp or "pending"}

## Alternatives Considered
See design doc for architecture/storage alternatives. Add any NEW alternatives discovered during build:

| Option | Verdict | Reason |
|--------|---------|--------|
| {Option discovered during build} | Rejected/Selected | {why} |

## Decisions Made During Build
{Any implementation decisions not in the design doc.
These feed back into the design doc or CLAUDE.md for next time.}
```

This log is for future reference -- next time super-aidlc runs on this project, it reads prior logs to understand conventions and avoid repeating mistakes.

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
  Error/Rescue Map: <relevant rows where this unit is Owner>
  Interface Contracts: <rows where this unit is Provider or Consumer -- follow these exactly>

  Build this unit following TDD: write failing test first, then minimal
  implementation, verify at each step. Run tests and lint before finishing.
  If this unit is a Provider in the Interface Contracts table, your implementation
  MUST match the contract signature and return shape exactly.
  If this unit is a Consumer, code against the contract shape (mock the Provider if needed).",

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

### Builder Timeout

When dispatching parallel builders, expect these approximate completion times:

| Unit Size | Expected Time | Concern Threshold |
|-----------|--------------|-------------------|
| Small (1-2 files) | 2-5 min | > 10 min |
| Medium (3-5 files) | 5-10 min | > 20 min |
| Large (6+ files) | 10-20 min | > 30 min |

If a builder significantly exceeds the concern threshold while others have finished:
1. Do NOT wait indefinitely. Proceed with review and merge for completed builders.
2. Check the stalled builder's last output for signs of an infinite loop, blocked resource, or scope creep.
3. Report to the user: "Builder for {unit} is taking longer than expected. Other units are ready. Options: (A) Keep waiting (B) Cancel and investigate."

After all builders complete (or stalled builders are resolved), check results. If any failed, fix and retry (max 2 attempts, then escalate to user with diagnosis).

### Merge Protocol for Worktree Results

After all parallel builders complete:
1. Check each builder's report for PASS/FAIL
2. If any FAIL: fix in the failed worktree, do NOT restart others
3. When all PASS: merge each worktree branch to main sequentially (see Conflict Resolution below)
4. After merge: verify interface contracts (see Step 3b)
5. Run full test suite to catch integration issues
6. If integration tests fail: use agents/debugger.md to investigate

### Conflict Resolution

When merging worktree branches, conflicts WILL happen (e.g., two builders both add exports to an index file, both add routes to a router, both extend a shared type).

For each merge:

```
1. git merge --no-commit {worktree-branch}
2. If clean merge: git commit and continue to next branch
3. If conflicts:
   a. Read each conflicted file
   b. Check the design doc's Interface Contracts table for the intended shape
   c. Resolve by combining both builders' contributions:
      - Import/export lists: merge both sets
      - Type definitions: union both sets of fields
      - Router/handler registrations: include both
      - Logic conflicts (two builders changed the same function):
        escalate to user with both versions and the design doc context
   d. After resolving: run the FULL test suite (not just the conflicting unit's tests)
   e. If tests fail after resolution: dispatch debugger agent
   f. If the conflict involved logic changes (not just additive merges):
      re-run quality review on the conflicted files only
4. Continue to next branch
```

**Additive conflicts** (both sides add lines to the same region) are safe to auto-resolve by keeping both. **Semantic conflicts** (both sides change the same logic) require user input -- do not guess.

After ALL branches are merged, run the full test suite once more as a final integration check.

### Shared Utility Deduplication

After merging all worktrees, check for duplicate utilities:

1. Scan new files for similar helper functions (e.g., two units both created a `validatePath()` or `formatError()` helper).
2. If duplicates are found:
   a. Keep the more complete or better-tested version.
   b. Update the other unit's imports to point to the shared version.
   c. Delete the duplicate.
   d. Re-run tests to confirm.
3. If no duplicates: skip this step.

This is a quick post-merge cleanup, not a refactoring session. Only deduplicate obvious duplicates -- functions with the same purpose and similar signatures. Do not merge functions that happen to look similar but serve different domains.

### If only one unit or sequential dependencies -- build directly:

Follow TDD: write failing tests first, then implementation, then run tests + lint.

## Step 3b: Interface Contract Verification

If the design doc has an Interface Contracts table (units with cross-unit dependencies), verify contracts after merge and before review.

For each contract row:
1. Find the Provider's implementation: does it return the exact shape specified?
2. Find the Consumer's usage: does it expect the exact shape specified?
3. If the project uses TypeScript/Go/Rust/Java: compile. Type errors = contract violations.
4. If the project uses Python/JS: write a quick integration test that passes real data from Provider to Consumer.

```
For each contract in Interface Contracts table:
  1. Read Provider code: does {function} return {shape}?
  2. Read Consumer code: does it consume {shape} correctly?
  3. If mismatch: fix the side that deviates from the contract (the contract is the source of truth)
  4. Re-run tests for both units
```

If no Interface Contracts section exists (all units independent), skip this step.

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

After all units pass review and coverage audit, run the verification loop.

### Checkpoint (before verification)

Before entering the verification loop, create a rollback checkpoint:

```bash
git tag super-aidlc-checkpoint-$(date +%Y%m%d-%H%M%S)
```

This ensures the user can recover if verification fails 3 times and leaves the codebase in a broken state. The tag is cleaned up on success (see below).

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

If still failing after 3 iterations, STOP and escalate to user with rollback option:
```
Verification loop failed after 3 iterations.

Remaining issues:
- {list of failing tests or errors}

What I've tried:
- Iteration 1: {what was fixed}
- Iteration 2: {what was fixed}
- Iteration 3: {what was fixed}

Options:
(A) I'll keep trying with your guidance
(B) Rollback to pre-build state: git reset --hard super-aidlc-checkpoint-{timestamp}
(C) Keep current state and fix manually

I recommend (A) if the remaining issues look solvable, (B) if the build is fundamentally broken.
```

This auto-fix loop is what makes Super-AIDLC deliver WORKING code, not just code
that was "written and reviewed." The loop continues until tests/build/lint all pass
or the maximum iterations are reached.

### Checkpoint Cleanup

On verification success, delete the checkpoint tag:

```bash
git tag -d super-aidlc-checkpoint-{timestamp}
```

The checkpoint only exists to provide a safety net. Once all-green is confirmed, it is no longer needed.

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

## Timing
- Inception: {duration} (questions: {duration}, design: {duration}, design review: {duration})
- Construction: {duration}
  - {unit name} ({parallel/sequential}): {duration}
  - ...
  - Bottleneck: {slowest unit name} at {duration}
- Review: {duration} (spec: {duration}, quality: {duration})
- Verification: {duration} ({N} iterations)
- Total: {duration}

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

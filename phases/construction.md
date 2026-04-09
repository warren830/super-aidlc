# Phase: Construction

> When you read this file, output: `[CONSTRUCTION PHASE]`

## Pre-flight

If complexity is Medium/Heavy, verify design doc exists at `aidlc-docs/`. If it does not exist, STOP -- go back to `phases/inception.md` first.

If complexity is Light (bug fix), skip the pre-flight.

## Step 0b: Plan-Design Alignment Check (Medium/Heavy only)

Before building, verify the construction plan aligns with the approved design. Superpowers' community found that plans and designs always drift apart (issue #602). This step catches that drift.

For each unit in the design doc's Units of Work table:
1. **Requirements check**: Does the unit's description match a requirement from the design doc?
2. **Interface check**: If the unit has Interface Contracts, are they still consistent with the Architecture section?
3. **Error check**: Does the unit's assigned Error/Rescue Map rows match the current error map?
4. **Scope check**: Are there any units that were added or removed since the design was approved?

If misalignment found:
- Minor (naming differences, reordering): fix silently, note in build log.
- Major (missing units, conflicting interfaces, changed scope): STOP and ask user before proceeding.

This takes ~30 seconds and prevents building the wrong thing.

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

**Repository pollution prevention** (Superpowers issue #807):

`aidlc-docs/` is a working directory, not a deliverable. Add it to `.gitignore` by default:

```bash
# Check if aidlc-docs/ is already in .gitignore
if [ -f .gitignore ] && ! grep -q 'aidlc-docs/' .gitignore; then
  echo '# Super-AIDLC working artifacts (design docs, build logs)' >> .gitignore
  echo 'aidlc-docs/' >> .gitignore
fi
```

If the user WANTS to commit design docs (recommended for team projects), they can:
1. Remove `aidlc-docs/` from .gitignore
2. Or use `git add -f aidlc-docs/` to force-add specific files

This prevents the "I found 14 files I didn't ask for" experience that plagues other methodologies.

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

### Strategy Selection (auto)

At the start of Step 3, select an execution strategy based on the design doc's Units of Work:

| Condition | Strategy | When |
|-----------|----------|------|
| units <= 2 AND total files <= 4 | **INLINE** | Trivial tasks, no agent overhead needed |
| units have dependencies OR shared file paths | **SERIAL** | Units depend on each other or touch same files |
| all units independent, no file overlap | **PARALLEL** | Maximum speed for independent units |

**File overlap detection** (critical for PARALLEL): Before selecting PARALLEL, scan each unit's file list from the design doc. If ANY two units list the same file path, downgrade to SERIAL. Conflict prevention is cheaper than conflict resolution.

Display to user:
```
Strategy: {INLINE|SERIAL|PARALLEL} ({N} units, {reason})
```

### Task Tracking (SERIAL and PARALLEL only)

Before dispatching builders, create a task for each unit:
```
TaskCreate(subject: "Build: {unit name}", description: "{unit description}", activeForm: "Building {unit name}")
```

If units have dependencies:
```
TaskUpdate(taskId: "{U2-id}", addBlockedBy: ["{U1-id}"])
```

Update tasks as builders progress:
- Dispatched → `TaskUpdate(status: "in_progress")`
- DONE → `TaskUpdate(status: "completed")`
- DONE_WITH_CONCERNS → `TaskUpdate(status: "completed", description: "Concerns: {list}")`
- BLOCKED → leave in_progress, update description with block reason

### INLINE Mode

For trivial 1-2 unit tasks with few files. The orchestrator builds directly:

1. Follow TDD rules from `rules/tdd.md` inline (no Agent() calls).
2. Write failing test → minimal implementation → verify → refactor.
3. Run tests + lint when done.
4. No task tracking overhead.

### SERIAL Mode (with Knowledge Injection)

One Agent() per unit, dispatched sequentially. Each agent works on the current branch.

```
Agent(
  prompt: "<agents/builder.md> + <rules/tdd.md> + {unit spec} + {accumulated context}",
  description: "Build unit: {name}"
)
```

After each unit completes, inject THREE sources of accumulated context into the next builder:

```
## Accumulated Context from Prior Units

### From Unit {N}'s Builder Report:
- Assumptions: {extracted from report}
- Interfaces created: {function signatures, types, API shapes}
- Decisions: {why they chose approach X over Y}

### From Unit {N}'s Self-Check:
- Test patterns: {e.g., "vitest with in-memory SQLite"}
- Files created: {exact paths the next builder can import}

### From Integration Results (if prior units merged):
- Issues found: {post-merge failures and resolutions}
- Shared utilities available: {paths to helpers}
```

This prevents the "subagent amnesia" problem where each agent starts fresh.

### PARALLEL Mode (with Worktree-First Fallback)

All agents dispatched in a SINGLE message for true parallelism.

**Phase 1: Worktree dispatch (preferred)**

```
Agent(prompt: "...", isolation: "worktree", description: "Build unit: U1")
Agent(prompt: "...", isolation: "worktree", description: "Build unit: U2")
Agent(prompt: "...", isolation: "worktree", description: "Build unit: U3")
```

All three run simultaneously. This is Super-AIDLC's key speed advantage.

**Phase 2: Detect worktree failure**

If ANY agent fails with a worktree error (hook blocked creation, permission denied, `.git/worktrees` error), treat ALL agents as failed. All-or-nothing -- mixing isolation modes creates merge complexity.

**Phase 3: Background fallback (redispatch)**

Redispatch ALL agents in one message with `run_in_background: true` and explicit file boundaries:

```
Agent(
  prompt: "... 
  ## File Boundary (STRICT -- non-isolated parallel mode)
  You may ONLY create or modify these files:
  - {file list from design doc for this unit}
  Do NOT touch any file outside this list. Other builders are working simultaneously.",
  run_in_background: true,
  description: "Build unit: {name}"
)
```

File lists come from the design doc. Strategy selection already verified no overlap.

**Builder prompt template** (both worktree and background modes):

```
Agent(
  prompt: "<agents/builder.md content>
  --- TDD Rules (mandatory) ---
  <rules/tdd.md content>
  --- Context ---
  Project context: <CLAUDE.md or Researcher summary>
  Unit to build: <unit spec from design doc>
  Error/Rescue Map: <rows where this unit is Owner>
  Interface Contracts: <rows where this unit is Provider or Consumer>
  {File Boundary section if background fallback mode}",
  description: "Build unit: {name}"
)
```

### Builder Timeout

| Unit Size | Expected Time | Concern Threshold |
|-----------|--------------|-------------------|
| Small (1-2 files) | 2-5 min | > 10 min |
| Medium (3-5 files) | 5-10 min | > 20 min |
| Large (6+ files) | 10-20 min | > 30 min |

If a builder exceeds threshold while others have finished:
1. Do NOT wait indefinitely. Proceed with completed builders.
2. Report: "Builder for {unit} is taking longer than expected. Options: (A) Keep waiting (B) Cancel."

### Status Aggregation

After all builders complete, display aggregated status:

```
Build Status:
  U1 (auth-service):    DONE                    [2 min]
  U2 (api-routes):      DONE_WITH_CONCERNS      [4 min]
    → response shape differs from contract for GET /users
  U3 (data-layer):      DONE                    [3 min]
  U4 (worker):          BLOCKED                 [1 min]
    → needs queue config created by U3
```

Handle each status:
- **DONE** → proceed to merge/review.
- **DONE_WITH_CONCERNS** → pass concern text to spec reviewer context for explicit attention.
- **BLOCKED** → if blocked by another unit's output, redispatch with missing context. If blocked by environment issue, escalate to user.

### Plan Deviation Check (after status aggregation)

Before proceeding to review, verify builders didn't deviate from the design doc:

For each builder report, check:
1. **Technology match**: did the builder use the technology specified in the design doc? (e.g., plan says gRPC → builder used gRPC, not JSON-over-HTTP)
2. **Scope match**: did the builder build only what was specified? (no extra features, no missing features)
3. **Interface match**: do the interfaces match Interface Contracts?

If ANY builder deviated from the plan's technology choices:
- **STOP review**. Fix the deviation first.
- Redispatch the builder with explicit instruction: "The plan specifies {X}. Use {X}, not {Y}. Add dependencies if needed."

This check exists because agents optimize for simplicity and will silently substitute technologies when the codebase doesn't match assumptions.

### Merge Protocol (PARALLEL worktree mode only)

After all parallel builders complete with DONE/DONE_WITH_CONCERNS:

For each worktree branch:
```
1. git merge --no-commit {worktree-branch}
2. If clean merge: git commit, update task, continue
3. If conflicts:
   a. Classify: additive (both add lines) vs semantic (both change same logic)
   b. Auto-resolve additive conflicts (keep both sides)
   c. Run full test suite
   d. If tests pass: commit, continue
   e. If tests fail OR semantic conflicts:
      - Dispatch debugger agent with both versions + Interface Contract
      - If debugger resolves: commit, continue
      - If debugger fails: escalate to user
4. Max 2 attempts per branch (1 auto + 1 debugger-assisted)
```

For **background fallback mode**: no merge step needed (same branch). Run full test suite directly.

After ALL branches merged, run full test suite as final integration check.

### Shared Utility Deduplication

After merging, check for duplicate utilities:

1. Scan new files for similar helpers (e.g., two units both created `validatePath()`).
2. Keep the more complete version, update imports, delete duplicate, re-run tests.
3. If no duplicates: skip.

Quick post-merge cleanup only. Do not refactor unrelated code.

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
  4. Run dependency audit (if security baseline enabled) -> if CRITICAL CVE -> fix or flag -> continue
  5. All pass? -> EXIT loop (success)
```

### Dependency Audit (if security baseline enabled)

Run the appropriate audit command from `extensions/security-baseline.md`:
- Node.js: `npm audit --audit-level=critical`
- Python: `pip-audit` (if installed)
- Go: `govulncheck ./...` (if installed)
- Rust: `cargo audit` (if installed)

If the audit tool is not available, note "Dependency audit: tool not available" in the build log and continue. Do not fail the build for a missing tool -- fail only for actual vulnerabilities found.

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

Append to `aidlc-docs/{date}-{feature-slug}/build-log.md` (in the session language -- see SKILL.md Language Selection):

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

## Metrics
- Complexity: {Light / Medium / Heavy}
- Strategy: {INLINE / SERIAL / PARALLEL}
- Total time: {seconds}
- Inception time: {seconds}
- Build time: {seconds}
- Review time: {seconds}
- Verify iterations: {count}
- Test count: {count}
- Test coverage: {percent or "N/A"}
- Issues encountered: {count}
- Decisions made: {count}
- Reviewer findings: {P0: N, P1: N, P2: N, P3: N}
- Security vulns: {count}
- Compound score: {0-9}
- Compound action: {auto / suggested / skipped}
```

This log is for future reference -- next time super-aidlc runs on this project, it reads prior logs to understand conventions and avoid repeating mistakes. The Metrics section is structured for `/super-aidlc:metrics` trend analysis.

## Step 9: Auto-Compound Evaluation

After recording the build log, automatically evaluate whether this session is worth compounding. Score on 4 signals:

| Signal | Points | How to Detect |
|--------|--------|--------------|
| Debugger invoked | +3 | Step 6 dispatched debugger agent (Issues Encountered is non-empty) |
| Multiple verification iterations | +2 | Step 6 ran > 1 iteration |
| New conventions established | +2 | Step 8 build log "Decisions Made" is non-empty |
| Architectural decisions | +1 | Design doc "Alternatives Considered" has entries |

**Act on score:**

| Score | Action |
|-------|--------|
| **>= 3** | Auto-compound: run compound extraction immediately, no prompt |
| **1-2** | Suggest: "This session scored {N} -- worth compounding? (y/n)" |
| **0** | Skip silently. Display: "Clean build, no knowledge to compound." |

**Auto-compound runs the same 3-agent extraction as `/super-aidlc:compound`:** Context Analyzer + Solution Extractor + Related Docs Finder → write to `aidlc-docs/solutions/{category}/`.

For sessions that score 0, knowledge still lives in the build log and patterns.md. Compound just makes it structured and searchable for the Researcher in future sessions.

The standalone `/super-aidlc:janitor` command can retroactively scan past sessions that were missed.

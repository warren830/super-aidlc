# Super-AIDLC v3 Implementation Plan

## Vision

Combine the best of three worlds into one unified skill for **Kiro + Claude Code**:

| Source | What We Take |
|--------|-------------|
| **AIDLC-workflows** | Adaptive lifecycle, documentation-driven, audit trail, extension system |
| **Superpowers** | TDD iron law, sub-agent context isolation, two-stage review, rationalization prevention, verification gate |
| **gstack** | Browser QA, safety guards (careful/freeze), investigate debugging, ship automation, coverage audit |

## Target Platforms

- **Kiro**: `.kiro/skills/super-aidlc/` (primary)
- **Claude Code**: `.claude/skills/super-aidlc/` (primary)
- Codex/Cursor: not in scope

## Architecture

```
super-aidlc/
├── SKILL.md                          # Entry: complexity assessment + routing
├── phases/
│   ├── inception.md                  # Design: questions -> design doc -> approval
│   ├── construction.md               # Build: TDD + parallel agents + two-stage review
│   └── operations.md                 # QA + Ship: browser QA, release, doc update
├── agents/
│   ├── researcher.md                 # Context filter (30-80 lines, cite sources)
│   ├── architect.md                  # Design doc producer (no code)
│   ├── builder.md                    # TDD enforced builder in worktree
│   ├── spec-reviewer.md              # Pass 1: spec compliance (don't trust report)
│   ├── quality-reviewer.md           # Pass 2: security + code quality
│   ├── qa.md                         # Browser QA with Playwright (optional)
│   └── debugger.md                   # Root-cause investigation (no guessing)
├── guards/
│   ├── careful.md                    # Destructive command warnings
│   ├── freeze.md                     # Edit scope lock
│   └── verification.md              # No claims without evidence
├── rules/
│   ├── tdd.md                        # TDD iron law + rationalizations
│   ├── review-protocol.md            # Two-stage review rules
│   └── anti-patterns.md              # Testing anti-patterns
├── extensions/                       # Pluggable (from AIDLC)
│   └── security-baseline.md          # OWASP, input validation, auth
├── adapters/
│   ├── kiro/
│   │   └── install.sh                # Symlink/copy to .kiro/skills/
│   └── claude-code/
│       └── install.sh                # Symlink/copy to .claude/skills/
└── README.md
```

## File-by-File Spec

---

### 1. SKILL.md (Entry Point)

**Base**: super-aidlc-archive v2 SKILL.md
**Enhancements**:

```
From v2 (keep):
- Complexity routing: Light / Medium / Heavy
- 5 differentiators vs plan mode
- Question protocol with options + recommendations
- Multi-agent dispatch rules
- Autonomy rules (first run vs returning)

From AIDLC (add):
- Workspace detection (greenfield vs brownfield)
- Pre-scan existing aidlc-docs/ for prior decisions
- Kiro: also scan .kiro/specs/ for existing specs

From Superpowers (add):
- Iron laws summary (3 lines, detail in rules/):
  1. No production code without failing test first
  2. No fixes without root cause investigation first
  3. No completion claims without fresh verification evidence
- Instruction: "Load rules/tdd.md before any builder dispatch"
- Instruction: "Load guards/verification.md before any completion claim"

From gstack (add):
- Safety note: "If user runs destructive commands, load guards/careful.md"
- QA routing: "If project has UI, suggest operations.md QA after build"
```

**Output routing**:
- Kiro projects: write specs to `.kiro/specs/{feature}/` AND `aidlc-docs/`
- Claude Code projects: write to `aidlc-docs/` only

---

### 2. phases/inception.md (Design Phase)

**Base**: super-aidlc-archive v2 phases/design.md
**Enhancements**:

```
From v2 (keep):
- Step 1: Ask questions (Medium vs Heavy question sets)
- Step 1.5: Researcher agent for brownfield
- Step 2: Create design doc (architecture, error map, units, decisions)
- Step 3: Present for approval (STOP gate)
- Mandatory outputs: ASCII diagram, Error/Rescue Map, Units table, Decisions Log

From AIDLC (add):
- Adaptive depth levels (not just Medium/Heavy, but within each):
  - Medium: checklist-level NFR, 3-5 question groups
  - Heavy: detailed NFR, user stories, persona mapping
- Reverse engineering stage (brownfield): auto-analyze existing code
  to generate component inventory before asking questions
- Extension opt-in: at question time, ask "Enable security baseline?"
  If yes, load extensions/security-baseline.md constraints

From Superpowers (add):
- Design review loop (max 3 iterations):
  After producing design doc, self-review against:
  1. Are all error paths covered? (Error/Rescue Map completeness)
  2. Are units truly independent? (parallel safety)
  3. Is anything over-engineered for v1?
  If issues found, fix and re-present. Max 3 rounds.

From gstack (add):
- Problem reframing (from /office-hours):
  Before questions, challenge the problem definition itself:
  "Before I ask detailed questions, let me make sure we're solving
  the right problem. Is {task} really what you need, or is the
  underlying need {reframed version}?"
  Only for Heavy complexity.
- Scope challenge (from /plan-ceo-review):
  After design doc, before approval, ask:
  "If you could only ship ONE unit from this design, which would
  deliver the most value?" — forces prioritization.
  Only for Heavy with 4+ units.
```

**Kiro-specific output**:
```
Write to .kiro/specs/{feature}/:
  - requirements.md  ← from question answers
  - design.md        ← architecture + error map + NFR
  - tasks.md         ← units of work table
Also write to aidlc-docs/{date}-{feature}/:
  - design.md        ← full design doc (single file)
```

---

### 3. phases/construction.md (Build Phase)

**Base**: super-aidlc-archive v2 phases/build.md
**Enhancements**:

```
From v2 (keep):
- Pre-flight: verify design doc exists (Medium/Heavy)
- Harness setup for greenfield (test runner, linter, CLAUDE.md)
- Researcher dispatch for brownfield build context
- Parallel builder dispatch with worktree isolation
- Reviewer dispatch after build
- Integration + test after merge
- Build log recording

MAJOR CHANGE - Two-Stage Review (from Superpowers):

Replace v2's single reviewer with TWO sequential reviewers:

  Stage 1: Spec Compliance Review (agents/spec-reviewer.md)
    - "Did you build what was asked? Nothing more, nothing less?"
    - Don't trust builder's report — read actual code
    - Check: missing requirements, extra features, misunderstandings
    - Verdict: PASS or FAIL with specific file:line issues

  Stage 2: Code Quality Review (agents/quality-reviewer.md)
    - ONLY runs after Stage 1 passes
    - Pass 1 CRITICAL: security, correctness, data integrity
    - Pass 2 IMPORTANT: edge cases, performance, conventions
    - Verdict: PASS or FAIL with specific fixes

  Flow: Builder → Spec Review → Quality Review → Merge
  If either FAIL: fix + re-review (max 2 rounds each)

MAJOR CHANGE - TDD Enforcement (from Superpowers):

Every builder agent MUST follow TDD. Inject into builder prompt:
  1. Write failing test FIRST
  2. Verify test fails (run it, see failure)
  3. Write minimal code to pass
  4. Verify test passes (run it, see green)
  5. Refactor (keep green)

  Violation = delete code, start over.
  Load rules/tdd.md into every builder agent's context.

From gstack (add):
- Coverage audit before merge:
  After all units pass review, before integration:
  "Run test coverage. Flag any new code with <80% coverage."

- Ship automation (optional, user-triggered):
  After integration passes, offer: "Ready to ship? I can create PR."
  If yes, follow phases/operations.md ship workflow.
```

---

### 4. phases/operations.md (QA + Ship) [NEW]

**Source**: gstack /qa + /ship + /document-release
**This is entirely new** — v2 had no operations phase.

```
## Browser QA (optional, for UI projects)

Prerequisites: Playwright installed (`npx playwright install`)

Workflow:
1. Launch browser, navigate to app URL
2. Test each user flow from requirements/design doc
3. For each flow:
   - Take before screenshot
   - Execute interaction sequence
   - Verify expected state
   - Take after screenshot
4. Report: pass/fail per flow, screenshots, bug list
5. For each bug found:
   - Write failing test (TDD!)
   - Fix the code
   - Verify fix in browser
   - Commit with regression test

If Playwright not available: skip browser QA, note in build log.

## Ship Workflow

Triggered by user saying "ship" or after QA passes.

1. Run full test suite (verification gate)
2. Run linter
3. Create meaningful commit(s)
4. Push branch
5. Create PR with:
   - Summary from design doc
   - Test results
   - QA results (if browser QA ran)
   - Link to design doc in aidlc-docs/

## Documentation Update

After ship:
1. Update README if public API changed
2. Update CHANGELOG with feature summary
3. Append to aidlc-docs/ build log
```

---

### 5. agents/builder.md

**Base**: super-aidlc-archive v2 agents/builder.md
**Major enhancement**: TDD enforcement from Superpowers

```
From v2 (keep):
- Build one unit in isolated worktree
- Follow existing project conventions
- Create interfaces/mocks if blocked by other units
- Report files, tests, assumptions

INJECT (from Superpowers TDD):

## The Iron Law

NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST

Write code before test? Delete it. Start over.
- Don't keep as "reference"
- Don't "adapt" it while writing tests
- Delete means delete

## Process (MANDATORY order)

1. Read design doc section for your unit
2. For each behavior to implement:
   a. RED: Write ONE failing test
   b. VERIFY RED: Run test, confirm it FAILS for the right reason
   c. GREEN: Write MINIMAL code to pass
   d. VERIFY GREEN: Run test, confirm ALL tests pass
   e. REFACTOR: Clean up, keep green
3. Run full test suite — all must pass
4. Run lint — zero warnings
5. Commit

## Rationalizations That Will Get Your Code Deleted

| Excuse | What Happens |
|--------|-------------|
| "Too simple to test" | Write the test. 30 seconds. |
| "I'll test after" | Delete code. Start TDD. |
| "Need to explore first" | Fine. Throw away exploration. Start TDD. |
| "Keep as reference" | No. Delete means delete. |

## Red Flags — STOP and restart with TDD

- Code written before test
- Test passes immediately (you're testing existing behavior)
- Can't explain why test failed
- "Just this once" rationalization

## Output

When done, report:
- Files created/modified (with paths)
- Test count: {X passing, Y new}
- TDD compliance: each test was verified RED then GREEN
- Any assumptions or decisions made
```

---

### 6. agents/spec-reviewer.md [NEW]

**Source**: Superpowers spec-reviewer-prompt.md

```
# Spec Compliance Reviewer

You verify the builder built what was requested — nothing more, nothing less.

## CRITICAL: Do Not Trust the Builder's Report

The builder may be incomplete, inaccurate, or optimistic.
You MUST verify everything independently by READING THE ACTUAL CODE.

## Process

1. Read the design doc / unit spec
2. Read the actual code changes (not just the builder's report)
3. Check line by line:

### Missing Requirements
- Did they implement everything requested?
- Are there requirements they skipped?
- Did they claim something works but didn't implement it?

### Extra/Unneeded Work
- Did they build things not requested?
- Did they over-engineer or add unnecessary features?
- Did they add "nice to haves" not in spec?

### Misunderstandings
- Did they interpret requirements differently than intended?
- Did they solve the wrong problem?

## Output

**Verdict: PASS or FAIL**

If FAIL:
- List each issue with file:line reference
- Classify: MISSING / EXTRA / MISUNDERSTOOD
- Suggest specific fix for each

If PASS:
- Confirm what was verified
- Note any minor observations (don't block on these)
```

---

### 7. agents/quality-reviewer.md

**Base**: super-aidlc-archive v2 agents/reviewer.md
**Enhancement**: Only runs AFTER spec-reviewer passes (from Superpowers two-stage pattern)

```
Keep v2 reviewer.md exactly as-is, with these additions:

## Prerequisites
This review ONLY runs after spec compliance review passes.
If spec review hasn't passed, STOP — go back to spec review first.

## Additional Checks (from Superpowers)
- Does each file have one clear responsibility?
- Are units decomposed for independent testing?
- Did this change create large new files or significantly grow existing ones?

## TDD Verification
- Are there tests for every new public function?
- Do test names describe behavior (not implementation)?
- Are mocks used only when unavoidable?
- No testing anti-patterns (testing mock behavior, test-only production methods)
```

---

### 8. agents/debugger.md [NEW]

**Source**: Superpowers systematic-debugging + gstack /investigate

```
# Debugger Agent

Systematic root-cause investigation. No guessing, no shotgun fixes.

## The Iron Law

NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST

## Four Phases

### Phase 1: Investigate (gather symptoms)
- Read error messages and stack traces completely
- Reproduce the issue (write a failing test if possible)
- Check recent changes (git log, git diff)
- Gather evidence, not opinions

### Phase 2: Analyze (trace the cause)
- Trace backward from symptom to root cause
- Follow the data flow, not the code flow
- Check each layer: input → processing → output → side effects
- Never fix at the symptom point — find the origin

### Phase 3: Hypothesize (test one thing)
- Form ONE hypothesis
- Design a test that proves or disproves it
- Run the test
- If disproved, form next hypothesis
- 3-strike rule: after 3 failed hypotheses, step back and
  question your assumptions about the architecture

### Phase 4: Implement (fix + prove)
- Write failing test that reproduces the bug (TDD!)
- Fix the root cause (not the symptom)
- Verify test passes
- Check for similar patterns elsewhere
- Commit with regression test

## Scope Lock
Do NOT fix unrelated issues found during investigation.
Note them, file them, move on. One bug at a time.

## Output
- Root cause: {what and where}
- Evidence: {how you know}
- Fix: {what changed}
- Regression test: {test file:line}
- Related risks: {similar patterns to watch}
```

---

### 9. agents/qa.md [NEW]

**Source**: gstack /qa (simplified, no gstack binary dependency)

```
# QA Agent

Browser-based QA testing using Playwright.

## Prerequisites
- Playwright installed: npx playwright install
- App running at accessible URL

## Process

1. Read requirements/design doc for expected behaviors
2. For each user flow:
   a. Navigate to starting page
   b. Execute interaction sequence
   c. Verify expected state (assertions)
   d. Screenshot before/after
3. Report findings

## Bug Triage
For each bug found:
- Severity: CRITICAL (blocks usage) / MAJOR (broken feature) / MINOR (cosmetic)
- Steps to reproduce
- Expected vs actual
- Screenshot evidence

## Fix Loop (if authorized)
For CRITICAL/MAJOR bugs:
1. Write failing test (TDD!)
2. Fix the code
3. Re-verify in browser
4. Commit with regression test

## Output
- Flows tested: {count}
- Bugs found: {count by severity}
- Fixed: {count}
- Ship-ready: YES / NO
```

---

### 10. guards/careful.md [NEW]

**Source**: gstack /careful

```
# Careful Guard

Before executing any of these commands, WARN the user and wait for confirmation:

## Destructive Commands
- rm -rf (except: node_modules, .next, dist, build, __pycache__, .pytest_cache)
- git reset --hard
- git push --force / --force-with-lease
- git checkout -- . / git restore .
- git clean -f
- DROP TABLE / DROP DATABASE / TRUNCATE
- kubectl delete
- docker system prune
- Any command with --no-verify

## Warning Format
```
DESTRUCTIVE: {command}
This will: {plain English description of what happens}
Reversible: YES / NO
Proceed? (y/n)
```

Do NOT proceed without explicit "y" from user.
```

---

### 11. guards/freeze.md [NEW]

**Source**: gstack /freeze

```
# Freeze Guard

Restrict all file edits to a specific directory for this session.

## Activation
User says "freeze to {path}" or skill determines scope should be locked.

## Rules
- Edit/Write operations OUTSIDE the allowed path: BLOCKED
- Read/Grep operations: allowed everywhere (read-only is safe)
- New file creation outside path: BLOCKED

## Override
User can say "unfreeze" to remove restriction.
```

---

### 12. guards/verification.md [NEW]

**Source**: Superpowers verification-before-completion

```
# Verification Gate

NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE

## The Gate Function

BEFORE claiming ANY status (success, completion, "done", "fixed", "passes"):

1. IDENTIFY: What command proves this claim?
2. RUN: Execute the command (fresh, complete, in this message)
3. READ: Full output, check exit code
4. VERIFY: Does output confirm the claim?
5. ONLY THEN: Make the claim WITH evidence

Skip any step = claim is invalid.

## Red Flags — STOP

- Using "should", "probably", "seems to"
- Expressing satisfaction before running verification
- Trusting agent reports without checking diff
- About to commit/PR without test run
- "I'm confident" (confidence is not evidence)

## Required Evidence

| Claim | Must Run | Not Sufficient |
|-------|----------|----------------|
| Tests pass | Test command, see 0 failures | "should pass" |
| Build works | Build command, see exit 0 | "linter passed" |
| Bug fixed | Reproduce test passes | "code changed" |
| Agent done | Check git diff | "agent said success" |
```

---

### 13. rules/tdd.md

**Source**: Superpowers test-driven-development/SKILL.md (full content)

This is the complete TDD reference loaded into builder agent context.
Contains: Iron Law, Red-Green-Refactor cycle, Good/Bad examples,
Rationalizations table, Red Flags, Verification Checklist.

**Copy verbatim from Superpowers** — this is battle-tested content.

---

### 14. rules/review-protocol.md [NEW]

```
# Two-Stage Review Protocol

## Why Two Stages

Stage 1 (Spec Compliance) catches: wrong thing built, scope drift, missing features
Stage 2 (Code Quality) catches: security holes, bugs, tech debt

This ORDER matters:
- Spec first: prevents polishing code that solves the wrong problem
- Quality second: focuses review on code that we know is the right code

## Flow

Builder completes → Spec Review → (pass?) → Quality Review → (pass?) → Merge

If Spec Review FAILS:
  - Fix specific issues
  - Re-run Spec Review (max 2 rounds)
  - If still failing: escalate to user

If Quality Review FAILS:
  - Fix specific issues
  - Re-run Quality Review (max 2 rounds)
  - If still failing: escalate to user

## Never Skip

- "It's a small change" — still review
- "I'm confident" — confidence is not evidence
- "Already reviewed mentally" — dispatch the agent
```

---

### 15. rules/anti-patterns.md

**Source**: Superpowers testing-anti-patterns.md

Contains: testing mock behavior, test-only production methods,
mocking without understanding, incomplete mocks, integration as afterthought.

**Copy from Superpowers** with attribution.

---

### 16. extensions/security-baseline.md

**Source**: AIDLC-workflows security baseline (simplified)

```
Opt-in at Inception phase. When enabled, adds constraints:

## Code Generation Constraints
- All user input validated at entry points
- Parameterized queries only (no string interpolation for SQL)
- No hardcoded secrets
- Auth/authz on all protected endpoints
- HTTPS for sensitive data
- Dependencies checked for known CVEs
- File uploads validated (type, size)

## Review Constraints (added to quality-reviewer)
- Security checklist must ALL pass for PASS verdict
- Any security issue = automatic FAIL
```

---

### 17. adapters/kiro/install.sh

```bash
#!/bin/bash
# Install super-aidlc as Kiro skill
PROJECT_ROOT="${1:-.}"
SKILL_DIR="$PROJECT_ROOT/.kiro/skills/super-aidlc"
SCRIPT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

mkdir -p "$SKILL_DIR"
ln -sf "$SCRIPT_DIR/SKILL.md" "$SKILL_DIR/SKILL.md"
ln -sf "$SCRIPT_DIR/phases" "$SKILL_DIR/phases"
ln -sf "$SCRIPT_DIR/agents" "$SKILL_DIR/agents"
ln -sf "$SCRIPT_DIR/guards" "$SKILL_DIR/guards"
ln -sf "$SCRIPT_DIR/rules" "$SKILL_DIR/rules"
ln -sf "$SCRIPT_DIR/extensions" "$SKILL_DIR/extensions"

echo "Installed super-aidlc to $SKILL_DIR"
```

---

### 18. adapters/claude-code/install.sh

```bash
#!/bin/bash
# Install super-aidlc as Claude Code skill
PROJECT_ROOT="${1:-.}"
SKILL_DIR="$PROJECT_ROOT/.claude/skills/super-aidlc"
SCRIPT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

mkdir -p "$SKILL_DIR"
ln -sf "$SCRIPT_DIR/SKILL.md" "$SKILL_DIR/SKILL.md"
ln -sf "$SCRIPT_DIR/phases" "$SKILL_DIR/phases"
ln -sf "$SCRIPT_DIR/agents" "$SKILL_DIR/agents"
ln -sf "$SCRIPT_DIR/guards" "$SKILL_DIR/guards"
ln -sf "$SCRIPT_DIR/rules" "$SKILL_DIR/rules"
ln -sf "$SCRIPT_DIR/extensions" "$SKILL_DIR/extensions"

echo "Installed super-aidlc to $SKILL_DIR"
```

---

## Implementation Order

### P0: Core (enables basic usage)
| # | File | LOE | Depends On |
|---|------|-----|-----------|
| 1 | SKILL.md | S | - |
| 2 | phases/construction.md | M | 1 |
| 3 | agents/builder.md | M | rules/tdd.md |
| 4 | rules/tdd.md | S (copy from Superpowers) | - |
| 5 | agents/spec-reviewer.md | S | - |
| 6 | agents/quality-reviewer.md | S | - |
| 7 | guards/verification.md | S | - |
| 8 | rules/review-protocol.md | S | - |

### P1: Inception (enables design-first workflow)
| # | File | LOE | Depends On |
|---|------|-----|-----------|
| 9 | phases/inception.md | M | - |
| 10 | agents/researcher.md | S (copy+enhance from v2) | - |
| 11 | agents/architect.md | S (copy+enhance from v2) | - |

### P2: Operations + Guards (enables QA and safety)
| # | File | LOE | Depends On |
|---|------|-----|-----------|
| 12 | phases/operations.md | M | - |
| 13 | agents/qa.md | M | - |
| 14 | agents/debugger.md | S | - |
| 15 | guards/careful.md | S | - |
| 16 | guards/freeze.md | S | - |

### P3: Extensions + Adapters (enables ecosystem)
| # | File | LOE | Depends On |
|---|------|-----|-----------|
| 17 | extensions/security-baseline.md | S | - |
| 18 | rules/anti-patterns.md | S (copy from Superpowers) | - |
| 19 | adapters/kiro/install.sh | S | all above |
| 20 | adapters/claude-code/install.sh | S | all above |
| 21 | README.md | S | all above |

LOE: S = Small (< 50 lines), M = Medium (50-200 lines)

## Key Design Principles

1. **Skills are Markdown** — no compiled code, no runtime dependencies, no DSL
2. **Platform-agnostic core** — adapters handle Kiro vs Claude Code differences
3. **Kiro specs alignment** — Inception output maps to .kiro/specs/ natively
4. **Progressive enhancement** — P0 alone is useful; each priority adds capability
5. **Copy battle-tested content** — TDD rules, review prompts from Superpowers are proven; don't rewrite
6. **Optional heavy features** — Browser QA requires Playwright but skill works without it
7. **Guard rails are separate files** — loaded on-demand, not always in context (saves tokens)

## What We Deliberately Exclude

| Feature | Source | Why Excluded |
|---------|--------|-------------|
| Brainstorm WebSocket server | Superpowers | Too heavy; Kiro/Claude Code chat is sufficient |
| gstack browse binary | gstack | Dependency too heavy; use Playwright directly |
| Cookie import from browsers | gstack | macOS only, security complexity |
| Multi-AI (Codex) review | gstack | Adds OpenAI dependency |
| Session hooks (auto-inject) | Superpowers | Platform-specific; adapters handle this |
| AIDLC question-in-files | AIDLC | Chat interaction is better UX for both platforms |
| AIDLC audit.md | AIDLC | Build log in aidlc-docs/ is sufficient |
| Retro / document-release | gstack | Nice-to-have, can add later |

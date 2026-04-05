---
name: super-aidlc:review
description: Run the two-stage code review (spec compliance + parallel quality reviewers) on current changes. Use before creating a PR or after completing a feature.
argument-hint: "[optional: specific files or scope to review]"
model: opus
---

# Code Review

Review scope: $ARGUMENTS

If scope is empty, review all uncommitted changes (`git diff`).

## Stage 1: Spec Compliance

If a design doc exists in `aidlc-docs/`, read it first. Then check:

- Missing requirements (skipped or not implemented)
- Extra features (scope creep, over-engineering)
- Misunderstandings (right intent, wrong interpretation)

Verdict: PASS or FAIL with file:line references.

**If FAIL**: fix issues, re-run Stage 1 (max 2 rounds, then escalate to user).

## Stage 2: Parallel Quality Review

**Only runs after Stage 1 passes.**

Launch applicable reviewers IN PARALLEL:

**Always-on:**
- **Correctness** -- logic errors, edge cases, state bugs, error propagation
- **Quality** -- security, data integrity, production readiness (Pass 1 CRITICAL + Pass 2 IMPORTANT)

**Conditional (selected per diff):**
- **Security** -- if diff touches auth, endpoints, user input, permissions
- **Performance** -- if diff touches DB queries, data transforms, caching, async
- **Adversarial** -- if diff has 50+ changed non-test lines, or touches auth/payments/data mutations

Each reviewer produces findings with severity (P0-P3) and confidence (high/medium/low).

### Findings Merge

1. Collect all findings from all reviewers
2. Dedup -- same file:line + same issue = merge (keep higher severity)
3. Gate -- P0 high confidence from ANY reviewer = FAIL
4. Synthesize unified report

## Output

```markdown
## Code Review Report

**Stage 1 (Spec Compliance):** PASS / FAIL
**Stage 2 (Quality):** PASS / FAIL

### Critical (P0-P1, must fix)
{Numbered list with file:line, issue, suggested fix}

### Notes (P2-P3, discretionary)
{Numbered list with file:line, suggestion}

### Summary
{1-2 sentences}
```

## Rules

- Max 2 rounds per stage. After that, escalate to user.
- Every finding must have file:line reference and suggested fix.
- Do not nitpick style if the project has no style guide.

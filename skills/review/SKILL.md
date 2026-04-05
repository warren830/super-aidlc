---
name: super-aidlc:review
description: Run the two-stage code review (spec compliance + parallel quality reviewers) on current changes. Use before creating a PR or after completing a feature.
argument-hint: "[optional: specific files or scope to review]"
model: opus
---

# Code Review

Review the current changes using Super-AIDLC's two-stage protocol.

Read and execute `rules/review-protocol.md`.

## What Happens

**Stage 1: Spec Compliance** (agents/spec-reviewer.md)
- Does the code match what was requested?
- Missing features? Extra features? Misunderstandings?

**Stage 2: Parallel Quality Review** (4 specialist reviewers in parallel)
- `agents/correctness-reviewer.md` → logic errors, edge cases, state bugs
- `agents/security-reviewer.md` → vulnerabilities (conditional: auth/input/endpoints)
- `agents/performance-reviewer.md` → N+1, memory, resources (conditional: DB/async)
- `agents/adversarial-reviewer.md` → failure scenarios (conditional: 50+ lines changed)

Findings are merged, deduped, and gated by confidence level.

## Scope

If `$ARGUMENTS` specifies files or a scope, review only those. Otherwise, review all uncommitted changes (`git diff`).

## Usage

```
/super-aidlc:review                    → review all current changes
/super-aidlc:review backend/api/       → review only API changes
```

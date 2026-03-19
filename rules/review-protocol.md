# Two-Stage Review Protocol

## Why Two Stages

| Stage | What It Catches |
|-------|----------------|
| Stage 1: Spec Compliance | Wrong thing built, scope drift, missing features, extra features |
| Stage 2: Code Quality | Security holes, bugs, performance issues, tech debt |

This ORDER matters:
- **Spec first**: prevents polishing code that solves the wrong problem.
- **Quality second**: focuses review effort on code that we know is the right code.

Running them in the wrong order wastes time. Running only one misses an entire class of defects.

## Flow

```
Builder completes
       |
       v
  Spec Review (agents/spec-reviewer.md)
       |
   PASS?--NO--> Fix issues --> Re-run Spec Review (max 2 rounds)
       |                              |
      YES                        Still FAIL? --> Escalate to user
       |
       v
  Quality Review (agents/quality-reviewer.md)
       |
   PASS?--NO--> Fix issues --> Re-run Quality Review (max 2 rounds)
       |                              |
      YES                        Still FAIL? --> Escalate to user
       |
       v
     Merge
```

## Stage 1: Spec Compliance Review

Dispatch `agents/spec-reviewer.md` with:
- The design doc / unit spec (what was requested)
- The builder's report (what they claim they built)
- Access to the actual code changes

The spec reviewer reads actual code -- not just the report. They check:
- Missing requirements (skipped or not implemented)
- Extra features (scope creep, over-engineering)
- Misunderstandings (right intent, wrong interpretation)

Verdict: PASS or FAIL with file:line references.

## Stage 2: Code Quality Review

**Only runs after Stage 1 passes.**

Dispatch `agents/quality-reviewer.md` with:
- The design doc for context
- The code changes (git diff or file list)

The quality reviewer runs two passes:
- Pass 1 CRITICAL: security, correctness, data integrity (any issue = FAIL)
- Pass 2 IMPORTANT: edge cases, performance, conventions (flagged as notes)

Verdict: PASS or FAIL with file:line references and suggested fixes.

## Failure Handling

**Max 2 rounds per stage.** After that, escalate to the user with:
- The specific issues that keep failing
- What was tried to fix them
- A recommendation for how to proceed

Do NOT loop indefinitely. Two rounds is enough to catch real issues vs. reviewer-builder disagreement.

**If Stage 1 fails and is fixed**: re-run Stage 1 only (Stage 2 has not run yet).
**If Stage 2 fails and is fixed**: re-run Stage 2 only (Stage 1 already passed).

## Never Skip

| Temptation | Why It Is Wrong |
|------------|-----------------|
| "It's a small change" | Small changes introduce security bugs. Review. |
| "I'm confident in this code" | Confidence is not evidence. Dispatch the reviewer. |
| "Already reviewed mentally" | Mental review is not a separate-agent review. Dispatch. |
| "Just tests, no production code" | Test quality matters. Review tests too. |
| "Time pressure" | Shipping bugs costs more time than reviewing. |
| "Same pattern as last time" | Context changes. Review. |

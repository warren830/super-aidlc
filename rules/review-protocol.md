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

## Stage 2: Code Quality Review (Parallel Specialist Reviewers)

**Only runs after Stage 1 passes.**

Stage 2 dispatches multiple specialist reviewers in PARALLEL. Each reviewer focuses on a specific dimension and returns structured findings with confidence levels.

### Always-On Reviewers (every review)

| Agent | Focus | File |
|-------|-------|------|
| **Quality Reviewer** | Security, correctness, data integrity (Pass 1 + Pass 2) | `agents/quality-reviewer.md` |
| **Correctness Reviewer** | Logic errors, edge cases, state bugs | `agents/correctness-reviewer.md` |
| **Maintainability Reviewer** | Coupling, complexity, naming, dead code | `agents/maintainability-reviewer.md` |

### Conditional Reviewers (selected per diff)

| Agent | Trigger | File |
|-------|---------|------|
| **Security Reviewer** | Auth, endpoints, user input, permissions | `agents/security-reviewer.md` |
| **Performance Reviewer** | DB queries, data transforms, caching, async | `agents/performance-reviewer.md` |
| **Reliability Reviewer** | Error handling, retries, timeouts, background jobs, external calls | `agents/reliability-reviewer.md` |
| **API Contract Reviewer** | Routes, serializers, response shapes, type signatures | `agents/api-contract-reviewer.md` |
| **Adversarial Reviewer** | >=50 changed non-test lines, or auth/payments/data mutations | `agents/adversarial-reviewer.md` |

### Dispatch

Launch all applicable reviewers in a single parallel dispatch:
```
Agent(correctness-reviewer, ...) +
Agent(maintainability-reviewer, ...) +
Agent(security-reviewer, ...) +          # if triggered
Agent(performance-reviewer, ...) +       # if triggered
Agent(reliability-reviewer, ...) +       # if triggered
Agent(api-contract-reviewer, ...) +      # if triggered
Agent(adversarial-reviewer, ...)         # if triggered
```

Review scales naturally: a small config change triggers 3 always-on reviewers. A full-stack auth feature with API changes triggers all 8.

### Findings Merge & Dedup

After all reviewers return:

1. **Collect** all findings from all reviewers.
2. **Dedup** -- if two reviewers flag the same file:line with the same issue, merge into one finding. Keep the higher severity and the combined evidence.
3. **Severity gate** -- P0 with high confidence from ANY reviewer = FAIL (blocks merge). P1 with high confidence = should fix. P2/P3 = notes.
4. **Synthesize** a unified quality report from all findings.

### Unified Verdict

The Stage 2 verdict is PASS only if:
- Zero P0 findings with high confidence
- All P1 findings with high confidence are addressed or acknowledged

Verdict: PASS or FAIL with file:line references, confidence levels, and suggested fixes.

## Failure Handling

**Max 2 rounds per stage.** After that, escalate to the user with:
- The specific issues that keep failing
- What was tried to fix them
- A recommendation for how to proceed

Do NOT loop indefinitely. Two rounds is enough to catch real issues vs. reviewer-builder disagreement.

**If Stage 1 fails and is fixed**: re-run Stage 1 only (Stage 2 has not run yet).
**If Stage 2 fails and is fixed**: re-run Stage 2 only (Stage 1 already passed).

## Cross-Model Review (optional)

Same-model bias is a known problem: Claude reviewing Claude's code tends to miss the same classes of errors Claude makes. gstack addresses this with cross-model consensus; Superpowers issue #730 requests it.

### When to Use Cross-Model Review

- Heavy tasks with security implications
- Code that handles financial data, PII, or authentication
- When the quality reviewer passes but you have low confidence

### How to Request

If the project's CLAUDE.md or the user specifies `cross-model-review: true`, dispatch the quality review to a different model when available:

```
Agent(
  prompt: "<quality reviewer prompt>",
  model: "sonnet",  # Use a different model than the builder
  description: "Cross-model quality review: {what was built}"
)
```

The key insight: a different model acts as a truly independent reviewer. It does not share the same blind spots as the model that wrote the code.

### Disagreement Handling

If the cross-model reviewer disagrees with the original reviewer:
1. Both reviewers' findings are presented to the user
2. The user decides which findings to address
3. Note the disagreement in the build log for future reference

## Code Reading Coverage

Research identifies "write-only code" as a growing risk: AI generates code nobody fully reads, yet someone must be accountable for it. A METR study found experienced developers were 19% SLOWER with AI because they spent time verifying AI output -- but that verification is the only thing preventing "write-only code" from reaching production.

**Super-AIDLC's approach:**

Every line of AI-generated code is read by at least TWO agents:
1. **Spec Reviewer** reads it to verify correctness against requirements
2. **Quality Reviewer** reads it to verify security, performance, and quality

**The human's role:**
- Review the design doc BEFORE construction (you define what gets built)
- Spot-check code changes AFTER both reviews pass (the agents catch details, you catch intent)
- Approve the PR (final accountability)

**In the build log, record:**
```
## Code Reading Coverage
- Lines generated: {N}
- Lines read by spec reviewer: {N} (100%)
- Lines read by quality reviewer: {N} (100%)
- Lines spot-checked by human: {N} ({percent})
```

The goal is 100% agent-read, >20% human-spot-checked for Medium tasks, >50% for Heavy tasks. No "write-only code" ships through Super-AIDLC.

## Never Skip

| Temptation | Why It Is Wrong |
|------------|-----------------|
| "It's a small change" | Small changes introduce security bugs. Review. |
| "I'm confident in this code" | Confidence is not evidence. Dispatch the reviewer. |
| "Already reviewed mentally" | Mental review is not a separate-agent review. Dispatch. |
| "Just tests, no production code" | Test quality matters. Review tests too. |
| "Time pressure" | Shipping bugs costs more time than reviewing. |
| "Same pattern as last time" | Context changes. Review. |

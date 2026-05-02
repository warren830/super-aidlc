---
name: super-aidlc:verify
description: Evidence-based completion. Before claiming work is done, tests pass, build succeeds, or a bug is fixed, run the verification command in this message and quote the output. No exceptions.
model: opus
---

# Verify

## Overview

Claiming work is complete without fresh verification evidence is dishonesty, not efficiency.

**Core principle**: Evidence before claims, always.

**Violating the letter of this rule is violating the spirit of this rule.**

## The Iron Law

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE IN THIS MESSAGE
```

If you have not run the verification command in *this* message, you cannot claim the result. A passing run from 10 minutes ago, or from a subagent's report, is not sufficient -- the code may have changed, the environment may have drifted.

## The Gate Function

Before making ANY claim of success, completion, or satisfaction:

1. **IDENTIFY**: What exact command proves this claim?
2. **RUN**: Execute the full command fresh in this message.
3. **READ**: Check exit code, full output, failure count.
4. **VERIFY**: Does the output confirm the claim?
   - NO → state actual status with evidence
   - YES → state claim WITH evidence (quote the relevant output line)
5. **ONLY THEN**: Make the claim.

Skipping any step = lying, not verifying.

## Claim → Required Evidence

| Claim | Requires | Not Sufficient |
|---|---|---|
| "Tests pass" | Full test command, exit 0, 0 failures, in this message | Previous run, partial run, "should pass" |
| "Linter clean" | Linter output: 0 errors, 0 warnings | Partial check, ignoring files |
| "Build succeeds" | Build command exit 0, no errors in stderr | Linter passing, "logs look good" |
| "Bug is fixed" | Test that reproduces the original symptom passes | Code changed, assumed fixed |
| "Regression test works" | Red → Green cycle verified (MUST see it fail first) | Test passes once |
| "Subagent completed task" | Inspect `git diff`; confirm changes match what was asked | Agent's success report alone |
| "Requirements met" | Line-by-line checklist against the design doc | "Tests pass, phase complete" |

## Rationalization Prevention

| Excuse | Reality |
|---|---|
| "Should work now" | Run the verification. |
| "I'm confident" | Confidence ≠ evidence. |
| "Just this once" | No exceptions. |
| "Linter passed, so build probably works" | Linter doesn't compile. Run the build. |
| "The subagent said success" | Verify independently. Check the diff. |
| "I'm tired, let me just commit" | Exhaustion ≠ excuse. |
| "Partial check is enough" | Partial proves nothing. Run the full command. |
| "It worked on my machine" | Run the command in this environment, this message. |
| "Different wording, rule doesn't apply" | Spirit over letter. |

## Red Flags — STOP

- Using "should", "probably", "seems to", "looks like"
- Expressing satisfaction before verification ("Perfect!", "Done!", "Good to go")
- About to commit, push, or create PR without verification in this message
- Trusting a subagent's report without checking the diff
- Relying on a test run from earlier in the session
- Thinking "just this once"
- **Any wording that implies success without having run verification in this message**

## Patterns

**Tests**
```
✓  [Run test command] → [Output: 34/34 pass] → "All 34 tests pass"
✗  "Should pass now" / "Looks correct" / "Tests should be green"
```

**Regression tests (TDD Red-Green cycle)**
```
✓  Write test → Run (MUST fail) → Apply fix → Run (pass) → Revert fix → Run (fail again) → Restore fix → Run (pass)
✗  "I've written a regression test" (without red-green cycle verification)
```

**Build**
```
✓  [Run build] → [Exit 0, 0 errors] → "Build succeeds"
✗  "Linter passed" (linter ≠ compiler)
```

**Subagent output**
```
✓  Subagent reports success → Run `git diff` → Inspect changes → Report actual state
✗  Trust the subagent report and move on
```

**Requirements**
```
✓  Re-read design doc → Build checklist → Verify each item → Report gaps or completion
✗  "Tests pass, phase complete"
```

## When To Apply

**ALWAYS before:**
- Any success / completion claim
- Any expression of satisfaction
- Committing, pushing, or creating a PR
- Moving to the next task or phase
- Claiming a subagent's work is done

**The rule applies to:**
- Exact phrases ("tests pass")
- Paraphrases ("all green", "we're good")
- Implications ("ready to ship")
- ANY wording suggesting completion or correctness

## Integration with super-aidlc

- **Construction Step 6 (Auto-Verification Loop)**: every iteration of the loop must quote the command exit code and failure count. See `phases/construction.md`.
- **Ship skill**: verification is the first gate before commit. See `skills/ship/SKILL.md`.
- **Operations phase**: before QA, verify build is green. See `phases/operations.md`.
- **Builder agent**: before reporting DONE, verify tests + build + lint. See `agents/builder.md`.
- **Reviewer agents**: when claiming "no critical issues", quote specific checks run, not general impression.
- **--auto mode**: when a fresh subagent reports success, the orchestrator must verify via `git diff` before proceeding.

## The Bottom Line

Run the command. Read the output. THEN claim the result.

No shortcuts. No exceptions. This is non-negotiable.

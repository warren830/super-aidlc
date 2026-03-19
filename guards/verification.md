# Verification Gate

## The Iron Law

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

If you have not run the verification command in this message, you cannot claim it passes.

Claiming work is complete without verification is dishonesty, not efficiency.

**Core principle:** Evidence before claims, always.

**Violating the letter of this rule is violating the spirit of this rule.**

## The Gate Function

```
BEFORE claiming any status or expressing satisfaction:

1. IDENTIFY: What command proves this claim?
2. RUN: Execute the FULL command (fresh, complete, in this message)
3. READ: Full output, check exit code, count failures
4. VERIFY: Does output confirm the claim?
   - If NO: State actual status with evidence
   - If YES: State claim WITH evidence
5. ONLY THEN: Make the claim

Skip any step = claim is invalid.
```

## Common Failures

| Claim | Must Run | Not Sufficient |
|-------|----------|----------------|
| Tests pass | Test command output: 0 failures | Previous run, "should pass" |
| Linter clean | Linter output: 0 errors | Partial check, extrapolation |
| Build succeeds | Build command: exit 0 | Linter passing, logs look good |
| Bug fixed | Test original symptom: passes | Code changed, assumed fixed |
| Regression test works | Red-green cycle verified | Test passes once |
| Agent completed | VCS diff shows changes | Agent reports "success" |
| Requirements met | Line-by-line checklist | Tests passing |

## Red Flags - STOP

- Using "should", "probably", "seems to"
- Expressing satisfaction before verification ("Great!", "Perfect!", "Done!", etc.)
- About to commit/push/PR without verification
- Trusting agent success reports without checking diff
- Relying on partial verification
- Thinking "just this once"
- Tired and wanting work over
- ANY wording implying success without having run verification

## Rationalization Prevention

| Excuse | Reality |
|--------|---------|
| "Should work now" | RUN the verification |
| "I'm confident" | Confidence is not evidence |
| "Just this once" | No exceptions |
| "Linter passed" | Linter is not compiler |
| "Agent said success" | Verify independently |
| "I'm tired" | Exhaustion is not excuse |
| "Partial check is enough" | Partial proves nothing |
| "Different words so rule doesn't apply" | Spirit over letter |

## Key Patterns

**Tests:**
```
CORRECT: [Run test command] [See: 34/34 pass] "All tests pass"
WRONG:   "Should pass now" / "Looks correct"
```

**Regression tests (TDD Red-Green):**
```
CORRECT: Write -> Run (pass) -> Revert fix -> Run (MUST FAIL) -> Restore -> Run (pass)
WRONG:   "I've written a regression test" (without red-green verification)
```

**Build:**
```
CORRECT: [Run build] [See: exit 0] "Build passes"
WRONG:   "Linter passed" (linter does not check compilation)
```

**Requirements:**
```
CORRECT: Re-read plan -> Create checklist -> Verify each -> Report gaps or completion
WRONG:   "Tests pass, phase complete"
```

**Agent delegation:**
```
CORRECT: Agent reports success -> Check VCS diff -> Verify changes -> Report actual state
WRONG:   Trust agent report
```

## When To Apply

**ALWAYS before:**
- ANY variation of success/completion claims
- ANY expression of satisfaction
- ANY positive statement about work state
- Committing, PR creation, task completion
- Moving to next task
- Delegating to agents

## The Bottom Line

**No shortcuts for verification.**

Run the command. Read the output. THEN claim the result.

This is non-negotiable.

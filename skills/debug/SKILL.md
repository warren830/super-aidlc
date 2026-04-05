---
name: super-aidlc:debug
description: Systematic root-cause investigation for bugs and failures. Four phases - investigate, analyze, hypothesize, implement. No shotgun fixes.
argument-hint: "[describe the bug, error message, or failing test]"
model: opus
---

# Debug

The user reports: $ARGUMENTS

## The Iron Law

No fixes without root-cause investigation first.

## Four Phases

### 1. Investigate (gather symptoms)

- Reproduce the failure. If you cannot reproduce it, you cannot fix it.
- Read the error message, stack trace, or unexpected output.
- Check recent changes: `git log --oneline -10`, `git diff`.
- Check logs, test output, build output.

### 2. Analyze (trace the cause)

- Start from the symptom, trace backward through code.
- Read the actual code at the error location (not just the error message).
- Check: What data flows into this point? What state is expected vs actual?
- Identify the gap between expected and actual behavior.

### 3. Hypothesize (test ONE thing)

- Form a single, testable hypothesis: "The bug is caused by X because Y."
- Design a test that would prove or disprove this hypothesis.
- Run the test. If disproved, return to Analyze with new information.
- **3-strike rule**: After 3 failed hypotheses, step back and question your assumptions about the system.

### 4. Implement (fix + prove)

- Write a regression test that fails with the bug present.
- Apply the minimal fix.
- Verify the regression test passes.
- Run the full test suite to check for side effects.

## Output

```markdown
## Debug Report

### Symptom
{What was observed}

### Root Cause
{What actually caused it, with evidence}

### Fix Applied
{What was changed, file:line references}

### Regression Test
{Test that prevents recurrence}

### Investigation Log
{What was tried, including dead ends}
```

## After Debug

Consider running `/super-aidlc:compound` if the bug was non-trivial -- document the root cause and solution for future reference.

## Rules

- **No shotgun fixes.** Do not change random things hoping it works.
- **Evidence before claims.** "I think it's fixed" is not acceptable. Run the test.
- **Minimal fix.** Fix the bug, not the surrounding code. Refactoring is a separate task.

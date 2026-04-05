---
name: super-aidlc:debug
description: Systematic root-cause investigation for bugs and failures. Four phases - investigate, analyze, hypothesize, implement. No shotgun fixes.
argument-hint: "[describe the bug, error message, or failing test]"
model: opus
---

# Debug

The user reports: $ARGUMENTS

Read and execute `agents/debugger.md`.

## The Iron Law

No fixes without root-cause investigation. This means:

1. **Investigate** → gather symptoms, reproduce the failure
2. **Analyze** → trace the cause through code, logs, state
3. **Hypothesize** → form ONE hypothesis, test it
4. **Implement** → fix + regression test that proves the fix

After 3 failed hypotheses, step back and question assumptions.

## When to Use Standalone

- A test is failing and you don't know why
- Production error or unexpected behavior
- Performance degradation
- Any bug where the cause is not immediately obvious

## What You Get

- Root cause identified with evidence
- Fix applied with regression test
- Prevention strategy documented
- Optionally: `/super-aidlc:compound` to save the solution for future reference

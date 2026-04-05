---
name: super-aidlc:brainstorm
description: Explore requirements before committing to design. Use when scope is ambiguous, multiple approaches exist, or the problem needs clarification.
argument-hint: "[describe what you want to explore]"
model: opus
---

# Brainstorm

The user wants to explore: $ARGUMENTS

Read and execute `phases/brainstorm.md`.

This is the pre-inception exploration phase. It produces a requirements document at `aidlc-docs/{date}-{slug}/requirements.md` that feeds directly into `/super-aidlc` inception.

## When to Use Standalone

- You have a vague idea and want to crystallize it before building
- Multiple approaches exist and you want to evaluate tradeoffs
- You want to define scope boundaries before committing engineering time

## After Brainstorm

```
Requirements captured. Next steps:
  /super-aidlc [task]              → full pipeline using these requirements
  /super-aidlc:brainstorm [task]   → explore a different angle
```

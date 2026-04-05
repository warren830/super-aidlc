---
name: super-aidlc:design
description: Run only the inception phase (research + questions + design doc) without building. Use when you want a design doc to review before committing to code.
argument-hint: "[describe what you want to design]"
model: opus
---

# Design Only

The user wants to design: $ARGUMENTS

Read and execute `phases/inception.md`, but STOP after the design doc is approved. Do NOT proceed to construction.

## What Happens

1. **Parallel Research** (4 agents) → codebase patterns, knowledge base, git history, best practices
2. **Structured Questions** → with options and recommendations, context-aware elimination
3. **Design Document** → architecture diagram, error/rescue map, units of work, decisions log
4. **Design Review** → independent reviewer for Heavy tasks, self-review for Medium

## Output

Design doc at `aidlc-docs/{date}-{slug}/design.md`

## After Design

```
Design complete. Next steps:
  /super-aidlc [task]     → build from this design (auto-detects existing design doc)
  Edit the design doc     → refine before building
```

## When to Use Standalone

- You want to review the design before committing to a build
- You're planning work for a team and need a spec
- You want to explore the architecture without writing code yet

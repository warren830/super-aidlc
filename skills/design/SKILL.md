---
name: super-aidlc:design
description: Run only the inception phase (research + questions + design doc) without building. Use when you want a design doc to review before committing to code.
argument-hint: "[describe what you want to design]"
model: opus
---

# Design Only

The user wants to design: $ARGUMENTS

Run the full inception phase but STOP after the design doc is approved. Do NOT proceed to construction.

## Process

### 1. Check for Existing Requirements

Scan `aidlc-docs/` for `*requirements.md` matching this task. If found, use as primary input and skip redundant questions.

### 2. Parallel Research (brownfield)

If existing code is present, dispatch research agents in parallel:
- **Researcher** -- codebase patterns, architecture, constraints
- **Learnings Researcher** -- search `aidlc-docs/solutions/` for related solutions
- **Git History Analyzer** -- code evolution, hotspots (Medium/Heavy)
- **Best Practices Researcher** -- external patterns (Heavy only)

### 3. Ask Structured Questions

- Context-aware: skip questions already answered by existing docs
- Grouped by topic, with options and recommendations
- One group at a time, wait for answers

### 4. Produce Design Document

Write to `aidlc-docs/{date}-{slug}/design.md` with mandatory sections:
- Requirements
- Architecture (ASCII diagram REQUIRED)
- Data Model
- NFR Plan (performance, reliability, security, observability)
- Error/Rescue Map (every external boundary, 5+ rows minimum)
- Interface Contracts (cross-unit dependencies)
- Units of Work (with parallelism markings)
- Decisions Log
- Alternatives Considered

### 5. Design Review

- Heavy: dispatch independent Design Reviewer Agent
- Medium: self-review against 3 criteria (error coverage, unit independence, over-engineering)

### 6. User Approval

Present the design doc and STOP. Wait for explicit approval.

```
Design complete. Next steps:
  /super-aidlc [task]     → build from this design (auto-detects existing doc)
  Edit the design doc     → refine before building
```

## Rules

- **No code in this phase.** Only documents.
- **Ask questions BEFORE designing.** Not after.
- **Architecture diagram is mandatory.** ASCII art, not prose.

---
name: super-aidlc:brainstorm
description: Explore requirements before committing to design. Multi-perspective review (Product, Engineering, Design). Use when scope is ambiguous, multiple approaches exist, or the problem needs clarification.
argument-hint: "[describe what you want to explore]"
model: opus
---

# Brainstorm

The user wants to explore: $ARGUMENTS

## Process

### Step 1: Understand Intent (5 Forcing Questions)

Ask one question at a time. Use multiple-choice options when possible. Lead with a recommendation.

1. **WHO** -- Who is the primary user? What is their workflow today?
2. **WHAT** -- What specific problem are they trying to solve? (Not "what feature" -- what PROBLEM.)
3. **WHY NOW** -- Why does this need to exist? What changed?
4. **WHAT EXISTS** -- Current workaround? What is wrong with it?
5. **WHAT SUCCESS** -- How will we know this worked? Measurable outcome.

### Step 2: Multi-Perspective Exploration

Once intent is clear, explore 2-3 approaches. For each, run three parallel review lenses:

Launch 3 subagents IN PARALLEL:

**Product Lens** (think like a CEO):
- Is this the right problem to solve? Is there a bigger opportunity hiding behind this request?
- What would the "10-star version" look like? (Airbnb's framework: 1-star = broken, 5-star = good, 10-star = magical)
- Who are we NOT building for? (anti-personas)
- What's the simplest version that delivers 80% of the value?
- Red flag: are we building what was requested, or what's actually needed?

**Engineering Lens** (think like a Staff Engineer):
- What's the simplest architecture that works?
- Where are the data flow bottlenecks?
- What existing patterns in the codebase should we follow or break?
- What are the hard technical risks? (not "might be complex" -- specific failure modes)
- What would we regret in 6 months? What's easy to change later vs. locked in now?

**Design Lens** (think like a Senior Designer):
- What are the critical user flows? Walk through each step.
- Where will users get confused or stuck?
- What state transitions exist? (loading, empty, error, success, partial)
- Is there AI-generated slop risk? (generic placeholders, meaningless metrics, decorative elements)
- What's the information hierarchy? What should the user see first/last?

Each lens returns a brief assessment (5-10 lines) with STRENGTHS and CONCERNS.

### Step 3: Synthesize Approaches

For each approach, present:

```
### Approach A: {Name}
How it works: {2-3 sentences}

Product: {1-line verdict from Product Lens}
Engineering: {1-line verdict from Engineering Lens}  
Design: {1-line verdict from Design Lens}

Pros: {bullet list}
Cons: {bullet list}
Effort: {small / medium / large}
Risk: {low / medium / high -- from Engineering Lens}
```

**Recommendation**: Which approach and why. Explain the tradeoff.

### Step 4: Define Scope Boundaries

After approach is chosen:

- **In scope**: What this feature WILL do (bullet list)
- **Out of scope**: What this feature will NOT do (equally important)
- **Assumptions**: What we are assuming to be true
- **Open questions**:
  - Blocking (resolve before design)
  - Deferrable (resolve during implementation)

### Step 5: Research Context

Launch parallel research agents:
1. **Learnings Researcher** -- search `aidlc-docs/solutions/` for related past solutions
2. **Git History Analyzer** -- recent activity in related code areas
3. **Researcher** -- codebase patterns and constraints

Inject findings into the requirements document.

### Step 6: Output Requirements Document

Write to `aidlc-docs/{date}-{slug}/requirements.md`:

```markdown
# Requirements: {feature name}

## Problem Statement
{2-3 sentences from Step 1}

## Chosen Approach
{Selected approach from Step 3 with rationale}

## Multi-Perspective Review
### Product
{Key insights from Product Lens}
### Engineering
{Key insights from Engineering Lens}
### Design
{Key insights from Design Lens}

## Scope
### In Scope
- {bullet list}
### Out of Scope
- {bullet list}

## Requirements
1. {Specific, testable requirement}
2. {Specific, testable requirement}

## Success Criteria
- {Measurable outcome from Step 1}

## User Flows
{Critical flows identified by Design Lens}

## Technical Risks
{From Engineering Lens -- specific failure modes, not vague concerns}

## Assumptions
- {What we assume to be true}

## Open Questions
### Blocking (resolve before design)
- {Question that changes the design}
### Deferrable (resolve during implementation)
- {Question that can wait}

## Research Context
{Summary from Step 5 research agents}
```

### Step 7: Handoff

```
Requirements captured. Next steps:
  /super-aidlc [task]              → full pipeline using these requirements
  /super-aidlc:design [task]       → design doc only
  /super-aidlc:brainstorm [task]   → explore a different angle
```

## Rules

- **One question at a time.** Never dump all 5 questions at once.
- **Options over open-ended.** Give 2-4 choices with recommendations.
- **Three lenses are parallel, not sequential.** Dispatch simultaneously.
- **Never design in brainstorm.** No architecture, no file structures, no code.
- **Keep it under 15 minutes.** If longer, the problem is too big -- suggest splitting.
- **Challenge the request.** If Product Lens says "you're solving the wrong problem," surface that.

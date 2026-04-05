---
name: super-aidlc:brainstorm
description: Explore requirements before committing to design. Use when scope is ambiguous, multiple approaches exist, or the problem needs clarification.
argument-hint: "[describe what you want to explore]"
model: opus
---

# Brainstorm

The user wants to explore: $ARGUMENTS

## Process

### Step 1: Understand Intent

Ask 3-5 forcing questions to expose the core need:

1. **WHO** -- Who is the primary user of this feature? What is their workflow today?
2. **WHAT** -- What specific problem are they trying to solve? (Not "what feature" -- what PROBLEM.)
3. **WHY NOW** -- Why does this need to exist? What is the trigger or urgency?
4. **WHAT EXISTS** -- Is there a current workaround? What is wrong with it?
5. **WHAT SUCCESS** -- How will we know this worked? What is the measurable outcome?

Ask one question at a time. Use multiple-choice options when natural options exist. Lead with a recommendation.

### Step 2: Explore Approaches

Once intent is clear, explore 2-3 approaches:

For each approach:
- **Name**: Short descriptive name
- **How it works**: 2-3 sentences
- **Pros**: What is good about this approach
- **Cons**: What is risky or limiting
- **Effort**: Relative (small / medium / large)
- **Recommendation**: Which approach and why

Present to user for selection. If the user picks one, proceed. If none fit, iterate.

### Step 3: Define Scope Boundaries

After approach is chosen:

- **In scope**: What this feature WILL do (bullet list)
- **Out of scope**: What this feature will NOT do (bullet list, equally important)
- **Assumptions**: What we are assuming to be true
- **Open questions**: What we still need to figure out (blocking vs. deferrable)

### Step 4: Research Context

Launch parallel research agents to gather context:

1. **Learnings Researcher** -- search `aidlc-docs/solutions/` for related past solutions
2. **Git History Analyzer** -- check recent activity in related code areas
3. **Researcher** -- scan codebase for existing patterns and constraints

Inject findings into the scope document before finalizing.

### Step 5: Output Requirements Document

Write to `aidlc-docs/{date}-{slug}/requirements.md`:

```markdown
# Requirements: {feature name}

## Problem Statement
{2-3 sentences from Step 1}

## Chosen Approach
{Selected approach from Step 2 with rationale}

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

## Assumptions
- {What we assume to be true}

## Open Questions
### Blocking (resolve before design)
- {Question that changes the design}

### Deferrable (resolve during implementation)
- {Question that can wait}

## Research Context
{Summary from Step 4 research agents}
```

### Step 6: Handoff to Inception

After the user approves the requirements doc:

```
Requirements captured. Ready for design phase.
Run /super-aidlc to continue with inception using these requirements.
```

The Inception phase reads `aidlc-docs/{date}-{slug}/requirements.md` automatically. If it exists, Inception:
- Skips redundant questions already answered in requirements
- Uses the requirements as primary input for the Architect
- Carries forward scope boundaries and assumptions

## Rules

- **One question at a time.** Never dump all 5 forcing questions in a wall of text.
- **Options over open-ended.** When possible, give 2-4 choices with recommendations.
- **Explore before narrowing.** Let the user change their mind in Steps 1-2. Lock in at Step 3.
- **Never design in brainstorm.** No architecture, no file structures, no code. That is Inception's job.
- **Keep it under 15 minutes.** If brainstorm is taking longer, the problem is too big -- suggest splitting.

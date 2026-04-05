# Brainstorm Phase (Pre-Inception Exploration)

Optional phase before Inception. Use when requirements are unclear, scope is ambiguous, or the problem needs exploration before committing to a design.

## When to Use

- Heavy tasks where the user says "I want to build something like..."
- Tasks with multiple valid approaches and no clear winner
- Features where the user has a vague idea but needs help crystallizing it
- When the orchestrator detects high ambiguity in the task description

## When to Skip

- User provides clear, specific requirements
- Medium/Light tasks with obvious scope
- Bug fixes or config changes
- Continuation of prior sessions with existing design docs

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
3. **Researcher** (existing) -- scan codebase for existing patterns and constraints

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

The Inception phase reads `aidlc-docs/{date}-{slug}/requirements.md` automatically (same directory convention). If it exists, Inception:
- Skips redundant questions already answered in requirements
- Uses the requirements as primary input for the Architect
- Carries forward scope boundaries and assumptions

## Rules

- **One question at a time.** Never dump all 5 forcing questions in a wall of text.
- **Options over open-ended.** When possible, give 2-4 choices with recommendations.
- **Explore before narrowing.** Let the user change their mind in Steps 1-2. Lock in at Step 3.
- **Never design in brainstorm.** No architecture, no file structures, no code. That is Inception's job.
- **Keep it under 15 minutes.** If brainstorm is taking longer, the problem is too big -- suggest splitting.

## Language

Follow the session language for all output. Requirements doc uses the session language.

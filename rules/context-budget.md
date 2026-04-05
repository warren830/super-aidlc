# Context Budget

Token consumption is the #1 complaint across every AI coding methodology. Monolithic plans cost 60k+ tokens. Always-on documentation burns context even when unused. This file defines how Super-AIDLC manages context efficiently.

## The Problem

- Superpowers: monolithic plans cost ~60k tokens with re-reads (issue #512)
- AIDLC: 532-line core-workflow.md consumes ~12k tokens always-on (issue #105)
- gstack: ~360 lines of browse documentation loaded on every invocation (issue #368)

Super-AIDLC avoids these by loading documents ON DEMAND, not upfront.

## Loading Strategy: Read When Needed, Not Before

### What to Load at Session Start (always-on)
- `SKILL.md` -- entry point, complexity routing (~280 lines)
- `aidlc-docs/patterns.md` -- if it exists (~50 lines max)

### What to Load On Demand (lazy-load)
| Document | Load When |
|----------|-----------|
| `phases/inception.md` | Complexity is Medium or Heavy |
| `phases/construction.md` | Entering build phase |
| `phases/operations.md` | Entering ship phase |
| `agents/researcher.md` | Dispatching researcher |
| `agents/architect.md` | Dispatching architect (Heavy only) |
| `agents/builder.md` | Dispatching builder |
| `agents/spec-reviewer.md` | Dispatching spec review |
| `agents/quality-reviewer.md` | Dispatching quality review |
| `agents/design-reviewer.md` | Heavy design review |
| `agents/debugger.md` | Verification failure |
| `agents/qa.md` | QA phase (optional) |
| `rules/tdd.md` | Injected into builder prompt |
| `rules/review-protocol.md` | Before dispatching reviewers |
| `rules/anti-patterns.md` | Injected into builder prompt |
| `rules/overconfidence-prevention.md` | Phase transitions |
| `guards/careful.md` | Destructive command detected |
| `guards/freeze.md` | Scope lock requested |
| `guards/verification.md` | Before any completion claim |
| `extensions/security-baseline.md` | Design phase + quality review |

### What to NEVER Load Unless Requested
- `docs/blog-en.md`, `docs/blog-cn.md` -- reference material, not operational
- `docs/benchmark-greenfield.md`, `docs/benchmark-brownfield.md` -- reference material
- `README.md`, `README_CN.md` -- user-facing, not agent instructions

## Context Budget Per Complexity

| Complexity | Max Agent Context | Max Design Doc | Max Build Log |
|-----------|------------------|---------------|--------------|
| Light | ~5k tokens | N/A (no design) | ~20 lines |
| Medium | ~15k tokens | ~100 lines | ~50 lines |
| Heavy | ~30k tokens | ~300 lines | ~100 lines |

If a design doc exceeds the budget, summarize it before injecting into builder/reviewer prompts. Builders only need their unit's section, not the entire design doc.

## Prompt Injection Rules

When dispatching subagents (builders, reviewers), only inject what they need:

### Builder Agent Receives:
- `rules/tdd.md` (full)
- `agents/builder.md` (full)
- Their specific unit from the design doc (NOT the full design doc)
- Their rows from the Error/Rescue Map
- Their rows from Interface Contracts
- Researcher summary (if brownfield)
- Project patterns from `aidlc-docs/patterns.md`

### Spec Reviewer Receives:
- `agents/spec-reviewer.md` (full)
- The specific unit spec being reviewed
- The builder's report
- The code diff for that unit

### Quality Reviewer Receives:
- `agents/quality-reviewer.md` (full)
- The code diff
- Relevant design doc sections for context
- Security baseline constraints (if enabled)

### What NOT to inject into subagents:
- Full design doc when only one unit is relevant
- Other units' specs or code
- Blog posts, benchmarks, READMEs
- Prior build logs (only the Researcher reads those)

## Measuring Context Health

Signs your context is too bloated:
- Agent starts "forgetting" earlier instructions
- Agent gives generic responses instead of specific ones
- Agent skips steps it followed earlier in the session
- Agent takes notably longer to respond

If you notice these, check what is loaded and prune unnecessary context.

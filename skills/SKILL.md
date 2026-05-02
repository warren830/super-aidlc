---
name: super-aidlc:skills
description: Meta-skill for authoring new skills. Load before creating or modifying any skill file. Enforces structure, voice, and the anti-rationalization patterns that make skills actually shape agent behavior rather than reading as polite suggestions.
model: opus
---

# Writing Skills

## Overview

Skills are not documentation. Skills are **code that shapes agent behavior**. A well-written skill triggers at the right moment, names the agent's rationalizations back at it, and makes the correct action the path of least resistance. A poorly-written skill reads as earnest advice the agent politely ignores.

This meta-skill captures the patterns super-aidlc uses (borrowed and adapted from superpowers) so new skills do not regress to advisory-prose.

## The Iron Law

```
A SKILL MUST CHANGE WHAT THE AGENT DOES, NOT JUST WHAT IT KNOWS
```

If a skill is pure background information, it belongs in `docs/` or `rules/`. Skills are reserved for **behavior-shaping** content: hard rules, rationalization-blocking tables, and mandatory process steps.

## Required Structure

Every skill under `skills/<name>/SKILL.md` must have:

1. **YAML frontmatter** — `name` (must start with `super-aidlc:`), `description` (one sentence, when-to-use), `model` (usually `opus`).
2. **Overview** (2-4 sentences) — what the skill governs, core principle.
3. **The Iron Law** — one non-negotiable rule in a fenced code block. The agent violates this = delete work and restart, or STOP-and-ask.
4. **When it applies** — specific triggers; explicit exceptions (if any).
5. **Rationalization Prevention table** — `| Excuse | Reality |` format. Names the specific thoughts the agent will have when about to break the rule.
6. **Red Flags — STOP** — a bullet list of thought patterns that should halt progress.
7. **Integration with super-aidlc** — which phases/agents/skills reference this one.

Optional but recommended:
- Good/Bad code examples
- A walkthrough (bug fix example for `tdd`, failure modes for `verify`, etc.)
- "When Stuck" table

See `skills/verify/SKILL.md` and `skills/tdd/SKILL.md` for canonical shape.

## Voice and Framing

- Use **"the user"**, not "your human partner" (superpowers convention that does not fit super-aidlc).
- Write **imperatively** — "Run the test." "Quote the output." Not "You might want to run the test."
- Name the agent's internal state — "If you are thinking X, that is rationalization."
- Keep code fences tight — `✓` for good pattern, `✗` for bad. No emoji beyond these.

## Persuasion Principles (essence)

Borrowed from superpowers' `persuasion-principles.md`, compressed to the 3 that matter most:

1. **Commitment & Consistency** — open with an Iron Law framed as absolute. Once an agent accepts "no exceptions", later rationalizations conflict with that commitment.
2. **Social Proof via Failure Memory** — cite the failure mode explicitly ("24 past sessions did X and lost Y"). Agents respond to "this has caused real problems" better than "this could theoretically cause problems".
3. **Framing the Rule as Identity** — "Violating the letter is violating the spirit" turns rule-parsing into character judgment. Closes the rhetorical escape hatch of "technically I didn't break the rule".

Skip: scarcity, reciprocity, authority — they backfire on LLMs or read as manipulation.

## Red Flags — STOP When Writing Skills

- Your skill reads as advice: "You should consider...", "It may be helpful to..." → rewrite to Iron Law form.
- No rationalization table: you are assuming the agent will just comply. It will not.
- No Iron Law: the skill has nothing to anchor against. Even documentation skills like `worktree` get an Iron Law (e.g., "do not `rm -rf` worktree dirs with active state").
- Your skill duplicates another skill's content — link instead.
- Your skill is > 400 lines — it's doing too many jobs. Split.
- Your skill has no integration section — nothing references it, so nothing triggers it.

## Testing a Skill

Before shipping a skill:
1. Run `bun test` — `tests/skills.test.ts` auto-discovers and validates frontmatter + naming for every `skills/*/SKILL.md`.
2. Create the self-symlink: `ln -s /absolute/path/skills/<name> skills/<name>/<name>` (required for adapter discovery; all existing skills have this).
3. Add references from the skill's target integration points (phases, agents, other skills). A skill no one references is dead code.
4. If the skill claims a new behavior, trigger it in a scratch session and confirm the agent changes behavior — not just acknowledges the skill.

## Relationship to super-aidlc's Other Meta-Systems

- `skills/compound/` extracts *learnings* from a session into `aidlc-docs/solutions/`. That's session-level knowledge.
- `skills/compound-refresh/` keeps those learnings current.
- `skills/janitor/` sweeps stale sessions and suggests compounding.
- `skills/metrics/` measures trends across sessions.
- **This skill (`skills/skills/`)** governs the *authoring of behavior-shaping content itself*.

Together they cover: new knowledge capture (compound), knowledge maintenance (refresh + janitor), behavior measurement (metrics), and behavior authoring (this skill).

## The Bottom Line

A skill that does not change agent behavior is documentation misfiled as a skill. Before adding a new skill, ask: "What rationalization am I blocking? What failure mode am I preventing?" If you cannot answer, write docs instead.

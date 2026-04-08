---
name: super-aidlc:compound
description: Extract structured knowledge from the current session into aidlc-docs/solutions/. Run after solving non-trivial bugs or discovering important patterns.
argument-hint: "[optional: brief context about what to document]"
model: opus
---

# Compound Knowledge Extraction

Document a recently solved problem or learned insight to compound the project's institutional knowledge.

## Purpose

Captures problem solutions and insights while context is fresh, creating structured documentation in `aidlc-docs/solutions/` with YAML frontmatter for searchability and future reference. Uses parallel subagents for maximum efficiency.

Each documented solution compounds the team's knowledge. The first time a problem is solved takes research. Document it, and the next occurrence takes minutes.

## When to Use

Run `/super-aidlc:compound` (or invoke this skill) after:
- Solving a non-trivial bug (not a typo or config tweak)
- Discovering an important pattern or anti-pattern
- Making an architectural decision with lessons learned
- Resolving a production incident
- Completing a Heavy task with novel solutions

Do NOT run after:
- Changing a typo or CSS tweak
- Running a routine migration
- Pure config changes with no insight value

## Usage

```
/compound                     # Document the most recent fix
/compound [brief context]     # Provide additional context hint
/compound --compact           # Lightweight mode for smaller insights
```

## Support Files

Read these on-demand at the step that needs them -- do not bulk-load at skill start:

- `skills/compound/references/schema.yaml` -- canonical frontmatter fields and enum values
- `skills/compound/references/yaml-schema.md` -- category mapping from problem_type to directory
- `skills/compound/assets/resolution-template.md` -- section structure for new docs

When spawning subagents, pass the relevant file contents into the task prompt.

## Full Mode (default)

The primary output is ONE file -- the final documentation in `aidlc-docs/solutions/{category}/`.

Phase 1 subagents return TEXT DATA to the orchestrator. They must NOT use Write, Edit, or create any files. Only the orchestrator writes files.

### Phase 0.5: Auto Memory Scan

Before launching Phase 1 subagents, check for relevant prior knowledge:

1. Read `aidlc-docs/patterns.md` (if it exists) for relevant conventions.
2. Scan `aidlc-docs/solutions/` frontmatter for related prior solutions.
3. If relevant entries are found, prepare a labeled excerpt block to pass to Phase 1 agents.

### Phase 1: Parallel Research

Launch these subagents IN PARALLEL. Each returns text data to the orchestrator.

#### 1. Context Analyzer

- Extracts conversation history (what was the problem, what was tried)
- Reads `skills/compound/references/schema.yaml` for enum validation and track classification
- Determines the track: **bug** or **knowledge**
  - Bug track: symptoms, root_cause, resolution_type
  - Knowledge track: applies_when (symptoms/root_cause optional)
- Reads `skills/compound/references/yaml-schema.md` for category mapping
- Suggests filename: `[sanitized-problem-slug]-[date].md`
- Returns: YAML frontmatter skeleton, category directory path, suggested filename, track type

#### 2. Solution Extractor

Reads schema for track classification, then produces:

**Bug track sections:**
- **Problem**: 1-2 sentence description
- **Symptoms**: Observable symptoms (error messages, behavior)
- **What Didn't Work**: Failed investigation attempts and why
- **Solution**: The actual fix with code examples (before/after when applicable)
- **Why This Works**: Root cause explanation
- **Prevention**: Strategies to avoid recurrence with concrete examples

**Knowledge track sections:**
- **Context**: What situation prompted this guidance
- **Guidance**: The practice or pattern with code examples
- **Why This Matters**: Rationale and impact
- **When to Apply**: Conditions where this applies
- **Examples**: Concrete before/after or usage examples

#### 3. Related Docs Finder

- Searches `aidlc-docs/solutions/` for related documentation
- Searches `aidlc-docs/patterns.md` for related conventions
- Searches recent build logs for related issues
- Assesses overlap with the new doc across five dimensions:
  - Problem statement, root cause, solution approach, referenced files, prevention rules
- Score: **High** (4-5 match), **Moderate** (2-3 match), **Low** (0-1 match)
- Flags existing docs that may now be stale or contradicted
- Returns: links, relationships, overlap assessment

**Search strategy (grep-first for efficiency):**
1. Extract keywords from problem context
2. If category is clear, narrow to `aidlc-docs/solutions/{category}/`
3. Use Grep to pre-filter candidates before reading content
4. Read only frontmatter (first 30 lines) of candidates to score relevance
5. Fully read only strong/moderate matches
6. Return distilled links, not raw content

### Phase 2: Assembly & Write

WAIT for all Phase 1 subagents to complete before proceeding.

1. Collect all text results from Phase 1
2. Check overlap assessment:

| Overlap | Action |
|---------|--------|
| **High** | Update existing doc with fresher context rather than creating a duplicate |
| **Moderate** | Create new doc. Flag overlap for Phase 2.5 review |
| **Low or none** | Create new doc normally |

3. Assemble markdown from collected pieces using `assets/resolution-template.md` structure
4. Validate YAML frontmatter against `references/schema.yaml`
5. Create directory if needed: `mkdir -p aidlc-docs/solutions/{category}/`
6. Write the file

### Phase 2.5: Selective Refresh Check

After writing the new learning, decide whether older docs should be refreshed.

Invoke `/super-aidlc:compound-refresh` with a narrow scope hint when:
- A related doc recommends an approach the new fix contradicts
- The new fix clearly supersedes an older solution
- The work involved a refactor/migration that likely invalidated older references

Do NOT invoke when:
- No related docs were found
- Related docs are still consistent with the new learning

### Phase 3: Update patterns.md

If the new solution reveals a cross-cutting pattern confirmed by 2+ occurrences:
1. Read current `aidlc-docs/patterns.md`
2. Add or update the relevant entry
3. Keep under 50 lines

## Compact Mode (`--compact`)

For smaller insights that don't need full parallel research:

1. Single-agent extraction (no parallel subagents)
2. Shorter template (Problem + Solution + Prevention only)
3. Still writes to `aidlc-docs/solutions/` with proper frontmatter
4. No overlap check, no refresh trigger

## Phase 4: Global Knowledge Sharing (optional)

After writing the project-local solution doc, evaluate whether it's useful across projects:

**Promote to global when:**
- The solution is language/framework-generic (e.g., "git worktree hook workaround")
- The pattern applies to any project using the same tool (e.g., "vitest mock cleanup")
- The bug is in a shared dependency, not project-specific code

**Keep local when:**
- The solution references project-specific files, schemas, or architecture
- The pattern only makes sense in this project's context

**If promoting:**
1. Copy the solution doc to `~/.aidlc/global-solutions/{category}/`
2. Strip project-specific file paths and replace with generic descriptions
3. Add `scope: global` to the YAML frontmatter
4. Add `source_project: {project name}` to track origin

**If not promoting:** skip silently. Most solutions are project-specific.

The Researcher searches global-solutions AFTER project-local solutions (Layer 2b):
- Project-local solutions take priority (more relevant)
- Global solutions fill gaps when no local match exists

## Integration with Super-AIDLC

The Construction phase Step 9 auto-evaluates compound score and runs extraction for high-value sessions. The `/super-aidlc:janitor` command retroactively scans missed sessions.

The Researcher agent search order:
1. `aidlc-docs/patterns.md` (Layer 1 -- project conventions)
2. `aidlc-docs/solutions/` (Layer 2 -- project knowledge)
3. `~/.aidlc/global-solutions/` (Layer 2b -- cross-project knowledge)
4. Build-log summaries (Layer 3 -- session history)

## Language

All solution docs follow the session language. Code examples and frontmatter field names remain in English.

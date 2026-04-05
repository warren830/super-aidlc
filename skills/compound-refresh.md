# Compound Refresh

Maintain the quality of `aidlc-docs/solutions/` over time. Reviews existing learnings against the current codebase, then refreshes any derived pattern docs that depend on them.

## When to Use

- After refactors, migrations, or dependency upgrades
- When a recently solved problem contradicts an existing learning
- When pattern docs no longer reflect current code
- When multiple docs seem to cover the same topic (consolidation)
- Periodically as a knowledge base hygiene pass

## Usage

```
/compound-refresh                    # Review all docs
/compound-refresh {scope}            # Review docs matching scope
/compound-refresh --autofix          # Non-interactive mode
```

## Mode Detection

| Mode | When | Behavior |
|------|------|----------|
| **Interactive** (default) | No --autofix flag | Ask for decisions on ambiguous cases |
| **Autofix** | `--autofix` in arguments | No user interaction. Apply safe actions, mark ambiguous as stale |

## Maintenance Model

For each candidate artifact, classify into one of five outcomes:

| Outcome | Meaning | Action |
|---------|---------|--------|
| **Keep** | Still accurate and useful | No edit needed |
| **Update** | Core solution correct, references drifted | Fix paths, names, links in-place |
| **Consolidate** | Two+ docs overlap heavily, both correct | Merge into canonical doc, delete subsumed |
| **Replace** | Old artifact is now misleading | Create successor, delete old |
| **Delete** | No longer useful or applicable | Delete file (git preserves history) |

## Core Rules

1. **Evidence informs judgment.** Signals are inputs, not a mechanical scorecard.
2. **Prefer no-write Keep.** Do not update just to leave a review breadcrumb.
3. **Match docs to reality.** When code differs from a learning, update the learning.
4. **Be decisive.** When evidence is clear, apply the update. Only ask when genuinely ambiguous.
5. **Avoid low-value churn.** Do not edit for typos or cosmetic changes only.
6. **Delete when code is gone.** If referenced code no longer exists and no successor found, delete.
7. **No archive directory.** Git history is the archive. Delete, don't move to `_archived/`.

## Workflow

### Phase 0: Scope Selection

1. Discover all `.md` files under `aidlc-docs/solutions/`
2. If `$ARGUMENTS` provided, narrow scope by:
   - Directory match (e.g., `performance-issues`)
   - Frontmatter match (module, component, tags)
   - Filename match (partial OK)
   - Content search (keyword fallback)
3. Route by scope size:

| Scope | Route |
|-------|-------|
| **Focused** (1-2 files) | Investigate directly, present recommendation |
| **Batch** (3-8 files) | Investigate first, present grouped recommendations |
| **Broad** (9+ files) | Triage first, then investigate in batches by impact |

### Phase 1: Investigate Learnings

For each learning in scope, cross-reference against current codebase:

**Dimensions to check:**
- **References** -- do file paths, class names, modules still exist?
- **Solution** -- does the fix still match how code works today?
- **Code examples** -- do snippets reflect current implementation?
- **Related docs** -- are cross-references still present and consistent?
- **Overlap** -- does another doc cover the same problem domain?

**Drift classification:**
- **Update territory** -- paths moved, classes renamed, but core approach still correct
- **Replace territory** -- solution conflicts with current code, approach changed

The boundary: if you are rewriting the solution section, that is Replace, not Update.

### Phase 1.5: Investigate Pattern Docs

After learning docs, review pattern docs in `aidlc-docs/solutions/patterns/`.

Pattern docs are high-leverage -- a stale pattern is more dangerous than a stale learning because future work treats it as broadly applicable guidance.

### Phase 2: Document-Set Analysis

Look for consolidation opportunities:
- Two docs with 4-5 overlapping dimensions → consolidate
- One doc clearly supersedes another → replace reference + delete
- Cluster of docs that should cross-reference each other → add links

### Phase 3: Apply Actions

**Interactive mode:**
- Present recommendations grouped by action type
- Ask for confirmation on ambiguous cases
- Apply approved actions

**Autofix mode:**
- Apply all unambiguous actions (Keep, Update, Delete when evidence is strong)
- Mark ambiguous cases as stale with `status: stale` and `stale_reason` in frontmatter
- Generate summary report

### Phase 4: Report

```markdown
## Compound Refresh Report

### Applied
- {file}: {action taken} -- {reason}

### Recommended (manual review needed)
- {file}: {recommended action} -- {reason}

### Summary
- {N} docs reviewed
- {N} kept, {N} updated, {N} consolidated, {N} replaced, {N} deleted
- {N} marked stale for manual review
```

## Integration with Super-AIDLC

The `/compound` skill invokes `/compound-refresh` selectively in Phase 2.5 when new knowledge contradicts or supersedes existing docs.

The Researcher agent checks `status: stale` in frontmatter and deprioritizes stale docs in search results.

## Language

Follow the session language for reports and recommendations. Frontmatter field names and file paths remain in English.

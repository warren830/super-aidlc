---
name: super-aidlc:janitor
description: Scan recent sessions for uncompounded knowledge. Auto-compound high-value sessions, suggest medium-value ones, skip low-value ones.
argument-hint: "[--days=N] [--dry-run]"
model: opus
---

# Compound Janitor

Scan recent build logs, find sessions worth compounding, extract knowledge automatically.

$ARGUMENTS

## Flags

| Flag | Default | Effect |
|------|---------|--------|
| `--days=N` | 1 (today) | Scan build logs from the last N days |
| `--dry-run` | false | Show what would be compounded without doing it |
| `--with-refresh` | false | Also check for stale docs after compounding |

## Process

### Step 1: Discover Uncompounded Sessions

1. Scan `aidlc-docs/*/build-log.md` files.
2. Filter by date range (default: today, or `--days=N`).
3. For each build log, check if already compounded:
   - Extract the date + feature slug from the directory name (e.g., `2026-04-05-pagerduty-collector`)
   - Search `aidlc-docs/solutions/` for docs with matching date AND module/component keywords
   - If a matching solution doc exists → mark as "already compounded", skip
4. Collect uncompounded sessions.

If no uncompounded sessions found:
```
No uncompounded sessions found in the last {N} day(s).
All build logs already have corresponding solution docs.
```

### Step 2: Score Each Session

Read each uncompounded build log and score on these signals:

| Signal | Points | How to Detect |
|--------|--------|--------------|
| **Debugger invoked** | +3 | "Issues Encountered" section contains actual issues (not just "None") |
| **Multiple verification iterations** | +2 | Timing section shows verification iterations > 1 |
| **New conventions established** | +2 | "Decisions Made During Build" section is non-empty |
| **Architectural decisions** | +1 | Corresponding design doc has entries in "Alternatives Considered" |
| **Non-trivial test count** | +1 | Summary shows tests > 20 |

Read the build log to extract these signals. Do NOT guess -- check the actual content.

### Step 3: Act on Score

| Score | Action |
|-------|--------|
| **>= 3** | Auto-compound: run compound extraction without asking the user |
| **1-2** | Suggest: present to user, ask whether to compound |
| **0** | Skip silently (clean build with nothing novel) |

**Auto-compound process:**

For each qualifying session, run the compound extraction:

1. Read the build log for full context (issues, decisions, patterns).
2. Read the corresponding design doc if it exists.
3. Launch 3 parallel subagents (same as `/super-aidlc:compound`):
   - **Context Analyzer** → YAML frontmatter + category
   - **Solution Extractor** → structured doc sections
   - **Related Docs Finder** → overlap detection + links
4. Assemble and write the solution doc to `aidlc-docs/solutions/{category}/`.
5. Update `aidlc-docs/patterns.md` if new cross-cutting conventions were found.

**If `--dry-run`:** show the scoring table but do NOT create any files.

### Step 4: Optional Refresh (if `--with-refresh` or `--days >= 7`)

After compounding, check for stale knowledge:

1. Scan `aidlc-docs/solutions/` for docs with `status: active` older than 30 days.
2. If stale candidates found:
   ```
   Found {N} docs older than 30 days that may need refresh.
   Run /super-aidlc:compound-refresh? (y/n)
   ```
3. If user confirms, invoke compound-refresh with autofix mode.

### Step 5: Report

Display a summary table:

```
Janitor Report ({N} day scan):

| Session | Date | Score | Action | Docs Created |
|---------|------|-------|--------|-------------|
| pagerduty-collector | 2026-04-05 | 5 | Auto-compounded | 3 |
| pagerduty-transformer | 2026-04-05 | 3 | Auto-compounded | 2 |
| fix-login-typo | 2026-04-04 | 0 | Skipped | - |
| api-rate-limiter | 2026-04-03 | 2 | Suggested (user declined) | - |

Summary: 2 sessions compounded, 5 new solution docs, 1 skipped, 1 declined.
```

If `--with-refresh` was active:
```
Stale docs: {N} docs flagged for review.
```

## Scoring Examples

**High-value session (score 7):** Built a payment system. Debugger was invoked twice (3). Verification took 3 iterations (2). Decided to use Stripe over PayPal (1). 45 tests written (1).

**Medium-value session (score 2):** Added a new API endpoint. Clean build (0). One new convention about response format (2). 12 tests (0).

**Low-value session (score 0):** Fixed a CSS alignment bug. No issues, no decisions, no patterns, 2 tests.

## Integration with Construction Phase

Step 9 of `phases/construction.md` uses the same scoring logic to auto-evaluate at build completion. The janitor is for catching sessions where Step 9 was missed or where the user skipped the suggestion.

## Rules

- **Never compound trivial sessions.** A score of 0 means the session was clean -- that's good, not a gap.
- **Respect existing docs.** If a solution already exists for this session, skip it.
- **Keep patterns.md under 50 lines.** If janitor would exceed this, prune least useful entries.
- **Dry-run first.** When in doubt, run with `--dry-run` to preview before auto-compounding.

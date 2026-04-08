---
name: super-aidlc:metrics
description: Generate session metrics trends from build logs. Shows time, tests, bugs, compound scores, and strategy effectiveness over time.
argument-hint: "[--days=N] [--format=table|chart]"
model: opus
---

# Session Metrics

Analyze build log history and generate trend reports.

$ARGUMENTS

## Flags

| Flag | Default | Effect |
|------|---------|--------|
| `--days=N` | 30 | Analyze build logs from the last N days |
| `--format=table` | table | Output format: `table` (markdown) or `chart` (ASCII) |
| `--project` | current | Analyze current project only (default) |
| `--global` | false | Include global metrics from `~/.aidlc/global-solutions/` |

## Process

### Step 1: Collect Build Logs

Scan `aidlc-docs/*/build-log.md` within the date range. For each log, extract the `## Metrics` section (structured data). If the log has no Metrics section (older format), extract what's available from Summary and Timing sections.

### Step 2: Extract Per-Session Metrics

From each build log, extract:

| Metric | Source in Build Log |
|--------|-------------------|
| `date` | Directory name or Summary date |
| `complexity` | Summary or auto-detect from units/files |
| `strategy` | INLINE / SERIAL / PARALLEL |
| `total_time_s` | Timing → Total |
| `inception_time_s` | Timing → Inception |
| `build_time_s` | Timing → Construction |
| `review_time_s` | Timing → Review |
| `verify_iterations` | Timing → Verification iterations |
| `test_count` | Summary → Tests |
| `test_coverage_pct` | Summary → Coverage |
| `issues_encountered` | Count of items in Issues Encountered |
| `decisions_made` | Count of items in Decisions Made |
| `compound_score` | From Metrics section (if present) |
| `compound_action` | auto / suggested / skipped |
| `reviewer_findings` | Count of P0-P3 findings from Quality Review |
| `security_vulns` | Count of P0 security findings |

### Step 3: Compute Trends

| Trend | Calculation | Good Direction |
|-------|------------|----------------|
| **Time per session** | Moving average (3-session window) | Decreasing |
| **Tests per session** | Moving average | Increasing |
| **Issues per session** | Moving average | Decreasing |
| **Verify iterations** | Average | Approaching 1 |
| **Compound rate** | % of sessions auto-compounded | Stable (not 100%, not 0%) |
| **Knowledge base size** | Count of docs in solutions/ | Growing but bounded |
| **Strategy distribution** | % INLINE / SERIAL / PARALLEL | Context-dependent |

### Step 4: Generate Report

```markdown
# Super-AIDLC Metrics Report
Period: {start_date} to {end_date}
Sessions: {count}

## Summary
| Metric | Current (last 5) | Previous (5 before) | Trend |
|--------|-----------------|--------------------:|-------|
| Avg time | {Xm} | {Ym} | ↓ faster |
| Avg tests | {N} | {M} | ↑ more |
| Avg issues | {N} | {M} | ↓ fewer |
| Avg verify iterations | {N} | {M} | ↓ cleaner |
| Knowledge base docs | {N} | {M} | ↑ growing |

## Session History
| Date | Feature | Strategy | Time | Tests | Issues | Score |
|------|---------|----------|------|-------|--------|-------|
| {date} | {slug} | PARALLEL | {Xm} | {N} | {N} | {N} |
| ... | ... | ... | ... | ... | ... | ... |

## Insights
- {e.g., "PARALLEL strategy saves ~30% time vs SERIAL for 3+ unit tasks"}
- {e.g., "Sessions with compound score >= 3 have 40% fewer issues in subsequent sessions"}
- {e.g., "Average verify iterations dropped from 2.1 to 1.3 over the last 10 sessions"}

## Knowledge Base Health
- Total solution docs: {N}
- Active: {N} | Stale: {N} | Superseded: {N}
- Most referenced: {title} ({N} times)
- Oldest unrefreshed: {title} ({N} days)
```

## Rules

- Only report what the data shows. Do not fabricate trends from insufficient data (< 3 sessions).
- If fewer than 5 sessions exist, show raw data without trend analysis.
- Insights section should contain actionable observations, not restating numbers.

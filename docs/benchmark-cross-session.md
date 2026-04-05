# Cross-Session Benchmark: Super-AIDLC v4 vs Superpowers

Evaluates the compound knowledge system by running 3 related sessions on Apache DevLake.

**Date**: 2026-04-05
**Project**: [Apache DevLake](https://github.com/apache/incubator-devlake) -- Go backend, TypeScript config-ui, MySQL/PostgreSQL
**Model**: Claude Opus 4.6, both approaches run in parallel on the same commit
**Version**: Super-AIDLC v4.0.0 vs Superpowers latest

---

## Why DevLake

DevLake's plugin architecture creates a natural 3-session progression:
1. **Collector** (Session 1) -- fetch data from an API
2. **Transformer** (Session 2) -- normalize raw data into domain models
3. **Enricher** (Session 3) -- compute metrics across data sources

Each session builds on patterns established in the previous one. This is the exact scenario where cross-session knowledge should pay off.

---

## Setup

### Parallel Tracks

| Track | Methodology | Knowledge System |
|-------|------------|-----------------|
| Track A | **Super-AIDLC v4** | aidlc-docs/solutions/ + patterns.md + build logs |
| Track B | **Superpowers** | None (each session starts fresh) |

### Rules

- Both tracks work on the same base commit of DevLake
- Both use Claude Opus 4.6
- Both use Medium complexity (not Light, not Heavy)
- Neither track gets manual hints or prior context injected
- Between sessions: Track A keeps its aidlc-docs/ intact; Track B gets no carryover
- Timer starts when the prompt is sent, stops when the PR/commit is created

---

## Session 1: PagerDuty Incident Collector

### Task Prompt (identical for both tracks)

```
Build a PagerDuty incident collector plugin for DevLake.

Requirements:
- New plugin at backend/plugins/pagerduty/
- Collect incidents from PagerDuty REST API v2 (/incidents endpoint)
- Store raw JSON in the raw layer (following existing plugin patterns)
- Implement rate limiting (PagerDuty rate limit: 960 req/min)
- Handle pagination (offset-based)
- Support incremental collection (collect since last run)
- Unit tests for API client and collector logic
- Follow existing plugin conventions (look at backend/plugins/github/ for reference)
```

### What to Measure

| Metric | Track A (v4) | Track B (SP) |
|--------|-------------|-------------|
| Wall clock time | | |
| Token consumption | | |
| Test count | | |
| Test pass rate | | |
| Security vulns found | | |
| Build passes | | |
| Files created | | |
| Design doc quality (1-10) | | |
| Pattern fidelity (matches existing plugins 1-10) | | |

### Expected Knowledge Output (Track A only)

After Session 1, run `/compound`. Expected docs in `aidlc-docs/solutions/`:

- Plugin creation pattern (Go interface, directory structure)
- API rate limiting approach (token bucket? 429 retry?)
- Raw layer storage pattern (how DevLake stores JSON)
- Test fixture pattern (mock HTTP server? testify?)

---

## Session 2: PagerDuty Transformer

### Task Prompt (identical for both tracks)

```
Add a transformer for the PagerDuty plugin to normalize raw incidents into
DevLake's domain model.

Requirements:
- Transform raw PagerDuty incidents into tool-layer models (pagerduty_incidents table)
- Map to domain-layer models (issues table with type=INCIDENT)
- Handle field mapping: severity → priority, status → state, created_at → created_date
- Handle missing/null fields gracefully
- Add database migration for new tables
- Link incidents to services (if service data exists)
- Integration tests that verify collector → transformer pipeline
- Follow existing transformer patterns (look at backend/plugins/github/tasks/)
```

### What to Measure (same table as Session 1, plus:)

| Cross-Session Metric | Track A (v4) | Track B (SP) |
|---------------------|-------------|-------------|
| Referenced S1 patterns? | Y/N + which ones | N/A |
| Avoided S1 dead ends? | Y/N + which ones | N/A |
| Reused S1 test fixtures? | Y/N | N/A |
| Time delta vs Session 1 | faster/slower/same | faster/slower/same |
| Bugs that S1 already solved | count | count |

### Key Observations

- Does Track A's Researcher find the Session 1 solution docs?
- Does Track A avoid re-investigating rate limiting (already solved in S1)?
- Does Track A reuse the plugin structure pattern from S1?
- Does Track B re-discover all of these from scratch?

---

## Session 3: Incident Reliability Metric (Enricher)

### Task Prompt (identical for both tracks)

```
Build an enricher plugin that calculates MTTR (Mean Time To Resolution) for
PagerDuty incidents, with trend analysis.

Requirements:
- New enricher at backend/plugins/pagerduty/tasks/incident_mttr_enricher.go
- Calculate MTTR per service, per week, for the last 12 weeks
- Join incidents with GitHub commits (find the commit that resolved each incident)
- Store results in a new analytics table (pagerduty_incident_mttr)
- Handle edge cases: incidents with no resolution, incidents spanning multiple services
- Create a Grafana dashboard JSON with 3 panels:
  1. MTTR trend line (weekly)
  2. MTTR by service (bar chart)
  3. Incident volume vs MTTR correlation (scatter)
- Unit tests for MTTR calculation logic
- Integration test for the full pipeline (collect → transform → enrich)
- Follow existing enricher patterns (look at backend/plugins/dora/)
```

### What to Measure (same as S1+S2, plus:)

| Cumulative Metric | Track A (v4) | Track B (SP) |
|-------------------|-------------|-------------|
| Referenced S1+S2 patterns? | Y/N + count | N/A |
| Knowledge docs in solutions/ | count | N/A |
| Total 3-session time | sum | sum |
| Total 3-session tests | sum | sum |
| Time trend (S1→S2→S3) | accelerating? | flat? |
| Bug trend (S1→S2→S3) | decreasing? | flat? |

---

## Scoring Rubric

### Single-Session Metrics (per session)

| Metric | Weight | How to Score |
|--------|--------|-------------|
| Wall clock time | 15% | Lower is better |
| Test count & quality | 20% | More tests + meaningful assertions |
| Security vulns | 15% | Zero = 10, each vuln = -2 |
| Build passes | 10% | Pass = 10, Fail = 0 |
| Pattern fidelity | 15% | Matches DevLake conventions (1-10 expert review) |
| Design doc quality | 10% | Useful for next maintainer? (1-10 expert review) |
| Code quality | 15% | Clean, readable, follows Go idioms (1-10 expert review) |

### Cross-Session Metrics (final score)

| Metric | Weight | How to Score |
|--------|--------|-------------|
| Knowledge reuse rate | 25% | % of S1 patterns referenced in S2/S3 |
| Dead-end avoidance | 20% | S2/S3 avoided mistakes that S1 already solved |
| Time improvement | 20% | S3 time < S1 time? By how much? |
| Bug rate improvement | 15% | S3 bugs < S1 bugs? |
| Knowledge base quality | 20% | Human review of aidlc-docs/solutions/ (1-10) |

---

## Expected Outcome Hypothesis

| Hypothesis | Expected Result |
|-----------|----------------|
| **H1**: S1 scores will be similar | Both tracks are starting fresh, no knowledge advantage yet |
| **H2**: S2 scores diverge | Track A (v4) references S1 solutions; Track B starts over |
| **H3**: S3 shows clear advantage | Track A has 2 sessions of accumulated knowledge; Track B has none |
| **H4**: Track A total time < Track B | Knowledge reuse saves time across sessions |
| **H5**: Track A total bugs < Track B | Dead-end avoidance prevents repeated mistakes |
| **H6**: Track A code is more consistent | Same patterns reused → more uniform codebase |

### Null Hypothesis

If Super-AIDLC v4 shows no improvement over Superpowers in S2/S3, then the compound knowledge system is not working as designed. Investigate:
- Is the Researcher actually finding solutions/ docs?
- Are the solutions/ docs structured well enough to be useful?
- Is the overhead of /compound worth it?

---

## Execution Checklist

### Before Starting

- [ ] Clone DevLake at a specific commit (record the SHA)
- [ ] Create two separate working directories (track-a/, track-b/)
- [ ] Install Super-AIDLC v4 in track-a/
- [ ] Install Superpowers in track-b/
- [ ] Verify both can build DevLake (`make build`)
- [ ] Set up token/cost tracking for both tracks

### Session 1

- [ ] Send identical prompt to both tracks simultaneously
- [ ] Record start time for both
- [ ] Track A: After completion, run `/compound`
- [ ] Record all metrics for both tracks
- [ ] Verify Track A has solutions/ docs
- [ ] Do NOT carry any context to Track B's next session

### Session 2

- [ ] Send identical prompt to both tracks
- [ ] Track A: Observe whether Researcher references S1 solutions
- [ ] Record all metrics + cross-session metrics
- [ ] Track A: Run `/compound` after completion
- [ ] Check if /compound-refresh is triggered (overlap with S1 docs?)

### Session 3

- [ ] Send identical prompt to both tracks
- [ ] Track A: Observe knowledge retrieval from S1+S2
- [ ] Record all metrics + cumulative metrics
- [ ] Track A: Run `/compound` after completion
- [ ] Final knowledge base review (quality score 1-10)

### After All 3 Sessions

- [ ] Calculate all scoring rubric values
- [ ] Compare total time, total tests, total bugs
- [ ] Graph the time trend (S1→S2→S3) for both tracks
- [ ] Graph the bug trend (S1→S2→S3) for both tracks
- [ ] Human-review Track A's aidlc-docs/solutions/ (quality 1-10)
- [ ] Write conclusion: did compound knowledge make a measurable difference?

---

## Report Template

```markdown
# Cross-Session Benchmark Results

## Environment
- DevLake commit: {SHA}
- Model: Claude Opus 4.6
- Date: {date}
- Super-AIDLC version: 4.0.0
- Superpowers version: {version}

## Session 1 Results
{metrics table}

## Session 2 Results
{metrics table}
### Cross-Session Observations
- Track A referenced these S1 patterns: {list}
- Track A avoided these S1 dead ends: {list}
- Track B re-discovered: {list}

## Session 3 Results
{metrics table}
### Cumulative Cross-Session Observations
- Track A referenced these S1+S2 patterns: {list}
- Knowledge base size: {N} docs in solutions/

## Cumulative Comparison
| Metric | Track A (v4) | Track B (SP) | Delta |
|--------|-------------|-------------|-------|
| Total time | | | |
| Total tests | | | |
| Total bugs | | | |
| Time trend | | | |
| Bug trend | | | |

## Knowledge Base Review
{Human review of aidlc-docs/solutions/}
Score: {1-10}

## Conclusion
{Did H1-H6 hold? What was the measured advantage (if any)?}

## Recommendations
{What to improve in the compound system based on findings}
```

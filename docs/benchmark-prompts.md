# Benchmark Prompts

Base commit: `94f7bca49` (both tracks)

## Session 1: PagerDuty Incident Collector

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

### Track A command
```
cd /Users/ychchen/warren_ws/devlake-track-a
claude
/super-aidlc Build a PagerDuty incident collector plugin for DevLake. ...
```

### Track B command
```
cd /Users/ychchen/warren_ws/devlake-track-b
claude
/superpowers:brainstorming Build a PagerDuty incident collector plugin for DevLake. ...
```

---

## Session 2: PagerDuty Transformer

```
Add a transformer for the PagerDuty plugin to normalize raw incidents into DevLake's domain model.

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

---

## Session 3: Incident MTTR Enricher

```
Build an enricher plugin that calculates MTTR (Mean Time To Resolution) for PagerDuty incidents, with trend analysis.

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

---

## Post-Session Checklist

After each session, record in a results file:

```bash
# Time
echo "Start: $(date)" >> results-track-{a|b}.md
# ... run session ...
echo "End: $(date)" >> results-track-{a|b}.md

# Code metrics
find backend/plugins/pagerduty -name '*.go' | wc -l
find backend/plugins/pagerduty -name '*_test.go' | wc -l
grep -r 'func Test' backend/plugins/pagerduty/ | wc -l
cd backend && go build ./plugins/pagerduty/... 2>&1
cd backend && go test ./plugins/pagerduty/... 2>&1

# Track A only: run /compound after each session
# Track A only: check aidlc-docs/solutions/ content
```

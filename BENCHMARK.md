# Benchmark: Super-AIDLC vs AIDLC-workflows

Two A/B tests on the same codebase (claude-code-claw, TypeScript monorepo), same model (Claude Opus 4.6), run in parallel. AIDLC followed core-workflow.md. Super-AIDLC followed SKILL.md with phases/agents/rules.

---

## Test 1: Medium Complexity -- Agent Health Check Endpoint

**Task**: Add GET /api/health/agents returning per-agent status, version, last active time, uptime.

### Efficiency

| Metric | AIDLC | Super-AIDLC | Delta |
|--------|-------|-------------|-------|
| Wall clock time | 595s (~10 min) | 390s (~6.5 min) | **-35%** |
| Token consumption | 121,389 | 90,919 | **-25%** |
| Tool calls | 107 | 66 | **-38%** |

### Code Quality

| Metric | AIDLC | Super-AIDLC |
|--------|-------|-------------|
| New tests | 18 (14 unit + 4 integration) | 17 (14 unit + 3 integration) |
| Code files changed | 9 | 5 |
| Build | Pass | Pass |
| Modified core code | Yes (ClaudeClient) | No (self-contained service) |

### TDD Compliance

| Check | AIDLC | Super-AIDLC |
|-------|-------|-------------|
| Tests before implementation | No (Step 5 of 6) | Yes (RED verified before GREEN) |
| RED phase documented | No | Yes ("module not found" confirmed) |
| GREEN phase documented | No | Yes (all tests pass) |

### Review & Design

| Artifact | AIDLC | Super-AIDLC |
|----------|-------|-------------|
| Independent review | No | Yes (spec compliance + quality) |
| Architecture diagram | No | Yes (ASCII) |
| Error/Rescue Map | No | Yes (5 rows) |
| Decisions Log | No | Yes (5 decisions) |
| Audit trail (audit.md) | Yes | No (build-log only) |
| Total doc files | 6 | 2 |

---

## Test 2: Heavy Complexity -- Agent Analytics API

**Task**: Add GET /api/analytics/agents with per-agent metrics: total queries, avg response time, error rate, hourly trend (24h), top 5 users. Requires 4 components: metrics collector middleware, metrics store (circular buffer), aggregation engine, REST API routes. Cross-package: types in shared, logic in runtime, routes in gateway.

### Efficiency

| Metric | AIDLC | Super-AIDLC | Delta |
|--------|-------|-------------|-------|
| Wall clock time | 742s (~12.4 min) | 1,105s (~18.4 min) | **+49% (AIDLC faster)** |
| Token consumption | 141,927 | 143,741 | ~same |
| Tool calls | 118 | 163 | **+38% more (Super-AIDLC)** |

Super-AIDLC was slower due to a ts-jest module resolution issue that required multiple debug-fix cycles. The Heavy workflow (full design doc, TDD RED-GREEN verification, two-stage review) also adds legitimate overhead. AIDLC skipped several optional stages (User Stories, Units Generation, Functional Design, NFR Design) and went straight to code generation.

### Code Quality

| Metric | AIDLC | Super-AIDLC |
|--------|-------|-------------|
| New tests | 25 (17 unit + 8 endpoint) | 26 (19 unit + 7 endpoint) |
| New code files | 2 | 4 (store, aggregator, collector, API) |
| Modified files | 6 | 6 |
| Test files | 2 | 4 |
| Build | Pass | Pass |
| All tests pass | 483 | 484 |
| Architecture | Monolithic AnalyticsStore with inline aggregation | Separated: Store + Aggregator + Collector (SRP) |

Super-AIDLC produced a more modular architecture: separate files for storage (analytics-store.ts), aggregation (analytics-aggregator.ts), collection (analytics-collector.ts), and API (analytics-api.ts). AIDLC put everything in one analytics-store.ts with aggregation inline.

### TDD Compliance

| Check | AIDLC | Super-AIDLC |
|-------|-------|-------------|
| Tests before implementation | No (Step 3 of 8 = tests after store, Step 7 = API tests after routes) | Yes (tests written first, RED verified) |
| RED phase documented | No | Yes (build errors confirmed as expected RED) |
| GREEN phase documented | No | Yes (26 tests pass after implementation) |
| Debug cycle on test failures | N/A | Yes -- ts-jest resolution issue caught and fixed during RED phase |

AIDLC's code-gen plan: Step 1 (types) → Step 2 (store code) → Step 3 (store tests) → Step 4 (handler integration) → Step 5 (API routes) → Step 7 (API tests). Code before tests at every stage.

Super-AIDLC: tests written first for each component, verified RED (failure for right reason), then implementation to GREEN. The ts-jest issue was caught early because tests were written before the implementation was wired in.

### Review & Design

| Artifact | AIDLC | Super-AIDLC |
|----------|-------|-------------|
| Independent review | No | Yes (spec + quality) |
| Architecture diagram | No | Yes (5-component data flow) |
| Error/Rescue Map | No | Yes (6 rows) |
| Units of Work table | No | Yes (5 units, parallelism marked) |
| Decisions Log | No | Yes (10 decisions with rationale) |
| NFR section | In requirements (brief) | Dedicated section (response time, retention, memory) |
| Application Design doc | Yes (AIDLC-specific) | N/A (in unified design.md) |
| Audit trail | Yes (audit.md) | No (build-log only) |
| Total doc files | 8 | 2 |

Super-AIDLC's design doc is notably richer for Heavy tasks: full data flow diagram, 6-row error map, 5-unit breakdown with parallel identification, 10-row decisions log. AIDLC produced more files (8) but with less structured content per file and no visual aids.

### Architecture Comparison

**AIDLC -- Monolithic approach:**
```
analytics-store.ts (AnalyticsStore class)
  - record()
  - cleanup()
  - getAllAgentSummaries()  ← aggregation inline
  - getAgentSummary()       ← aggregation inline
```

**Super-AIDLC -- Separated responsibilities:**
```
analytics-store.ts      → storage only (record, getEvents, cleanup)
analytics-aggregator.ts → aggregation only (aggregate, aggregateAgent)
analytics-collector.ts  → event creation (collectMetricEvent)
analytics-api.ts        → REST routes (mounted in server.ts)
```

Super-AIDLC's separation follows the Single Responsibility Principle, making each component independently testable (4 test files vs 2). The tradeoff is more files and slightly more complexity.

---

## Cross-Test Analysis

### Consistent Patterns (Both Tests)

| Pattern | AIDLC | Super-AIDLC |
|---------|-------|-------------|
| TDD compliance | Code first, tests after | Tests first, verified RED then GREEN |
| Review process | No independent review | Two-stage (spec + quality) |
| Design doc richness | Requirements + plan (text only) | Architecture diagram + error map + decisions log |
| Audit trail | Complete (audit.md) | Summary (build-log.md) |
| Doc file count | More files, less structure | Fewer files, richer content |

### Efficiency Story

| Test | AIDLC | Super-AIDLC | Winner |
|------|-------|-------------|--------|
| Medium (health check) | 595s / 121K tokens | 390s / 91K tokens | **Super-AIDLC (-35%)** |
| Heavy (analytics API) | 742s / 142K tokens | 1,105s / 144K tokens | **AIDLC (-34%)** |

**Key insight**: Super-AIDLC's efficiency advantage is strongest on Medium tasks where complexity routing skips unnecessary ceremony. On Heavy tasks, the additional rigor (full design doc, TDD verification, two-stage review) adds overhead that AIDLC avoids by skipping optional stages. The Heavy test was also affected by a ts-jest resolution issue that added ~5 minutes of debug time.

**Adjusted estimate** (removing the ts-jest issue): Super-AIDLC's Heavy time would have been ~800s, making the two workflows roughly equal on time for Heavy tasks, with Super-AIDLC producing better-structured output.

### Quality Story

| Dimension | Medium Test | Heavy Test | Consistent? |
|-----------|------------|------------|-------------|
| Test count | ~Same (18 vs 17) | ~Same (25 vs 26) | Yes |
| TDD order | AIDLC: code first | AIDLC: code first | Yes -- AIDLC never does TDD |
| Review | AIDLC: none | AIDLC: none | Yes -- AIDLC never reviews |
| Architecture | Super-AIDLC: more modular | Super-AIDLC: more modular | Yes |
| Design doc | Super-AIDLC: richer | Super-AIDLC: richer | Yes |

---

## Conclusions

1. **Super-AIDLC excels at Medium tasks** -- 35% faster with equal quality. The complexity router correctly minimizes overhead.

2. **Heavy tasks are a tradeoff** -- Super-AIDLC produces better-structured code and documentation but takes longer due to additional rigor (TDD verification, two-stage review, comprehensive design doc). When no unexpected issues occur, the two are roughly equal in time.

3. **TDD compliance is a consistent Super-AIDLC advantage** -- AIDLC never wrote tests before implementation across both tests. Super-AIDLC always did, catching the ts-jest issue early in the Heavy test.

4. **AIDLC's audit trail is a consistent advantage** -- For compliance-heavy environments, AIDLC's audit.md with timestamped phase transitions is valuable. Super-AIDLC should consider adding this.

5. **Design doc quality consistently favors Super-AIDLC** -- Architecture diagrams, error maps, and decisions logs are produced every time, regardless of complexity. AIDLC never produced these artifacts.

### When to Use Which

| Scenario | Recommendation |
|----------|---------------|
| Bug fix, config change | Super-AIDLC (Light routing, fast TDD cycle) |
| New feature, clear requirements | Super-AIDLC (Medium routing, -35% time, better design doc) |
| Large system, multi-component | Either (roughly equal time; Super-AIDLC for better structure, AIDLC for audit trail) |
| Regulated environment requiring audit | AIDLC (audit.md is more complete) |
| Team with TDD discipline concerns | Super-AIDLC (mechanical enforcement, not voluntary) |

# Greenfield Benchmark: 4-Way Comparison

Build the same complete project from scratch using 4 different approaches.

**Date**: 2026-03-21

**Task**: Feishu Claude Code Controller -- a Node.js/TypeScript app that controls Claude Code CLI via Feishu WebSocket. Features: 7 slash commands (/clone, /code, /ask, /workspace, /status, /skill, /plugin), Feishu Interactive Cards, per-user workspaces, one-click Docker deployment.

**Model**: Claude Opus 4.6, all 4 run in parallel.

---

## Results

### Efficiency

| Metric | Raw | Superpowers | Super-AIDLC | AIDLC |
|--------|-----|-------------|-------------|-------|
| Wall clock time | **300s (5 min)** | 540s (9 min) | 599s (10 min) | 875s (14.6 min) |
| Token consumption | **30,457** | 73,888 | 72,184 | 116,922 |
| Tool calls | **30** | 94 | 80 | 114 |

Raw is fastest by a wide margin -- no methodology overhead at all. Superpowers is 2nd. Super-AIDLC is 3rd. AIDLC is slowest (nearly 3x Raw).

### Code Output

| Metric | Raw | Superpowers | Super-AIDLC | AIDLC |
|--------|-----|-------------|-------------|-------|
| Source files | 10 | 21 | 12 | 19 |
| Source lines | 1,407 | 994 | 1,241 | 1,802 |
| Test files | 4 | **16** | 13 | 9 |
| Test count | 26 | **68** | 58 | 63 |
| Deployment files | 4 | 4 | 4 | 4 |
| Build | Pass | Pass | Pass | Pass |

Superpowers produced the most tests (68) and most modular code (21 source files). Raw produced the fewest tests (26) but the most code per file. AIDLC wrote the most total lines (1,802).

### Architecture

| Dimension | Raw | Superpowers | Super-AIDLC | AIDLC |
|-----------|-----|-------------|-------------|-------|
| File organization | Flat-ish (10 files) | Very modular (21 files, 1 per component) | Modular (12 files) | Modular (19 files with types) |
| Command handlers | Single router file | Separate file per command | Combined handlers/index.ts | Separate file per command |
| Card builder | Single class | Single class | Builder with 7 card types | Builder with templates |
| Feishu connection | Direct WSClient | Client wrapper | Client + MessageSender | Client + types |
| Error handling | Try/catch in router | Per-handler with cards | Per-handler with cards | Per-handler with cards |

### TDD Compliance

| Check | Raw | Superpowers | Super-AIDLC | AIDLC |
|-------|-----|-------------|-------------|-------|
| Tests before code | **No** | **Yes** | **Yes** | **No** |
| Every module tested | No (3/10) | Yes (16/21) | Yes (9/12) | Partial (8/19) |
| RED phase verified | No | Yes | Yes | No |

Raw and AIDLC wrote code first, tests after. Superpowers and Super-AIDLC followed TDD.

### Documentation

| Artifact | Raw | Superpowers | Super-AIDLC | AIDLC |
|----------|-----|-------------|-------------|-------|
| Architecture diagram | No | No | **Yes** | No |
| Error/Rescue Map | No | No | **Yes (12 rows)** | No |
| Decisions Log | No | No | **Yes** | No |
| Alternatives Considered | No | No | **Yes** | No |
| User Stories | No | No | No | **Yes (3 personas, 10 stories)** |
| Audit trail | No | No | Build-log | **audit.md** |
| Total doc files | **0** | **0** | **2** | **14** |

Super-AIDLC produced the most useful design docs (architecture + error map + decisions). AIDLC produced the most docs (14 files) but spread across many small files (personas, stories, component methods, services, dependency matrix). Superpowers and Raw produced zero documentation.

### Feature Completeness

All 4 implementations include:
- Feishu WebSocket connection via @larksuiteoapi/node-sdk
- Claude Code CLI execution via child_process.spawn
- 7+ slash commands
- Feishu Interactive Card formatting
- Per-user workspace management
- Skill and plugin management
- Dockerfile + docker-compose.yml + deploy.sh + .env.example
- Structured JSON logging

All 4 are functionally equivalent.

---

## Analysis

### Speed vs Quality Tradeoff

```
Speed:    Raw (5m) >>> Superpowers (9m) > Super-AIDLC (10m) >> AIDLC (15m)
Tests:    Superpowers (68) > AIDLC (63) > Super-AIDLC (58) >> Raw (26)
Docs:     Super-AIDLC (useful) > AIDLC (thorough) >> Raw = Superpowers (none)
TDD:      Superpowers = Super-AIDLC >> Raw = AIDLC
```

### Key Findings

1. **Raw is 3x faster but produces half the tests.** 26 tests vs 58-68 for the structured approaches. If you need to ship fast and don't care about test coverage, Raw wins. If you need confidence the code works, it loses.

2. **Superpowers is the test champion.** 68 tests, 16 test files, every module covered. The TDD iron law produces the most comprehensive test suite. But zero documentation -- the next person who maintains this code gets no context.

3. **Super-AIDLC is the best all-rounder.** 58 tests + architecture diagram + error map + decisions log + build log. 10 minutes total. Only 1 minute slower than Superpowers but with dramatically better documentation.

4. **AIDLC spends too much time on documents nobody reads.** 14 documentation files including personas, user stories, component methods, services matrix, dependency matrix. 15 minutes total. The documentation is thorough but most of it (personas, stories) doesn't help with implementation or maintenance.

5. **All 4 produced working code.** Build passes, tests pass, all features implemented. The methodology doesn't determine whether the code works -- it determines how confident you are that it works and how maintainable it is.

### Cost-Benefit Analysis

| Approach | Time Cost | What You Get Extra |
|----------|-----------|-------------------|
| Raw (baseline) | 5 min | Nothing extra -- just code |
| Superpowers (+4 min) | 9 min | +42 tests, TDD confidence, modular architecture |
| Super-AIDLC (+5 min) | 10 min | +32 tests, TDD, design doc, error map, audit-lite |
| AIDLC (+10 min) | 15 min | +37 tests, 14 doc files, user stories, full audit |

The marginal cost of Superpowers is 4 minutes for 42 extra tests. That's the best ROI.
The marginal cost of Super-AIDLC is 5 minutes for 32 extra tests + documentation. Best ROI if you need docs.
The marginal cost of AIDLC is 10 minutes for 37 extra tests + 14 doc files. Worst ROI -- the extra 5 minutes vs Super-AIDLC buys you user stories and audit.md, which are rarely referenced.

---

## Conclusion

### For This Project (Greenfield, Single Developer)

**Winner: Super-AIDLC.** Best balance of speed (10 min), test quality (58 tests, TDD), and documentation (architecture diagram, error map, decisions log). Only 1 minute slower than Superpowers but with design artifacts that will save hours when maintaining or extending the project.

### General Recommendations

| Scenario | Best Choice | Why |
|----------|------------|-----|
| Hackathon / prototype | Raw | 3x faster, features work, iterate later |
| Solo project, need confidence | Superpowers | Most tests, fastest TDD, no doc overhead |
| Team project, need handoff | **Super-AIDLC** | Best docs + tests + TDD in one package |
| Enterprise, need compliance | AIDLC | Full audit trail, user stories, but slowest |
| Ongoing project (brownfield) | **Super-AIDLC** | Cross-session learning + Kiro integration |

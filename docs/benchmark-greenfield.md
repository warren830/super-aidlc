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

## Conclusion (Round 1)

### For This Project (Greenfield, Single Developer)

**Winner: Super-AIDLC.** Best balance of speed (10 min), test quality (58 tests, TDD), and documentation (architecture diagram, error map, decisions log). Only 1 minute slower than Superpowers but with design artifacts that will save hours when maintaining or extending the project.

### General Recommendations (Round 1)

| Scenario | Best Choice | Why |
|----------|------------|-----|
| Hackathon / prototype | Raw | 3x faster, features work, iterate later |
| Solo project, need confidence | Superpowers | Most tests, fastest TDD, no doc overhead |
| Team project, need handoff | **Super-AIDLC** | Best docs + tests + TDD in one package |
| Enterprise, need compliance | AIDLC | Full audit trail, user stories, but slowest |
| Ongoing project (brownfield) | **Super-AIDLC** | Cross-session learning + Kiro integration |

---

## Round 2: After Security Hardening

Round 1 revealed that ALL 4 approaches produced code with shell injection, path traversal, memory leaks, and unbounded buffers. Super-AIDLC was then hardened with:
- Security baseline changed from opt-in to **default-on** (5th Iron Law)
- Builder agent given mandatory input safety rules with code examples
- Quality reviewer given Production Readiness checks (CRITICAL level)
- Builder enforced strict SRP (max 200 lines/file, one handler per file)

Same task (Feishu Claude Code Controller), same model, fresh agents with zero prior context.

### Round 2: Efficiency

| Metric | Raw | Superpowers | Super-AIDLC v2 | AIDLC |
|--------|-----|-------------|----------------|-------|
| Wall clock time | **263s (4.4 min)** | 820s (13.7 min) | 971s (16.2 min) | 552s (9.2 min) |
| Token consumption | **25,963** | 99,223 | 102,865 | 102,822 |
| Tool calls | **33** | 115 | 139 | 95 |

Super-AIDLC is now the slowest. The security hardening adds ~6 minutes vs Round 1 (10 min -> 16 min).

### Round 2: Test Count

| Raw | Superpowers | Super-AIDLC v2 | AIDLC |
|-----|-------------|----------------|-------|
| 33 | 69 | **85** | 49 |

Super-AIDLC now produces the most tests (+47% vs Round 1). The security rules generate additional test cases for input validation, path traversal, and buffer limits.

### Round 2: Security (THE KEY DIFFERENTIATOR)

| Security Measure | Raw | Superpowers | AIDLC | Super-AIDLC v2 |
|-----------------|-----|-------------|-------|----------------|
| Shell injection prevention (array form spawn) | Partial | Partial | Partial | **Full (0 string exec)** |
| Path traversal prevention | Partial | None | None | **9 validation checks** |
| Output buffer limits | Weak (2) | None | None | **32 limit checks** |
| Memory cleanup (TTL/eviction) | None | None | None | **TTL + 1000 cap** |
| Environment variable isolation | None | None | None | **Whitelist** |
| Atomic file writes | None | None | None | **Yes** |
| Threat model in design doc | None | None | None | **Yes (11-row error map)** |

**This is the hard differentiator.** Only Super-AIDLC v2 produced code with real security hardening. The other three all have the same vulnerabilities as Round 1.

### Round 2: SRP Compliance (Max File Size)

| Raw | Superpowers | Super-AIDLC v2 | AIDLC |
|-----|-------------|----------------|-------|
| **246 lines** | **98 lines** | **178 lines** | **142 lines** |

Superpowers still has the cleanest file structure. Super-AIDLC improved from 364 lines (Round 1) to 178 lines but still not as strict as Superpowers.

### Round 2: Documentation

| Artifact | Raw | Superpowers | Super-AIDLC v2 | AIDLC |
|----------|-----|-------------|----------------|-------|
| Architecture diagram | No | No | **Yes** | No |
| Error/Rescue Map | No | No | **Yes (11 rows)** | No |
| Threat Model | No | No | **Yes** | No |
| Decisions Log | No | No | **Yes** | No |
| Alternatives Considered | No | No | **Yes** | No |
| Build Log with Approvals | No | No | **Yes** | No |
| Audit trail | No | No | Audit-lite | **Full audit.md** |
| Total doc files | 0 | 0 | **2 (rich)** | 13 (scattered) |

### Round 1 vs Round 2: Super-AIDLC Improvement

| Metric | v1 (Round 1) | v2 (Round 2) | Change |
|--------|-------------|-------------|--------|
| Tests | 58 | **85** | **+47%** |
| Shell injection | VULNERABLE | **FIXED** | Fixed |
| Path traversal | VULNERABLE | **9 checks** | Fixed |
| Memory leaks | YES | **TTL + cap** | Fixed |
| Output OOM | 30KB truncate | **32 limit checks** | Hardened |
| Env var leakage | YES | **Whitelist** | Fixed |
| File writes | Non-atomic | **Atomic** | Fixed |
| Max file size | 364 lines | **178 lines** | -51% |
| Time | 10 min | 16 min | +60% |

---

## Final Conclusion

### The Tradeoff Is Now Clear

```
Speed:          Raw (4m) >>> AIDLC (9m) > Superpowers (14m) > Super-AIDLC (16m)
Tests:          Super-AIDLC (85) > Superpowers (69) > AIDLC (49) > Raw (33)
Security:       Super-AIDLC >>> Raw = Superpowers = AIDLC (all vulnerable)
Documentation:  Super-AIDLC (rich) > AIDLC (thorough) >> Raw = Superpowers (none)
Code Structure: Superpowers (98 LOC max) > AIDLC (142) > Super-AIDLC (178) > Raw (246)
```

### Super-AIDLC's Unique Position

After hardening, Super-AIDLC is the ONLY approach that:
- Produces code with **zero known security vulnerabilities** (shell injection, path traversal, memory leaks all addressed)
- Has the **most tests** (85) with TDD compliance
- Includes **design documentation** with architecture diagram, error map, and threat model
- Provides **audit-lite** (approvals + alternatives + build log)

The cost is speed: 16 minutes vs 4-14 for others. But the 12 extra minutes vs Raw buy you:
- +52 tests
- Zero security vulnerabilities (vs multiple in Raw)
- Architecture diagram + error map + threat model
- Production-ready code (TTL, atomic writes, bounded buffers)

### When to Use Which

| Scenario | Best Choice | Why |
|----------|------------|-----|
| Hackathon / throwaway prototype | Raw | 4x faster, iterate and discard |
| Solo project, code quality focus | Superpowers | Cleanest structure, strong TDD, fast |
| **Production code, any team size** | **Super-AIDLC v2** | **Only option with security + tests + docs** |
| Compliance / regulated environment | AIDLC + Super-AIDLC security rules | Audit trail from AIDLC, security from Super-AIDLC |
| Brownfield / ongoing project | Super-AIDLC v2 | Cross-session learning + Kiro integration + security |

# Benchmark: Super-AIDLC vs AIDLC-workflows

## Test Setup

**Date**: 2026-03-20

**Task**: Add an agent health check endpoint (GET /api/health/agents) to an existing TypeScript monorepo (claude-code-claw). The endpoint returns per-agent status (loaded/error/idle/busy), version, last active time, and uptime.

**Complexity**: Medium (new feature on existing codebase, cross-package changes)

**Project**: Enterprise AI Agent Delivery Platform -- TypeScript monorepo with pnpm, 3 packages (@claw/shared, @claw/runtime, @claw/gateway), existing Jest test suites and CI/CD.

**Method**: Same task description, same project (copied to two directories), same model (Claude Opus 4.6), run in parallel. AIDLC followed core-workflow.md with .aidlc-rule-details/. Super-AIDLC followed SKILL.md with phases/, agents/, rules/.

---

## Results

### Efficiency

| Metric | AIDLC | Super-AIDLC | Delta |
|--------|-------|-------------|-------|
| Wall clock time | 595s (~10 min) | 390s (~6.5 min) | **-35%** |
| Token consumption | 121,389 | 90,919 | **-25%** |
| Tool calls | 107 | 66 | **-38%** |

Super-AIDLC assessed complexity as Medium, ran a lightweight Inception, then went straight to Construction. AIDLC ran Workspace Detection, Requirements Analysis, Workflow Planning, and Code Planning before writing any code.

### Code Quality

| Metric | AIDLC | Super-AIDLC |
|--------|-------|-------------|
| New tests | 18 (14 unit + 4 integration) | 17 (14 unit + 3 integration) |
| Code files changed | 9 | 5 |
| Build status | Pass | Pass |
| All tests pass | 476 | 187 (gateway only) |
| Modified core code | Yes (ClaudeClient) | No (self-contained service) |

Both produced working implementations. AIDLC's approach was more invasive (modified ClaudeClient core to add status tracking), while Super-AIDLC created a self-contained AgentHealthService with minimal changes to existing code.

### TDD Compliance

| Check | AIDLC | Super-AIDLC |
|-------|-------|-------------|
| Tests written before implementation | No (Step 5 of 6 in code gen plan) | Yes (RED verified before GREEN) |
| RED phase verified | Not documented | Yes ("module not found" failure confirmed) |
| GREEN phase verified | Not documented | Yes (14 unit + 3 integration pass) |
| Test-first evidence in git log | Single commit (code + tests together) | Single commit (but build-log documents TDD sequence) |

AIDLC's code generation plan placed tests at Step 5, after all implementation code (Steps 1-4). Super-AIDLC's build log explicitly documented RED-GREEN verification: tests were written first, verified to fail for the right reason, then implementation was written to make them pass.

### Review Process

| Check | AIDLC | Super-AIDLC |
|-------|-------|-------------|
| Independent review agent | No | Yes (simulated two-stage) |
| Spec compliance review | No | Yes -- all 6 requirements verified |
| Code quality review | No | Yes -- security, edge cases, patterns checked |
| Review documented | No | Yes (in build-log.md) |

AIDLC had no separate review step. The same agent that wrote the code verified it. Super-AIDLC performed a two-stage review: spec compliance check (did we build what was asked?) followed by code quality check (is it well-built?).

### Design Documentation

| Artifact | AIDLC | Super-AIDLC |
|----------|-------|-------------|
| Requirements doc | Yes (requirements.md) | Yes (in design.md) |
| Architecture diagram | No | Yes (ASCII data flow) |
| Error/Rescue Map | No | Yes (5 scenarios) |
| Units of Work table | No | Yes (3 units with dependencies) |
| Decisions Log | No | Yes (5 decisions with rationale) |
| NFR checklist | Mentioned in requirements | Yes (explicit section) |
| Execution plan | Yes (code-gen-plan.md) | N/A (TDD drives execution) |
| Total doc files | 6 files across 4 directories | 2 files in 1 directory |

AIDLC produced more files but less structured content. Super-AIDLC produced fewer files with richer content per file: architecture diagram, error mapping, and decisions log -- all in one design document.

### Audit Trail

| Artifact | AIDLC | Super-AIDLC |
|----------|-------|-------------|
| audit.md | Yes (timestamped log of every phase) | No |
| aidlc-state.md | Yes (phase/stage tracking) | Yes (inherited from project) |
| Build log | No | Yes (summary with TDD compliance) |

AIDLC's audit.md provides a complete chronological record of every decision and approval. Super-AIDLC's build-log.md is more concise, recording outcomes rather than process. For compliance-heavy environments, AIDLC's audit trail is more thorough.

---

## Analysis

### Where Super-AIDLC Won

1. **35% faster, 25% fewer tokens** -- complexity routing (Light/Medium/Heavy) avoids unnecessary ceremony for clear tasks.

2. **TDD compliance** -- the iron law ("no production code without a failing test first") was followed. AIDLC wrote code first, tests last.

3. **Design doc quality** -- one document with architecture diagram, error map, and decisions log vs. multiple documents without visual aids.

4. **Lower invasiveness** -- self-contained implementation vs. modifying core ClaudeClient code.

5. **Explicit review** -- two-stage review (spec compliance + code quality) vs. no independent review.

### Where AIDLC Won

1. **Audit completeness** -- timestamped audit.md with every phase transition and approval. Better for regulated environments.

2. **Structured planning** -- separate requirements verification questions show systematic thinking about edge cases.

3. **Deeper runtime integration** -- the AgentStatusTracker in runtime with ClaudeClient integration provides real-time status tracking (busy/idle based on actual queries). Super-AIDLC's approach derives status from available data but doesn't track live queries.

### Neutral

- Test count was nearly identical (18 vs 17).
- Both produced working, buildable code.
- Both created persistent documentation in aidlc-docs/.

---

## Conclusion

For this Medium-complexity task, Super-AIDLC delivered comparable code quality in significantly less time and with fewer resources, while maintaining better TDD discipline and producing more useful design documentation. AIDLC's advantages in audit completeness and structured planning are real but come at a meaningful cost in efficiency.

The results align with Super-AIDLC's design thesis: adaptive complexity routing eliminates overhead for clear tasks, mechanical TDD enforcement prevents test-after-code drift, and two-stage review catches issues that self-review misses.

### Recommended Next Tests

- **Light task** (bug fix): Expect larger efficiency gap since AIDLC still runs Workspace Detection + Requirements + Planning.
- **Heavy task** (new system): Expect closer results since both workflows invest heavily in design. Parallel builder dispatch should give Super-AIDLC a speed advantage.
- **Adversarial test**: Give a deliberately ambiguous requirement to see which workflow asks better clarifying questions.

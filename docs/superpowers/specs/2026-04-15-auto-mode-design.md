# Design: Auto Mode (`--auto`)

## Problem

LLM 的 context 越大、跑得越久，越容易偷懒。当前 super-aidlc 的 construction 和 operations 阶段在主 session 中 inline 执行，随着 builder 报告、review 结果的累积，orchestrator 的 context 膨胀，质量下降。

## Approach

新增 `--auto` flag。Inception 保持交互式（问问题、等用户批准设计）。设计批准后，construction 和 operations 改为 **fresh subagent** 派发，主 session 变成 thin dispatcher——只做状态读取、gate check、状态报告。

## Requirements

- Inception 交互式不变（用户回答问题、批准设计）
- Construction 和 operations 作为 fresh subagent 执行（独立 context）
- 每个 stage 完成后输出状态报告，绿灯自动过，红灯停车等用户
- 不自动 push/PR（不可逆操作需用户确认）
- 复用现有 phases/agents/rules，不新增文件
- 仅修改 SKILL.md，增加约 40-50 行 auto 分支逻辑

---

## Flag Definition

在 SKILL.md 现有 flags（`--skip-review`, `--light`, `--lang=`）旁增加：

```
--auto    After design approval, run construction + operations fully automated
          with fresh subagent isolation. Outputs status reports between stages.
          Inception remains interactive. Push/PR still requires confirmation.
```

## Flow: Default vs Auto

| Stage | Default | `--auto` |
|-------|---------|----------|
| Inception | Interactive (inline) | Interactive (inline) — same |
| Design approval | Wait for user | Wait for user — same |
| Construction | Inline execution in main session | **Fresh subagent** |
| Gate check | Implicit (in review) | **Explicit inline check of build log** |
| Status report | None | **Output to user, can interrupt** |
| Operations | Inline execution | **Fresh subagent** |
| Commit | Ask user | **Auto-commit (if all green)** |
| Push / PR | Ask user | Ask user — same |

## Construction Subagent Dispatch

After design approval, in the auto branch of Step 6:

```
Agent(
  prompt: "<phases/construction.md full content>
  
  --- Design Document ---
  <aidlc-docs/{date}-{slug}/design.md full content>
  
  --- Project Context ---
  <CLAUDE.md content>
  <Researcher summary (if brownfield)>
  
  --- TDD Rules ---
  <rules/tdd.md full content>
  
  --- Security Baseline ---
  <extensions/security-baseline.md (if enabled)>
  
  --- Session Config ---
  Language: {session language}
  Complexity: {Medium/Heavy}
  Auto mode: true — do not ask user for confirmation at any point.
  Write all results to aidlc-docs/{date}-{slug}/build-log.md when done.
  
  Execute the full construction phase.",
  
  description: "Auto construction: {feature name}"
)
```

Construction.md internal logic (builder/reviewer subagent dispatch) is unchanged. The only difference is the construction orchestrator itself runs in a fresh context.

## Gate Check (Inline)

After construction subagent completes, main session reads `aidlc-docs/{date}-{slug}/build-log.md` and checks:

1. **Build Status**: All units DONE or DONE_WITH_CONCERNS?
   - Any BLOCKED → STOP, output problem, wait for user
2. **Spec Review**: PASS?
   - FAIL → STOP, output findings, wait for user
3. **Quality Review**: PASS?
   - FAIL → STOP, output findings, wait for user
4. **Verification Loop**: All green?
   - 3 failures → STOP, output errors, wait for user

All PASS → output status report, proceed to operations.

**Principle: green = auto-proceed, red = stop and wait for human.**

Gate check cost is minimal: read one file, a few lines of logic. Does not significantly grow main session context.

## Status Report Format

### All green:

```
──────────────────────────────────────
[AUTO] Construction complete

  Units:    3/3 DONE
  Tests:    48 passing (coverage: 87%)
  Spec:     PASS
  Quality:  PASS (2 notes)
  Time:     8 min

  Proceeding to operations...
──────────────────────────────────────
```

### Problem found:

```
──────────────────────────────────────
[AUTO] Construction needs attention

  Units:    2/3 DONE, 1 BLOCKED
  Blocked:  U3 (worker) — needs queue config from U2
  
  Options:
  (A) Retry U3 with additional context
  (B) Skip U3 and proceed with U1+U2
  (C) Abort auto mode, switch to interactive
──────────────────────────────────────
```

## Operations Subagent Dispatch

After gate check passes:

```
Agent(
  prompt: "<phases/operations.md full content>
  
  --- Build Results ---
  <aidlc-docs/{date}-{slug}/build-log.md full content>
  
  --- Project Context ---
  <CLAUDE.md content>
  
  --- Session Config ---
  Auto mode: true
  - Run verification loop (test -> build -> lint -> dependency audit)
  - On success: auto-commit with meaningful message
  - On failure after 3 iterations: write failure report and stop
  - Do NOT ask user for ship confirmation — just commit
  - Write verification results to build-log.md (append)
  
  Execute the operations phase.",
  
  description: "Auto operations: {feature name}"
)
```

## Final Report

### All green:

```
──────────────────────────────────────
[AUTO] All complete

  Verification:  PASS (1 iteration)
  Tests:         48 passing
  Build:         clean
  Lint:          0 errors
  Commit:        a1b2c3d "feat: add user authentication"
  
  Compound score: 4 → auto-compounding knowledge
  
  Push and create PR? (y/n)
──────────────────────────────────────
```

### Verification failed:

```
──────────────────────────────────────
[AUTO] Verification failed after 3 iterations

  Remaining issues:
  - test auth.test.ts:67 — expected 401, got 500
  - lint src/auth.ts:42 — unused variable 'token'
  
  Options:
  (A) Continue debugging interactively
  (B) Rollback: git reset --hard super-aidlc-checkpoint-{ts}
  (C) Keep current state, fix manually
──────────────────────────────────────
```

## Auto Mode Boundaries

| Operation | Auto? | Reason |
|-----------|-------|--------|
| Ask requirements | No | Needs human judgment |
| Generate design doc | No | Needs human approval |
| Construction (build + review) | **Yes** | Fresh subagent, results written to disk |
| Gate check | **Yes** | Inline read of build log |
| Operations (verify + commit) | **Yes** | Fresh subagent |
| Knowledge compounding | **Yes** | Based on compound score |
| Push / PR | **No** | Irreversible, needs user confirmation |

## Context Chain Analysis

Why this solves the context degradation problem:

```
Default mode context chain:
  Main Session: inception questions + answers + design doc + researcher results
    + builder reports (x N units) + review results + verification output
    = LARGE, degrading context

Auto mode context chain:
  Main Session: inception questions + answers + design doc approval
    + build log summary (1 read) + status report + verification summary (1 read)
    = SMALL, stays fresh

  Construction Agent: construction.md + design doc + project context
    → dispatches fresh builder/reviewer subagents
    = MEDIUM, bounded per-session

  Operations Agent: operations.md + build log
    = SMALL
```

The main session never accumulates builder reports or review results. Those stay inside the construction subagent's context and are persisted to disk as the build log.

## Files to Modify

| File | Change |
|------|--------|
| `SKILL.md` | Add `--auto` flag description + Step 6 auto branch (~40-50 lines) |

## Out of Scope

- No new agent files (gate check is inline, not a separate agent)
- No changes to phases/construction.md or phases/operations.md
- No changes to any agent files
- No changes to the interactive (non-auto) flow
- Push/PR automation (stays manual)

## Decisions Log

| Question | Decision | Rationale |
|----------|---------|-----------|
| Inception 是否也自动化？ | 否，保持交互式 | 需求问题需要人类判断，设计需要人类审批 |
| Gate check 用独立 agent 还是 inline？ | Inline | 只读 build log 判断 pass/fail，context 增量极小 |
| 自动 push 吗？ | 否 | 不可逆操作需用户确认 |
| 自动 commit 吗？ | 是（all green 时） | 可逆操作，auto 模式应减少等待 |
| Construction subagent 内部逻辑改吗？ | 不改 | 已有的 builder/reviewer 派发逻辑复用 |

## Alternatives Considered

| Option | Verdict | Reason |
|--------|---------|--------|
| Gate Agent（独立 fresh agent 做 gate check） | Rejected for v1 | Inline 已足够，后续可升级 |
| Unit-level fresh agents（主 session 逐 unit 派发） | Rejected for v1 | 复杂度高，现有方案已解决核心问题 |
| 替换默认架构（所有模式都用 thin dispatcher） | Rejected | `--auto` flag 更安全，保留现有交互式流程 |
| Inception 也自动化（assumption-first） | Rejected | 设计决策需要人类输入 |

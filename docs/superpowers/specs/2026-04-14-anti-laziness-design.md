# Design: Three-Layer Anti-Laziness System

## Problem

AI agent 在三个环节偷懒：
1. **Dispatch (D)**：Unit 描述太模糊，builder 不知道 "done" 长什么样
2. **Builder (A)**：写浅层实现、骨架代码、只测 happy path
3. **Reviewer (B)**：橡皮图章式 review，不深入读代码

根本原因是一条链：模糊的 dispatch → 偷懒的 build → 肤浅的 review。只修一环，另外两环照样失败。

## Approach

借鉴 aidlc-workflows 的防偷懒模式（overconfidence-prevention、units-generation、functional-design、code-generation），在 super-aidlc 的三个环节同时加固。

## Requirements

- 不改变整体架构（phases/agents/rules 结构不变）
- 不显著增加 token 消耗（每个 unit 增加约 15-20 行描述）
- 不减慢 Light complexity 流程（Light 跳过 inception，不受影响）
- 兼容现有 INLINE/SERIAL/PARALLEL 三种 build 策略

---

## Layer 1: Richer Unit Specs (Inception Phase)

**改动文件**: `phases/inception.md`

**改动位置**: Step 3 Design Doc Template → Units of Work 部分

**现状**:
```markdown
## Units of Work
| Unit | Description | Dependencies | Can Parallel? |
| U1: Auth | Handle authentication | None | yes |
```

**改为**: 保留总结表格，在下方为每个 unit 增加详细规格：

```markdown
## Units of Work

| Unit | Description | Dependencies | Can Parallel? |
|------|------------|-------------|---------------|
| U1: Auth | Handle authentication | None | yes |

### U1: Auth

**Acceptance Criteria:**
1. GIVEN {前置条件} WHEN {操作} THEN {预期结果}
2. GIVEN {前置条件} WHEN {操作} THEN {预期结果}
...

**Required Test Scenarios:**
- Happy path: {具体场景}
- Error: {从 Error/Rescue Map 提取的错误场景}
- Edge: {边界/异常输入场景}
- Integration: {跨 unit 交互场景，如适用}

**Done means:**
- 所有 acceptance criteria 有独立通过的测试
- Error/Rescue Map 中归属本 unit 的行都已实现
- Interface Contracts 中本 unit 提供的接口签名匹配
```

**关键原则**:
- GIVEN/WHEN/THEN 格式强制具体化，不允许 "处理认证" 这种模糊描述
- 测试场景分类（happy/error/edge/integration）防止 "只测正常流程"
- "Done means" 给 builder 和 reviewer 共同的检查清单

**对 dispatch 的影响**: `phases/construction.md` 的 builder prompt 模板已传 `{unit spec from design doc}`。Unit 描述变丰富后，builder 自动拿到验收标准，dispatch 模板不需改。

**Token 成本**: 每个 unit 约 15-20 行。3 unit 项目约多 50 行。

---

## Layer 2: Builder Self-Discipline (Builder Agent)

**改动文件**: `agents/builder.md`

### 机制 2.1: Acceptance Criteria 追踪表

**改动位置**: Output 部分 → TDD Compliance 改为 Acceptance Criteria Coverage

**现状**:
```markdown
### TDD Compliance
1. {behavior}: RED -> GREEN -> REFACTOR
2. {behavior}: RED -> GREEN -> REFACTOR
```

**改为**:
```markdown
### Acceptance Criteria Coverage
| # | Acceptance Criteria | Test File:Line | Status |
|---|-------------------|----------------|--------|
| AC1 | GIVEN ... WHEN ... THEN ... | auth.test.ts:15 | RED -> GREEN |
| AC2 | GIVEN ... WHEN ... THEN ... | auth.test.ts:42 | RED -> GREEN |
```

**规则**: 设计文档有 N 条 AC，表必须有 N 行。缺行 = 不能报 DONE。

### 机制 2.2: Test Depth Requirements

**改动位置**: Rules 部分之后新增一节

```markdown
## Test Depth Requirements

每个 unit 的测试必须覆盖设计文档中列出的所有场景分类：
- Happy path: 至少 1 个测试
- Error cases: 设计文档 Required Test Scenarios 中每个 error 至少 1 个测试
- Edge cases: 设计文档中每个 edge case 至少 1 个测试

如果设计文档列了 3 个 error case 和 2 个 edge case，你至少需要 6 个测试。
```

### 机制 2.3: Anti-Skeleton Scan

**改动位置**: Self-Check 部分新增第 4 步

```markdown
4. **Anti-skeleton scan:**
   - 检查每个新增 function/method body
   - 如果 body 只有 return/throw/pass/TODO，或少于 3 行有效逻辑 → 标记为可疑
   - 真的简单（getter/setter/delegator）→ report 中注明原因
   - 不确定 → 写完整实现
```

### Builder Report Self-Check 格式更新

```markdown
### Self-Check
- Contract compliance: {matches / deviation at {location}}
- Acceptance criteria: {N/N covered} (< 100% 则列出缺失项)
- Test depth: {happy: N, error: N, edge: N} vs required {happy: N, error: N, edge: N}
- Skeleton scan: {N functions checked, N flagged → resolved/justified}
- Open items: {TODOs, FIXMEs, or "None"}
```

---

## Layer 3: Reviewer Depth Enforcement (Review Agents)

### 机制 3.1: Spec Reviewer — AC 逐条核对

**改动文件**: `agents/spec-reviewer.md`

**改动位置**: Output Format 部分，新增 Acceptance Criteria Verification 表

```markdown
### Acceptance Criteria Verification
| # | Criteria | Verified At | Evidence | Status |
|---|---------|------------|----------|--------|
| AC1 | GIVEN ... WHEN ... THEN ... | auth.ts:28, auth.test.ts:15 | 函数返回 sign(payload)，测试断言 token 结构 | PASS |
| AC2 | GIVEN ... WHEN ... THEN ... | -- | 代码中没有相关逻辑 | MISSING |
```

**规则**:
- N 条 AC = N 行
- 每行必须有 Verified At（file:line）和 Evidence（具体代码逻辑）
- 任何 MISSING 行 = 整体 FAIL

### 机制 3.2: Quality Reviewer — 关键检查项举证

**改动文件**: `agents/quality-reviewer.md`

**改动位置**: Pass 1 输出格式，checked 项必须附带 file:line 证据

**现状**: `- [x] No SQL injection`
**改为**: `- [x] No SQL injection — db.ts:15 uses parameterized query db.query($1, [userId])`

**强制举证的检查项**（Pass 1 中最容易偷懒的）:
- Security: SQL injection, hardcoded secrets, input validation
- Input Safety: shell injection, path traversal
- Correctness: error cases implemented, tests test right behavior

其余 Pass 1 项保持 checkbox 即可。Pass 2 不变。

### 机制 3.3: Rubber-stamp Detection

**改动文件**: `agents/spec-reviewer.md` 和 `agents/quality-reviewer.md`

**新增**: 当 verdict = PASS 且 zero findings 时，必须输出 Confidence Check：

```markdown
### Confidence Check
- 代码行数: {N 行新增/修改}
- 我实际读了: {每个文件和行范围}
- 最复杂的逻辑在: {file:line — 为什么它是正确的}
- 如果这段代码有 bug，最可能出在: {具体位置和原因}
```

无法填写 = 没认真读代码 = 回去重读。

---

## Three-Layer Interaction

| 偷懒方式 | Layer 1 | Layer 2 | Layer 3 |
|---------|---------|---------|---------|
| Builder 只做 happy path | AC 列出了 error/edge cases | 测试深度要求强制覆盖 | Spec reviewer 逐条核对 AC |
| Builder 写骨架代码 | Done means 定义完成标准 | Anti-skeleton scan 检测 | Quality reviewer 举证发现空实现 |
| Builder 跳过难的 AC | AC 表格缺行 = 不能报 DONE | Self-check 发现覆盖 < 100% | Spec reviewer AC 表标记 MISSING |
| Reviewer 橡皮图章 | — | — | Rubber-stamp detection 强制举证 |

## Files to Modify

| File | Change |
|------|--------|
| `phases/inception.md` | Step 3 Design Doc Template — 扩展 Units of Work 格式 |
| `agents/builder.md` | 新增 AC 追踪表、Test Depth Requirements、Anti-skeleton scan、更新 Self-Check 和 Report 格式 |
| `agents/spec-reviewer.md` | 新增 AC Verification 表、Rubber-stamp detection |
| `agents/quality-reviewer.md` | Pass 1 关键项强制举证、Rubber-stamp detection |

## Out of Scope

- 不改 Light complexity 流程（Light 跳过 inception，没有设计文档，不受影响）
- 不改 construction.md 的 dispatch 模板（unit spec 变丰富后自动生效）
- 不改 review-protocol.md（规则层面不变，只改 agent 输出格式）
- 不改其他 agent（researcher、architect、design-reviewer 等不受影响）
- 不新增文件（所有改动在现有 4 个文件中完成）

## Decisions Log

| Question | Decision | Rationale |
|----------|---------|-----------|
| 是否为每个 unit 生成独立文件（像 aidlc-workflows）？ | 否，保持内联在设计文档中 | super-aidlc 追求简洁（2 文件 vs 14 文件），内联已足够 |
| Quality reviewer 是否所有 Pass 1 项都强制举证？ | 否，只对最易偷懒的项 | 全部举证会让输出过长，选择性举证平衡效果和 token 成本 |
| Rubber-stamp detection 是否适用于小改动？ | 是，但 <10 行改动允许简短 | 小改动也可能有 bug，但不需要长篇举证 |

## Alternatives Considered

| Option | Verdict | Reason |
|--------|---------|--------|
| 只改 inception（Approach A） | Rejected | 只修 dispatch 不够，builder 和 reviewer 仍会偷懒 |
| 只改 builder + reviewer（Approach B） | Rejected | 没有明确 AC，builder 猜测 edge cases，reviewer 无标准可查 |
| 三层全改（Approach C） | **Selected** | 每层互相制约，链条完整 |
| 照搬 aidlc-workflows 的多文件模式 | Rejected | super-aidlc 追求简洁，不适合每个 unit 4 个文件 |

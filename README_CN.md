# Super-AIDLC

> 别再氛围编码了。开始工程化。

Super-AIDLC 是一个面向 AI 编码代理的结构化开发技能。它评估任务复杂度、先设计再编码、在并行 worktree 中用 TDD 构建、两阶段审查、自动验证直到全绿。

> [English version / 英文版](README.md) | [Brownfield 基准测试](docs/benchmark-brownfield.md) | [Greenfield 基准测试](docs/benchmark-greenfield.md) | [Blog](docs/blog.md)

## 为什么不直接用 AIDLC / Superpowers / gstack？

我们在同一个代码库上做了三方对比测试（[基准测试结果](BENCHMARK.md)）。每个都有明显短板：

| 工具 | 强项 | 短板 |
|------|------|------|
| **AIDLC-workflows** | 完整的审计追踪 | 从不做 TDD。没有独立审查。不能并行构建。 |
| **Superpowers** | 最快。严格 TDD。 | 零持久化文档。会话结束什么都不留。 |
| **gstack** | 浏览器 QA。安全防护。 | 没有生命周期管理。没有设计阶段。 |

Super-AIDLC 取各家之长，再加上 4 个它们都没有的能力。

## 4 个独有能力

### 1. 真正的多 Agent 并行构建

独立工作单元同时 dispatch 到隔离的 git worktree。5 个 unit 的 Heavy 任务构建 1 轮，不是 5 轮。

```
# 在一条消息中，3 个同时运行：
Agent(prompt: "构建 U1...", isolation: "worktree")
Agent(prompt: "构建 U2...", isolation: "worktree")
Agent(prompt: "构建 U3...", isolation: "worktree")
```

AIDLC 串行构建。Superpowers 串行构建。只有 Super-AIDLC 并行 dispatch。

### 2. 跨会话学习

开始前先读取 `aidlc-docs/` 中的历史构建日志。提取经验教训、已建立的模式、被否决的方案。每次运行让下次更聪明。

```
## 来自历史运行的经验
- ts-jest 在 pnpm 中有跨包解析问题 → 使用 diagnostic ignore codes
- 这个项目使用 SRP 分离 → 每个组件一个文件
- 已否决：ajv 库（为小型 schema 子集引入外部依赖不值得）
```

没有其他工具能记住上次发生了什么。

### 3. Kiro Specs 深度集成

如果项目有 `.kiro/specs/` 或 `.kiro/steering/`，Super-AIDLC 会先读取它们：

- **Specs 已覆盖该功能？** 跳过提问，直接用已有 specs 作为设计输入。
- **Specs 部分覆盖？** 预填已知答案，只问空白部分。
- **构建完成后：** 回写完成状态到 `.kiro/specs/`。

Super-AIDLC 不是挂在 Kiro 上的外挂 -- 它是 Kiro 原生的。

### 4. 自动验证修复循环

构建完成后，Super-AIDLC 不是告诉你"请验证"。它自己跑测试，失败了自己修：

```
循环（最多 3 次）：
  跑测试   → 失败？ → dispatch debugger agent → 修复 → 重试
  跑编译   → 失败？ → 修复编译错误 → 重试
  跑 lint  → 失败？ → 修复 lint 错误 → 重试
  全绿？   → 完成
```

其他工具："请验证。" Super-AIDLC：替你验证、修复、再验证。

## 快速开始

### Kiro

```bash
git clone https://github.com/warren830/super-aidlc.git ~/super-aidlc
~/super-aidlc/adapters/kiro/install.sh /path/to/your/project
```

### Claude Code

```bash
git clone https://github.com/warren830/super-aidlc.git ~/super-aidlc
~/super-aidlc/adapters/claude-code/install.sh /path/to/your/project
```

安装脚本创建符号链接 -- 在 `~/super-aidlc` 中 `git pull` 即可更新所有项目。

然后使用：`/super-aidlc [描述你要构建的东西]`

## 工作方式

每个任务从复杂度评估开始：

| 复杂度 | 做什么 |
|--------|--------|
| **Light**（bug 修复、配置） | 跳过设计。TDD 构建。单次审查。自动验证。 |
| **Medium**（新功能） | 结构化提问。设计文档。并行构建。两阶段审查。自动验证。 |
| **Heavy**（新系统、重构） | 问题重构。完整设计（架构图 + 错误映射 + 工作单元分解）。worktree 并行构建。两阶段审查。覆盖率审计。自动验证。 |

### Heavy 任务完整流水线

```
Inception:  重构问题 → 提问 → 设计文档（架构图 + 错误映射 + 工作单元）→ 审查 → 审批
               ↓
Construction: [Builder U1] [Builder U2] [Builder U3]  ← worktree 并行，每个都用 TDD
               ↓               ↓              ↓
            规格审查 → 质量审查 → 合并 → 覆盖率审计
               ↓
Verify:     测试 → 编译 → Lint → （失败？→ debugger → 修复 → 重试）→ 全绿
               ↓
Ship:       提交 → 推送 → PR（附设计文档 + 测试结果）
```

## 五条铁律

1. **没有失败测试就没有生产代码。** 违反就删除代码重来。
2. **没有根因调查就没有修复。** 不做散弹式调试。
3. **没有验证证据就没有完成声明。** "应该能行"不是证据。
4. **没有全绿验证循环就没有发布。** 失败自动修复最多 3 次。
5. **没有消毒就不能让用户输入进入 shell/文件系统/模板。** 安全基线默认开启。

## 文件结构

```
super-aidlc/
  SKILL.md                        # 入口：复杂度路由 + 铁律
  phases/
    inception.md                  # 设计：提问 -> 设计文档 -> 审批
    construction.md               # 构建：并行 TDD + 审查 + 自动验证
    operations.md                 # QA + 发布：浏览器 QA、发版、文档更新
  agents/
    researcher.md                 # 上下文过滤 + 跨会话学习
    architect.md                  # 设计文档生成（不写代码）
    builder.md                    # TDD 构建者（在隔离 worktree 中）
    spec-reviewer.md              # 审查第一阶段：你做的是要求的吗？
    quality-reviewer.md           # 审查第二阶段：代码质量过关吗？
    qa.md                         # 浏览器 QA（Playwright，可选）
    debugger.md                   # 根因调查（用于自动验证循环）
  guards/
    careful.md                    # 破坏性命令拦截
    freeze.md                     # 编辑范围锁定
    verification.md               # 必须有证据才能声称完成
  rules/
    tdd.md                        # TDD 参考 + 反合理化
    review-protocol.md            # 两阶段审查协议
    anti-patterns.md              # 测试反模式
  extensions/
    security-baseline.md          # OWASP 安全约束（可选启用）
  adapters/
    kiro/install.sh               # Kiro 项目一键安装
    claude-code/install.sh        # Claude Code 项目一键安装
```

## 基准测试结果

在同一个 TypeScript monorepo 上测试，同一个模型（Claude Opus 4.6），同样的任务：

| 维度 | AIDLC | Superpowers | Super-AIDLC |
|------|-------|-------------|-------------|
| 速度（Medium） | 10 分钟 | -- | **6.5 分钟 (-35%)** |
| 速度（Heavy） | 12 分钟 | **9 分钟** | 13.6 分钟 |
| TDD 合规 | 从不 | 始终 | 始终 |
| 测试数量（Heavy） | 35 | 46 | **48** |
| 设计文档 | 仅审计 | 无 | **架构图 + 错误映射 + 决策 + 替代方案** |
| 持久化产物 | audit.md | 无 | **设计文档 + 构建日志 + 审计精简版** |
| 代码模块化 | 混合 | SRP | **SRP** |

完整结果：[Brownfield 基准测试](docs/benchmark-brownfield.md) | [Greenfield 基准测试](docs/benchmark-greenfield.md)

## 致谢

基于三个开源项目的理念构建：

- **[AIDLC-workflows](https://github.com/awslabs/aidlc-workflows)** -- 自适应生命周期、文档驱动设计、扩展系统。
- **[Superpowers](https://github.com/PrimeRadiantAI/superpowers)** -- TDD 强制执行、两阶段审查、验证门、合理化防护。
- **[gstack](https://github.com/garrytan/gstack)** -- 浏览器 QA、careful/freeze 安全防护、系统化调试。

## 许可证

MIT

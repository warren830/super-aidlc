# Super-AIDLC

> 别再氛围编码了。开始工程化。

Super-AIDLC 是面向 AI 编码代理（Kiro、Claude Code）的结构化开发技能。它按复杂度路由任务、先设计再编码、在并行 worktree 中用 TDD 构建、两阶段审查、自动验证直到全绿——安全加固默认开启。

> [English / 英文](README.md) | [Blog](docs/blog-cn.md) | [基准测试](docs/benchmark-greenfield.md)

## 为什么又一个 AI 工作流？

我们在相同任务上对比了 4 种方案（[完整结果](docs/benchmark-greenfield.md)）：

| 方案 | 速度 | 测试数 | 安全漏洞 | 设计文档 |
|------|------|--------|----------|----------|
| 裸写（无方法论） | **4 分钟** | 33 | Shell 注入、路径遍历、内存泄露 | 无 |
| Superpowers | 14 分钟 | 69 | Shell 注入、路径遍历、内存泄露 | 无 |
| AIDLC-workflows | 9 分钟 | 49 | Shell 注入、路径遍历、内存泄露 | 13 个文件（审计） |
| **Super-AIDLC** | 16 分钟 | **85** | **无** | **2 个文件（设计 + 构建日志）** |

Super-AIDLC 是唯一产出零已知安全漏洞代码的方案。多花的时间换来了真正的安全。

## 与其他方法论对比

| 能力 | Super-AIDLC | Superpowers | AIDLC-workflows | gstack |
|------|------------|-------------|-----------------|--------|
| TDD 强制执行 | 严格，含反合理化 | 严格 | 可选（扩展） | 无 |
| 并行 Agent 构建 | 是（worktree） | 是（子代理） | 否 | 否 |
| 两阶段代码审查 | 规格+质量（独立 Agent） | 规格+质量（子代理） | 否 | 单次审查 |
| 安全基线 | 默认开启，多语言 | 无 | 无 | CSO 技能（手动） |
| 设计文档 | Medium/Heavy 必须 | 头脑风暴输出 | HLD/LLD 产物 | 无正式文档 |
| 知识积累系统 | 三层（约定 + 解决方案 + 日志）| 无 | 审计跟踪 | 无 |
| 知识库维护 | /compound-refresh（5 种操作）| 无 | 无 | 无 |
| 并行研究 Agent | 4 个（代码+知识库+Git+最佳实践）| 无 | 无 | 无 |
| 并行专项 Reviewer | 正确性+安全+性能+对抗 | 单一 | 无 | 单次审查 |
| Kiro 集成 | 原生（读写 .kiro/specs） | 无 | 原生 | 无 |
| 上下文效率 | 按需懒加载 | 整体计划（~60k tokens） | 常驻（~12k tokens） | 常驻（~360 行） |
| 复杂度路由 | 3 级（Light/Medium/Heavy） | 单一流程 | 单一流程 | 按技能 |
| 过度自信防护 | 专用规则+自查协议 | 无 | 专用规则 | 无 |
| 依赖审计 | 验证循环中自动执行 | 无 | 无 | CSO 技能（手动） |
| 问题验证 | 发现阶段（Heavy） | Option Zero（已提议） | 无 | Office Hours |
| 增量交付 | 4+ 单元可分批发布 | 无 | 无 | 无 |
| 卸载支持 | 有 | 无 | 无 | 有 |
| Stars（2026.03） | 新项目 | 108k | 822 | 41k |

## 16 个独有能力

**1. 真正的多 Agent 并行构建** -- 独立单元同时 dispatch 到隔离 worktree。5 个单元构建 1 轮，不是 5 轮。含冲突处理、超时机制和共享工具去重。

**2. 跨会话学习** -- 按任务相关性（而非时间）选择历史构建日志。在 `aidlc-docs/patterns.md` 中累积项目模式。每次运行让下次更聪明。

**3. Kiro Specs 集成** -- 读取 `.kiro/specs/`，如果已有需求文档则跳过提问直接构建。构建完回写状态。

**4. 自动验证修复循环** -- 自动跑测试/编译/lint，失败触发 debugger agent 修复，最多重试 3 次。开始前创建回滚检查点。

**5. 独立设计审查** -- Heavy 任务由独立的 Design Reviewer Agent（非自审）检查错误路径覆盖、单元独立性和过度工程。

**6. 接口契约验证** -- 跨单元依赖在设计文档中定义为契约，合并后验证，防止集成失败。

**7. 多语言安全基线** -- 输入安全规则附带 TypeScript、Python、Go、Java、Rust 代码示例。默认开启。

**8. 增量交付** -- 4+ 单元的 Heavy 任务可分批交付，先交付最高价值批次，根据反馈调整后续批次。

**9. 过度自信防护** -- 专用规则检测并阻止 Agent 跳过步骤。每个阶段转换时运行自查协议。基于 Superpowers、AIDLC 和 gstack 中观察到的失败模式。

**10. 上下文预算管理** -- 按需懒加载文档，而非预先加载所有内容。按复杂度缩放上下文：Light ~5k tokens，Medium ~15k，Heavy ~30k。避免困扰其他方法论的 token 膨胀。

**11. 跨模型审查** -- 可选将质量审查分发给不同模型（如 Sonnet 审查 Opus 的代码），以捕获同模型盲点。分歧呈现给用户决定。

**12. 多会话迭代** -- Continue 模式从上次会话中断处继续。版本迭代（v1 -> v2）在先前决定基础上构建，不重新辩论已确定的选择。

**13. 多语言文档生成** -- 所有生成的文档（设计文档、构建日志、提问、审查报告）跟随用户语言。自动检测用户输入语言或通过 `--lang=zh` 显式指定。代码和提交信息保持英文。

**14. Compound 知识系统** -- `/super-aidlc:compound` 在解决非平凡问题后，将结构化解决方案提取到 `aidlc-docs/solutions/`（带 YAML frontmatter 可搜索）。`/super-aidlc:compound-refresh` 通过 Keep/Update/Consolidate/Replace/Delete 五种操作维护知识库质量。三层搜索：约定 → 解决方案 → 构建日志。

**15. 并行研究 Agent** -- Medium/Heavy 任务同时派出最多 4 个研究 Agent：Researcher（代码模式）、Learnings Researcher（解决方案知识库）、Git History Analyzer（代码演化）、Best Practices Researcher（外部最佳实践）。

**16. 并行专项 Reviewer** -- 第二阶段代码审查同时派出 correctness、security、performance、adversarial 四个专项 reviewer，带置信度分级和发现去重。

## 快速开始

```bash
git clone https://github.com/warren830/super-aidlc.git ~/super-aidlc

# Claude Code
~/super-aidlc/adapters/claude-code/install.sh /path/to/your/project

# Kiro
~/super-aidlc/adapters/kiro/install.sh /path/to/your/project

# OpenAI Codex CLI
~/super-aidlc/adapters/codex/install.sh /path/to/your/project

# Gemini CLI
~/super-aidlc/adapters/gemini-cli/install.sh /path/to/your/project

# Windows (PowerShell)
.\adapters\claude-code\install.ps1 -ProjectRoot C:\path\to\project

# 全局安装（所有项目生效）
~/super-aidlc/adapters/claude-code/install.sh --global

# 验证安装
~/super-aidlc/adapters/claude-code/install.sh --verify

# 卸载
~/super-aidlc/adapters/claude-code/uninstall.sh /path/to/your/project
```

然后：`/super-aidlc [描述你要构建的东西]`

符号链接安装 -- `git pull` 即可更新所有项目。

## 工作方式

```
评估复杂度 → Light / Medium / Heavy
```

| 复杂度 | 流程 |
|--------|------|
| **Light** | TDD 构建 → 审查 → 自动验证 |
| **Medium** | 提问 → 设计文档 → 并行 TDD 构建 → 两阶段审查 → 自动验证 |
| **Heavy** | 问题重构 → 提问 → 完整设计（架构图 + 错误映射 + 工作单元）→ worktree 并行 TDD → 两阶段审查 → 覆盖率审计 → 自动验证 |

### Heavy 流水线

```
Brainstorm:    谁 → 什么 → 为什么 → 方案 → 范围（可选，Heavy）
                  ↓
Inception:     并行研究（4 Agent）→ 提问 → 设计文档 → 审批
                  ↓
Construction:  [U1] [U2] [U3]  ← worktree 并行，每个 TDD
                  ↓    ↓    ↓
               规格审查 → 并行质量审查 → 合并
                  ↓
Verify:        测试 → 编译 → Lint → （失败？→ 修复 → 重试 x3）→ 全绿
                  ↓
Ship:          提交 → 推送 → PR
                  ↓
Compound:      提取知识 → aidlc-docs/solutions/（可选）
```

## 五条铁律

1. **没有失败测试就没有代码。** 违反就删除重来。
2. **没有根因调查就没有修复。** 不做散弹式调试。
3. **没有证据就没有完成声明。** "应该能行"不是证据。
4. **没有全绿验证就没有发布。** 失败自动修复最多 3 次。
5. **没有消毒就不能让用户输入进入 shell/文件系统/模板。** 安全默认开启。

## 项目结构

```
super-aidlc/
  VERSION                           # 语义化版本号（4.0.0）
  SKILL.md                          # 入口：复杂度路由 + 命令
  CONTRIBUTING.md                   # 贡献指南
  phases/
    brainstorm.md                   # 前置探索阶段（可选，v4）
    inception.md                    # 设计：并行研究 → 提问 → 文档 → 审批
    construction.md                 # 构建：TDD + 并行 + 审查 + compound
    operations.md                   # 发布：浏览器 QA、发版、文档更新
  agents/
    researcher.md                   # 上下文过滤 + 三层知识搜索
    learnings-researcher.md         # 解决方案知识库搜索（v4）
    git-history-analyzer.md         # 代码演化 + 热点分析（v4）
    best-practices-researcher.md    # 外部模式 + 框架文档（v4）
    architect.md                    # 设计文档生成（不写代码）
    builder.md                      # TDD 构建者 + 输入安全规则
    design-reviewer.md              # 独立设计文档审查（Heavy）
    spec-reviewer.md                # 第一阶段：做的是要求的吗？
    quality-reviewer.md             # 第二阶段：总体质量门槛
    correctness-reviewer.md         # 并行：逻辑错误 + 边界条件（v4）
    security-reviewer.md            # 并行：安全漏洞（v4）
    performance-reviewer.md         # 并行：性能 + 资源（v4）
    adversarial-reviewer.md         # 并行：故障场景（v4）
    qa.md                           # 浏览器 QA（Playwright，可选）
    debugger.md                     # 根因调查
  skills/
    compound/SKILL.md               # 会话后知识提取（v4）
    compound-refresh.md             # 知识库维护（v4）
  guards/
    careful.md                      # 破坏性命令拦截
    freeze.md                       # 编辑范围锁定
    verification.md                 # 必须有证据才能声称完成
  rules/
    tdd.md                          # TDD 参考 + 反合理化
    review-protocol.md              # 两阶段审查 + 并行专项
    anti-patterns.md                # 测试反模式
    overconfidence-prevention.md    # 防跳步规则 + 自查协议
    context-budget.md               # Token 效率 + 懒加载策略
  extensions/
    security-baseline.md            # 输入安全 + 依赖审计（默认开启）
  adapters/
    claude-code/install.sh          # Claude Code 安装（--verify, --global）
    kiro/install.sh                 # Kiro 安装
  docs/
    blog-cn.md                      # 为什么以及怎么构建的
    blog-en.md                      # 英文版
    benchmark-greenfield.md         # 单次会话基准测试
    benchmark-brownfield.md         # 棕地基准测试
    benchmark-cross-session.md      # 跨会话知识基准测试（v4）
```

## 致谢

基于三个开源项目的理念构建：
- [AIDLC-workflows](https://github.com/awslabs/aidlc-workflows) -- 自适应生命周期、文档驱动设计
- [Superpowers](https://github.com/obra/superpowers) -- TDD 强制执行、两阶段审查、合理化防护
- [gstack](https://github.com/garrytan/gstack) -- 浏览器 QA、安全防护、系统化调试

## 许可证

MIT

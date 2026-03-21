# Super-AIDLC v3

一个面向 AI 编码代理的结构化开发技能，将自适应生命周期管理、测试驱动开发强制执行和生产安全防护整合到一个工作流中。它将"氛围编码"变成可重复的流程：评估复杂度、先设计再编码、在并行 worktree 中用 TDD 构建、两阶段审查、带验证证据地发布。

> [English version / 英文版](README.md)

## 有什么不同

Super-AIDLC 融合了三个成熟系统的精华，加上 4 个独有能力：

| 来源 | 我们取什么 |
|------|-----------|
| **[AIDLC-workflows](https://github.com/awslabs/aidlc-workflows)** | 自适应生命周期、文档驱动设计、审计追踪、扩展系统 |
| **[Superpowers](https://github.com/PrimeRadiantAI/superpowers)** | TDD 铁律、子代理上下文隔离、两阶段审查、合理化防护 |
| **[gstack](https://github.com/garrytan/gstack)** | 浏览器 QA、安全防护（careful/freeze）、根因调试、发布自动化 |

### Super-AIDLC 独有能力

这 4 个能力无法通过组合其他工具实现：

1. **真正的多 Agent 并行构建** -- 独立工作单元同时 dispatch 到隔离 worktree。5 个 unit 的 Heavy 任务跑 1 轮，不是 5 轮。AIDLC 和 Superpowers 都做不到。
2. **跨会话学习** -- 读取之前的 build-log 提取教训："上次 ts-jest 有解析问题，这样修复的。"每次运行让下次更聪明。其他工具不会跨会话记忆。
3. **Kiro Specs 深度集成** -- 读取已有的 `.kiro/specs/` 和 `.kiro/steering/`，如果 Kiro 已有需求文档，直接跳过问题阶段开始构建。构建完成后回写完成状态。
4. **自动验证修复循环** -- 构建后自动跑测试/编译/lint。失败则触发 debugger agent 修复并重新验证，最多循环 3 次直到全绿。其他工具只告诉你要验证，Super-AIDLC 替你验证并修复。

## 支持平台

- **Kiro**（AWS AI IDE）
- **Claude Code**（Anthropic CLI）

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

两个安装脚本都创建符号链接，更新此仓库后会自动生效。

然后在 AI 代理中使用：`/super-aidlc [描述你要构建的东西]`

## 工作流概览

每个任务从复杂度评估开始，然后相应路由：

### Light（轻量：bug 修复、配置变更）
- 跳过设计，直接构建
- TDD 仍然强制：先写失败测试，修复，验证通过
- 单次审查

### Medium（中等：新功能、适度变更）
- 清单式问题（3-5 组，每个带选项和推荐）
- 设计文档：架构图、错误映射表、工作单元表
- 并行 builder 代理在 worktree 中隔离构建
- 两阶段审查：先规格合规，再代码质量

### Heavy（重量：新系统、多组件、大型重构）
- 先挑战问题定义再问细节
- 详细问题：非功能需求、用户画像、架构决策
- 完整设计文档（启用安全基线时含威胁模型）
- 范围挑战："如果只能发布一个工作单元，哪个价值最大？"
- 并行构建、两阶段审查、覆盖率审计、可选浏览器 QA

## 文件结构

```
super-aidlc/
  SKILL.md                        # 入口：复杂度评估 + 路由
  phases/
    inception.md                  # 设计：问题 -> 设计文档 -> 审批
    construction.md               # 构建：TDD + 并行代理 + 两阶段审查
    operations.md                 # QA + 发布：浏览器 QA、发版、文档更新
  agents/
    researcher.md                 # 上下文过滤器（30-80 行，引用来源）
    architect.md                  # 设计文档生成者（不写代码）
    builder.md                    # TDD 强制执行的构建者（在 worktree 中）
    spec-reviewer.md              # 第一阶段：规格合规审查（不信任报告）
    quality-reviewer.md           # 第二阶段：安全 + 代码质量审查
    qa.md                         # 浏览器 QA（Playwright，可选）
    debugger.md                   # 根因调查（不猜测）
  guards/
    careful.md                    # 破坏性命令警告
    freeze.md                     # 编辑范围锁定
    verification.md               # 无证据不得声称完成
  rules/
    tdd.md                        # TDD 铁律 + 反合理化
    review-protocol.md            # 两阶段审查协议
    anti-patterns.md              # 测试反模式参考
  extensions/
    security-baseline.md          # OWASP 安全约束（可插拔）
  adapters/
    kiro/install.sh               # 符号链接到 .kiro/skills/
    claude-code/install.sh        # 符号链接到 .claude/skills/
```

## 四条铁律

不可妥协。每个代理、每个任务、每一次。

1. **没有失败测试就没有生产代码。** 先写测试，看它失败，再实现。违反就删除代码重来。
2. **没有根因调查就没有修复。** 从症状追溯到根源。不做散弹式调试。
3. **没有新鲜验证证据就没有完成声明。** 运行命令，阅读输出，然后声称成功。"应该能行"不是证据。
4. **没有全绿验证循环就没有发布。** 测试、编译、lint 必须全部通过。失败自动修复最多 3 次。

## 致谢

Super-AIDLC 基于三个开源项目的理念构建：

- **[AIDLC-workflows](https://github.com/awslabs/aidlc-workflows)** -- 自适应生命周期、文档驱动设计、扩展系统、审计追踪模式。
- **[Superpowers](https://github.com/PrimeRadiantAI/superpowers)** -- TDD 强制执行、两阶段审查协议、验证门、测试反模式、系统化调试。
- **[gstack](https://github.com/garrytan/gstack)** -- 浏览器 QA 工作流、careful/freeze 安全防护、根因调试、发布自动化、覆盖率审计。

## 许可证

MIT

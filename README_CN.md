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

## 4 个独有能力

**1. 真正的多 Agent 并行构建** -- 独立单元同时 dispatch 到隔离 worktree。5 个单元构建 1 轮，不是 5 轮。

**2. 跨会话学习** -- 读取历史构建日志，避免重复犯错，沿用已建立的模式。每次运行让下次更聪明。

**3. Kiro Specs 集成** -- 读取 `.kiro/specs/`，如果已有需求文档则跳过提问直接构建。构建完回写状态。

**4. 自动验证修复循环** -- 自动跑测试/编译/lint，失败触发 debugger agent 修复，最多重试 3 次。

## 快速开始

```bash
# Kiro
git clone https://github.com/warren830/super-aidlc.git ~/super-aidlc
~/super-aidlc/adapters/kiro/install.sh /path/to/your/project

# Claude Code
~/super-aidlc/adapters/claude-code/install.sh /path/to/your/project
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
Inception:     重构问题 → 提问 → 设计文档 → 审批
                  ↓
Construction:  [U1] [U2] [U3]  ← worktree 并行，每个 TDD
                  ↓    ↓    ↓
               规格审查 → 质量审查 → 合并
                  ↓
Verify:        测试 → 编译 → Lint → （失败？→ 修复 → 重试 x3）→ 全绿
                  ↓
Ship:          提交 → 推送 → PR
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
  SKILL.md                          # 入口：复杂度路由
  phases/
    inception.md                    # 设计：提问 → 文档 → 审批
    construction.md                 # 构建：TDD + 并行 + 审查 + 自动验证
    operations.md                   # 发布：浏览器 QA、发版、文档更新
  agents/
    researcher.md                   # 上下文过滤 + 跨会话学习
    architect.md                    # 设计文档生成（不写代码）
    builder.md                      # TDD 构建者 + 输入安全规则
    spec-reviewer.md                # 第一阶段：做的是要求的吗？
    quality-reviewer.md             # 第二阶段：安全 + 质量过关吗？
    qa.md                           # 浏览器 QA（Playwright，可选）
    debugger.md                     # 根因调查
  guards/
    careful.md                      # 破坏性命令拦截
    freeze.md                       # 编辑范围锁定
    verification.md                 # 必须有证据才能声称完成
  rules/
    tdd.md                          # TDD 参考 + 反合理化
    review-protocol.md              # 两阶段审查协议
    anti-patterns.md                # 测试反模式
  extensions/
    security-baseline.md            # 输入安全 + 生产就绪检查（默认开启）
  adapters/
    kiro/install.sh                 # Kiro 一键安装
    claude-code/install.sh          # Claude Code 一键安装
  docs/
    blog-cn.md                      # 为什么以及怎么构建的
    blog-en.md                      # 英文版
    benchmark-brownfield.md         # 棕地测试（已有代码库）
    benchmark-greenfield.md         # 绿地测试（从零构建）
```

## 致谢

基于三个开源项目的理念构建：
- [AIDLC-workflows](https://github.com/awslabs/aidlc-workflows) -- 自适应生命周期、文档驱动设计
- [Superpowers](https://github.com/PrimeRadiantAI/superpowers) -- TDD 强制执行、两阶段审查、合理化防护
- [gstack](https://github.com/garrytan/gstack) -- 浏览器 QA、安全防护、系统化调试

## 许可证

MIT

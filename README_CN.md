# Super-AIDLC

> 别再氛围编码了。开始工程化。

Super-AIDLC 是面向 AI 编码代理（Claude Code、Kiro）的结构化开发技能。按复杂度路由任务、先设计再编码、并行 TDD 构建、专项 Agent 审查、跨 Session 知识积累 -- 安全加固默认开启。

> [English / 英文](README.md) | [Blog](docs/blog-cn.md) | [基准测试](docs/benchmark-greenfield.md)

## 为什么又一个 AI 工作流？

相同任务 4 种方案对比（[完整结果](docs/benchmark-greenfield.md)）：

| 方案 | 速度 | 测试数 | 安全漏洞 | 设计文档 |
|------|------|--------|----------|----------|
| 裸写 | **4 分钟** | 33 | Shell 注入、路径遍历、内存泄露 | 无 |
| Superpowers | 14 分钟 | 69 | Shell 注入、路径遍历、内存泄露 | 无 |
| AIDLC-workflows | 9 分钟 | 49 | Shell 注入、路径遍历、内存泄露 | 13 文件 |
| **Super-AIDLC** | 16 分钟 | **85** | **无** | **2 文件** |

唯一产出零安全漏洞代码的方案。

跨 Session 测试（[完整结果](docs/benchmark-cross-session.md)）：在 DevLake 上连续 3 个 Session，Super-AIDLC 在 Session 3 比 Superpowers 快 13%，零 issues -- 因为 2 个 Session 的积累知识提供了清晰的实现路径。

---

## 快速开始

### 安装

```bash
git clone https://github.com/warren830/super-aidlc.git ~/super-aidlc

# 全局安装（所有项目可用）
~/super-aidlc/adapters/claude-code/install.sh --global

# 或单个项目
~/super-aidlc/adapters/claude-code/install.sh /path/to/your/project

# Kiro
~/super-aidlc/adapters/kiro/install.sh /path/to/your/project

# 验证
~/super-aidlc/adapters/claude-code/install.sh --verify --global
```

符号链接安装 -- `cd ~/super-aidlc && git pull` 即可更新所有项目。

### 第一次使用

```bash
cd /你的项目
claude

# 直接描述你要什么：
/super-aidlc 实现一个基于 JWT 的用户认证系统
```

就这样。Super-AIDLC 会自动判断复杂度、问结构化问题、生成设计文档、TDD 构建、审查、验证、然后提供发布。

---

## 使用指南

### 日常工作流（最常用的 3 个命令）

```bash
# 1. 开发任何功能
/super-aidlc 给 API 加上限流

# 2. 解决完一个棘手问题后：
/super-aidlc:compound

# 3. 每周知识清理：
/super-aidlc:janitor --days=7
```

### 全部 11 个命令

#### 核心流程

| 命令 | 何时使用 | 示例 |
|------|---------|------|
| `/super-aidlc [任务]` | 任何开发任务 | `/super-aidlc 加上 WebSocket 支持` |

自动检测复杂度并路由：

| 复杂度 | 自动判断条件 | 流程 |
|--------|------------|------|
| **Light** | 修 bug、改配置、≤2 文件 | TDD → 审查 → 验证 |
| **Medium** | 新功能、中等范围 | 提问 → 设计 → 并行构建 → 审查 → 验证 |
| **Heavy** | 新系统、多组件 | 探索 → 研究 → 完整设计 → worktree 并行 → 专项审查 → 验证 |

**标志：** `--light` `--medium` `--heavy`（强制复杂度）、`--dry-run`（预览）、`--lang=zh`（中文文档）、`--skip-review`（跳过审查）

#### 构建之前

| 命令 | 何时使用 | 示例 |
|------|---------|------|
| `/super-aidlc:brainstorm [想法]` | 模糊想法，需要探索 | `/super-aidlc:brainstorm 我想做某种通知系统` |
| `/super-aidlc:design [任务]` | 只要设计不要代码 | `/super-aidlc:design 支付处理模块` |

**Brainstorm** 问 谁/什么/为什么，探索 2-3 种方案，定义范围，输出 `requirements.md` 供主流程使用。

**Design** 跑完整的 inception（研究 → 提问 → 设计文档 → 审查）但不写代码。想先看架构再动手时用。

#### 构建中 / 构建后

| 命令 | 何时使用 | 示例 |
|------|---------|------|
| `/super-aidlc:review [范围]` | 审查当前改动 | `/super-aidlc:review backend/api/` |
| `/super-aidlc:debug [bug]` | 系统化调查 bug | `/super-aidlc:debug 有效 token 登录返回 401` |
| `/super-aidlc:qa [url]` | 测试运行中的应用 | `/super-aidlc:qa http://localhost:3000` |
| `/super-aidlc:ship [分支]` | 验证 + 提交 + 推送 + PR | `/super-aidlc:ship` |

**Review** 两阶段：规格合规（做的是要求的吗？）→ 并行质量审查（正确性 + 安全 + 性能 + 对抗性 reviewer）。

**Debug** 遵循铁律：调查 → 分析 → 假设 → 实现。不猜。必出回归测试。

**QA** 自动检测模式（浏览器/API/CLI），测试用户流程并附带证据（截图、响应体）。

**Ship** 确保所有测试/编译/lint 通过，创建有意义的 commit，推送并开 PR。

#### 知识管理

| 命令 | 何时使用 | 示例 |
|------|---------|------|
| `/super-aidlc:compound [上下文]` | 解决了棘手问题后 | `/super-aidlc:compound` |
| `/super-aidlc:compound-refresh [范围]` | 重构或迁移后 | `/super-aidlc:compound-refresh performance-issues` |
| `/super-aidlc:janitor [--days=N]` | 定期知识扫描 | `/super-aidlc:janitor --days=7` |
| `/super-aidlc:metrics [--days=N]` | 看自己是否在进步 | `/super-aidlc:metrics --days=30` |

**Compound** 从当前 session 提取结构化解决方案（问题 → 走过的弯路 → 解法 → 预防）到 `aidlc-docs/solutions/`。跨项目通用知识自动提升到 `~/.aidlc/global-solutions/`。

**Compound-refresh** 对比现有解决方案和当前代码。五种操作：保留、更新、合并、替换、删除。重构后用。

**Janitor** 扫描构建日志并自动评分（debugger 被调用了？多次修复尝试？新模式？）。高价值 session 自动 compound，低价值跳过。每周跑一次。

**Metrics** 生成趋势报告：你是否越来越快？bug 越来越少？测试越来越多？显示哪种策略（INLINE/SERIAL/PARALLEL）最适合你的项目。

### 知识系统（如何越来越聪明）

```
Session 1:  aidlc-docs/ 空的 → 从零开始
Session 2:  Researcher 读 patterns.md + 构建日志 → 避免 Session 1 的错误
Session 3:  Researcher 读 solutions/ + patterns.md + 日志 → 利用所有先前知识
Session N:  四层搜索 → 项目约定 → 项目解决方案 → 全局解决方案 → 构建历史
```

知识积累位置：

```
aidlc-docs/                              # 每个项目（自动创建）
  patterns.md                            # 约定（≤50 行，总是最先读）
  solutions/                             # 结构化知识库
    runtime-issues/                      # Bug 修复
    patterns/                            # 最佳实践
    config-issues/                       # 配置陷阱
    testing-issues/                      # 测试心得
    ...
  2026-04-05-feature-name/
    design.md                            # 架构 + 错误映射 + 决策
    build-log.md                         # Session 历史 + 结构化指标

~/.aidlc/                                # 跨项目（自动创建）
  global-solutions/                      # 所有项目共享的知识
```

### 典型场景

**新功能（Medium）：**
```
/super-aidlc 加上用户头像上传和编辑
→ 问 ~5 组结构化问题
→ 生成设计文档（含架构图）
→ 并行构建 2-3 个单元（TDD）
→ 规格审查 → 并行质量审查
→ 自动验证（测试 + 编译 + lint）
→ 提供发布
→ 自动评估 compound 分数
```

**修 Bug（Light）：**
```
/super-aidlc:debug 邮件队列在高负载下丢消息
→ 调查 → 复现 → 根因
→ 回归测试 → 修复 → 验证
→ 如果 compound 分数 >= 3 则自动提取知识
```

**探索新想法：**
```
/super-aidlc:brainstorm 我想做类似 Google Docs 的实时协作
→ 谁/什么/为什么 提问
→ 2-3 种方案（WebSocket vs SSE vs 轮询）
→ 范围定义 → 输出 requirements.md

/super-aidlc:design 实时协作
→ 自动读取 requirements.md → 生成设计文档

/super-aidlc 实现实时协作
→ 自动读取设计文档 → 构建
```

**每周维护：**
```
/super-aidlc:janitor --days=7              # compound 未处理的有价值 session
/super-aidlc:compound-refresh              # 检查过时知识
/super-aidlc:metrics --days=30             # 我们在进步吗？
```

### 更新

```bash
cd ~/super-aidlc && git pull
# 所有已安装的项目立即更新（符号链接）
```

### 卸载

```bash
~/super-aidlc/adapters/claude-code/uninstall.sh /path/to/your/project
# 全局卸载：删除 ~/.claude/skills/super-aidlc* 目录
```

注意：项目中的 `aidlc-docs/` 不会被删除 -- 那是你的设计文档和积累的知识。

---

## 五条铁律

1. **没有失败测试就没有代码。** 违反就删除重来。
2. **没有根因调查就没有修复。** 不做散弹式调试。
3. **没有证据就没有完成声明。** "应该能行"不是证据。
4. **没有全绿验证就没有发布。** 失败自动修复最多 3 次。
5. **没有消毒就不能让用户输入进入 shell/文件系统/模板。** 安全默认开启。

## 架构

```
Brainstorm:    谁 → 什么 → 为什么 → 方案 → 范围（可选）
                  ↓
Inception:     并行研究（4 Agent）→ 提问 → 设计文档 → 审批
                  ↓
Construction:  [U1] [U2] [U3]  ← INLINE / SERIAL / PARALLEL（自动选择）
                  ↓    ↓    ↓
               规格审查 → 并行质量审查 → 合并
                  ↓
Verify:        测试 → 编译 → Lint → （失败？→ debugger → 重试 x3）→ 全绿
                  ↓
Ship:          提交 → 推送 → PR
                  ↓
Compound:      评分 → 高价值自动提取 → aidlc-docs/solutions/
```

### 12 个 Agent

| Agent | 职责 |
|-------|------|
| Researcher | 代码模式 + 四层知识搜索 |
| Learnings Researcher | 搜索解决方案知识库 |
| Git History Analyzer | 代码演化 + 热点检测 |
| Best Practices Researcher | 外部模式 + 框架文档 |
| Architect | 设计文档生成（不写代码）|
| Builder | TDD 构建 + 自检协议 |
| Design Reviewer | 独立设计审查（Heavy）|
| Spec Reviewer | 第一阶段：做的是要求的吗？ |
| Correctness Reviewer | 逻辑错误、边界条件、状态 bug |
| Security Reviewer | 漏洞、利用、OWASP |
| Performance Reviewer | N+1、内存、可扩展性 |
| Adversarial Reviewer | 故障场景、攻击向量 |

另有：Quality Reviewer（总体门槛）、QA Agent、Debugger。

## 项目结构

```
super-aidlc/
  VERSION                           # 4.0.0
  SKILL.md                          # 入口
  phases/                           # brainstorm, inception, construction, operations
  agents/                           # 15 个专项 agent
  skills/                           # 10 个斜杠命令
  guards/                           # careful, freeze, verification
  rules/                            # tdd, review-protocol, anti-patterns, overconfidence
  extensions/                       # security-baseline
  adapters/                         # claude-code, kiro 安装脚本
  docs/                             # 博客、基准测试
```

## 致谢

基于以下开源项目的理念：
- [AIDLC-workflows](https://github.com/awslabs/aidlc-workflows) -- 自适应生命周期、文档驱动设计
- [Superpowers](https://github.com/obra/superpowers) -- TDD 强制、两阶段审查
- [gstack](https://github.com/garrytan/gstack) -- 浏览器 QA、安全防护
- [Compound Engineering](https://github.com/EveryInc/compound-engineering-plugin) -- 知识积累、并行研究

## 许可证

MIT

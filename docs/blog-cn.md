# 我用 4 种 AI 编码方法论做了对比测试，这是我发现的

*2026 年 3 月 | Warren Chen*

每周 GitHub 上都有新的"AI 编码工作流"宣称能把 Claude 或 Cursor 变成 10 倍效率的工程团队。我厌倦了这些宣传，决定做一个正经的对比测试。

我选了 4 种方案 -- AIDLC-workflows（AWS 开源方法论）、Superpowers（TDD 导向技能）、我自己的 Super-AIDLC（融合了以上所有优点）、以及裸写（无任何方法论）-- 在相同任务、相同模型上并行运行。同一个代码库，同样的 prompt。

结果出乎我意料。

## 测试设置

**模型**：Claude Opus 4.6（1M 上下文）

**代码库**：一个真实的 TypeScript monorepo（企业级 AI 代理平台，3 个包，已有 CI/CD）

**任务**：
- Medium：添加健康检查 API（棕地）
- Heavy：构建完整的分析流水线，5 个组件（棕地）
- Heavy：从零构建飞书-Claude Code 桥接应用（绿地）

每个任务跑 4 次，一种方法一次，零共享上下文。

## 第一轮：速度 vs 质量

第一个意外发现：**方法论几乎不影响代码能不能跑。** 4 种方案在每个任务上都产出了可构建、可通过测试的代码。差异在于*怎么*到达那里，以及它们留下了什么。

### 速度

| 任务 | 裸写 | Superpowers | Super-AIDLC | AIDLC |
|------|------|-------------|-------------|-------|
| Medium（棕地） | -- | -- | **6.5 分钟** | 10 分钟 |
| Heavy（棕地） | -- | **9 分钟** | 13.6 分钟 | 12 分钟 |
| Heavy（绿地） | **4.4 分钟** | 9 分钟 | 10 分钟 | 14.6 分钟 |

裸写比 AIDLC 快 3 倍。不意外 -- 它没有任何流程开销。但这个速度有代价。

### TDD 合规

Superpowers 和 Super-AIDLC 都强制 TDD -- 先写测试、看它失败、再写代码。AIDLC 说"写测试"但不强制顺序。在全部 5 次运行中，AIDLC 都是先写代码后补测试。每一次都是。

### 文档

Superpowers 不产出任何文档。AIDLC 产出很多文档（用户画像、故事、组件矩阵）但没有架构图。Super-AIDLC 产出 2 个文件：一个含架构图和错误映射的设计文档，一个含审批和替代方案的构建日志。

到这里我对自己诚实：**Super-AIDLC 的优势还不够明显。** TDD 和文档是好的，但你可以把 Superpowers 的 TDD 规则加到 AIDLC 里达到同样效果。

## 转折点：没有一个方法论写出了安全代码

我对 4 个版本的飞书项目做了深度代码审查。每一个都有：

- **Shell 注入**：`execSync(\`git clone ${用户输入}\`)` -- 用户发一个恶意 URL，完蛋。
- **路径遍历**：`/workspace ../../etc/passwd` -- 用户逃出沙箱。
- **内存泄露**：每用户 Map 无限增长，没有 TTL，没有清理。
- **无界缓冲**：Claude 生成 500MB 输出，应用 OOM 崩溃。

4 种方法论。相同的漏洞。**没有一个方法论自动产出安全代码。**

## 第二轮：加固之后

我对 Super-AIDLC 做了 3 个改动：

1. **安全基线从可选改为默认开启。** 第 5 条铁律：用户输入不经消毒不得进入 shell/文件系统/模板。Builder agent 有带代码示例的强制规则。

2. **质量审查器增加生产就绪检查。** Map 有没有 TTL？文件写入是否原子？子进程关闭时是否清理？环境变量是否隔离？

3. **Builder 强制 SRP。** 每文件最多 200 行。每个 handler 一个文件。

然后重新跑同样的 4 方对比。全新 agent，零上下文。

### 第二轮结果

| | 裸写 | Superpowers | Super-AIDLC v2 | AIDLC |
|--|------|-------------|----------------|-------|
| 测试 | 33 | 69 | **85** | 49 |
| Shell 注入 | 有漏洞 | 有漏洞 | **已修复** | 有漏洞 |
| 路径遍历 | 有漏洞 | 有漏洞 | **已修复（9 处检查）** | 有漏洞 |
| 内存清理 | 无 | 无 | **TTL + 1000 上限** | 无 |
| 输出限制 | 弱 | 无 | **32 处限制** | 无 |
| 耗时 | **4.4 分钟** | 13.7 分钟 | 16.2 分钟 | 9.2 分钟 |

**Super-AIDLC v2 是唯一产出安全代码的方案。**

代价？16 分钟而不是 10 分钟。多出来的 6 分钟换来了：+27 个测试、零安全漏洞、生产就绪模式（TTL、原子写入、有界缓冲）。

## 我学到了什么

### 1. 方法论不决定代码能不能跑
4 种方案每次都产出可运行的代码。模型足够好。

### 2. 方法论决定代码是否值得信任
TDD、审查、安全检查决定了你是否敢部署。

### 3. "写安全代码"这个指令没用
没有机械强制（带代码示例的具体规则 + 审查清单阻断合并），AI 和人一样会走捷径。

### 4. 真正的差异化是你检查什么，不是你文档化什么
AIDLC 产出 13 个文档文件，没有一个防住了 Shell 注入。Super-AIDLC 产出 2 个文档文件和一个审查清单，防住了。

流程文档是给人看的。强制规则是给 AI 的。

### 5. 速度是陷阱
裸写快 4 倍。但它是唯一一个我不敢部署到生产的方案。

## 取舍图

```
速度:     裸写 (4m) >>> AIDLC (9m) > Superpowers (14m) > Super-AIDLC (16m)
测试:     Super-AIDLC (85) > Superpowers (69) > AIDLC (49) > 裸写 (33)
安全:     Super-AIDLC >>> 裸写 = Superpowers = AIDLC（全部有漏洞）
文档:     Super-AIDLC > AIDLC >> 裸写 = Superpowers（零文档）
结构:     Superpowers (98行) > AIDLC (142行) > Super-AIDLC (178行) > 裸写 (246行)
```

## 试一下

Super-AIDLC 是开源的。一组 Markdown 文件 -- 无运行时、无依赖、无构建步骤。

```bash
git clone https://github.com/warren830/super-aidlc.git ~/super-aidlc
~/super-aidlc/adapters/claude-code/install.sh /path/to/your/project
# 然后：/super-aidlc [描述你要构建的东西]
```

完整基准测试数据：[棕地测试](benchmark-brownfield.md) | [绿地测试](benchmark-greenfield.md)

基于 [AIDLC-workflows](https://github.com/awslabs/aidlc-workflows)、[Superpowers](https://github.com/PrimeRadiantAI/superpowers) 和 [gstack](https://github.com/garrytan/gstack) 的理念构建。

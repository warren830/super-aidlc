# Super-AIDLC

> Stop vibe coding. Start engineering.

Super-AIDLC is a structured development skill for AI coding agents (Kiro, Claude Code). It routes tasks by complexity, designs before coding, builds with TDD in parallel worktrees, reviews in two stages, and auto-verifies until all green -- with security hardening enabled by default.

> [Chinese / 中文](README_CN.md) | [Blog](docs/blog-en.md) | [Benchmarks](docs/benchmark-greenfield.md)

## Why Another AI Workflow?

We benchmarked 4 approaches on identical tasks ([full results](docs/benchmark-greenfield.md)):

| Approach | Speed | Tests | Security Vulns | Design Docs |
|----------|-------|-------|----------------|-------------|
| Raw (no methodology) | **4 min** | 33 | Shell injection, path traversal, memory leak | None |
| Superpowers | 14 min | 69 | Shell injection, path traversal, memory leak | None |
| AIDLC-workflows | 9 min | 49 | Shell injection, path traversal, memory leak | 13 files (audit) |
| **Super-AIDLC** | 16 min | **85** | **None** | **2 files (design + build log)** |

Super-AIDLC is the only approach that produces code with zero known security vulnerabilities. The extra time buys real safety.

## What Makes It Unique

Eleven capabilities no other AI workflow has:

**1. Three-Strategy Subagent Builds** -- Auto-selects Inline (1-2 units, no overhead), Serial (dependent units, with knowledge injection between them), or Parallel (independent units in worktrees). Parallel uses worktree-first with background-fallback when worktrees fail. Per-unit self-check, real-time task tracking, and conflict resolution with automatic retry.

**2. Cross-Session Learning** -- Selects prior build logs by task relevance (not just recency). Accumulates project patterns in `aidlc-docs/patterns.md`. Each run teaches the next.

**3. Kiro Specs Integration** -- Reads `.kiro/specs/` before asking questions. If specs exist, skips straight to building. Writes back after construction.

**4. Auto-Verification Loop** -- Runs test/build/lint automatically. Failures trigger the debugger agent, which fixes and re-verifies up to 3 times. Creates a rollback checkpoint before starting.

**5. Independent Design Review** -- Heavy tasks get a dedicated Design Reviewer Agent (not self-review) that checks error path coverage, unit independence, and over-engineering.

**6. Interface Contract Verification** -- Cross-unit dependencies are defined as contracts in the design doc and verified after merge, preventing integration failures.

**7. Multi-Language Security Baseline** -- Input safety rules with code examples for TypeScript, Python, Go, Java, and Rust. Default on.

**8. Incremental Delivery** -- Heavy tasks with 4+ units can be shipped in batches, getting user feedback before building the next batch.

**9. Compound Knowledge System** -- `/super-aidlc:compound` extracts structured solutions into `aidlc-docs/solutions/` with YAML frontmatter after solving non-trivial problems. `/super-aidlc:compound-refresh` maintains quality with Keep/Update/Consolidate/Replace/Delete operations. Three-layer search: conventions → solutions → build logs.

**10. Parallel Research Agents** -- Medium/Heavy tasks dispatch up to 4 research agents simultaneously: Researcher (codebase), Learnings Researcher (solutions knowledge base), Git History Analyzer (code evolution), Best Practices Researcher (external patterns).

**11. Parallel Specialist Reviewers** -- Stage 2 code review dispatches correctness, security, performance, and adversarial reviewers in parallel with confidence gating and findings dedup.

## Quick Start

```bash
git clone https://github.com/warren830/super-aidlc.git ~/super-aidlc

# Claude Code (global -- all projects)
~/super-aidlc/adapters/claude-code/install.sh --global

# Claude Code (single project)
~/super-aidlc/adapters/claude-code/install.sh /path/to/your/project

# Kiro
~/super-aidlc/adapters/kiro/install.sh /path/to/your/project

# Verify installation
~/super-aidlc/adapters/claude-code/install.sh --verify --global
```

Symlink-based install -- `git pull` updates all projects.

## Commands

| Command | Purpose |
|---------|---------|
| `/super-aidlc [task]` | Full pipeline -- auto-routes Light/Medium/Heavy |
| `/super-aidlc:brainstorm [idea]` | Explore requirements before design |
| `/super-aidlc:design [task]` | Run inception only (design doc, no code) |
| `/super-aidlc:review [scope]` | Two-stage review with parallel specialist reviewers |
| `/super-aidlc:debug [bug]` | Systematic root-cause investigation |
| `/super-aidlc:qa [url]` | Browser / API / CLI QA testing |
| `/super-aidlc:ship [branch]` | Verification + commit + push + PR |
| `/super-aidlc:compound [context]` | Extract knowledge into `aidlc-docs/solutions/` |
| `/super-aidlc:compound-refresh [scope]` | Maintain knowledge base quality |
| `/super-aidlc:janitor [--days=N]` | Auto-scan past sessions, compound the valuable ones |

## How It Works

```
Assess complexity → Light / Medium / Heavy
```

| Complexity | Pipeline |
|------------|----------|
| **Light** | TDD build → review → auto-verify |
| **Medium** | Questions → design doc → parallel TDD build → 2-stage review → auto-verify |
| **Heavy** | Problem reframing → questions → full design (diagram + error map + units) → parallel TDD build in worktrees → 2-stage review → coverage audit → auto-verify |

### Heavy Pipeline

```
Brainstorm:    WHO → WHAT → WHY → Approaches → Scope (optional, Heavy)
                  ↓
Inception:     Parallel Research (4 agents) → Questions → Design Doc → Approve
                  ↓
Construction:  [U1] [U2] [U3]  ← parallel worktrees, each TDD
                  ↓    ↓    ↓
               Spec Review → Parallel Quality Reviews → Merge
                  ↓
Verify:        Test → Build → Lint → (fail? → fix → retry x3) → All green
                  ↓
Ship:          Commit → Push → PR
                  ↓
Compound:      Extract knowledge → aidlc-docs/solutions/ (optional)
```

## Five Iron Laws

1. **No code without a failing test first.** Violations get deleted.
2. **No fixes without root-cause investigation.** No shotgun debugging.
3. **No completion claims without evidence.** "Should work" is not evidence.
4. **No shipping without all-green verification.** Auto-fix up to 3 times.
5. **No unsanitized input to shell/filesystem/templates.** Security is default-on.

## Project Structure

```
super-aidlc/
  VERSION                           # Semantic version (4.0.0)
  SKILL.md                          # Entry point: complexity routing + commands
  phases/
    brainstorm.md                   # Pre-inception exploration (optional, v4)
    inception.md                    # Design: parallel research → questions → doc → approval
    construction.md                 # Build: TDD + parallel + review + compound
    operations.md                   # Ship: browser QA, release, doc update
  agents/
    researcher.md                   # Context filter + three-layer knowledge search
    learnings-researcher.md         # Solutions knowledge base searcher (v4)
    git-history-analyzer.md         # Code evolution + hotspot analysis (v4)
    best-practices-researcher.md    # External patterns + framework docs (v4)
    architect.md                    # Design doc producer (no code)
    builder.md                      # TDD builder + input safety rules
    design-reviewer.md              # Independent design doc review (Heavy)
    spec-reviewer.md                # Stage 1: built what was asked?
    quality-reviewer.md             # Stage 2: overall quality gate
    correctness-reviewer.md         # Parallel: logic errors + edge cases (v4)
    security-reviewer.md            # Parallel: vulnerabilities (v4)
    performance-reviewer.md         # Parallel: perf + resources (v4)
    adversarial-reviewer.md         # Parallel: failure scenarios (v4)
    qa.md                           # Browser QA (Playwright, optional)
    debugger.md                     # Root-cause investigation
  skills/
    brainstorm/SKILL.md             # /super-aidlc:brainstorm
    design/SKILL.md                 # /super-aidlc:design
    review/SKILL.md                 # /super-aidlc:review
    debug/SKILL.md                  # /super-aidlc:debug
    qa/SKILL.md                     # /super-aidlc:qa
    ship/SKILL.md                   # /super-aidlc:ship
    compound/SKILL.md               # /super-aidlc:compound
    compound-refresh/SKILL.md       # /super-aidlc:compound-refresh
  guards/
    careful.md                      # Destructive command interception
    freeze.md                       # Edit scope lock
    verification.md                 # Evidence-before-claims gate
  rules/
    tdd.md                          # TDD reference + rationalization prevention
    review-protocol.md              # Two-stage review + parallel specialists
    anti-patterns.md                # Testing anti-patterns
    overconfidence-prevention.md    # Anti-skip rules + self-check protocol
    context-budget.md               # Token efficiency + lazy-loading strategy
  extensions/
    security-baseline.md            # Input safety + production readiness (default-on)
  adapters/
    claude-code/install.sh          # Claude Code install (--verify, --global)
    kiro/install.sh                 # Kiro install
  docs/
    blog-en.md                      # How and why we built this
    blog-cn.md                      # Chinese version
    benchmark-greenfield.md         # Single-session benchmark
    benchmark-brownfield.md         # Brownfield benchmark
    benchmark-cross-session.md      # Cross-session knowledge benchmark (v4)
```

## Credits

Built on ideas from:
- [AIDLC-workflows](https://github.com/awslabs/aidlc-workflows) -- adaptive lifecycle, documentation-driven design
- [Superpowers](https://github.com/PrimeRadiantAI/superpowers) -- TDD enforcement, two-stage review, rationalization prevention
- [gstack](https://github.com/garrytan/gstack) -- browser QA, safety guards, systematic debugging

## License

MIT

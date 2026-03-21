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

Four capabilities no other AI workflow has:

**1. True Parallel Multi-Agent Builds** -- Independent units dispatch simultaneously to isolated worktrees. 5 units build in 1 round, not 5.

**2. Cross-Session Learning** -- Reads prior build logs to avoid past mistakes and follow established patterns. Each run teaches the next.

**3. Kiro Specs Integration** -- Reads `.kiro/specs/` before asking questions. If specs exist, skips straight to building. Writes back after construction.

**4. Auto-Verification Loop** -- Runs test/build/lint automatically. Failures trigger the debugger agent, which fixes and re-verifies up to 3 times.

## Quick Start

```bash
# Kiro
git clone https://github.com/warren830/super-aidlc.git ~/super-aidlc
~/super-aidlc/adapters/kiro/install.sh /path/to/your/project

# Claude Code
~/super-aidlc/adapters/claude-code/install.sh /path/to/your/project
```

Then: `/super-aidlc [describe what you want to build]`

Symlink-based install -- `git pull` updates all projects.

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
Inception:     Reframe → Questions → Design Doc → Approve
                  ↓
Construction:  [U1] [U2] [U3]  ← parallel worktrees, each TDD
                  ↓    ↓    ↓
               Spec Review → Quality Review → Merge
                  ↓
Verify:        Test → Build → Lint → (fail? → fix → retry x3) → All green
                  ↓
Ship:          Commit → Push → PR
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
  SKILL.md                          # Entry point: complexity routing
  phases/
    inception.md                    # Design: questions → doc → approval
    construction.md                 # Build: TDD + parallel + review + auto-verify
    operations.md                   # Ship: browser QA, release, doc update
  agents/
    researcher.md                   # Context filter + cross-session learning
    architect.md                    # Design doc producer (no code)
    builder.md                      # TDD builder + input safety rules
    spec-reviewer.md                # Pass 1: built what was asked?
    quality-reviewer.md             # Pass 2: secure + well-built?
    qa.md                           # Browser QA (Playwright, optional)
    debugger.md                     # Root-cause investigation
  guards/
    careful.md                      # Destructive command interception
    freeze.md                       # Edit scope lock
    verification.md                 # Evidence-before-claims gate
  rules/
    tdd.md                          # TDD reference + rationalization prevention
    review-protocol.md              # Two-stage review protocol
    anti-patterns.md                # Testing anti-patterns
  extensions/
    security-baseline.md            # Input safety + production readiness (default-on)
  adapters/
    kiro/install.sh                 # One-line Kiro install
    claude-code/install.sh          # One-line Claude Code install
  docs/
    blog-en.md                      # How and why we built this
    blog-cn.md                      # Chinese version
    benchmark-brownfield.md         # Tests on existing codebase
    benchmark-greenfield.md         # Tests building from scratch
```

## Credits

Built on ideas from:
- [AIDLC-workflows](https://github.com/awslabs/aidlc-workflows) -- adaptive lifecycle, documentation-driven design
- [Superpowers](https://github.com/PrimeRadiantAI/superpowers) -- TDD enforcement, two-stage review, rationalization prevention
- [gstack](https://github.com/garrytan/gstack) -- browser QA, safety guards, systematic debugging

## License

MIT

# Super-AIDLC

> Stop vibe coding. Start engineering.

Super-AIDLC is a structured development skill for AI coding agents (Claude Code, Kiro). It routes tasks by complexity, designs before coding, builds with TDD in parallel, reviews with specialist agents, and compounds knowledge across sessions -- with security hardening enabled by default.

> [Chinese / 中文](README_CN.md) | [Blog](docs/blog-en.md) | [Benchmarks](docs/benchmark-greenfield.md)

## Why Another AI Workflow?

We benchmarked 4 approaches on identical tasks ([full results](docs/benchmark-greenfield.md)):

| Approach | Speed | Tests | Security Vulns | Design Docs |
|----------|-------|-------|----------------|-------------|
| Raw (no methodology) | **4 min** | 33 | Shell injection, path traversal, memory leak | None |
| Superpowers | 14 min | 69 | Shell injection, path traversal, memory leak | None |
| AIDLC-workflows | 9 min | 49 | Shell injection, path traversal, memory leak | 13 files (audit) |
| **Super-AIDLC** | 16 min | **85** | **None** | **2 files (design + build log)** |

Super-AIDLC is the only approach that produces code with zero known security vulnerabilities.

Cross-session benchmark ([full results](docs/benchmark-cross-session.md)): After 3 sessions on DevLake, Track A (Super-AIDLC) was 13% faster than Track B (Superpowers) in Session 3, with zero issues -- because 2 sessions of accumulated knowledge provided a clear implementation path.

---

## Quick Start

### Install

```bash
git clone https://github.com/warren830/super-aidlc.git ~/super-aidlc

# Global install (all projects)
~/super-aidlc/adapters/claude-code/install.sh --global

# Or single project
~/super-aidlc/adapters/claude-code/install.sh /path/to/your/project

# Kiro
~/super-aidlc/adapters/kiro/install.sh /path/to/your/project

# Verify
~/super-aidlc/adapters/claude-code/install.sh --verify --global
```

Symlink-based -- `cd ~/super-aidlc && git pull` updates all installed projects instantly.

### Your First Session

```bash
cd /your/project
claude

# Just describe what you want:
/super-aidlc Build a user authentication system with JWT
```

That's it. Super-AIDLC will auto-detect complexity, ask structured questions, produce a design doc, build with TDD, review, verify, and offer to ship.

---

## Usage Guide

### Daily Workflow (3 commands you'll use most)

```bash
# 1. Build anything
/super-aidlc implement rate limiting for the API

# 2. After a hard debugging session or solving a tricky problem:
/super-aidlc:compound

# 3. Weekly knowledge hygiene:
/super-aidlc:janitor --days=7
```

### All 11 Commands

#### Core Pipeline

| Command | When to Use | Example |
|---------|------------|---------|
| `/super-aidlc [task]` | Any development task | `/super-aidlc add WebSocket support` |

This is the main entry point. It auto-detects complexity and routes:

| Complexity | Auto-detected When | What Happens |
|------------|-------------------|--------------|
| **Light** | Bug fix, config change, ≤2 files | TDD build → review → verify |
| **Medium** | New feature, moderate scope | Questions → design doc → parallel build → review → verify |
| **Heavy** | New system, multi-component | Brainstorm → research → full design → parallel worktree builds → specialist review → verify |

**Flags:** `--light` `--medium` `--heavy` (force complexity), `--dry-run` (preview), `--lang=zh` (Chinese docs), `--skip-review` (escape hatch)

#### Before Building

| Command | When to Use | Example |
|---------|------------|---------|
| `/super-aidlc:brainstorm [idea]` | Vague idea, need to explore | `/super-aidlc:brainstorm I want some kind of notification system` |
| `/super-aidlc:design [task]` | Want design doc without coding | `/super-aidlc:design payment processing module` |

**Brainstorm** asks WHO/WHAT/WHY, then runs 3 parallel lenses (Product: "right problem?", Engineering: "hard risks?", Design: "UX issues?") on each approach. Defines scope, outputs `requirements.md` that feeds into the main pipeline.

**Design** runs full inception (research → questions → design doc → review) but stops before writing code. Use when you want to review the architecture before committing.

#### During / After Building

| Command | When to Use | Example |
|---------|------------|---------|
| `/super-aidlc:review [scope]` | Review current changes | `/super-aidlc:review backend/api/` |
| `/super-aidlc:debug [bug]` | Systematic bug investigation | `/super-aidlc:debug login returns 401 for valid tokens` |
| `/super-aidlc:qa [url]` | Test a running app | `/super-aidlc:qa http://localhost:3000` |
| `/super-aidlc:ship [branch]` | Verify + commit + push + PR | `/super-aidlc:ship` |

**Review** runs two stages: spec compliance (did you build what was asked?) then up to 8 parallel specialist reviewers (correctness, quality, maintainability always-on + security, performance, reliability, API contract, adversarial conditionally selected).

**Debug** follows the Iron Law: investigate → analyze → hypothesize → implement. No shotgun fixes. Always produces a regression test.

**QA** auto-detects mode (browser/API/CLI) and tests user flows with evidence (screenshots, response bodies).

**Ship** verifies all tests/build/lint pass, creates meaningful commits, pushes, and opens a PR with summary.

#### Knowledge Management

| Command | When to Use | Example |
|---------|------------|---------|
| `/super-aidlc:compound [context]` | After solving a hard problem | `/super-aidlc:compound` |
| `/super-aidlc:compound-refresh [scope]` | After refactors or migrations | `/super-aidlc:compound-refresh performance-issues` |
| `/super-aidlc:janitor [--days=N]` | Periodic knowledge scan | `/super-aidlc:janitor --days=7` |
| `/super-aidlc:metrics [--days=N]` | See how you're improving | `/super-aidlc:metrics --days=30` |

**Compound** extracts structured solutions from the current session (Problem → What Didn't Work → Solution → Prevention) into `aidlc-docs/solutions/`. Cross-project generic solutions auto-promote to `~/.aidlc/global-solutions/`.

**Compound-refresh** reviews existing solutions against current code. Five actions: Keep, Update, Consolidate, Replace, Delete. Use after refactors that may have invalidated prior knowledge.

**Janitor** scans build logs and auto-scores sessions (debugger invoked? multiple fix attempts? new patterns?). High-value sessions get auto-compounded. Low-value sessions are skipped. Run weekly.

**Metrics** generates trend reports: are you getting faster? fewer bugs? more tests? Shows which strategies (INLINE/SERIAL/PARALLEL) work best for your projects.

### Knowledge System (How It Gets Smarter)

```
Session 1:  aidlc-docs/ empty → starts from scratch
Session 2:  Researcher reads patterns.md + build logs → avoids Session 1's mistakes
Session 3:  Researcher reads solutions/ + patterns.md + logs → leverages all prior knowledge
Session N:  Four-layer search → project conventions → project solutions → global solutions → build history
```

Your knowledge accumulates in:

```
aidlc-docs/                              # Per-project (auto-created)
  patterns.md                            # Conventions (≤50 lines, always read first)
  solutions/                             # Structured knowledge base
    runtime-issues/                      # Bug fixes
    patterns/                            # Best practices
    config-issues/                       # Configuration gotchas
    testing-issues/                      # Testing insights
    ...
  2026-04-05-feature-name/
    design.md                            # Architecture + error map + decisions
    build-log.md                         # Session history + structured metrics

~/.aidlc/                                # Cross-project (auto-created)
  global-solutions/                      # Knowledge shared across all projects
```

### Typical Workflows

**New feature (Medium):**
```
/super-aidlc add user profile editing with avatar upload
→ asks ~5 groups of questions
→ produces design doc with architecture diagram
→ parallel builds 2-3 units with TDD
→ spec review → parallel quality review
→ auto-verify (test + build + lint)
→ offers to ship
→ auto-evaluates compound score
```

**Bug fix (Light):**
```
/super-aidlc:debug the email queue is dropping messages under load
→ investigate → reproduce → root cause
→ regression test → fix → verify
→ auto-compound if score >= 3
```

**Exploring a new idea:**
```
/super-aidlc:brainstorm I want real-time collaboration like Google Docs
→ WHO/WHAT/WHY questions
→ 2-3 approaches (WebSocket vs SSE vs polling)
→ scope definition
→ outputs requirements.md

/super-aidlc:design real-time collaboration
→ reads requirements.md automatically
→ produces design doc

/super-aidlc build real-time collaboration
→ reads design doc automatically
→ builds it
```

**Weekly maintenance:**
```
/super-aidlc:janitor --days=7              # compound any unprocessed valuable sessions
/super-aidlc:compound-refresh              # check for stale knowledge
/super-aidlc:metrics --days=30             # are we improving?
```

### Updating

```bash
cd ~/super-aidlc && git pull
# All installed projects update instantly (symlinks)
```

### Uninstalling

```bash
~/super-aidlc/adapters/claude-code/uninstall.sh /path/to/your/project
# Or for global: remove ~/.claude/skills/super-aidlc* directories
```

Note: `aidlc-docs/` in your project is NOT removed -- it contains your design docs and accumulated knowledge.

---

## Five Iron Laws

1. **No code without a failing test first.** Violations get deleted.
2. **No fixes without root-cause investigation.** No shotgun debugging.
3. **No completion claims without evidence.** "Should work" is not evidence.
4. **No shipping without all-green verification.** Auto-fix up to 3 times.
5. **No unsanitized input to shell/filesystem/templates.** Security is default-on.

## Architecture

```
Brainstorm:    WHO → WHAT → WHY → Approaches → Scope (optional)
                  ↓
Inception:     Parallel Research (4 agents) → Questions → Design Doc → Approve
                  ↓
Construction:  [U1] [U2] [U3]  ← INLINE / SERIAL / PARALLEL (auto-selected)
                  ↓    ↓    ↓
               Spec Review → Parallel Quality Reviews → Merge
                  ↓
Verify:        Test → Build → Lint → (fail? → debugger → retry x3) → All green
                  ↓
Ship:          Commit → Push → PR
                  ↓
Compound:      Score session → auto-extract if valuable → aidlc-docs/solutions/
```

### 18 Agents

| Agent | Role |
|-------|------|
| Researcher | Codebase patterns + four-layer knowledge search |
| Learnings Researcher | Search solutions knowledge base |
| Git History Analyzer | Code evolution + hotspot detection |
| Best Practices Researcher | External patterns + framework docs |
| Architect | Design doc producer (no code) |
| Builder | TDD builder + self-check protocol |
| Design Reviewer | Independent design review (Heavy) |
| Spec Reviewer | Stage 1: built what was asked? |
| Quality Reviewer | Stage 2: overall quality gate |
| Correctness Reviewer | Logic errors, edge cases, state bugs |
| Security Reviewer | Vulnerabilities, exploits, OWASP |
| Performance Reviewer | N+1, memory, scalability |
| Maintainability Reviewer | Coupling, complexity, naming, dead code |
| Reliability Reviewer | Error handling, retries, timeouts, failure modes |
| API Contract Reviewer | Breaking changes, response shapes, versioning |
| Adversarial Reviewer | Failure scenarios, attack vectors |
| QA Agent | Browser/API/CLI testing with real Chromium |
| Debugger | Root-cause investigation (4-phase) |

## Project Structure

```
super-aidlc/
  VERSION                           # 4.1.0
  SKILL.md                          # Entry point
  phases/                           # brainstorm, inception, construction, operations
  agents/                           # 18 specialized agents
  skills/                           # 10 slash commands
  guards/                           # careful, freeze, verification
  rules/                            # tdd, review-protocol, anti-patterns, overconfidence
  extensions/                       # security-baseline
  adapters/                         # claude-code, kiro install scripts
  docs/                             # blogs, benchmarks
```

## Credits

Built on ideas from:
- [AIDLC-workflows](https://github.com/awslabs/aidlc-workflows) (AWS Labs) -- adaptive workflow steering rules for AI agents, three-phase lifecycle (Inception→Construction→Operations), design-first with "Bolts" rapid iteration
- [Superpowers](https://github.com/obra/superpowers) (Jesse Vincent) -- composable skills for coding agents, non-negotiable TDD + verification-before-completion, subagent-driven development with two-stage review
- [gstack](https://github.com/garrytan/gstack) (Garry Tan) -- virtual engineering team as slash commands (15 specialists + 6 power tools), Think→Plan→Build→Review→Test→Ship→Reflect sprint cycle, real-browser QA with Playwright
- [Compound Engineering](https://github.com/EveryInc/compound-engineering-plugin) (Every Inc) -- "each unit of engineering work should make subsequent units easier", knowledge compounding via documented solutions, 80% planning+review / 20% execution

## License

MIT

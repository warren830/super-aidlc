# Super-AIDLC

> Stop vibe coding. Start engineering.

Super-AIDLC is a structured development skill for AI coding agents. It assesses task complexity, designs before coding, builds with TDD in parallel worktrees, reviews in two stages, and auto-verifies until all green.

> [Chinese version / 中文版](README_CN.md) | [Benchmark](BENCHMARK.md)

## Why Not Just Use AIDLC / Superpowers / gstack?

We tested all three head-to-head on the same codebase ([benchmark results](BENCHMARK.md)). Each has a clear gap:

| Tool | Strength | Gap |
|------|----------|-----|
| **AIDLC-workflows** | Complete audit trail | Never does TDD. No independent review. No parallel builds. |
| **Superpowers** | Fastest. Strict TDD. | Zero persistent documentation. Nothing survives the session. |
| **gstack** | Browser QA. Safety guards. | No lifecycle management. No design phase. |

Super-AIDLC takes the best from each, then adds 4 capabilities none of them have.

## 4 Unique Capabilities

### 1. True Parallel Multi-Agent Builds

Independent units dispatch simultaneously to isolated git worktrees. A Heavy task with 5 units builds in 1 round, not 5.

```
# In a SINGLE message, all 3 run at the same time:
Agent(prompt: "Build U1...", isolation: "worktree")
Agent(prompt: "Build U2...", isolation: "worktree")
Agent(prompt: "Build U3...", isolation: "worktree")
```

AIDLC builds units sequentially. Superpowers builds sequentially. Only Super-AIDLC dispatches them in parallel.

### 2. Cross-Session Learning

Reads prior `aidlc-docs/` build logs before starting. Extracts lessons learned, established patterns, and rejected alternatives. Each run makes the next one smarter.

```
## Lessons from Prior Runs
- ts-jest has cross-package resolution issues with pnpm → use diagnostic ignore codes
- This project uses SRP separation → one file per component
- Rejected: ajv library (adds external dependency for small schema subset)
```

No other workflow remembers what happened last time.

### 3. Kiro Specs Deep Integration

If the project has `.kiro/specs/` or `.kiro/steering/`, Super-AIDLC reads them first:

- **Specs already cover the feature?** Skip questions, use existing specs as design input.
- **Specs partially cover it?** Pre-fill known answers, only ask about gaps.
- **After building:** Write back completion status to `.kiro/specs/`.

Super-AIDLC is not bolted onto Kiro -- it is Kiro-native.

### 4. Auto-Verification Loop

After building, Super-AIDLC doesn't just tell you to run tests. It runs them, and if they fail, it fixes them:

```
REPEAT (max 3):
  Run tests   → FAIL? → dispatch debugger agent → fix → retry
  Run build   → FAIL? → fix compilation errors → retry
  Run lint    → FAIL? → fix lint errors → retry
  All green?  → DONE
```

Other tools: "Please verify." Super-AIDLC: verifies, fixes, and re-verifies for you.

## Quick Start

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

Installers create symlinks -- `git pull` in `~/super-aidlc` updates all projects automatically.

Then: `/super-aidlc [describe what you want to build]`

## How It Works

Every task starts with complexity assessment:

| Complexity | What Happens |
|------------|-------------|
| **Light** (bug fix, config) | Skip design. TDD build. Single review. Auto-verify. |
| **Medium** (new feature) | Structured questions. Design doc. Parallel build. Two-stage review. Auto-verify. |
| **Heavy** (new system, refactor) | Problem reframing. Full design with architecture diagram, error map, unit breakdown. Parallel build in worktrees. Two-stage review. Coverage audit. Auto-verify. |

### The Full Heavy Pipeline

```
Inception:  Reframe problem → Ask questions → Design doc (diagram + error map + units) → Review → Approve
               ↓
Construction: [Builder U1] [Builder U2] [Builder U3]  ← parallel in worktrees, each with TDD
               ↓               ↓              ↓
            Spec Review → Quality Review → Merge → Coverage Audit
               ↓
Verify:     Test → Build → Lint → (fail? → debugger → fix → retry) → All green
               ↓
Ship:       Commit → Push → PR (with design doc + test results)
```

## Five Iron Laws

1. **No production code without a failing test first.** Violations get deleted.
2. **No fixes without root-cause investigation.** No shotgun debugging.
3. **No completion claims without verification evidence.** "Should work" is not evidence.
4. **No shipping without all-green verification loop.** Auto-fix up to 3 times.
5. **No user input passed unsanitized to shell, filesystem, or templates.** Security baseline is default-on.

## File Structure

```
super-aidlc/
  SKILL.md                        # Entry: complexity routing + iron laws
  phases/
    inception.md                  # Design: questions -> design doc -> approval
    construction.md               # Build: parallel TDD + review + auto-verify
    operations.md                 # QA + Ship: browser QA, release, doc update
  agents/
    researcher.md                 # Context filter + cross-session learning
    architect.md                  # Design doc producer (no code)
    builder.md                    # TDD builder in isolated worktree
    spec-reviewer.md              # Review pass 1: did you build what was asked?
    quality-reviewer.md           # Review pass 2: is the code well-built?
    qa.md                         # Browser QA with Playwright (optional)
    debugger.md                   # Root-cause investigation for auto-verify loop
  guards/
    careful.md                    # Destructive command interception
    freeze.md                     # Edit scope lock
    verification.md               # Evidence-before-claims gate
  rules/
    tdd.md                        # TDD reference with rationalization prevention
    review-protocol.md            # Two-stage review protocol
    anti-patterns.md              # Testing anti-patterns
  extensions/
    security-baseline.md          # OWASP security constraints (opt-in)
  adapters/
    kiro/install.sh               # One-line install for Kiro projects
    claude-code/install.sh        # One-line install for Claude Code projects
```

## Benchmark Results

Tested on the same TypeScript monorepo, same model (Claude Opus 4.6), same tasks:

| Dimension | AIDLC | Superpowers | Super-AIDLC |
|-----------|-------|-------------|-------------|
| Speed (Medium) | 10 min | -- | **6.5 min (-35%)** |
| Speed (Heavy) | 12 min | **9 min** | 13.6 min |
| TDD compliance | Never | Always | Always |
| Test count (Heavy) | 35 | 46 | **48** |
| Design documentation | Audit only | None | **Diagram + error map + decisions + alternatives** |
| Persistent artifacts | audit.md | None | **Design doc + build log + audit-lite** |
| Code modularity | Mixed | SRP | **SRP** |

Full results: [BENCHMARK.md](BENCHMARK.md)

## Credits

Built on ideas from three open-source projects:

- **[AIDLC-workflows](https://github.com/awslabs/aidlc-workflows)** -- Adaptive lifecycle, documentation-driven design, extension system.
- **[Superpowers](https://github.com/PrimeRadiantAI/superpowers)** -- TDD enforcement, two-stage review, verification gate, rationalization prevention.
- **[gstack](https://github.com/garrytan/gstack)** -- Browser QA, careful/freeze safety guards, systematic debugging.

## License

MIT

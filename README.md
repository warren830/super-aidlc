# Super-AIDLC v3

A structured development skill for AI coding agents that combines adaptive lifecycle management, test-driven development enforcement, and production safety guards into a single workflow. It turns "vibe coding" into a repeatable process: assess complexity, design before code, build with TDD in parallel worktrees, review in two stages, and ship with verification evidence.

> [Chinese version / 中文版](README_CN.md)

## What Makes It Different

Super-AIDLC merges the best of three proven systems, plus 4 unique capabilities no other tool has:

| Source | What We Take |
|--------|-------------|
| **[AIDLC-workflows](https://github.com/awslabs/aidlc-workflows)** | Adaptive lifecycle, documentation-driven design, audit trail, extension system |
| **[Superpowers](https://github.com/PrimeRadiantAI/superpowers)** | TDD iron law, sub-agent context isolation, two-stage review, rationalization prevention |
| **[gstack](https://github.com/garrytan/gstack)** | Browser QA, safety guards (careful/freeze), investigate debugging, ship automation |

### Unique to Super-AIDLC

These 4 features cannot be replicated by combining the other tools:

1. **True Parallel Multi-Agent Builds** -- Independent units dispatch simultaneously to isolated worktrees via Agent tool. A Heavy task with 5 units runs in 1 round, not 5. Neither AIDLC nor Superpowers can do this.

2. **Cross-Session Learning** -- Reads prior build logs to extract lessons: "last time ts-jest had resolution issues, here's how we fixed it." Each run teaches the next one. No other workflow remembers across sessions.

3. **Kiro Specs Deep Integration** -- Reads existing `.kiro/specs/` and `.kiro/steering/` before asking questions. If Kiro already has requirements, Super-AIDLC skips straight to building. Writes back completion status after construction.

4. **Auto-Verification Loop** -- After building, runs test/build/lint automatically. Failures trigger the debugger agent, which fixes and re-verifies. Loops up to 3 times until all green. Other tools tell you to verify; Super-AIDLC verifies and fixes for you.

## Supported Platforms

- **Kiro** (AWS AI IDE)
- **Claude Code** (Anthropic CLI)

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

Both installers create symlinks, so updates to this repo propagate automatically.

Then use in your AI agent: `/super-aidlc [describe what you want to build]`

## Workflow Overview

Every task starts with complexity assessment, then routes accordingly:

### Light (bug fix, config change)
- Skip design, go straight to build
- TDD still enforced: write failing test, fix, verify green
- Single reviewer pass

### Medium (new feature, moderate change)
- Checklist-level questions (3-5 groups with options and recommendations)
- Design doc with architecture diagram, error map, units of work
- Parallel builder dispatch with worktree isolation
- Two-stage review: spec compliance then code quality

### Heavy (new system, multi-component, major refactor)
- Problem reframing before questions
- Detailed questions including NFR, personas, architecture decisions
- Full design doc with threat model (if security baseline enabled)
- Scope challenge: "If you could only ship ONE unit, which delivers the most value?"
- Parallel builders, two-stage review, coverage audit, optional browser QA

## File Structure

```
super-aidlc/
  SKILL.md                        # Entry: complexity assessment + routing
  phases/
    inception.md                  # Design: questions -> design doc -> approval
    construction.md               # Build: TDD + parallel agents + two-stage review
    operations.md                 # QA + Ship: browser QA, release, doc update
  agents/
    researcher.md                 # Context filter (30-80 lines, cite sources)
    architect.md                  # Design doc producer (no code)
    builder.md                    # TDD-enforced builder in worktree
    spec-reviewer.md              # Pass 1: spec compliance (don't trust report)
    quality-reviewer.md           # Pass 2: security + code quality
    qa.md                         # Browser QA with Playwright (optional)
    debugger.md                   # Root-cause investigation (no guessing)
  guards/
    careful.md                    # Destructive command warnings
    freeze.md                     # Edit scope lock
    verification.md               # No claims without evidence
  rules/
    tdd.md                        # TDD iron law + rationalizations
    review-protocol.md            # Two-stage review rules
    anti-patterns.md              # Testing anti-patterns reference
  extensions/
    security-baseline.md          # OWASP-aligned security constraints (opt-in)
  adapters/
    kiro/install.sh               # Symlink to .kiro/skills/
    claude-code/install.sh        # Symlink to .claude/skills/
```

## Iron Laws

These four rules are non-negotiable. Every agent, every task, every time.

1. **No production code without a failing test first.** Write the test. Watch it fail. Then implement. Violations get deleted.
2. **No fixes without root-cause investigation first.** Trace backward from symptom to origin. No shotgun debugging.
3. **No completion claims without fresh verification evidence.** Run the command. Read the output. Then claim success. "Should work" is not evidence.
4. **No shipping without all-green verification loop.** Tests, build, and lint must all pass. Failures are auto-fixed up to 3 times.

## Credits

Super-AIDLC is built on ideas from three open-source projects:

- **[AIDLC-workflows](https://github.com/awslabs/aidlc-workflows)** -- Adaptive lifecycle, documentation-driven design, extension system, audit trail patterns.
- **[Superpowers](https://github.com/PrimeRadiantAI/superpowers)** -- TDD enforcement, two-stage review protocol, verification gate, testing anti-patterns, systematic debugging.
- **[gstack](https://github.com/garrytan/gstack)** -- Browser QA workflow, careful/freeze safety guards, investigate debugging, ship automation, coverage audit.

## License

MIT

# I Tested 4 AI Coding Methodologies Head-to-Head. Here's What Actually Matters.

*March 2026 | Warren Chen*

Every week there's a new "AI coding workflow" on GitHub promising to turn Claude or Cursor into a 10x engineering team. I got tired of the hype and decided to test them properly.

I took 4 approaches -- AIDLC-workflows (AWS's open-source methodology), Superpowers (a TDD-focused skill), my own Super-AIDLC (which combines ideas from all of them), and raw prompting (no methodology at all) -- and ran them on identical tasks with the same model. Same codebase. Same prompts. In parallel.

The results surprised me.

## The Setup

**Model**: Claude Opus 4.6 (1M context)

**Codebase**: A real TypeScript monorepo (enterprise AI agent platform, 3 packages, existing CI/CD)

**Tasks**:
- Medium: Add a health check API endpoint (brownfield)
- Heavy: Build a complete analytics pipeline with 5 components (brownfield)
- Heavy: Build an entire Feishu-to-Claude Code bridge app from scratch (greenfield)

Each task ran 4 times in parallel, one per methodology, zero shared context.

## Round 1: Speed vs Quality

First surprise: **the methodology barely affects whether the code works.** All 4 approaches produced functional, buildable, passing-tests code on every task. The differences are in *how* they get there and what they leave behind.

### Speed

| Task | Raw | Superpowers | Super-AIDLC | AIDLC |
|------|-----|-------------|-------------|-------|
| Medium (brownfield) | -- | -- | **6.5 min** | 10 min |
| Heavy (brownfield) | -- | **9 min** | 13.6 min | 12 min |
| Heavy (greenfield) | **4.4 min** | 9 min | 10 min | 14.6 min |

Raw is 3x faster than AIDLC. No surprise -- it has zero overhead. But that speed comes at a cost we'll see later.

### Test Count

| Task | Raw | Superpowers | Super-AIDLC | AIDLC |
|------|-----|-------------|-------------|-------|
| Heavy (brownfield, schema) | -- | 46 | **48** | 35 |
| Heavy (greenfield, feishu) | 26 | **68** | 58 | 63 |

Superpowers and Super-AIDLC consistently produce more tests. They both enforce TDD -- write the test first, watch it fail, then implement. AIDLC says "write tests" but doesn't enforce the order. In all 5 runs, AIDLC wrote code first and tests after. Every time.

### Documentation

| | Raw | Superpowers | Super-AIDLC | AIDLC |
|--|-----|-------------|-------------|-------|
| Architecture diagram | No | No | **Yes** | No |
| Error/rescue map | No | No | **Yes** | No |
| Decisions log | No | No | **Yes** | No |
| Audit trail | No | No | Audit-lite | **Full** |
| Doc files | 0 | 0 | **2** | 8-14 |

Superpowers produces zero documentation. Everything lives in the agent's context and is lost when the session ends. AIDLC produces many documents (personas, user stories, component matrices) but no visual aids. Super-AIDLC produces 2 rich files: a design doc with architecture diagram and error map, and a build log with approvals and alternatives considered.

At this point I was honest with myself: **Super-AIDLC didn't have a clear enough advantage.** The TDD and documentation were nice, but you could get TDD by just adding Superpowers' skill to AIDLC. The design docs were richer, but did they actually produce better code?

## The Revelation: None of Them Write Secure Code

I did a deep code review of all 4 versions of the Feishu project. Every single one had:

- **Shell injection**: `execSync(\`git clone ${userInput}\`)` -- user sends a malicious URL, game over.
- **Path traversal**: `/workspace ../../etc/passwd` -- user escapes the sandbox.
- **Memory leaks**: Per-user Maps that grow forever, no TTL, no cleanup.
- **Unbounded buffers**: Claude generates 500MB of output, app crashes with OOM.
- **Environment variable leakage**: Child processes inherit all secrets.

Four methodologies. Same vulnerabilities. **No methodology automatically produces secure code.**

This was the wake-up call. The methodologies are solving the wrong problem. TDD catches logic bugs. Design docs help with architecture. But security? Concurrency? Production readiness? Nobody's checking for those.

## Round 2: After Hardening

I made three changes to Super-AIDLC:

**1. Security baseline is now default-on, not opt-in.**

Added a 5th Iron Law: "No user input passed unsanitized to shell, filesystem, or templates." The builder agent gets mandatory rules with code examples:

```typescript
// The builder now knows this is WRONG:
execSync(`git clone ${userUrl}`)

// And must use this instead:
execFileSync('git', ['clone', userUrl])
```

**2. Quality reviewer checks production readiness.**

New CRITICAL checklist items:
- In-memory Maps have TTL or max entries?
- File writes are atomic (temp + rename)?
- Concurrent access protected?
- Child processes cleaned up on shutdown?
- Environment variables whitelisted for subprocesses?

**3. Builder enforces strict SRP.**

Max 200 lines per file. One handler per file. If you can't describe the file's purpose in one sentence, split it.

Then I re-ran the same 4-way test. Fresh agents, zero context.

### Round 2 Results

| | Raw | Superpowers | Super-AIDLC v2 | AIDLC |
|--|-----|-------------|----------------|-------|
| Tests | 33 | 69 | **85** | 49 |
| Shell injection | Vulnerable | Vulnerable | **Fixed** | Vulnerable |
| Path traversal | Vulnerable | Vulnerable | **Fixed (9 checks)** | Vulnerable |
| Memory cleanup | None | None | **TTL + 1000 cap** | None |
| Output limits | Weak | None | **32 limit checks** | None |
| Env var isolation | None | None | **Whitelist** | None |
| Atomic writes | None | None | **Yes** | None |
| Time | **4.4 min** | 13.7 min | 16.2 min | 9.2 min |

**Super-AIDLC v2 was the only approach that produced secure code.** The other three -- including AIDLC with its 13 documentation files and full audit trail -- still had every vulnerability from Round 1.

The cost? 16 minutes instead of 10. The extra 6 minutes bought:
- +27 tests (58 -> 85)
- Zero security vulnerabilities (vs multiple in all others)
- Production-ready patterns (TTL, atomic writes, bounded buffers)
- Threat model in the design document

## What I Learned

### 1. Methodology doesn't determine if code works

All 4 approaches produced functional code every time. The model is good enough that the basic functionality is reliable regardless of process.

### 2. Methodology determines if code is trustworthy

TDD, review, and security checks determine whether you can deploy the code with confidence. Raw coding and AIDLC both skip TDD. Superpowers and Super-AIDLC enforce it. Only Super-AIDLC checks for security.

### 3. "Write secure code" doesn't work as an instruction

I didn't tell the Round 1 agents "write insecure code." They all had access to security best practices. But without mechanical enforcement -- specific rules with code examples, a reviewer checklist that blocks on violations -- the AI takes shortcuts just like a human developer under time pressure.

### 4. The real differentiator is what you check, not what you document

AIDLC produces 13 documentation files including user personas and component dependency matrices. None of that prevented shell injection. Super-AIDLC produces 2 documentation files and a reviewer checklist that blocks merge on security violations. That prevented shell injection.

Process documents are for humans. Enforcement rules are for AI.

### 5. Speed is a trap

Raw coding is 4x faster. It's also the only approach I wouldn't deploy to production. The 12 extra minutes Super-AIDLC takes would cost days to fix manually if the security vulnerabilities made it to production.

## The Tradeoff Chart

```
Speed:      Raw (4m) >>> AIDLC (9m) > Superpowers (14m) > Super-AIDLC (16m)
Tests:      Super-AIDLC (85) > Superpowers (69) > AIDLC (49) > Raw (33)
Security:   Super-AIDLC >>> Raw = Superpowers = AIDLC (all vulnerable)
Docs:       Super-AIDLC > AIDLC >> Raw = Superpowers (none)
Structure:  Superpowers (98 LOC max) > AIDLC (142) > Super-AIDLC (178) > Raw (246)
```

## When to Use What

| You need... | Use... |
|-------------|--------|
| A throwaway prototype, fast | Raw |
| Clean code structure, solo project | Superpowers |
| Production-ready code with docs | **Super-AIDLC** |
| Compliance audit trail | AIDLC (+ Super-AIDLC security rules) |

## Try It

Super-AIDLC is open source. It's a set of Markdown files -- no runtime, no dependencies, no build step. Works with Kiro and Claude Code.

```bash
git clone https://github.com/warren830/super-aidlc.git ~/super-aidlc
~/super-aidlc/adapters/claude-code/install.sh /path/to/your/project
# Then: /super-aidlc [describe what you want to build]
```

Full benchmark data: [Brownfield tests](benchmark-brownfield.md) | [Greenfield tests](benchmark-greenfield.md)

Built on ideas from [AIDLC-workflows](https://github.com/awslabs/aidlc-workflows), [Superpowers](https://github.com/PrimeRadiantAI/superpowers), and [gstack](https://github.com/garrytan/gstack).

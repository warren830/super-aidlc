# Credits

Super-AIDLC stands on ideas and patterns from the open-source community. This file records what we borrowed and from whom.

## Superpowers (Jesse Vincent / Prime Radiant)

- **Upstream**: <https://github.com/obra/superpowers> (MIT)

Super-AIDLC has adapted several behavior-shaping patterns from Superpowers. Not code reuse — conceptual and structural borrowing, rewritten in super-aidlc's voice and integrated with super-aidlc's pipeline (Inception → Construction → Operations).

Specifically:

| From superpowers | Where in super-aidlc | Adaptation |
|------------------|----------------------|------------|
| `skills/verification-before-completion/` | `skills/verify/` | Voice ("the user" vs "your human partner"); integrated with `skills/ship/`, `phases/construction.md` Step 6, `agents/builder.md` Self-Check |
| `skills/test-driven-development/` | `skills/tdd/` + `skills/tdd/anti-patterns.md` | Linked to `--skip-tests` flag as explicit Iron Law bypass; builder agent prerequisite |
| `skills/using-git-worktrees/` | `skills/worktree/` | Documents existing super-aidlc behavior (PARALLEL strategy defaults to worktree via Agent tool's `isolation` option) rather than introducing a new flag |
| `skills/writing-skills/` | `skills/skills/` (this was already a directory) | Lightweight version (~95 lines vs 655); retains persuasion-principles essence and Red Flags |
| `using-superpowers/` Red Flags pattern | Top-level `SKILL.md` "Red Flags — STOP, You're Rationalizing" | Adapted rationalization table for super-aidlc's context |

"Iron Law" framing was already in use in `skills/debug/SKILL.md` before this integration — super-aidlc and superpowers converged on that pattern independently, which is why the borrowed content slots in cleanly.

## What Super-AIDLC Adds

These are super-aidlc originals, not borrowed:

- **Compound knowledge system** (`skills/compound/`, `compound-refresh/`, `janitor/`) — per-session learning extraction into `aidlc-docs/solutions/`.
- **18 specialist reviewer agents** (`agents/*-reviewer.md`) — security, performance, architecture, API contract, maintainability, reliability, correctness, etc. Parallel two-stage review vs superpowers' single code-reviewer.
- **Multi-language artifact generation** (`zh`/`en`/`ja`/`ko`) — design docs, build logs, reports in user's language; code and commits stay in English.
- **Complexity auto-detection + overrides** (`--light` / `--medium` / `--heavy`) — pipeline scales to task size.
- **Pipeline phases** (Inception / Construction / Operations) — in-order execution with auto-verification loop, plan-design alignment check, and checkpoint/rollback.
- **`--auto` fresh subagent dispatch** — long-running autonomous execution with human gate at phase boundaries.
- **`--dry-run` preview mode** — see the pipeline plan before executing.
- **Meta-tests for skills** (`tests/skills.test.ts`) — auto-validates frontmatter + naming conventions for every skill on disk.

## License

Both projects are MIT-licensed. Super-aidlc's LICENSE applies to this repository. Superpowers' license travels with the concepts and any code it inspired.

---

Integration tracked in `aidlc-docs/2026-05-02-superpowers-integration/design.md`.

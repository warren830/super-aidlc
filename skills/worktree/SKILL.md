---
name: super-aidlc:worktree
description: Git worktree usage in super-aidlc. Worktrees provide filesystem isolation for parallel builders. PARALLEL strategy uses them by default via the Agent tool's `isolation: "worktree"` option. Read this before debugging worktree issues or running `--auto` on branches with uncommitted state.
model: opus
---

# Worktree

## Overview

Git worktrees let multiple branches be checked out in parallel, each in its own directory. Super-AIDLC uses them so concurrent builders cannot overwrite each other's unstaged changes.

**Worktrees are not opt-in or opt-out. They are strategy-dependent.** See the table below.

## When Worktrees Are Used

| Construction strategy | Worktree? | Why |
|-----------------------|-----------|-----|
| **INLINE** (1-2 units) | No | Single agent, nothing to isolate from |
| **SERIAL** (dependent units) | No | Sequential execution, later builders see earlier builders' output |
| **PARALLEL** (independent units) | **Yes, by default** | Prevents concurrent writes to the same working tree |

The strategy is chosen by `phases/construction.md` Step 3 based on unit count + dependency graph. You usually do not override it.

## How It Works (PARALLEL mode)

1. The orchestrator dispatches N `Agent(...)` calls in a single message with `isolation: "worktree"`. This is a built-in Agent tool option — super-aidlc does not manage worktrees itself.
2. The Agent tool creates a temporary worktree for each agent under `.claude/worktrees/<hash>/` on a new branch.
3. Each builder agent works inside its worktree. Reads and writes stay scoped to that copy.
4. When the builder finishes, it reports the worktree path and branch name back to the orchestrator.
5. The orchestrator merges each branch back per the Merge Protocol in `phases/construction.md`.
6. Worktrees with no changes are automatically cleaned up by the Agent tool; worktrees with changes have their path + branch returned for merge.

See `phases/construction.md` Step 4 "PARALLEL Mode (with Worktree-First Fallback)" for the authoritative dispatch logic.

## Failure and Fallback (PARALLEL mode)

If ANY builder fails with a worktree error (hook blocked creation, permission denied, `.git/worktrees` corruption), the orchestrator:

1. Treats ALL builders as failed (mixing isolation modes complicates merge).
2. Redispatches ALL builders with `run_in_background: true` and **explicit file boundaries** baked into each prompt:

```
You may ONLY create or modify these files: <list from design doc>
Do NOT touch any file outside this list. Other builders are working simultaneously.
```

Why all-or-nothing: without per-file boundaries, two builders in the same working tree will race on imports, config, and shared files.

## Merge Protocol (after successful parallel build)

For each worktree branch the orchestrator runs:

1. `git merge --no-commit {worktree-branch}`
2. **Clean merge** → commit, move to next branch.
3. **Conflict** → classify:
   - **Additive** (both sides add distinct lines) → auto-keep both, run test suite, commit if green.
   - **Semantic** (both sides changed the same logic) → dispatch `agents/debugger.md` with both versions + the relevant Interface Contract. If debugger resolves, commit. If not, escalate to the user.

Full protocol in `phases/construction.md` Step 4 "Merge Protocol".

## Manual Worktree Usage (non-parallel cases)

Use a worktree even for single-agent work when:

- Running `--auto` construction while continuing other work in the main directory (isolation from your own uncommitted changes).
- Testing a migration that touches many files and you want clean rollback via `git worktree remove`.
- Investigating a past commit without stashing your current work.

```bash
# Create
git worktree add .claude/worktrees/<slug> -b <branch-name>
cd .claude/worktrees/<slug>

# Work, commit

# Clean up
cd -
git worktree remove .claude/worktrees/<slug>
git branch -d <branch-name>
```

## Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| "worktree already exists" | A previous run crashed before cleanup | `git worktree prune` (safe) or `git worktree remove --force <path>` |
| "ref X is already checked out" | Branch is in use by another worktree | Pick a different branch name |
| Every parallel run has merge conflicts | Units overlap on the same files | Re-partition units in the design doc — parallel strategy requires disjoint file sets |
| `.claude/worktrees/` has old agent-* dirs | Prior sessions left residue | `git worktree prune`, then `rm -rf .claude/worktrees/agent-*` if any remain untracked |

## Integration with super-aidlc

- **`phases/construction.md` Step 4 (PARALLEL Mode)**: dispatch + fallback logic.
- **`phases/construction.md` Merge Protocol**: conflict handling.
- **`agents/builder.md`**: builder prompt assumes it is running inside a worktree ("You are building one unit of work in an isolated git worktree").
- **`.claude/worktrees/`**: canonical parent directory for super-aidlc-created worktrees.
- **`--auto`**: dispatches a construction subagent which, if it picks PARALLEL strategy, uses worktrees automatically. There is no separate `--worktree` flag because worktree selection is strategy-driven, not user-facing.

## Red Flags — STOP

- About to dispatch parallel builders without `isolation: "worktree"` → read `phases/construction.md` Step 4 first.
- About to manually delete `.claude/worktrees/` with active worktrees inside → use `git worktree remove` or `git worktree prune`; raw `rm -rf` leaves git's worktree metadata stale.
- Merge conflicts in every parallel run → your units are not truly independent; go back to design doc and re-partition.

## The Bottom Line

Worktrees are handled by the Agent tool when PARALLEL strategy is selected. Super-AIDLC does not expose a user-facing worktree flag because the choice is driven by the unit dependency graph. When things go wrong, the fallback to background mode with explicit file boundaries is automatic.

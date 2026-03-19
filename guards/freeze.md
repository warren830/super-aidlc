# Freeze Guard

Restrict all file modifications to a specific directory for the duration of this session.

## Activation

The freeze activates when:
- The user says "freeze to {path}" (e.g., "freeze to src/auth/").
- The skill or orchestrator determines that scope should be locked to prevent accidental edits outside the current unit of work.

## Rules

When freeze is active:

### BLOCKED (outside the allowed path)

- **Edit** -- cannot modify files outside the frozen path.
- **Write** -- cannot create or overwrite files outside the frozen path.
- **New file creation** -- cannot create new files outside the frozen path.
- **Delete** -- cannot remove files outside the frozen path.
- **Move/Rename** -- cannot move or rename files to or from outside the frozen path.

### ALLOWED (everywhere)

- **Read** -- can read any file in the entire repository. Read-only access is always safe.
- **Grep/Search** -- can search any file in the entire repository.
- **Git operations** -- can run git commands (log, diff, status, etc.) that do not modify files outside the path.

## Behavior on Violation Attempt

If an operation is attempted outside the frozen path:

```
FREEZE ACTIVE

Attempted: {operation} on {file path}
Frozen to: {allowed path}
Status: BLOCKED

The current session is frozen to {allowed path}.
To edit files outside this path, say "unfreeze" first.
```

Do not proceed with the operation. Do not ask "are you sure?" -- the operation is blocked.

## Override

The user can say "unfreeze" to remove the restriction. Once unfrozen, all paths are writable again.

The user can also say "freeze to {new path}" to change the frozen path without unfreezing first.

## Scope

- The freeze applies to the exact path and everything under it. "freeze to src/auth/" allows edits to `src/auth/login.ts`, `src/auth/utils/hash.ts`, etc.
- Paths are matched as prefixes. `src/auth` matches `src/auth/` and `src/authentication/` -- be specific.
- The freeze does not persist across sessions. Each new session starts unfrozen.

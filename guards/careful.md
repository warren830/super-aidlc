# Careful Guard

Before executing any destructive command, WARN the user and wait for explicit confirmation.

## Destructive Commands

These commands can cause irreversible data loss or damage. Each one requires a warning before execution.

| Command Pattern | What It Does | Reversible? |
|----------------|-------------|-------------|
| `rm -rf` | Recursively deletes files and directories without confirmation | No |
| `git reset --hard` | Discards all uncommitted changes and resets to a commit | No (uncommitted changes lost) |
| `git push --force` | Overwrites remote history, can destroy others' work | Difficult (reflog, limited window) |
| `git push --force-with-lease` | Overwrites remote history with safety check | Difficult |
| `git checkout -- .` | Discards all unstaged changes in working directory | No |
| `git restore .` | Discards all unstaged changes in working directory | No |
| `git clean -f` | Deletes untracked files permanently | No |
| `DROP TABLE` | Deletes an entire database table and its data | No (without backup) |
| `DROP DATABASE` | Deletes an entire database | No (without backup) |
| `TRUNCATE` | Deletes all rows from a table | No (without backup) |
| `kubectl delete` | Deletes Kubernetes resources | Depends on resource type |
| `docker system prune` | Removes unused containers, images, networks, volumes | No |
| `--no-verify` | Skips pre-commit hooks and safety checks | N/A (bypasses guardrails) |

## Safe Exceptions

These directories are safe to delete without warning. They are generated artifacts that can be recreated:

- `node_modules/`
- `.next/`
- `dist/`
- `build/`
- `__pycache__/`
- `.pytest_cache/`
- `target/`
- `.turbo/`
- `.parcel-cache/`

Example: `rm -rf node_modules` does NOT require a warning. `rm -rf src/` does.

## Warning Format

When a destructive command is detected, display this warning BEFORE executing:

```
DESTRUCTIVE COMMAND DETECTED

Command: {the exact command}
This will: {plain English description of what will happen}
Reversible: {YES / NO / DIFFICULT}

Type "y" to proceed, anything else to cancel.
```

## Rules

1. Do NOT execute the command until the user responds with "y". Any other response (including "yes", "sure", "ok") means cancel. Only the literal "y" proceeds.
2. If the command affects multiple resources (e.g., `kubectl delete namespace`), list what will be affected.
3. If you are unsure whether a command is destructive, err on the side of warning.
4. This guard applies to commands you execute directly AND commands you suggest the user run.
5. Chained commands count: `rm -rf /tmp/work && rm -rf src/` requires a warning for the `src/` part even though `/tmp/work` might be safe.

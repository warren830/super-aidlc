# Category Mapping

Maps `problem_type` to directory structure under `aidlc-docs/solutions/`.

## Directory Mapping

| problem_type | Directory |
|-------------|-----------|
| build-failure | `build-issues/` |
| runtime-error | `runtime-issues/` |
| test-failure | `testing-issues/` |
| performance-issue | `performance-issues/` |
| security-vulnerability | `security-issues/` |
| data-integrity | `data-issues/` |
| integration-issue | `integration-issues/` |
| configuration-error | `config-issues/` |
| deployment-issue | `deployment-issues/` |
| concurrency-bug | `concurrency-issues/` |
| architecture-decision | `architecture/` |
| best-practice | `patterns/` |
| anti-pattern | `patterns/` |
| tooling-insight | `tooling/` |
| debugging-technique | `debugging/` |
| migration-guide | `migrations/` |

## Filename Convention

```
{sanitized-problem-slug}-{YYYY-MM-DD}.md
```

Examples:
- `sqlite-wal-mode-lock-timeout-2026-04-05.md`
- `vitest-mock-cleanup-pattern-2026-04-05.md`
- `api-rate-limiting-architecture-2026-04-05.md`

## Frontmatter Example (Bug Track)

```yaml
---
title: "SQLite WAL mode lock timeout on concurrent writes"
date: 2026-04-05
problem_type: runtime-error
category: runtime-issues
module: database
component: sqlite-connection-pool
severity: high
resolution_type: code-fix
tags: [sqlite, wal, concurrency, timeout]
related_docs: []
status: active
---
```

## Frontmatter Example (Knowledge Track)

```yaml
---
title: "Use array form for shell commands to prevent injection"
date: 2026-04-05
problem_type: best-practice
category: patterns
module: security
component: input-validation
tags: [security, shell, injection, execFile]
applies_when: "Any code that executes shell commands with user-provided input"
related_docs: []
status: active
---
```

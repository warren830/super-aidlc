---
name: super-aidlc:qa
description: Run QA testing against a live app (browser, API, or CLI). Tests user flows, captures screenshots, reports bugs by severity.
argument-hint: "[URL or command to test, e.g. http://localhost:3000]"
model: opus
---

# QA Testing

Test target: $ARGUMENTS

## QA Modes

| Mode | When | How |
|------|------|-----|
| **Browser** | Web apps (http/https URL) | Navigate, interact, screenshot, assert |
| **API** | REST/GraphQL APIs | curl + schema validation |
| **CLI** | Command-line tools | Shell commands + output assertions |

Auto-detected from the test target. Override with `--mode=browser|api|cli`.

## Process

### 1. Read Design Doc (if exists)

Check `aidlc-docs/` for the most recent design doc. Use it to understand expected behavior, user flows, and acceptance criteria.

### 2. Test Each User Flow

For each flow:
1. Set up initial state
2. Execute the flow (navigate, click, fill, submit)
3. Verify the outcome (visible elements, response codes, output)
4. Capture evidence (screenshot, response body, output)

### 3. Classify Bugs

| Severity | Meaning | Examples |
|----------|---------|---------|
| **CRITICAL** | Data loss, security breach, core feature broken | Auth bypass, data corruption, crash on launch |
| **MAJOR** | Feature broken, significant UX issue | Form doesn't submit, wrong data displayed, broken nav |
| **MINOR** | Cosmetic, minor inconvenience | Alignment off, typo, missing hover state |

### 4. Output QA Report

```markdown
## QA Report

**Target**: {URL or command}
**Mode**: {browser/API/CLI}
**Design doc**: {path or "none"}

### Flows Tested
1. {Flow name} -- PASS / FAIL ({severity})
2. {Flow name} -- PASS / FAIL ({severity})

### Bugs Found
#### CRITICAL
- {Description + evidence}

#### MAJOR
- {Description + evidence}

#### MINOR
- {Description + evidence}

### Summary
{N flows tested, N passed, N failed}
{N CRITICAL, N MAJOR, N MINOR bugs}
```

## Rules

- Skip this section entirely if the project is a library with no UI/API/CLI.
- Test real behavior, not implementation details.
- Capture evidence (screenshots, response bodies) for every bug.

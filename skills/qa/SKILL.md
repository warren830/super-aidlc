---
name: super-aidlc:qa
description: Run QA testing against a live app (browser, API, or CLI). Tests user flows, captures screenshots, reports bugs by severity.
argument-hint: "[URL or command to test, e.g. http://localhost:3000]"
model: opus
---

# QA Testing

Test target: $ARGUMENTS

Read and execute `agents/qa.md`.

## QA Modes

| Mode | When | How |
|------|------|-----|
| **Browser** | Web apps | Playwright: navigate, interact, screenshot, assert |
| **API** | REST/GraphQL APIs | curl + schema validation |
| **CLI** | Command-line tools | Shell commands + output assertions |

Auto-detected from the test target. Override with `--mode=browser|api|cli`.

## What Happens

1. Read the design doc (if exists) to understand expected behavior
2. Test each user flow: screenshot before/after, verify state
3. Classify bugs: CRITICAL (data loss/security) → MAJOR (feature broken) → MINOR (cosmetic)
4. Output QA report with evidence

## Usage

```
/super-aidlc:qa http://localhost:3000      → browser QA
/super-aidlc:qa curl http://localhost:8080  → API QA
/super-aidlc:qa ./my-cli --help            → CLI QA
```

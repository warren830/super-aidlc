# Phase: Operations

> When you read this file, output: `[OPERATIONS PHASE]`

This phase handles QA, shipping, and documentation updates. It runs after construction completes.

## Section 1: Browser QA (optional, for UI projects)

### Prerequisites

- Playwright installed (`npx playwright install`)
- Application running at an accessible URL
- Design doc available with user flows and expected behaviors

If Playwright is not available or the project has no UI, skip this section entirely. Note the skip in the build log and proceed to Section 2.

For complex QA scenarios, dispatch a dedicated QA agent using `agents/qa.md`.

### Workflow

1. Read the requirements and design doc. Extract every user flow that involves UI interaction.
2. For each user flow:
   a. Navigate to the starting page.
   b. Take a **before** screenshot.
   c. Execute the interaction sequence (clicks, form fills, navigation).
   d. Verify the expected state (page content, URL, element visibility, data changes).
   e. Take an **after** screenshot.
   f. Record: PASS or FAIL with evidence.

3. Compile results into a QA report:

```
## QA Report

Flows tested: {count}
Passed: {count}
Failed: {count}

### Results

| Flow | Steps | Result | Evidence |
|------|-------|--------|----------|
| {flow name} | {step summary} | PASS/FAIL | {screenshot paths} |
```

### Bug Triage

For each failure, classify severity:

| Severity | Definition | Action |
|----------|-----------|--------|
| CRITICAL | Blocks core usage, data loss, security hole | Must fix before ship |
| MAJOR | Feature broken but workaround exists | Must fix before ship |
| MINOR | Cosmetic, non-blocking, edge case | Log for later, does not block ship |

For each bug, record:
- Severity
- Steps to reproduce (exact sequence)
- Expected behavior
- Actual behavior
- Screenshot evidence (before/after)

### Fix Loop

For CRITICAL and MAJOR bugs, if authorized to fix:

1. Write a failing test that reproduces the bug (TDD -- test first, always).
2. Run the test, confirm it fails for the right reason.
3. Fix the root cause in code.
4. Run the test, confirm it passes.
5. Re-verify in the browser -- navigate the same flow, take screenshots.
6. Run the full test suite to check for regressions.
7. Commit with the regression test included.

Repeat for each CRITICAL/MAJOR bug. After all fixes, re-run the full QA workflow to confirm no new issues.

## Section 2: Ship Workflow

Triggered when the user says "ship" or after QA passes with no CRITICAL/MAJOR bugs remaining.

### Verification Gate

Before any ship action, load `guards/verification.md` and follow its protocol. No ship claims without evidence.

### Steps

1. **Run full test suite.** All tests must pass. If any fail, STOP -- fix before shipping.

2. **Run linter.** Zero errors required. Warnings should be reviewed -- fix or justify each one.

3. **Create commits.** Write meaningful commit messages:
   - One commit per unit of work, or one combined commit if units are tightly coupled.
   - Message format: `{type}: {summary}` (e.g., `feat: add user authentication flow`).
   - Include test files in the same commit as the code they test.

4. **Push branch.** Push to the remote branch. If no branch exists, create one:
   - Branch name: `feat/{feature-slug}` or `fix/{bug-slug}`.

5. **Create PR.** The PR body must include:

```markdown
## Summary
{1-2 paragraph summary from the design doc}

## What Changed
{List of components/units built, one line each}

## Test Results
- Tests: {count} passing, {count} new
- Coverage: {percent} (if available)
- Lint: clean

## QA Results
{If browser QA ran:}
- Flows tested: {count}
- Bugs found: {count by severity}
- All CRITICAL/MAJOR bugs fixed: YES/NO

{If browser QA did not run:}
- Browser QA: skipped (no UI / Playwright not available)

## Design Doc
See: aidlc-docs/{date}-{feature-slug}/design.md
```

## Section 3: Documentation Update

After the PR is created (or after commits if not using PRs):

### README Update

If the change introduced or modified public API (new endpoints, CLI commands, library functions, configuration options):
- Update README.md with the new/changed API surface.
- Include usage examples for new features.
- Remove documentation for removed features.

If no public API changed, skip this step.

### CHANGELOG Update

Append to CHANGELOG.md (create if it does not exist):

```markdown
## [{version or date}]

### Added
- {new features, one line each}

### Changed
- {modifications to existing features}

### Fixed
- {bugs fixed, with reference to bug description}
```

### Build Log Update

Append to `aidlc-docs/{date}-{feature-slug}/build-log.md`:

```markdown
## Operations Phase

### QA Results
- Browser QA: {ran / skipped}
- Flows tested: {count}
- Bugs found: {count by severity}
- Bugs fixed: {count}

### Ship Results
- Tests: {count} passing
- Lint: {clean / N warnings}
- Branch: {branch name}
- PR: {PR URL or "no PR"}
- Commits: {count}

### Documentation Updated
- README: {yes / no}
- CHANGELOG: {yes / no}
```

This log is the record of what happened. Future sessions read it for context.

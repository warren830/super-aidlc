---
name: super-aidlc:qa
description: Run QA testing against a live app with real browser automation, API validation, or CLI testing. Captures screenshots, finds bugs, classifies by severity.
argument-hint: "[URL or command to test, e.g. http://localhost:3000]"
model: opus
---

# QA Testing

Test target: $ARGUMENTS

## Browser Tool Setup

Before any browser testing, detect the available tool:

```bash
# Check for super-aidlc-browse (built-in, uses Playwright)
B=""
_PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(git rev-parse --show-toplevel 2>/dev/null)/.claude/skills/super-aidlc}"
[ -f "$_PLUGIN_ROOT/bin/super-aidlc-browse" ] && B="bun $_PLUGIN_ROOT/bin/super-aidlc-browse"

# Fallback: check if globally installed
[ -z "$B" ] && which super-aidlc-browse >/dev/null 2>&1 && B="super-aidlc-browse"

# Fallback: gstack browse (if installed)
[ -z "$B" ] && [ -x "$HOME/.claude/skills/gstack/browse/dist/browse" ] && B="$HOME/.claude/skills/gstack/browse/dist/browse"

if [ -n "$B" ]; then
  echo "BROWSER: $B"
else
  echo "BROWSER: none (run: npx playwright install chromium)"
fi
```

If no browser tool is available, browser mode falls back to curl + HTML parsing (limited).

First-time setup (one-time, ~30s):
```bash
npx playwright install chromium
```

## QA Modes

| Mode | Auto-detect | How |
|------|------------|-----|
| **Browser** | URL starts with http/https | Real Chromium via gstack browse: navigate, interact, screenshot, assert |
| **API** | URL contains /api/ or user specifies `--mode=api` | curl + response validation + schema checks |
| **CLI** | Input is a command (not URL) or `--mode=cli` | Shell execution + output assertions |

## Browser Mode (Real Chromium)

### Setup
```bash
$B goto {target URL}
$B snapshot -i          # see all interactive elements with @refs
```

### Testing Workflow

For each user flow from the design doc (or inferred from the page):

```bash
# 1. Baseline screenshot
$B screenshot /tmp/qa-{flow}-before.png

# 2. Interact using @refs from snapshot
$B snapshot -i                    # get element refs
$B fill @e3 "test@example.com"   # fill input
$B fill @e4 "password123"        # fill input
$B click @e5                     # click button

# 3. Verify outcome
$B snapshot -D                   # diff: what changed?
$B is visible ".success-message" # assert element exists
$B console --errors              # any JS errors?
$B network                       # any failed requests?

# 4. Evidence screenshot
$B screenshot /tmp/qa-{flow}-after.png
```

### Always show screenshots to the user
After every `$B screenshot`, use the Read tool on the PNG so the user can see it.

### Common Test Patterns

**Form validation:**
```bash
$B snapshot -i
$B click @e10                     # submit empty
$B snapshot -D                    # errors should appear
$B is visible ".error-message"
# Fill and resubmit
$B fill @e3 "valid input"
$B click @e10
$B snapshot -D                    # errors should disappear
```

**Navigation flow:**
```bash
$B goto {url}/page-a
$B snapshot -i
$B click @e5                      # nav link
$B url                            # verify URL changed
$B is visible ".page-b-content"   # verify page loaded
$B screenshot /tmp/qa-nav.png
```

**Responsive check:**
```bash
$B responsive /tmp/qa-responsive  # 3 screenshots: mobile, tablet, desktop
# Read each PNG to show the user
```

**Auth flow:**
```bash
$B goto {url}/login
$B snapshot -i
$B fill @e3 "user@test.com"
$B fill @e4 "password"
$B click @e5
$B snapshot -D
$B is visible ".dashboard"        # should redirect to dashboard
$B cookies                        # verify session cookie set
```

**Console + Network check (after every critical flow):**
```bash
$B console --errors               # JS errors?
$B network                        # failed HTTP requests?
```

## API Mode

For each endpoint in the design doc:

```bash
# Happy path
curl -s -w "\n%{http_code}" {url}/api/endpoint | tail -1  # check status
curl -s {url}/api/endpoint | head -50                       # check body

# Error cases
curl -s -w "\n%{http_code}" {url}/api/endpoint -d '{invalid}'  # should reject
curl -s -w "\n%{http_code}" {url}/api/protected                 # without auth

# Schema validation (if design doc specifies response shape)
# Compare actual response fields against expected
```

## CLI Mode

```bash
# Help works
{command} --help

# Happy path
{command} {valid args}
echo $?  # should be 0

# Error cases
{command} {invalid args}
echo $?  # should be non-zero

# Edge cases
{command} ""                  # empty input
{command} "$(printf 'A%.0s' {1..10000})"  # large input
```

## Process

### 1. Read Design Doc

Check `aidlc-docs/` for the most recent design doc. Extract:
- User flows to test (from requirements or architecture section)
- Expected behavior per flow
- Error cases from Error/Rescue Map
- API endpoints and expected responses

If no design doc exists, infer flows from the page structure (use `$B snapshot -i`).

### 2. Test Each Flow

For each flow, follow the mode-specific workflow above. After each:
- Capture evidence (screenshot, response, output)
- Check for JS errors (`$B console --errors`)
- Check for failed requests (`$B network`)
- Assert expected state

### 3. Classify Bugs

| Severity | Meaning | Auto-detect |
|----------|---------|------------|
| **CRITICAL** | Data loss, security breach, core feature broken | JS uncaught errors, 500s, auth bypass, blank page |
| **MAJOR** | Feature broken, significant UX issue | Form doesn't submit, wrong data, broken nav, 4xx on valid input |
| **MINOR** | Cosmetic, minor inconvenience | Alignment off, missing hover state, console warnings |

### 4. Output QA Report

```markdown
## QA Report

**Target**: {URL or command}
**Mode**: {browser / API / CLI}
**Browser tool**: {gstack browse / curl fallback / N/A}
**Design doc**: {path or "none"}
**Flows tested**: {N}
**Bugs found**: {N CRITICAL, N MAJOR, N MINOR}

### Flows Tested

| # | Flow | Result | Evidence |
|---|------|--------|----------|
| 1 | {Login flow} | PASS | screenshot: /tmp/qa-login-after.png |
| 2 | {Form submit} | FAIL (MAJOR) | form doesn't submit, screenshot: /tmp/qa-form-error.png |

### Bugs

#### CRITICAL
- **{Title}**: {Description}. Evidence: {screenshot/console/network}. Reproduce: {steps}.

#### MAJOR
- **{Title}**: {Description}. Evidence: {screenshot}. Reproduce: {steps}.

#### MINOR
- **{Title}**: {Description}.

### Console Errors
{Any JS errors captured during testing, or "None"}

### Failed Network Requests
{Any 4xx/5xx requests, or "None"}

### Health Score
{0-100 based on: flows passed / total flows, weighted by severity of failures}
```

### 5. Fix and Re-test (optional)

If user says "fix these", for each bug starting from CRITICAL:
1. Read the source code at the likely location
2. Fix the root cause (not a band-aid)
3. Re-run the specific flow to verify the fix
4. Capture before/after evidence
5. Commit the fix atomically: `git commit -m "fix(qa): {bug title}"`

## Rules

- Skip entirely if the project is a library with no UI/API/CLI.
- Always show screenshots to the user (Read the PNG after capturing).
- Test real behavior, not implementation details.
- Capture evidence for EVERY bug (screenshot + console + network).
- If browser tool is not available, say so clearly -- don't pretend to have browser access.

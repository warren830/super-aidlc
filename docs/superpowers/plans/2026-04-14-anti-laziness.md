# Three-Layer Anti-Laziness System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent AI agents from cutting corners across dispatch, build, and review stages by adding acceptance criteria tracking, test depth enforcement, and evidence-based review.

**Architecture:** Four markdown files modified in-place. Layer 1 (inception.md) generates per-unit acceptance criteria; Layer 2 (builder.md) enforces builders track those criteria; Layer 3 (spec-reviewer.md + quality-reviewer.md) enforces reviewers verify with evidence. No new files created.

**Tech Stack:** Markdown prompt files only. Validation via `bun run src/cli.ts validate` and `bun test`.

**Constraint:** `agents/builder.md` is at 266/270 lines. Must condense existing Input Safety multi-language examples to free ~20 lines before adding new content.

---

### Task 1: Expand Units of Work template in inception.md

**Files:**
- Modify: `phases/inception.md:326-336` (Units of Work section)
- Modify: `phases/inception.md:359` (MANDATORY outputs list, item 4)

- [ ] **Step 1: Add per-unit specification template**

After the existing Units of Work table and its description line ("Mark which units can run in parallel..."), insert the per-unit spec template:

```markdown
### Per-Unit Specifications

For each unit in the table above, add a detail section:

#### {Unit Name}

**Acceptance Criteria:**
1. GIVEN {precondition} WHEN {action} THEN {expected result}
2. ...

At least 3 criteria per unit. Each must be specific and testable. Use GIVEN/WHEN/THEN format -- vague descriptions like "handle auth" are not acceptable.

**Required Test Scenarios:**
- Happy path: {specific scenario}
- Error: {specific error scenario, reference Error/Rescue Map rows owned by this unit}
- Edge: {boundary value, invalid input, or concurrent access scenario}
- Integration: {cross-unit interaction, if applicable -- reference Interface Contracts}

**Done means:**
- All acceptance criteria have individual passing tests
- Error/Rescue Map rows owned by this unit are implemented
- Interface Contracts provided by this unit match signatures exactly
```

- [ ] **Step 2: Update MANDATORY outputs list**

Change item 4 from:

```markdown
4. Units of Work table with parallelism markings
```

to:

```markdown
4. Units of Work table with parallelism markings AND per-unit specifications (Acceptance Criteria, Required Test Scenarios, Done means)
```

- [ ] **Step 3: Validate**

Run: `bun run src/cli.ts validate`
Expected: All checks passed.

- [ ] **Step 4: Commit**

```bash
git add phases/inception.md
git commit -m "inception: add per-unit acceptance criteria to design doc template" --no-verify
```

---

### Task 2: Add anti-laziness mechanisms to builder.md

**Files:**
- Modify: `agents/builder.md` (multiple sections)

**CRITICAL:** builder.md is at 266/270 lines. Steps 1-2 free up lines; Steps 3-6 add new content. Do Steps 1-2 FIRST to stay under the limit.

- [ ] **Step 1: Condense shell command safety examples**

Replace the 5-language shell command examples (TypeScript, Python, Go, Java, Rust) with 2-language examples plus a note.

Replace:

```markdown
1. **Never pass user input directly to shell commands.** Use array form:

   ```typescript
   // TypeScript -- BAD: execSync(`git clone ${userUrl}`)
   // TypeScript -- GOOD: execFileSync('git', ['clone', userUrl])
   ```
   ```python
   # Python -- BAD: os.system(f"git clone {user_url}")
   # Python -- GOOD: subprocess.run(['git', 'clone', user_url], check=True)
   ```
   ```go
   // Go -- BAD: exec.Command("sh", "-c", "git clone " + userURL)
   // Go -- GOOD: exec.Command("git", "clone", userURL)
   ```
   ```java
   // Java -- BAD: Runtime.getRuntime().exec("git clone " + userUrl)
   // Java -- GOOD: new ProcessBuilder("git", "clone", userUrl).start()
   ```
   ```rust
   // Rust -- BAD: Command::new("sh").arg("-c").arg(format!("git clone {}", user_url))
   // Rust -- GOOD: Command::new("git").args(["clone", &user_url])
   ```
```

With:

```markdown
1. **Never pass user input directly to shell commands.** Use array form:

   ```typescript
   // BAD: execSync(`git clone ${userUrl}`)
   // GOOD: execFileSync('git', ['clone', userUrl])
   ```
   ```python
   # BAD: os.system(f"git clone {user_url}")
   # GOOD: subprocess.run(['git', 'clone', user_url], check=True)
   ```
   Go/Java/Rust: same pattern -- use array args (exec.Command, ProcessBuilder, Command::new().args()), never string interpolation.
```

- [ ] **Step 2: Condense path validation examples**

Replace the 3-language path validation examples (TypeScript, Python, Go) with 1 example plus a note.

Replace:

```markdown
2. **Validate all filesystem paths** against a base directory:

   ```typescript
   // TypeScript
   const target = path.resolve(baseDir, userPath)
   if (!target.startsWith(baseDir)) throw new Error('Path traversal')
   ```
   ```python
   # Python
   target = os.path.realpath(os.path.join(base_dir, user_path))
   if not target.startswith(os.path.realpath(base_dir)):
       raise ValueError("Path traversal")
   ```
   ```go
   // Go
   target := filepath.Join(baseDir, userPath)
   if !strings.HasPrefix(filepath.Clean(target), filepath.Clean(baseDir)) {
       return fmt.Errorf("path traversal")
   }
   ```
```

With:

```markdown
2. **Validate all filesystem paths** against a base directory:

   ```typescript
   const target = path.resolve(baseDir, userPath)
   if (!target.startsWith(baseDir)) throw new Error('Path traversal')
   ```
   Same pattern in other languages: resolve the joined path, verify it starts with the base directory.
```

- [ ] **Step 3: Add Test Depth Requirements section**

After the Rules section (after "Tests are not optional. Every public function gets at least one test.") and before "## Code Structure Rules", insert:

```markdown

## Test Depth Requirements

Your tests must cover ALL scenario categories from the design doc's Required Test Scenarios:
- Happy path: at least 1 test
- Error cases: at least 1 test per error scenario listed
- Edge cases: at least 1 test per edge case listed

If the design doc lists 3 error cases and 2 edge cases, you need at least 6 tests (1 + 3 + 2).
```

- [ ] **Step 4: Add anti-skeleton scan to Self-Check**

After existing step 3 ("Quick correctness scan") in the Self-Check section, add step 4:

```markdown

4. **Anti-skeleton scan:**
   - Check every new function/method body.
   - If body is only return/throw/pass/TODO, or fewer than 3 lines of real logic → flag as suspicious.
   - Genuinely simple (getter/setter/delegator) → note why in report.
   - Unsure → write the full implementation. Over-deliver, never under-deliver.
```

- [ ] **Step 5: Update Self-Check in Output report template**

In the Output section's markdown template, replace:

```markdown
### Self-Check
- Contract compliance: {matches / deviation at {location}}
- Open items: {TODOs, FIXMEs, or "None"}
- Concerns: {specific concern, or "None"}
```

With:

```markdown
### Self-Check
- Contract compliance: {matches / deviation at {location}}
- Acceptance criteria: {N/N covered} (if < 100%, list missing items)
- Test depth: {happy: N, error: N, edge: N} vs required {happy: N, error: N, edge: N}
- Skeleton scan: {N functions checked, N flagged → resolved/justified}
- Open items: {TODOs, FIXMEs, or "None"}
```

- [ ] **Step 6: Replace TDD Compliance with Acceptance Criteria Coverage in Output**

In the Output section's markdown template, replace:

```markdown
### TDD Compliance
For each behavior implemented:
1. {behavior}: RED (test failed as expected) -> GREEN (minimal code passed) -> REFACTOR
2. {behavior}: RED -> GREEN -> REFACTOR
...
```

With:

```markdown
### Acceptance Criteria Coverage
| # | Acceptance Criteria | Test File:Line | Status |
|---|-------------------|----------------|--------|
| AC1 | {GIVEN ... WHEN ... THEN ...} | {test.ts:line} | RED → GREEN |
| AC2 | {GIVEN ... WHEN ... THEN ...} | {test.ts:line} | RED → GREEN |

Every AC from the design doc MUST have a row. Missing row = not DONE.
```

- [ ] **Step 7: Validate line count**

Run: `bun run src/cli.ts validate`
Expected: All checks passed. builder.md must be ≤ 270 lines.

If over 270: further condense the buffer bounding section (lines 178-186) by removing the bullet sub-items.

- [ ] **Step 8: Commit**

```bash
git add agents/builder.md
git commit -m "builder: add AC tracking, test depth requirements, anti-skeleton scan" --no-verify
```

---

### Task 3: Add AC verification and rubber-stamp detection to spec-reviewer.md

**Files:**
- Modify: `agents/spec-reviewer.md:55-71` (Output Format)
- Modify: `agents/spec-reviewer.md` (append Rubber-stamp Detection)

- [ ] **Step 1: Add Acceptance Criteria Verification table to Output Format**

In the Output Format template, after `**Verdict: PASS / FAIL**` and before `### Missing Requirements`, insert:

```markdown

### Acceptance Criteria Verification
| # | Criteria | Verified At | Evidence | Status |
|---|---------|------------|----------|--------|
| AC1 | {from design doc} | {impl file:line, test file:line} | {specific code logic} | PASS / MISSING / WRONG |

Rules:
- One row per AC from the design doc. N criteria = N rows.
- Every row MUST have Verified At (file:line) and Evidence (describe the actual code logic, not just "implemented").
- Any MISSING or WRONG row = overall verdict FAIL.
```

- [ ] **Step 2: Add Rubber-stamp Detection section**

After the Rules section (end of file), append:

```markdown

## Rubber-stamp Detection

If your verdict is PASS with zero findings (no Missing, no Extra, no Misunderstood), you MUST add a Confidence Check:

```markdown
### Confidence Check
- Lines changed: {N lines added/modified}
- Files I actually read: {each file and line ranges}
- Most complex logic at: {file:line — why it is correct}
- Most likely place for a bug: {file:line — why}
```

If you cannot fill in "most complex logic" and "most likely bug location", you did not read the code carefully. Go back and re-read.
```

- [ ] **Step 3: Validate**

Run: `bun run src/cli.ts validate`
Expected: All checks passed. spec-reviewer.md must be ≤ 270 lines.

- [ ] **Step 4: Commit**

```bash
git add agents/spec-reviewer.md
git commit -m "spec-reviewer: add AC verification table and rubber-stamp detection" --no-verify
```

---

### Task 4: Add evidence requirements and rubber-stamp detection to quality-reviewer.md

**Files:**
- Modify: `agents/quality-reviewer.md:18` (after Pass 1 header)
- Modify: `agents/quality-reviewer.md` (append Rubber-stamp Detection)

- [ ] **Step 1: Add evidence requirement instruction to Pass 1**

After the line `## Pass 1: CRITICAL (any of these = FAIL, blocks merge)` and before `### Security`, insert:

```markdown

**Evidence requirement:** For checked items in these categories, you MUST cite file:line and describe the specific code you verified. An empty `[x]` without evidence is not a valid check:
- Security: SQL injection, hardcoded secrets, input validation
- Input Safety: shell injection, path traversal
- Correctness: error cases implemented, tests test right behavior

Example: `- [x] No SQL injection — db.ts:15 uses parameterized query db.query($1, [userId])`
```

- [ ] **Step 2: Add Rubber-stamp Detection section**

After the Rules section (end of file), append:

```markdown

## Rubber-stamp Detection

If your verdict is PASS with zero findings (Pass 1 all clear, Pass 2 no notes), you MUST add a Confidence Check:

```markdown
### Confidence Check
- Lines changed: {N lines added/modified}
- Files I actually read: {each file and line ranges}
- Most complex logic at: {file:line — why it is correct}
- Most likely place for a bug: {file:line — why}
```

If you cannot fill in "most complex logic" and "most likely bug location", you did not read the code carefully. Go back and re-read.
```

- [ ] **Step 3: Validate**

Run: `bun run src/cli.ts validate`
Expected: All checks passed. quality-reviewer.md must be ≤ 270 lines.

- [ ] **Step 4: Commit**

```bash
git add agents/quality-reviewer.md
git commit -m "quality-reviewer: add evidence requirements and rubber-stamp detection" --no-verify
```

---

### Task 5: Full validation and integration test

**Files:**
- All four modified files

- [ ] **Step 1: Run full validator**

Run: `bun run src/cli.ts validate`
Expected: All checks passed with 0 issues.

- [ ] **Step 2: Run test suite**

Run: `bun test`
Expected: All tests pass.

- [ ] **Step 3: Verify line counts**

Run: `wc -l agents/builder.md agents/spec-reviewer.md agents/quality-reviewer.md`
Expected: builder.md ≤ 270, spec-reviewer.md ≤ 270, quality-reviewer.md ≤ 270.

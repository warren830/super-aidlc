---
name: super-aidlc:ship
description: Run the operations phase - verification, commit, push, and PR creation. Use after building when you're ready to ship.
argument-hint: "[optional: branch name or PR title]"
model: opus
---

# Ship

Read and execute `phases/operations.md`.

## What Happens

1. **Verification Gate** → all tests pass, build passes, lint passes
2. **Commit** → meaningful commit message(s), one per logical unit
3. **Push** → push branch to remote
4. **PR** → create PR with summary, test results, design doc link

## Pre-Ship Checklist (auto-verified)

- [ ] All tests pass
- [ ] Build passes
- [ ] Lint passes
- [ ] No uncommitted changes outside the feature scope
- [ ] Design doc exists (Medium/Heavy tasks)

## Usage

```
/super-aidlc:ship                    → ship current changes
/super-aidlc:ship feat/my-feature    → ship to specific branch
```

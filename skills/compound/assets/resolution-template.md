# Resolution Template

## Bug Track Template

```markdown
---
title: "{title}"
date: {YYYY-MM-DD}
problem_type: {problem_type}
category: {category}
module: {module}
component: {component}
severity: {severity}
resolution_type: {resolution_type}
tags: [{tags}]
related_docs: [{related_docs}]
status: active
---

# {title}

## Problem

{1-2 sentence description of the issue}

## Symptoms

{Observable symptoms -- error messages, unexpected behavior, failing tests}

## What Didn't Work

{Failed investigation attempts and why they failed. This section is critical -- it saves future developers from going down the same dead ends.}

1. **{Attempt 1}**: {What was tried and why it didn't work}
2. **{Attempt 2}**: {What was tried and why it didn't work}

## Solution

{The actual fix with code examples}

**Before:**
```{lang}
{code before the fix}
```

**After:**
```{lang}
{code after the fix}
```

## Why This Works

{Root cause explanation and why the solution addresses it}

## Prevention

{Strategies to avoid recurrence. Include concrete examples:}

- {Lint rule, test case, or code pattern that prevents recurrence}
- {Configuration or tooling change}

## Related

- {Links to related docs, issues, or PRs}
```

## Knowledge Track Template

```markdown
---
title: "{title}"
date: {YYYY-MM-DD}
problem_type: {problem_type}
category: {category}
module: {module}
component: {component}
tags: [{tags}]
applies_when: "{when this guidance applies}"
related_docs: [{related_docs}]
status: active
---

# {title}

## Context

{What situation, gap, or friction prompted this guidance}

## Guidance

{The practice, pattern, or recommendation}

```{lang}
{Code example showing the recommended approach}
```

## Why This Matters

{Rationale and impact of following or not following this guidance}

## When to Apply

{Conditions or situations where this applies. Be specific.}

## Examples

**Before (anti-pattern):**
```{lang}
{code showing the problem}
```

**After (recommended):**
```{lang}
{code showing the solution}
```

## Related

- {Links to related docs, patterns, or prior build logs}
```

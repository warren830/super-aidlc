# Contributing to Super-AIDLC

## How to Contribute

### Reporting Issues

Open a GitHub issue with:
- **What happened**: concrete description, not "it doesn't work"
- **What you expected**: the behavior you wanted
- **Steps to reproduce**: task description, complexity level, which phase failed
- **Environment**: Claude Code / Kiro version, model used

### Proposing Changes

1. Open an issue first to discuss the change
2. Fork the repo and create a feature branch
3. Make your changes following the guidelines below
4. Submit a PR with a clear description

## File Format Guidelines

### Skill Files (agents/, phases/, guards/, rules/, extensions/, skills/)

All skill files are Markdown with a specific structure:

```markdown
# Title

> Brief description (shown when file is loaded)

## Section

Content...

## Rules

- Rule 1
- Rule 2
```

**Key constraints:**
- Max 150 lines per file (context budget -- see `rules/context-budget.md`)
- Front-load the most important content (agents attend more to early text)
- Use tables for structured information (easier to parse than prose)
- Include concrete examples, not just abstract rules
- Use imperative voice ("Do X", not "You should consider doing X")

### Agent Files (agents/*.md)

Every agent file must have:
1. **Input section**: what the agent receives
2. **Process section**: step-by-step what it does
3. **Output section**: exact format of what it produces
4. **Rules section**: constraints and guidelines

### Phase Files (phases/*.md)

Phase files define the execution flow. They:
- Start with a phase announcement: `> When you read this file, output: [PHASE NAME]`
- Use numbered steps
- Include decision points (what happens on PASS vs FAIL)
- Reference other files by relative path

### Skills (skills/*.md, skills/*/SKILL.md)

Skills are standalone commands that can be invoked independently:
- `skills/compound/SKILL.md` -- knowledge extraction (`/compound`)
- `skills/compound-refresh.md` -- knowledge base maintenance (`/compound-refresh`)

Skills follow the same format as agent files (Input/Process/Output/Rules) but are user-invocable.

## Testing Changes

There is no automated test suite for skill files (they are instructions, not code). To validate changes:

1. **Dry run**: Run `/super-aidlc --dry-run {task}` to verify routing logic
2. **Light task**: Test with a simple bug fix to verify minimal path
3. **Medium task**: Test with a new feature to verify design + build flow
4. **Compound test**: Run `/compound` after a session and verify `aidlc-docs/solutions/` output
5. **Compare output**: Check that design docs and build logs match the expected format

## What Makes a Good Contribution

- **Fixes a real problem**: ideally backed by a benchmark, user report, or reproducible issue
- **Does not increase context consumption**: see `rules/context-budget.md`
- **Follows the Iron Laws**: does not weaken TDD, verification, or security requirements
- **Includes rationale**: explain WHY, not just WHAT
- **Updates both languages**: if changing README.md, update README_CN.md too

## What We Will Not Accept

- Changes that weaken security baseline defaults
- Removing TDD requirements or making them optional
- Adding "skip" options without explicit user permission gates
- Files over 200 lines without strong justification
- Marketing language or self-promotional content in skill files

## Architecture Decisions

If your change affects the overall architecture (new phases, new agent types, changing the review protocol), open a discussion issue first. These changes need broader input before implementation.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

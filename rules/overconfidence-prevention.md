# Overconfidence Prevention

AI agents routinely skip steps, rationalize shortcuts, and claim completion without verification. This file exists because the problem is mechanical, not motivational -- agents optimize for speed and will skip any step that is not explicitly guarded.

## The Core Problem

Benchmarks across Superpowers, AIDLC-workflows, and gstack all show the same failure mode: **agents skip steps they consider "unnecessary" and rationalize the skip.** This is not a bug in any one tool -- it is a fundamental property of how LLMs respond to long instruction sets.

## Step-Skip Detection

If the agent is about to skip ANY of these, it is overconfident. Every skip requires explicit user permission.

### Design Phase Skips

| Skip Attempt | Why It Feels Right | Why It Is Wrong |
|-------------|-------------------|-----------------|
| "Requirements are clear, skipping questions" | Task seems obvious | Your interpretation may differ from user's |
| "Simple enough, skipping design doc" | Medium task looks easy | Without a doc, reviewers have nothing to review against |
| "Reusing prior design, skipping review" | Similar to past work | Context changed. Review catches drift. |
| "User is experienced, skipping confirmation" | User seems technical | Even experts want to validate assumptions |

### Build Phase Skips

| Skip Attempt | Why It Feels Right | Why It Is Wrong |
|-------------|-------------------|-----------------|
| "Too simple to test" | 3-line function | Simple code breaks. 30-second test prevents 30-minute debug. |
| "Writing tests after for efficiency" | Faster to code first | Tests-after confirm implementation, not requirements. |
| "Skipping review, code is straightforward" | Clean code | Review catches what you cannot see in your own work. |
| "Skipping lint, no style issues" | Code looks clean | Linters catch more than style. Run it. |

### Verification Skips

| Skip Attempt | Why It Feels Right | Why It Is Wrong |
|-------------|-------------------|-----------------|
| "Tests passed earlier, should still pass" | Nothing changed | You do not know what changed. Run them. |
| "Build succeeded before this change" | Small change | Small changes break builds. Verify. |
| "Already verified manually" | Checked the output | Manual checks miss what automated checks catch. |

## The Keyword Trap

AIDLC-workflows discovered that excessive use of MANDATORY, CRITICAL, MUST in rule files paradoxically causes agents to skip MORE steps -- keyword fatigue makes agents treat ALL instructions as boilerplate.

**Rules for this project's instruction language:**
1. Use MANDATORY/MUST only for Iron Laws (the 5 non-negotiable rules).
2. For everything else, explain WHY the step matters. Agents follow instructions better when they understand the reason.
3. Keep instruction files under 150 lines. Beyond that, agents start skimming.
4. Front-load the most important instructions. Agents attend more to early content.

## Self-Check Protocol

Before completing ANY phase (inception, construction, operations), the agent MUST run this checklist:

### End of Inception
- [ ] Questions were asked and answered (not assumed)
- [ ] Design doc was written to `aidlc-docs/` (not just discussed)
- [ ] Architecture diagram exists (not "will add later")
- [ ] Error/Rescue Map has 5+ rows (not skipped)
- [ ] User approved the design (not auto-approved)

### End of Construction
- [ ] Every unit has tests that were written BEFORE code
- [ ] Tests were watched fail (RED verified)
- [ ] Both spec and quality reviews ran (not skipped)
- [ ] Full test suite passes NOW (not "passed earlier")
- [ ] Lint passes NOW (not "should be clean")

### End of Operations
- [ ] Test suite ran with exit code 0 (evidence, not claim)
- [ ] Lint ran with 0 errors (evidence, not claim)
- [ ] Build compiled successfully (evidence, not claim)
- [ ] Commit message is meaningful (not "update code")

## When Agents Disagree With Instructions

If you believe a step should be skipped:

1. **State which step** you want to skip
2. **State why** (the specific reason, not "it's simple")
3. **Ask the user** for permission to skip
4. **If no response**: do NOT skip. Follow the instructions.

The user decides what to skip, not the agent. This is non-negotiable.

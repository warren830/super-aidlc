# Phase: Inception

> When you read this file, output: `[INCEPTION PHASE]`

Do NOT write any code in this phase. This phase produces documents, not code.

## Step -1: Problem Validation (Heavy only)

Before any design work, validate that the problem is worth solving. AIDLC-workflows' community found that jumping straight to requirements without validating the problem leads to well-engineered solutions to the wrong problems (issue #132).

Ask these three forcing questions:

```
Before we design anything, three quick checks:

1. WHO is blocked by this problem today?
   {Specific person/team/user, not "everyone"}

2. WHAT are they doing instead right now?
   {The current workaround -- if none exists, the problem may not be real}

3. WHY now?
   {What changed that makes this worth building today vs. next quarter?}
```

Wait for answers. If the user cannot answer #1 and #2, the problem may not be validated enough for a Heavy investment. Suggest starting with a Medium-scoped prototype instead.

If answers are clear, proceed to Step 0.

## Step 0: Problem Reframing (Heavy only)

For Heavy complexity tasks, challenge the problem definition before asking detailed questions. The user's first description is often a solution, not a problem.

Say:

```
Before I ask detailed questions, let me make sure we're solving the right problem.

You asked for: {user's task description}

Is the underlying need actually: {reframed version -- step back one level of abstraction}?

Or is {original description} exactly what you need?
```

Wait for the user to confirm or reframe. This prevents building the wrong thing at scale.

### Medium Complexity: Assumption Statement (lightweight alternative)

For Medium tasks, skip the full reframing dialogue. Instead, state your assumptions upfront so the user can correct misunderstandings without a round-trip:

```
My understanding: {1-sentence summary of what the user wants}
Scope: {what is included} | Out of scope: {what is excluded}
If this is wrong, let me know. Otherwise I'll proceed.
```

Do NOT wait for confirmation -- proceed to Step 1 immediately. The user will interrupt if the assumption is wrong. This saves a round-trip while still surfacing misunderstandings early.

## Step 0.5: Check for Brainstorm Requirements (new in v4)

Before asking questions, check if a brainstorm phase already produced a requirements doc:

1. Scan `aidlc-docs/` for `*requirements.md` files matching the current task.
2. If found and relevant (same topic, created within 30 days):
   - Read it thoroughly
   - Announce: "Found requirements doc from brainstorm phase. Using as primary input."
   - Carry forward: problem frame, scope boundaries, requirements, assumptions, open questions
   - Skip questions already answered in the requirements doc
   - Only ask about gaps
3. If not found, proceed normally.

## Step 1: Parallel Research (brownfield only)

If this is a brownfield project, dispatch research agents in PARALLEL to gather context before asking questions.

**Always dispatch:**
```
Agent(researcher.md, "Component inventory for {task}")
```

**If `aidlc-docs/solutions/` exists, also dispatch:**
```
Agent(learnings-researcher.md, "Prior solutions related to {task}")
```

**For Medium/Heavy tasks, also dispatch:**
```
Agent(git-history-analyzer.md, "Code evolution for {relevant modules}")
```

**For Heavy tasks, also dispatch:**
```
Agent(best-practices-researcher.md, "Best practices for {technology context}")
```

Wait for all parallel agents to return. Merge their findings into a unified research context:
- Researcher: architecture, patterns, constraints
- Learnings Researcher: prior solutions, dead ends to avoid
- Git History Analyzer: hotspots, contributor patterns, recent changes
- Best Practices Researcher: external recommendations

Use the merged context to tailor questions in Step 2. Reference prior solutions and known patterns when asking: "A prior solution in {path} used {approach} -- should we follow that here?"

## Step 2: Ask Questions

### Context-Aware Question Elimination

Before asking ANY question, scan available context to avoid asking what is already known. Superpowers' community found that agents ask "What type of project is this?" even when CLAUDE.md explicitly states it (issue #849).

**Scan these sources in order:**
1. `CLAUDE.md` -- project conventions, tech stack, build commands
2. `README.md` -- project description, architecture overview
3. `package.json` / `pyproject.toml` / `go.mod` / `Cargo.toml` -- tech stack, dependencies
4. `.kiro/specs/` and `.kiro/steering/` -- Kiro specs (see below)
5. `aidlc-docs/patterns.md` -- established conventions from prior runs
6. Recent `git log --oneline -10` -- what is this project actively working on

**For each question you are about to ask:**
- If the answer is already in one of these sources: use it and note "(from CLAUDE.md)" or "(from package.json)". Do NOT re-ask.
- If the answer is partially known: state what you know and ask only about the gap.
- If the answer is not available: ask as normal.

This saves 1-2 round-trips for returning projects and avoids the frustrating "but I already told you" experience.

### Pre-fill from Kiro Specs

Before asking questions, check if `.kiro/specs/` or `.kiro/steering/` already answers them:
- tech.md may specify database, framework, deployment target
- product.md may specify users, scale, priorities
- Existing requirements.md may cover scope and constraints

For each question: if a Kiro file already provides the answer, use it and note:
"(from .kiro/steering/tech.md)" -- do not re-ask the user.

Before designing anything, you MUST ask the user these questions. Group them by topic, provide options with trade-offs and your recommendation, wait for answers.

### Security Baseline (DEFAULT ON)

The security baseline is enabled by default. Read `extensions/security-baseline.md` and incorporate its constraints into the design doc and review criteria.

Display to user:
```
Security baseline: ENABLED (input validation, shell safety, path traversal prevention, auth checks)
To disable: say "skip security baseline"
```

Only skip if the user explicitly requests it. If skipped, note the reason in the design doc's Approvals section.

### For Medium Complexity -- Checklist-Level Questions (3-5 groups)

**Scope and Users**
- Who uses this? (end users, admins, APIs, other services)
- Expected scale? (users, requests/sec, data volume)
- What is explicitly OUT of scope for v1?

**Technical Constraints**
- Must-use technologies? (language, framework, cloud, database)
- Existing systems to integrate with?
- Deployment target? (local, container, serverless, specific cloud)

**Priority**
- Speed to ship vs quality vs flexibility -- which matters most right now?

**NFR Quick Scan** (checklist -- mark what applies)
- [ ] Response time target: ___
- [ ] Expected concurrent users: ___
- [ ] Data retention policy: ___
- [ ] Logging: structured? what format?
- [ ] Needs caching? where?

### For Heavy Complexity -- Detailed Questions (all of Medium, plus these)

**Architecture**
- Monolith or services? Any existing service boundaries?
- Sync or async for inter-service communication?
- Auth strategy? (JWT, session, OAuth, API keys)

**Non-Functional Requirements (detailed)**
- Performance targets? (latency per endpoint, throughput ceiling)
- Availability requirements? (uptime SLA, error budget)
- Compliance? (GDPR, SOC2, HIPAA)
- Observability needs? (logging, metrics, tracing -- which tools?)
- Disaster recovery? (backup frequency, failover strategy, RTO/RPO)

**User Personas and Workflows**
- Who are the 2-3 distinct user personas?
- What are each persona's top 3 workflows?
- What would make them stop using this?
- Any accessibility requirements?

**WAIT for answers before proceeding.**

Record all answers -- they become the requirements section of the design doc.

## Step 3: Create Design Document

For **Heavy** complexity, dispatch an **Architect Agent** (`agents/architect.md`) with:
- The user's answers from Step 2
- The Researcher's component inventory from Step 1 (if brownfield)
- The complexity level
- Whether the security baseline extension is enabled

```
Agent(
  prompt: "<agents/architect.md content>

  --- Input ---
  Complexity: Heavy
  User requirements: <answers from Step 2>
  Existing architecture: <Researcher summary, or 'greenfield' if none>
  Security baseline: <enabled / disabled>

  Produce a complete design doc following the template below.",
  description: "Architecture: {feature name}"
)
```

For **Medium** complexity, create the design doc directly (no separate Architect dispatch needed).

### Design Doc Template

Create `aidlc-docs/{date}-{feature-slug}/design.md` in the session language (see SKILL.md Language Selection). All section headers, descriptions, and explanations follow the session language. Error names, interface signatures, and code snippets remain in English.

Template structure:

```markdown
# Design: {feature name}

## Requirements
{From user's answers -- bullet points}
{For Heavy: include user personas and key workflows}
{If security baseline enabled: note security constraints}

## Architecture

### Components
{List each component, its responsibility, and how it communicates with others}

### Diagram
{ASCII diagram showing components and data flow -- MANDATORY}

Example:
    [Client] --> [API Gateway] --> [Auth Service]
                       |
                 [Business Logic] --> [Database]
                       |
                 [Event Queue] --> [Worker]

### Data Model
{Tables/collections/schemas with fields and relationships}

## NFR Plan

### Medium -- quick scan:
- [ ] Response time target: ___
- [ ] Expected concurrent users: ___
- [ ] Data retention policy: ___
- [ ] Logging: structured? what format?
- [ ] Needs caching? where?

### Heavy -- expand each:

**Performance**
- Budgets per endpoint (e.g., p95 < 200ms for reads, < 500ms for writes)
- Load testing plan
- Bottleneck mitigation (caching, connection pooling, pagination)

**Reliability**
- Error budget and SLA
- Retry strategy (exponential backoff, max retries)
- Circuit-breaker placement (which external calls?)
- Graceful degradation plan

**Security**
- Auth flow (diagram if complex)
- Data encryption (at rest, in transit)
- Input validation rules
- Secrets management approach

**Observability**
- Metrics to track (latency, error rate, throughput, saturation)
- Alerting thresholds
- Log aggregation and structured format
- Distributed tracing (if multi-service)

**Deployment**
- Rollback strategy
- Blue-green or canary approach
- Health check endpoints

## Error/Rescue Map

| What Can Fail | Error Name | Owner Unit | What System Does | What User Sees |
|---------------|-----------|------------|-----------------|----------------|
| DB connection lost | DatabaseUnavailable | U1: Data Layer | Retry 3x with backoff, then fail | "Service temporarily unavailable" |
| Invalid user input | ValidationError | U3: API Routes | Return 400 with field errors | "Please fix: {field} {reason}" |
| Auth token expired | TokenExpired | U2: Auth | Return 401, client refreshes | Auto-redirect to login |
| External API timeout | UpstreamTimeout | U4: Integration | Return cached data or degrade | "Some data may be stale" |
| File upload too large | PayloadTooLarge | U3: API Routes | Reject before processing | "File must be under {limit}" |

At least 5 rows. Every external call, every user input, every async operation gets a row.

Rules:
- No silent failures. Every error has a name, a rescue action, and a user-visible message.
- **Every row has an Owner Unit.** This tells parallel builders exactly which errors are their responsibility. When builders receive the Error/Rescue Map, they only need to implement rows where they are the Owner.
- If an error spans multiple units (e.g., a retry that starts at the API layer and reaches the data layer), assign ownership to the unit that INITIATES the rescue action.

## Interface Contracts

When multiple units will be built in parallel, define the interfaces between them explicitly. This prevents Provider and Consumer from disagreeing on data shapes after merge.

| Provider Unit | Consumer Unit | Interface | Contract (signature + shape) |
|--------------|--------------|-----------|------------------------------|
| {U1} | {U3} | {function/API/event name} | {exact signature and return shape} |

Rules:
- Every cross-unit dependency MUST have a row here.
- Include field names and types, not just "returns User object."
- Both the Provider builder and Consumer builder receive these contracts in their prompts.
- After merge, a contract verification step confirms both sides match (see construction.md Step 3b).

If all units are fully independent (no cross-unit calls), write "None -- all units are independent" and skip this section.

## Units of Work

| Unit | Description | Dependencies | Can Parallel? |
|------|------------|-------------|---------------|
| {name} | {what it does} | {which units must finish first} | {yes/no} |

Mark which units can run in parallel. This drives the build phase.

### Shared Utilities (optional)

If multiple units will need the same helper (e.g., path validation, error formatting, config parsing), list them here. These should be built first (as Unit 0, sequential) before parallel units start, to avoid duplication.

| Utility | Used By | Location |
|---------|---------|----------|
| {e.g., validatePath()} | U1, U3 | {e.g., src/utils/path.ts} |

If no shared utilities are anticipated, skip this section. Post-merge deduplication (construction.md) will catch any that emerge.

## Decisions Log

| Question | Decision | Rationale |
|----------|---------|-----------|
| {from Step 2} | {what was decided} | {why} |

## Alternatives Considered

For each key decision above, record what was rejected:

| Option | Verdict | Reason |
|--------|---------|--------|
| {Option A} | Rejected | {why} |
| {Option B} | **Selected** | {why} |
```

**MANDATORY outputs** -- the design doc MUST include ALL of these:
1. ASCII architecture diagram
2. Error/Rescue Map (5+ rows)
3. Interface Contracts (if units have cross-unit dependencies)
4. Units of Work table with parallelism markings
5. Decisions Log
6. Alternatives Considered (at least for architecture and storage decisions)

If you skip any of these, you are doing plan mode, not super-aidlc.

### Kiro-Specific Output

If a `.kiro/` directory exists in the project, also write Kiro-native specs:

**`.kiro/specs/{feature}/requirements.md`** -- extracted from user answers:
```markdown
## Functional Requirements
- FR1: {requirement from user answers}
- FR2: ...

## Non-Functional Requirements
- NFR1: {from NFR plan}
- NFR2: ...
```

**`.kiro/specs/{feature}/design.md`** -- architecture + error map + NFR plan (subset of the full design doc, formatted for Kiro).

**`.kiro/specs/{feature}/tasks.md`** -- units of work table, one task per unit:
```markdown
## Tasks
- [ ] Task 1: {unit name} -- {description}
- [ ] Task 2: {unit name} -- {description}
```

The full design doc still goes to `aidlc-docs/` as the system of record.

## Step 4: Design Review

After producing the design doc, it MUST be reviewed before presenting to the user.

### Heavy Complexity: Independent Design Review

For Heavy tasks, dispatch an independent **Design Reviewer Agent** (`agents/design-reviewer.md`). This is NOT self-review -- it is a separate agent with a fresh perspective, just like the two-stage code review uses separate agents.

```
Agent(
  prompt: "<agents/design-reviewer.md content>

  --- Input ---
  Design document: <full design doc content>
  User requirements: <answers from Step 2>
  Complexity: Heavy
  Security baseline: <enabled / disabled>

  Review this design for error path coverage, unit independence, and over-engineering.",
  description: "Design review: {feature name}"
)
```

If verdict is NEEDS REVISION:
1. Apply the suggested changes to the design doc
2. Re-dispatch the Design Reviewer (max 2 rounds total)
3. If still NEEDS REVISION after 2 rounds: present the design to the user with the reviewer's remaining concerns noted

If verdict is PASS: proceed to Step 5.

### Medium Complexity: Self-Review (Lightweight)

For Medium tasks, self-review against these three criteria (no separate agent dispatch needed -- Medium scope is small enough for self-review):

1. **Error Path Coverage** -- Does every external call have a row in the Error/Rescue Map?
2. **Unit Independence** -- Can each unit be built and tested without the others?
3. **Over-Engineering** -- Is anything designed for scale the project does not need yet?

If issues are found: fix the design doc and re-check once. Then proceed.

## Step 5: Present Design for Approval

Show the user:
1. The architecture diagram
2. The Error/Rescue Map (highlight the riskiest scenarios)
3. The unit breakdown (what will be built, in what order, what is parallel)
4. Key design decisions

### Scope Challenge and Delivery Strategy (Heavy with 4+ units only)

Before asking for final approval, if the design has 4 or more units and complexity is Heavy, ask:

```
This design has {N} units. Before we commit:

1. If you could only ship ONE unit, which delivers the most value?

2. Build strategy:
   (A) Build ALL units in this session -- ship everything at once
   (B) Build in BATCHES -- ship highest-value first, iterate based on feedback
       Suggested batches:
       - Batch 1: {highest-value units, independent} -- ship and get feedback
       - Batch 2: {remaining units} -- build after Batch 1 feedback
   -> I recommend {A or B} because {reason}
```

Wait for the answer.

**If (A)**: Reorder the units table so the highest-value unit builds first. Note in Decisions Log.

**If (B)**:
1. Record batch assignments in the Units of Work table (add a "Batch" column).
2. Proceed to construction with Batch 1 only.
3. After Batch 1 ships, the next `/super-aidlc` invocation can read the existing design doc and continue with Batch 2. The cross-session learning mechanism will carry forward decisions and patterns.
4. Note in the design doc: "Batch delivery: Batch 1 = {units}, Batch 2 = {units}. Batch 2 may be adjusted based on Batch 1 feedback."

### Approval Gate

Ask: "Does this design look right? Any changes before I start building?"

**WAIT for approval.** This is a STOP gate -- do not proceed without explicit approval.

## Step 6: Proceed to Build

When design is approved, read `phases/construction.md` and execute.

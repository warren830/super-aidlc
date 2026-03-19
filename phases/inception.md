# Phase: Inception

> When you read this file, output: `[INCEPTION PHASE]`

Do NOT write any code in this phase. This phase produces documents, not code.

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

Skip this step for Medium complexity -- the scope is small enough that reframing adds overhead without proportional benefit.

## Step 1: Reverse Engineering (brownfield only)

If this is a brownfield project, auto-analyze existing code BEFORE asking questions. The component inventory informs better questions.

Dispatch a **Researcher Agent** (`agents/researcher.md`):

```
Agent(
  prompt: "<agents/researcher.md content>
  Task: {what the user wants to build}
  Search scope: src/, lib/, app/, aidlc-docs/, .kiro/specs/, .kiro/steering/
  Question: What is the existing component inventory? Map out:
  1. Current architecture (components, boundaries, communication)
  2. Existing design patterns and conventions
  3. Test setup and CI/CD configuration
  4. Prior design decisions from aidlc-docs/ or .kiro/specs/
  5. Integration points the new work must connect to",
  description: "Research: component inventory for {task}"
)
```

Use the Researcher's inventory to tailor the questions in Step 2. If the Researcher found relevant patterns or constraints, reference them when asking questions: "The codebase uses X pattern -- should we follow that here?"

## Step 2: Ask Questions

Before designing anything, you MUST ask the user these questions. Group them by topic, provide options with trade-offs and your recommendation, wait for answers.

### Extension Opt-In

At the start of the question session, ask:

```
Before we dive in -- do you want to enable the security baseline?
This adds input validation, auth checks, and OWASP constraints to the design.
Enable security baseline? (y/n)
```

If yes, read `extensions/security-baseline.md` and incorporate its constraints into the design doc and review criteria.

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

Create `aidlc-docs/{date}-{feature-slug}/design.md` with this EXACT structure:

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

| What Can Fail | Error Name | What System Does | What User Sees |
|---------------|-----------|-----------------|----------------|
| DB connection lost | DatabaseUnavailable | Retry 3x with backoff, then fail | "Service temporarily unavailable" |
| Invalid user input | ValidationError | Return 400 with field errors | "Please fix: {field} {reason}" |
| Auth token expired | TokenExpired | Return 401, client refreshes | Auto-redirect to login |
| External API timeout | UpstreamTimeout | Return cached data or degrade | "Some data may be stale" |
| File upload too large | PayloadTooLarge | Reject before processing | "File must be under {limit}" |

At least 5 rows. Every external call, every user input, every async operation gets a row.
Rules: No silent failures. Every error has a name, a rescue action, and a user-visible message.

## Units of Work

| Unit | Description | Dependencies | Can Parallel? |
|------|------------|-------------|---------------|
| {name} | {what it does} | {which units must finish first} | {yes/no} |

Mark which units can run in parallel. This drives the build phase.

## Decisions Log

| Question | Decision | Rationale |
|----------|---------|-----------|
| {from Step 2} | {what was decided} | {why} |
```

**MANDATORY outputs** -- the design doc MUST include ALL of these:
1. ASCII architecture diagram
2. Error/Rescue Map (5+ rows)
3. Units of Work table with parallelism markings
4. Decisions Log

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

## Step 4: Design Review Loop (self-review, max 3 iterations)

After producing the design doc, self-review it against these three criteria:

### Check 1: Error Path Coverage
- Does every external call have a row in the Error/Rescue Map?
- Does every user input have validation and error handling?
- Are there async operations without failure handling?

### Check 2: Unit Independence
- Can each unit be built and tested without the others?
- Are there hidden coupling points (shared state, implicit ordering)?
- Would a failure in one unit's build block other units?

### Check 3: Over-Engineering for v1
- Is anything designed for scale the project does not need yet?
- Are there abstractions that only have one implementation?
- Could any component be simpler without losing required functionality?

If issues are found: fix the design doc, re-check. Maximum 3 rounds. After 3 rounds, present the design as-is with notes on any remaining concerns.

## Step 5: Present Design for Approval

Show the user:
1. The architecture diagram
2. The Error/Rescue Map (highlight the riskiest scenarios)
3. The unit breakdown (what will be built, in what order, what is parallel)
4. Key design decisions

### Scope Challenge (Heavy with 4+ units only)

Before asking for final approval, if the design has 4 or more units and complexity is Heavy, ask:

```
This design has {N} units. Before we commit to building all of them:

If you could only ship ONE unit from this design, which would deliver
the most value to users?

This helps me prioritize the build order so you get value fastest.
```

Wait for the answer. Reorder the units table so the highest-value unit builds first. Note the priority in the Decisions Log.

### Approval Gate

Ask: "Does this design look right? Any changes before I start building?"

**WAIT for approval.** This is a STOP gate -- do not proceed without explicit approval.

## Step 6: Proceed to Build

When design is approved, read `phases/construction.md` and execute.

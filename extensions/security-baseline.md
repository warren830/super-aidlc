# Security Baseline

DEFAULT ON. These constraints apply to ALL code generation and review unless the user explicitly says "skip security baseline."

The four-way benchmark proved that NO methodology automatically produces secure code. Shell injection, path traversal, and memory leaks appeared in ALL implementations. This baseline exists to fix that.

## Code Generation Constraints

Every builder agent MUST enforce these when the security baseline is active:

### Input Validation
- Validate ALL user input at entry points (API params, form data, URL params, headers)
- Type-check, length-bound, and format-validate every input
- Use allowlists over denylists for structured inputs (emails, dates, IDs)
- Reject or sanitize HTML/script content in user-supplied strings

### Parameterized Queries
- Use parameterized queries for ALL database operations
- Never concatenate user input into SQL, NoSQL, or OS commands
- This is non-negotiable -- no exceptions, no "just this once"

### No Hardcoded Secrets
- No passwords, API keys, tokens, or connection strings in source code
- Use environment variables or a secrets manager
- No secrets in logs, error messages, or comments

### Authentication and Authorization
- Every protected endpoint MUST have auth/authz checks server-side
- Deny by default -- all routes require authentication unless explicitly public
- Verify resource ownership on every request that references a resource by ID (prevent IDOR)
- Validate tokens server-side on every request (signature, expiration, audience)

### HTTPS and Transport Security
- Enforce HTTPS for any endpoint that handles sensitive data
- Set Strict-Transport-Security header on web responses
- No sensitive data transmitted over unencrypted channels

### Dependency Security
- Check dependencies for known critical CVEs before merge
- Use lock files with pinned versions
- Remove unused dependencies

### File Upload Validation
- Validate file type against an allowlist (not just extension -- check content type)
- Enforce maximum file size at the framework/gateway level
- Never execute or directly serve uploaded files without validation

## Review Constraints

When the security baseline is active, the quality reviewer (`agents/quality-reviewer.md`) adds these rules:

- ALL items in Pass 1 Security checklist MUST pass for a PASS verdict
- Any security finding in Pass 1 is an automatic FAIL -- no exceptions
- Security findings cannot be deferred to "fix later"

## Threat Model (Heavy complexity only)

For Heavy complexity projects with the security baseline enabled, the design doc MUST include a simplified threat model section:

```markdown
## Threat Model

### Assets (what are we protecting?)
- {e.g., user credentials, payment data, PII}

### Threats (what could go wrong?)
| Threat | Target Asset | Likelihood | Impact | Mitigation |
|--------|-------------|------------|--------|------------|
| SQL injection | Database | High | Critical | Parameterized queries |
| Stolen API key | External services | Medium | High | Secrets manager + rotation |
| IDOR | User data | High | High | Ownership check on every request |

### Trust Boundaries
- {Where does trusted data become untrusted? e.g., API gateway, file upload endpoint}
```

At least 3 threats. Focus on the most likely and highest-impact scenarios for this specific project.

# Security Baseline

DEFAULT ON. These constraints apply to ALL code generation and review unless the user explicitly says "skip security baseline."

The four-way benchmark proved that NO methodology automatically produces secure code. Shell injection, path traversal, and memory leaks appeared in ALL implementations. This baseline exists to fix that.

## Code Generation Constraints

Every builder agent MUST enforce these (security baseline is default-on). Examples are shown for multiple languages -- use the one matching your project.

### Input Validation
- Validate ALL user input at entry points (API params, form data, URL params, headers)
- Type-check, length-bound, and format-validate every input
- Use allowlists over denylists for structured inputs (emails, dates, IDs)
- Reject or sanitize HTML/script content in user-supplied strings

### Parameterized Queries
- Use parameterized queries for ALL database operations
- Never concatenate user input into SQL, NoSQL, or OS commands
- This is non-negotiable -- no exceptions, no "just this once"

**Multi-language examples:**

```typescript
// TypeScript -- BAD vs GOOD
// BAD:  db.query(`SELECT * FROM users WHERE id = '${userId}'`)
// GOOD: db.query('SELECT * FROM users WHERE id = $1', [userId])
```

```python
# Python -- BAD vs GOOD
# BAD:  cursor.execute(f"SELECT * FROM users WHERE id = '{user_id}'")
# GOOD: cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
```

```go
// Go -- BAD vs GOOD
// BAD:  db.Query("SELECT * FROM users WHERE id = '" + userID + "'")
// GOOD: db.Query("SELECT * FROM users WHERE id = $1", userID)
```

```java
// Java -- BAD vs GOOD
// BAD:  stmt.executeQuery("SELECT * FROM users WHERE id = '" + userId + "'")
// GOOD: PreparedStatement ps = conn.prepareStatement("SELECT * FROM users WHERE id = ?");
//       ps.setString(1, userId);
```

```rust
// Rust (sqlx) -- BAD vs GOOD
// BAD:  sqlx::query(&format!("SELECT * FROM users WHERE id = '{}'", user_id))
// GOOD: sqlx::query("SELECT * FROM users WHERE id = $1").bind(&user_id)
```

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

**Automated audit commands by language:**

| Language | Audit Command | Install If Missing |
|----------|--------------|-------------------|
| Node.js | `npm audit --audit-level=critical` | Built-in |
| Python | `pip-audit` | `pip install pip-audit` |
| Go | `govulncheck ./...` | `go install golang.org/x/vuln/cmd/govulncheck@latest` |
| Rust | `cargo audit` | `cargo install cargo-audit` |
| Java | `mvn dependency-check:check` (OWASP plugin) | Add to pom.xml |

These are run automatically in the verification loop (construction.md Step 6). Any critical CVE is a FAIL -- the build does not ship until dependencies are clean or the user explicitly accepts the risk.

### Dependency Verification (Slopsquatting Prevention)

Research across 576,000 AI-generated code samples found that **19.7% of AI-recommended packages do not exist**. Attackers register these hallucinated package names with malware. This is called "slopsquatting" and is the #1 AI-specific supply chain attack vector.

**Rules for AI-generated dependency additions:**

1. **Before adding ANY new dependency**, verify it exists:
   - npm: `npm view {package-name} version` -- must return a version, not 404
   - pip: `pip index versions {package-name}` -- must return versions
   - go: check `pkg.go.dev/{module-path}` exists
   - cargo: `cargo search {crate-name}` -- must return results

2. **Verify package popularity/legitimacy:**
   - Check weekly downloads (npm: `npm view {pkg} --json | jq .time`)
   - Packages with < 100 weekly downloads should be flagged for review
   - Check publication date -- packages created in the last 30 days are suspicious

3. **Never install a dependency without explicit user approval** if:
   - Package name was suggested by the AI (not from project's existing dependencies)
   - Package has no README or minimal documentation
   - Package author has no other published packages

4. **Prefer well-known packages** over obscure alternatives:
   - If the AI suggests `fast-json-parser`, check if `JSON.parse()` or `ajv` suffices
   - If the AI suggests a utility package, check if the functionality exists in the standard library

This is NOT paranoia. 87% of hallucinated package names are plausible-sounding, and 58% are repeatable across runs, making them predictable attack targets.

### File Upload Validation
- Validate file type against an allowlist (not just extension -- check content type)
- Enforce maximum file size at the framework/gateway level
- Never execute or directly serve uploaded files without validation

## Review Constraints

The quality reviewer (`agents/quality-reviewer.md`) enforces these rules (default-on):

- ALL items in Pass 1 Security checklist MUST pass for a PASS verdict
- Any security finding in Pass 1 is an automatic FAIL -- no exceptions
- Security findings cannot be deferred to "fix later"

## Threat Model (Heavy complexity only)

For Heavy complexity projects, the design doc MUST include a simplified threat model section:

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

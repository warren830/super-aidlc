# Testing Anti-Patterns

Load this reference when writing or changing tests, adding mocks, or tempted to add test-only methods to production code.

Tests must verify real behavior, not mock behavior. Mocks are a means to isolate, not the thing being tested.

**Core principle:** Test what the code does, not what the mocks do.

## Anti-Pattern 1: Testing Mock Behavior Instead of Real Behavior

**What it looks like:**

```typescript
// BAD: Testing that the mock exists
test('renders sidebar', () => {
  render(<Page />);
  expect(screen.getByTestId('sidebar-mock')).toBeInTheDocument();
});
```

**Why this is wrong:**
- You are verifying the mock works, not that the component works
- Test passes when mock is present, fails when removed
- Tells you nothing about real behavior

**The fix:**

```typescript
// GOOD: Test real component behavior
test('renders sidebar with navigation links', () => {
  render(<Page />);  // Don't mock sidebar
  expect(screen.getByRole('navigation')).toBeInTheDocument();
  expect(screen.getByText('Dashboard')).toBeInTheDocument();
});

// OR if sidebar must be mocked for isolation:
// Don't assert on the mock -- test Page's own behavior with sidebar present
test('renders page content alongside sidebar', () => {
  render(<Page />);
  expect(screen.getByRole('main')).toBeInTheDocument();
});
```

**Prevention:** Before asserting on any element, ask: "Am I testing real component behavior or just mock existence?" If the latter, delete the assertion or unmock the component.

## Anti-Pattern 2: Adding Test-Only Methods to Production Classes

**What it looks like:**

```typescript
// BAD: destroy() only exists for test cleanup
class Session {
  async destroy() {  // Looks like production API!
    await this._workspaceManager?.destroyWorkspace(this.id);
  }
}

// In tests
afterEach(() => session.destroy());
```

**Why this is wrong:**
- Production class polluted with test-only code
- Dangerous if accidentally called in production
- Violates separation of concerns
- Confuses object lifecycle with entity lifecycle

**The fix:**

```typescript
// GOOD: Test utilities handle test cleanup
// Session has no destroy() -- it is stateless in production

// In test-utils/cleanup.ts
export async function cleanupSession(session: Session) {
  const workspace = session.getWorkspaceInfo();
  if (workspace) {
    await workspaceManager.destroyWorkspace(workspace.id);
  }
}

// In tests
afterEach(() => cleanupSession(session));
```

**Prevention:** Before adding any method to a production class, ask: "Is this only used by tests?" If yes, put it in test utilities instead. Ask: "Does this class own this resource's lifecycle?" If no, wrong class for this method.

## Anti-Pattern 3: Mocking Without Understanding Dependencies

**What it looks like:**

```typescript
// BAD: Mock breaks test logic
test('detects duplicate server', () => {
  // Mock prevents config write that test depends on!
  vi.mock('ToolCatalog', () => ({
    discoverAndCacheTools: vi.fn().mockResolvedValue(undefined)
  }));

  await addServer(config);
  await addServer(config);  // Should throw -- but won't!
});
```

**Why this is wrong:**
- The mocked method had a side effect (writing config) that the test depended on
- Over-mocking "to be safe" breaks actual behavior under test
- Test passes for the wrong reason or fails mysteriously

**The fix:**

```typescript
// GOOD: Mock at the correct level -- only the slow/external part
test('detects duplicate server', () => {
  vi.mock('MCPServerManager'); // Just mock slow server startup

  await addServer(config);  // Config written (real behavior preserved)
  await addServer(config);  // Duplicate detected -- throws
});
```

**Prevention:** Before mocking any method:
1. Ask: "What side effects does the real method have?"
2. Ask: "Does this test depend on any of those side effects?"
3. If yes, mock at a lower level (the actual slow/external operation), not the high-level method the test needs.
4. If unsure, run the test with the real implementation first, observe what needs to happen, then add minimal mocking.

Red flags: "I'll mock this to be safe," "This might be slow, better mock it," mocking without tracing the dependency chain.

## Anti-Pattern 4: Incomplete Mocks That Hide Bugs

**What it looks like:**

```typescript
// BAD: Partial mock -- only fields you think you need
const mockResponse = {
  status: 'success',
  data: { userId: '123', name: 'Alice' }
  // Missing: metadata that downstream code uses
};

// Later: breaks in production when code accesses response.metadata.requestId
```

**Why this is wrong:**
- Partial mocks hide structural assumptions
- Downstream code may depend on fields you did not include
- Tests pass but integration fails -- silent failures
- False confidence: test proves nothing about real behavior

**The fix:**

```typescript
// GOOD: Mirror the real API response completely
const mockResponse = {
  status: 'success',
  data: { userId: '123', name: 'Alice' },
  metadata: { requestId: 'req-789', timestamp: 1234567890 }
  // All fields the real API returns
};

// BETTER: Use a factory that enforces the full shape
function buildApiResponse(overrides: Partial<ApiResponse> = {}): ApiResponse {
  return {
    status: 'success',
    data: { userId: 'default-id', name: 'Default' },
    metadata: { requestId: 'req-000', timestamp: Date.now() },
    ...overrides
  };
}
```

**Prevention:** Before creating mock responses, check what the real API response contains. Include ALL fields the system might consume downstream. When uncertain, include all documented fields. Use factory functions that enforce the complete shape so new fields are added in one place.

## Anti-Pattern 5: Integration Tests as Afterthought

**What it looks like:**

```
Implementation complete.
No tests written.
"Ready for testing."
```

Or worse:

```typescript
// BAD: Tests written after the fact to hit coverage targets
test('createUser works', () => {
  const result = createUser({ name: 'Alice', email: 'a@b.com' });
  expect(result).toBeTruthy();  // Tests nothing meaningful
});
```

**Why this is wrong:**
- Testing is part of implementation, not an optional follow-up
- Tests written after code tend to confirm implementation rather than verify behavior
- After-the-fact tests miss edge cases the developer did not think of during implementation
- Cannot claim "complete" without tests

**The fix:**

```typescript
// GOOD: TDD -- test drives the implementation
// Step 1: Write failing test
test('createUser returns user with generated ID', () => {
  const user = createUser({ name: 'Alice', email: 'a@b.com' });
  expect(user.id).toMatch(/^usr_[a-z0-9]+$/);
  expect(user.name).toBe('Alice');
  expect(user.email).toBe('a@b.com');
  expect(user.createdAt).toBeInstanceOf(Date);
});

test('createUser rejects duplicate email', async () => {
  await createUser({ name: 'Alice', email: 'a@b.com' });
  await expect(createUser({ name: 'Bob', email: 'a@b.com' }))
    .rejects.toThrow('Email already registered');
});

// Step 2: Implement to pass
// Step 3: Refactor
// Step 4: THEN claim complete
```

**Prevention:** Follow TDD. Write the failing test first, implement to pass, refactor. If you find yourself writing tests after implementation, stop -- delete the code, write the test, and re-implement. The test must fail before the implementation exists.

## Quick Reference

| Anti-Pattern | Fix |
|---|---|
| Assert on mock elements | Test real component or unmock it |
| Test-only methods in production | Move to test utilities |
| Mock without understanding | Understand dependencies first, mock minimally |
| Incomplete mocks | Mirror real API completely, use factories |
| Tests as afterthought | TDD -- tests first, always |
| Over-complex mocks | Consider integration tests instead |

## Red Flags

- Assertion checks for `*-mock` test IDs
- Methods only called in test files
- Mock setup is more than 50% of the test
- Test fails when you remove a mock
- Cannot explain why a mock is needed
- Mocking "just to be safe"
- Test written after implementation and passes immediately

Following strict TDD prevents all of these anti-patterns. If you are testing mock behavior, you violated TDD -- you added mocks without watching the test fail against real code first.

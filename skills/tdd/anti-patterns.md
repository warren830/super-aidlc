# Testing Anti-Patterns

Reference for `skills/tdd/`. When writing a test feels awkward or requires heavy mocking, chances are you are stepping into one of these anti-patterns. Each section is a symptom and a fix.

## 1. Testing Mock Behavior Instead of Real Behavior

**Symptom**: the assertion is against mock call counts or mock return values, not against the function's actual output or side effect.

<Bad>
```typescript
test("caches results", () => {
  const fetchMock = jest.fn().mockResolvedValue("data");
  const cache = new Cache(fetchMock);
  cache.get("key"); cache.get("key");
  expect(fetchMock).toHaveBeenCalledTimes(1);  // testing the mock
});
```
</Bad>

<Good>
```typescript
test("second call for same key does not hit the source", async () => {
  let calls = 0;
  const cache = new Cache(async () => { calls++; return "data"; });
  await cache.get("key");
  await cache.get("key");
  expect(calls).toBe(1);  // testing observable behavior
});
```
</Good>

**Fix**: use a real in-memory substitute (counter, Map, test double) instead of a mock framework. The test should pass the same way against a real implementation of the dependency.

## 2. Test-Only Methods on Production Classes

**Symptom**: the production class has `resetForTesting()`, `getPrivateState()`, or `__test_*` helpers.

**Why it is bad**: production code now depends on test-only surface. Refactors that remove the test methods break tests. Real bugs hide behind the test-only bypass.

**Fix**:
- Construct a fresh instance per test (test isolation via the constructor)
- Expose state through the same methods production uses (no test-only getters)
- If a test needs to observe internals, make the internals part of the public contract, or test a higher-level behavior that reveals the internal state

## 3. Mocking Without Understanding the Dependency

**Symptom**: "I mocked X because the real X is too slow/complex to set up in tests."

**Why it is bad**: the mock will drift from X's real behavior. Tests pass. Production breaks.

**Fix, in order of preference**:
1. **Use the real thing** — in-memory databases (SQLite), temporary directories, local fakes.
2. **Use the library's official test double** — e.g., `aws-sdk-mock`, `pg-mem`, `msw` for HTTP.
3. **Contract test the dependency** — a single integration test that proves your mock matches real behavior.
4. **Only then** fall back to ad-hoc mocks, and write a comment explaining why.

## 4. The Test That Is Also the Documentation

**Symptom**: one test does 10 things — setup, happy path, edge cases, teardown — because "it shows how to use the API."

**Why it is bad**: when the test fails, you cannot tell which of the 10 behaviors broke. Every change breaks the test.

**Fix**: one behavior per test. Clear name. If you need a narrative walkthrough of the API, write a README example — not a test.

## 5. Testing Implementation Instead of Behavior

**Symptom**: the test asserts the function called a specific private helper, used a specific algorithm, or iterated in a specific order.

<Bad>
```typescript
test("sort uses quicksort", () => {
  const spy = jest.spyOn(Array.prototype, "sort");
  sortedList(input);
  expect(spy).toHaveBeenCalledWith(expect.any(Function));
});
```
</Bad>

<Good>
```typescript
test("returns items in ascending order", () => {
  expect(sortedList([3, 1, 2])).toEqual([1, 2, 3]);
});
```
</Good>

**Fix**: test the observable output or side effect. Implementation details should be free to change without breaking tests.

## 6. Huge Setup, Tiny Assertion

**Symptom**: 50 lines of `beforeEach`/fixtures for a single `expect(x).toBe(1)`.

**Why it is bad**: the ratio of setup to behavior means the code under test has too many collaborators or too much global state.

**Fix**:
- Dependency injection — accept collaborators as constructor args or function params
- Pure functions where possible — no hidden state
- Split the class — if it needs 10 things to exist before you can test it, it is doing too much

## 7. Mocking Time Without a Clock Abstraction

**Symptom**: `jest.useFakeTimers()` scattered through tests for any code that uses `Date.now()` or `setTimeout`.

**Fix**: inject a `Clock` or `Now` dependency. Production gets the real clock, tests get a controllable one. The test reads more naturally and does not depend on the test framework's time mocks.

## 8. Assertions That Never Can Fail

**Symptom**: `expect(result).toBeDefined()`, `expect(result).toBeTruthy()`, or `expect(x).not.toThrow()` where `x` could never realistically throw.

**Why it is bad**: the test passes trivially. You do not know if the behavior is correct — only that *something* happened.

**Fix**: assert the exact value, shape, or effect. If you cannot, you do not understand what the function should do.

## The Meta-Pattern

If writing a test feels hard: **listen to the test**. The test is telling you the code is hard to use.

- Hard to test in isolation → too coupled, inject dependencies
- Hard to assert → interface returns the wrong shape, return what you actually mean
- Hard to set up → too many collaborators, split responsibilities
- Hard to read the test → the behavior is not a single idea, split it

TDD is not only a discipline for producing tested code. It is also a **design pressure** that surfaces coupling, god-objects, and unclear contracts *before* they cement into the codebase.

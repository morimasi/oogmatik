---
name: test-driven-development
description: Use when implementing any feature or bugfix, before writing implementation code
---

# Test-Driven Development (TDD)

## Overview

Write the test first. Watch it fail. Write minimal code to pass.

**Core principle:** If you didn't watch the test fail, you don't know if it tests the right thing.

**Violating the letter of the rules is violating the spirit of the rules.**

## Oogmatik Test Setup

**Test framework:** Vitest (not Jest)
**Test files:** `tests/` directory (e.g., `tests/MyService.test.ts`)
**Run all tests:** `npm run test:run`
**Run single file:** `npm run test:run -- tests/MyService.test.ts`
**Watch mode:** `npm test`

**Import pattern:**
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
```

**Oogmatik test standards:**
- Every new `services/` function needs a test in `tests/`
- AppError must be thrown (not raw Error) — test for it explicitly
- No `any` type in tests either — use `unknown` + type guards

## When to Use

**Always:**
- New features
- Bug fixes
- Refactoring
- Behavior changes

## The Iron Law

```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```

Write code before the test? Delete it. Start over.

## Red-Green-Refactor

### RED - Write Failing Test

Write one minimal test showing what should happen.

<Good>
```typescript
import { describe, it, expect } from 'vitest';
import { retryWithBackoff } from '../utils/errorHandler.js';

describe('retryWithBackoff', () => {
  it('retries failed operations 3 times', async () => {
    let attempts = 0;
    const operation = async () => {
      attempts++;
      if (attempts < 3) throw new Error('fail');
      return 'success';
    };

    const result = await retryWithBackoff(operation, { maxAttempts: 3 });

    expect(result).toBe('success');
    expect(attempts).toBe(3);
  });
});
```
Clear name, tests real behavior, one thing
</Good>

**Requirements:**
- One behavior
- Clear name
- Real code (no mocks unless unavoidable)

### Verify RED - Watch It Fail

**MANDATORY. Never skip.**

```bash
npm run test:run -- tests/MyService.test.ts
```

Confirm:
- Test fails (not errors)
- Failure message is expected
- Fails because feature missing (not typos)

### GREEN - Minimal Code

Write simplest code to pass the test. Don't add features beyond what the test requires.

### Verify GREEN - Watch It Pass

**MANDATORY.**

```bash
npm run test:run -- tests/MyService.test.ts
```

Also run all tests to verify nothing broke:
```bash
npm run test:run
```

### REFACTOR - Clean Up

After green only:
- Remove duplication
- Improve names
- Extract helpers

Keep tests green. Don't add behavior.

## Good Tests for Oogmatik

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AppError, ValidationError, RateLimitError } from '../utils/AppError.js';

describe('MyService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('başarılı durumda doğru veri döner', async () => {
    const result = await myService.islev({ /* valid input */ });
    expect(result).toMatchObject({ success: true });
  });

  it('geçersiz input AppError fırlatır', async () => {
    await expect(myService.islev(null)).rejects.toThrow(AppError);
  });

  it('rate limit aşımında RateLimitError fırlatır', async () => {
    await expect(limitedCall()).rejects.toThrow(RateLimitError);
  });

  it('pedagogicalNote her aktivitede bulunur', async () => {
    const output = await generator.generate(options);
    expect(output.pedagogicalNote).toBeTruthy();
    expect(output.pedagogicalNote.length).toBeGreaterThan(10);
  });
});
```

## Why Order Matters

**"I'll write tests after to verify it works"**

Tests written after code pass immediately. Passing immediately proves nothing — you never saw it catch the bug.

**"Already manually tested all the edge cases"**

Manual testing is ad-hoc. No record, can't re-run, easy to forget cases.

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "Too simple to test" | Simple code breaks. Test takes 30 seconds. |
| "I'll test after" | Tests passing immediately prove nothing. |
| "Already manually tested" | Ad-hoc ≠ systematic. No record, can't re-run. |
| "TDD will slow me down" | TDD faster than debugging. |

## Red Flags - STOP and Start Over

- Code before test
- Test after implementation
- Test passes immediately
- Rationalizing "just this once"

## Verification Checklist

Before marking work complete:

- [ ] Every new function/method has a test in `tests/`
- [ ] Watched each test fail before implementing
- [ ] Each test failed for expected reason
- [ ] Wrote minimal code to pass each test
- [ ] `npm run test:run` passes (all tests, not just new ones)
- [ ] Tests use real code (mocks only if unavoidable)
- [ ] AppError thrown correctly (not raw Error)
- [ ] No `any` type in test or implementation

## Final Rule

```
Production code → test exists and failed first
Otherwise → not TDD
```

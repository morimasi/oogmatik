---
name: writing-plans
description: Use when you have a spec or requirements for a multi-step task, before touching code
---

# Writing Plans

## Overview

Write comprehensive implementation plans assuming the engineer has zero context for our codebase and questionable taste. Document everything they need to know: which files to touch for each task, code, testing, docs they might need to check, how to test it. Give them the whole plan as bite-sized tasks. DRY. YAGNI. TDD. Frequent commits.

Assume they are a skilled developer, but know almost nothing about our toolset or problem domain. Assume they don't know good test design very well.

**Announce at start:** "I'm using the writing-plans skill to create the implementation plan."

**Save plans to:** `docs/superpowers/plans/YYYY-MM-DD-<feature-name>.md`

## Oogmatik-Specific Requirements

Every plan MUST verify:
- [ ] `pedagogicalNote` field in all AI activity outputs
- [ ] `AppError` standard used (not raw Error)
- [ ] `any` type eliminated (use `unknown` + type guard)
- [ ] `npm run test:run` passes after each task
- [ ] Rate limiting on new endpoints

## File Structure

Before defining tasks, map out which files will be created or modified and what each one is responsible for.

- Design units with clear boundaries and well-defined interfaces
- Each file should have one clear responsibility
- Follow the existing project structure:
  - `api/` — Vercel Serverless Functions
  - `services/` — Business logic
  - `services/generators/` — AI activity generators
  - `components/` — React components
  - `types/` — TypeScript types (import from here, don't duplicate)
  - `tests/` — Vitest tests
- Import direction: `types/` ← `services/` ← `api/` ← `components/`

## Bite-Sized Task Granularity

**Each step is one action (2-5 minutes):**
- "Write the failing test" - step
- "Run it to make sure it fails" - step
- "Implement the minimal code to make the test pass" - step
- "Run the tests and make sure they pass" - step
- "Commit" - step

## Plan Document Header

**Every plan MUST start with this header:**

```markdown
# [Feature Name] Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** [One sentence describing what this builds]

**Architecture:** [2-3 sentences about approach]

**Tech Stack:** React 18 + TypeScript (strict) + Vite + Vercel Serverless + Gemini 2.5 Flash + Firebase + Vitest

---
```

## Task Structure

````markdown
### Task N: [Component Name]

**Files:**
- Create: `exact/path/to/file.ts`
- Modify: `exact/path/to/existing.ts`
- Test: `tests/exact/path/to/test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest';

describe('SpecificBehavior', () => {
  it('does the expected thing', async () => {
    const result = await functionUnderTest(input);
    expect(result).toMatchObject({ success: true });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- tests/path/test.ts`
Expected: FAIL with "functionUnderTest is not defined"

- [ ] **Step 3: Write minimal implementation**

```typescript
export function functionUnderTest(input: unknown): Result {
  // minimal implementation
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- tests/path/test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/path/test.ts src/path/file.ts
git commit -m "feat: add specific feature"
```
````

## Remember
- Exact file paths always
- Complete code in plan (not "add validation")
- Exact commands with expected output (`npm run test:run`, `npm run build`)
- DRY, YAGNI, TDD, frequent commits
- Oogmatik rules: AppError, pedagogicalNote, no `any`, RateLimiter

## Execution Handoff

After saving the plan:

**"Plan complete and saved to `docs/superpowers/plans/<filename>.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - Use `subagent-driven-development` skill: fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Use `executing-plans` skill: execute in this session, batch execution with checkpoints

**Which approach?"**

---
name: requesting-code-review
description: Use when completing tasks, implementing major features, or before merging to verify work meets requirements
---

# Requesting Code Review

Dispatch a code-reviewer subagent to catch issues before they cascade. The reviewer gets precisely crafted context for evaluation — never your session's history.

**Core principle:** Review early, review often.

## When to Request Review

**Mandatory:**
- After completing major feature
- Before merge to main
- After each task in subagent-driven development

**Optional but valuable:**
- When stuck (fresh perspective)
- Before refactoring (baseline check)
- After fixing complex bug

## How to Request

**1. Get git SHAs:**
```bash
BASE_SHA=$(git rev-parse HEAD~1)  # or origin/main
HEAD_SHA=$(git rev-parse HEAD)
```

**2. Provide reviewer with:**
- What was implemented
- What it should do (plan/requirements)
- Base SHA and Head SHA
- Brief description

**3. Reviewer checks:**
- Does code match requirements?
- Are tests present and meaningful?
- Is AppError format used correctly?
- Is `any` type absent?
- Is `pedagogicalNote` present in activity outputs?
- Are rate limiting and CORS applied to new endpoints?
- No diagnostic language in user-facing text?

**4. Act on feedback:**
- Fix Critical issues immediately
- Fix Important issues before proceeding
- Note Minor issues for later

## Oogmatik-Specific Review Checklist

```
□ TypeScript strict: no `any`, optional chaining used
□ AppError format: { success, error: { message, code }, timestamp }
□ Rate limiting on new endpoints
□ pedagogicalNote in all AI activity outputs
□ LearningDisabilityProfile all profiles covered
□ Lexend font not changed
□ No diagnostic language
□ KVKK: name + diagnosis + score not shown together
□ Test written (in tests/ directory, vitest)
□ npm run test:run passes
□ npm run build passes
```

## Example

```
[Just completed: Add new reading activity generator]

BASE_SHA=$(git rev-parse HEAD~1)
HEAD_SHA=$(git rev-parse HEAD)

Review request:
  WHAT: Added ReadingFlowGenerator with AI and offline modes
  PLAN: Task 3 from docs/superpowers/plans/reading-generators.md
  BASE_SHA: a7981ec
  HEAD_SHA: 3df7661
  
Key checks:
- pedagogicalNote field present in output schema
- AppError thrown for invalid LearningDisabilityProfile
- Tests in tests/ReadingFlowGenerator.test.ts
- Registry updated in services/generators/registry.ts
```

## Red Flags

**Never:**
- Skip review because "it's simple"
- Ignore Critical issues
- Proceed with unfixed Important issues

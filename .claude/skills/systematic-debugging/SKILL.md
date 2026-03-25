---
name: systematic-debugging
description: Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes
---

# Systematic Debugging

## Overview

Random fixes waste time and create new bugs. Quick patches mask underlying issues.

**Core principle:** ALWAYS find root cause before attempting fixes. Symptom fixes are failure.

## The Iron Law

```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```

If you haven't completed Phase 1, you cannot propose fixes.

## When to Use

Use for ANY technical issue:
- Test failures
- Bugs in production
- Unexpected behavior
- Performance problems
- Build failures
- Integration issues

**Use this ESPECIALLY when:**
- Under time pressure
- "Just one quick fix" seems obvious
- You've already tried multiple fixes

## The Four Phases

### Phase 1: Root Cause Investigation

**BEFORE attempting ANY fix:**

1. **Read Error Messages Carefully**
   - Don't skip past errors or warnings
   - Read stack traces completely
   - Note line numbers, file paths, error codes

2. **Reproduce Consistently**
   - Can you trigger it reliably?
   - Does it happen every time?

3. **Check Recent Changes**
   - What changed that could cause this?
   - `git diff`, recent commits
   - New dependencies, config changes

4. **Gather Evidence in Multi-Component Systems**

   For Oogmatik-specific debugging:
   ```typescript
   // Add evidence gathering at each layer:
   // 1. API endpoint - what request is received
   // 2. Service layer - what parameters are passed to AI
   // 3. Gemini client - what JSON is returned
   // 4. JSON repair motor - what happens during parsing
   // 5. Component - what state is set

   logError(new AppError(
     'Debug evidence: ' + JSON.stringify(evidenceData),
     'DEBUG_TRACE',
     200,
     { layer: 'geminiClient', rawResponse: response }
   ));
   ```

5. **Trace Data Flow**
   - Where does bad value originate?
   - Keep tracing up until you find the source
   - Fix at source, not at symptom

### Phase 2: Pattern Analysis

1. **Find Working Examples**
   - Locate similar working code in same codebase
   - Check `services/generators/` for patterns

2. **Compare Against References**
   - Read reference implementation COMPLETELY

3. **Identify Differences**
   - List every difference, however small

### Phase 3: Hypothesis and Testing

1. **Form Single Hypothesis**
   - State clearly: "I think X is the root cause because Y"
   - Write it down

2. **Test Minimally**
   - Make the SMALLEST possible change to test hypothesis
   - One variable at a time

3. **Verify Before Continuing**
   - Did it work? Yes → Phase 4
   - Didn't work? Form NEW hypothesis
   - DON'T add more fixes on top

### Phase 4: Implementation

1. **Create Failing Test Case** (use test-driven-development skill)

2. **Implement Single Fix**
   - Address the root cause identified
   - ONE change at a time

3. **Verify Fix**
   ```bash
   npm run test:run
   npm run build
   ```

4. **If Fix Doesn't Work**
   - STOP
   - Count: How many fixes have you tried?
   - If ≥ 3: Question the architecture

## Oogmatik-Specific Debugging Patterns

**Gemini JSON Parse Errors:**
- Check `services/geminiClient.ts` JSON repair motor (3 layers: balanceBraces → truncate → parse)
- Never modify the JSON repair motor — it's battle-tested
- Instead: check prompt construction, schema definition, response handling

**TypeScript Errors:**
- `any` type is often the root cause of type errors in tests
- Use `unknown` + type guard pattern
- Import types from `types/` not define inline

**Rate Limit Issues:**
- Check `services/rateLimiter.ts`
- Verify `RateLimiter` is instantiated per endpoint in `api/`

**AI Response Quality:**
- Check `pedagogicalNote` is in the schema
- Verify prompt includes ZPD context and `LearningDisabilityProfile`

## Red Flags - STOP and Follow Process

- "Quick fix for now, investigate later"
- "Just try changing X and see if it works"
- Proposing solutions before tracing data flow
- "One more fix attempt" (when already tried 2+)

## Quick Reference

| Phase | Key Activities | Success Criteria |
|-------|---------------|------------------|
| **1. Root Cause** | Read errors, reproduce, check changes | Understand WHAT and WHY |
| **2. Pattern** | Find working examples, compare | Identify differences |
| **3. Hypothesis** | Form theory, test minimally | Confirmed or new hypothesis |
| **4. Implementation** | Create test, fix, verify | Bug resolved, `npm run test:run` passes |

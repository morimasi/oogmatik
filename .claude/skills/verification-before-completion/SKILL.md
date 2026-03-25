---
name: verification-before-completion
description: Use when about to claim work is complete, fixed, or passing, before committing or creating PRs - requires running verification commands and confirming output before making any success claims; evidence before assertions always
---

# Verification Before Completion

## Overview

Claiming work is complete without verification is dishonesty, not efficiency.

**Core principle:** Evidence before claims, always.

## The Iron Law

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

If you haven't run the verification command in this message, you cannot claim it passes.

## The Gate Function

```
BEFORE claiming any status or expressing satisfaction:

1. IDENTIFY: What command proves this claim?
2. RUN: Execute the FULL command (fresh, complete)
3. READ: Full output, check exit code, count failures
4. VERIFY: Does output confirm the claim?
   - If NO: State actual status with evidence
   - If YES: State claim WITH evidence
5. ONLY THEN: Make the claim
```

## Oogmatik Verification Commands

**Tests pass:**
```bash
npm run test:run
```
Expected: All tests pass, 0 failures

**TypeScript compiles:**
```bash
npm run build
```
Expected: exit 0, no errors

**Linter passes:**
```bash
npm run lint
```
Expected: 0 errors

**Full verification before merge:**
```bash
npm run test:run && npm run build && npm run lint
```

## Common Failures

| Claim | Requires | Not Sufficient |
|-------|----------|----------------|
| Tests pass | `npm run test:run` output: 0 failures | Previous run, "should pass" |
| Build succeeds | `npm run build` exit 0 | Linter passing, logs look good |
| Bug fixed | Test original symptom passes | Code changed, assumed fixed |
| `any` type removed | TypeScript strict mode compiles | Visual inspection alone |
| AppError used correctly | Test for error code and message | Looks correct |

## Red Flags - STOP

- Using "should", "probably", "seems to"
- Expressing satisfaction before verification
- About to commit/push/PR without verification
- Relying on partial verification
- "I already ran it a few minutes ago"

## Key Patterns

**Tests:**
```
✅ [Run `npm run test:run`] [See: X tests pass, 0 failures] "All tests pass"
❌ "Should pass now" / "Looks correct"
```

**Build:**
```
✅ [Run `npm run build`] [See: exit 0] "Build succeeds"
❌ "TypeScript looks clean"
```

**Requirements:**
```
✅ Re-read plan → Create checklist → Verify each → Report gaps or completion
❌ "Tests pass, task complete"
```

## The Bottom Line

**No shortcuts for verification.**

Run the command. Read the output. THEN claim the result.

This is non-negotiable.

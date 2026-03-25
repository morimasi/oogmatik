---
name: subagent-driven-development
description: Use when executing implementation plans with independent tasks in the current session
---

# Subagent-Driven Development

Execute plan by dispatching fresh subagent per task, with two-stage review after each: spec compliance review first, then code quality review.

**Why subagents:** You delegate tasks to specialized agents with isolated context. By precisely crafting their instructions and context, you ensure they stay focused and succeed at their task. They should never inherit your session's context or history — you construct exactly what they need.

**Core principle:** Fresh subagent per task + two-stage review (spec then quality) = high quality, fast iteration

## When to Use

Use when you have a written implementation plan in `docs/superpowers/plans/` and the tasks are mostly independent.

## The Process

1. **Read plan file** from `docs/superpowers/plans/`
2. **Extract all tasks** with full text and context
3. **Create task list** (TodoWrite or checklist)

For each task:
4. **Dispatch implementer subagent** with:
   - Full task text and context
   - Relevant files to read
   - Oogmatik-specific rules they must follow
   
5. **Answer any questions** the implementer raises before they proceed

6. **After implementation:** Dispatch spec compliance reviewer
   - Does code match what the plan spec said?
   - Nothing missing, nothing extra?
   
7. **After spec review passes:** Dispatch code quality reviewer
   - AppError used correctly?
   - `any` type absent?
   - pedagogicalNote in activity outputs?
   - Tests present and meaningful?
   
8. **Fix any issues** and re-review until approved

9. **Mark task complete**, move to next

10. **After all tasks:** Dispatch final code reviewer for entire implementation

11. **Use finishing-a-development-branch skill** to complete

## Oogmatik Subagent Context Template

When dispatching implementer subagents, always include:

```
OOGMATIK PROJECT RULES (MANDATORY):
- TypeScript strict: no `any` type, use `unknown` + type guard
- AppError standard: { success, error: { message, code }, timestamp }
- pedagogicalNote required in all AI activity outputs
- Test with: npm run test:run
- No console.log in production code, use logError()
- gemini-2.5-flash model only (in geminiClient.ts)
- Lexend font must not change
- No diagnostic language about disabilities

RELEVANT FILES TO READ:
- .claude/MODULE_KNOWLEDGE.md (module overview)
- utils/AppError.ts (error standard)
- services/geminiClient.ts (AI wrapper - DO NOT MODIFY)
- [specific files for this task]
```

## Model Selection

- **Simple implementation tasks** (1-2 files, clear spec): fast model
- **Integration and judgment tasks** (multi-file): standard model
- **Architecture, design, review tasks**: most capable model

## Handling Implementer Status

**DONE:** Proceed to spec compliance review.

**DONE_WITH_CONCERNS:** Read concerns before proceeding. Address correctness concerns; note observational ones.

**NEEDS_CONTEXT:** Provide missing context and re-dispatch.

**BLOCKED:** Assess blocker, provide context or escalate.

## Red Flags

**Never:**
- Start implementation on main/master branch without explicit user consent
- Skip reviews (spec compliance OR code quality)
- Proceed with unfixed issues
- Dispatch multiple implementation subagents in parallel (conflicts)
- Start code quality review before spec compliance is ✅

## Integration

This skill requires:
- **using-git-worktrees** — REQUIRED: Set up isolated workspace first
- **writing-plans** — Creates the plan this skill executes
- **test-driven-development** — Subagents must follow TDD for each task
- **finishing-a-development-branch** — Complete when all tasks done

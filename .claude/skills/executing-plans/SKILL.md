---
name: executing-plans
description: Use when you have a written implementation plan to execute in the current session with review checkpoints
---

# Executing Plans

## Overview

Load plan, review critically, execute all tasks, report when complete.

**Announce at start:** "I'm using the executing-plans skill to implement this plan."

**Note:** Superpowers works much better with subagents. Use subagent-driven-development instead of this skill when subagent support is available.

## The Process

### Step 1: Load and Review Plan

1. Read plan file from `docs/superpowers/plans/`
2. Review critically — identify any questions or concerns
3. If concerns: Raise them before starting
4. If no concerns: Create task list and proceed

### Step 2: Execute Tasks

For each task:
1. Mark as in_progress
2. Follow each step exactly (plan has bite-sized steps)
3. Run verifications as specified: `npm run test:run`
4. Mark as completed

**After every 3 tasks:** Run full test suite + build:
```bash
npm run test:run && npm run build
```

### Step 3: Complete Development

After all tasks complete and verified:
- **REQUIRED:** Use finishing-a-development-branch skill

## Oogmatik Task Execution Rules

For every task:
- [ ] Write test FIRST (test-driven-development skill)
- [ ] No `any` type introduced
- [ ] AppError used for error cases
- [ ] `npm run test:run` passes after task
- [ ] `pedagogicalNote` in AI activity outputs

## When to Stop and Ask for Help

**STOP executing immediately when:**
- Hit a blocker (missing dependency, test fails, instruction unclear)
- Plan has critical gaps
- Verification fails repeatedly

**Ask for clarification rather than guessing.**

## Integration

- **using-git-worktrees** — REQUIRED: Set up isolated workspace before starting
- **test-driven-development** — Follow TDD for each implementation step
- **finishing-a-development-branch** — Complete development after all tasks

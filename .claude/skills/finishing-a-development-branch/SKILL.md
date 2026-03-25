---
name: finishing-a-development-branch
description: Use when implementation is complete, all tests pass, and you need to decide how to integrate the work - guides completion of development work by presenting structured options for merge, PR, or cleanup
---

# Finishing a Development Branch

## Overview

Guide completion of development work by presenting clear options and handling chosen workflow.

**Core principle:** Verify tests → Present options → Execute choice → Clean up.

**Announce at start:** "I'm using the finishing-a-development-branch skill to complete this work."

## The Process

### Step 1: Verify Tests

**Before presenting options, verify tests pass:**

```bash
npm run test:run
```

**If tests fail:**
```
Tests failing (<N> failures). Must fix before completing.
Cannot proceed with merge/PR until tests pass.
```

Stop. Don't proceed to Step 2.

**Also verify build:**
```bash
npm run build
```

**If tests pass:** Continue to Step 2.

### Step 2: Determine Base Branch

```bash
git merge-base HEAD main 2>/dev/null || git merge-base HEAD master 2>/dev/null
```

### Step 3: Present Options

Present exactly these 4 options:

```
Implementation complete. What would you like to do?

1. Merge back to <base-branch> locally
2. Push and create a Pull Request
3. Keep the branch as-is (I'll handle it later)
4. Discard this work

Which option?
```

### Step 4: Execute Choice

#### Option 1: Merge Locally

```bash
git checkout <base-branch>
git pull
git merge <feature-branch>
npm run test:run  # verify on merged result
git branch -d <feature-branch>
```

#### Option 2: Push and Create PR

```bash
git push -u origin <feature-branch>
gh pr create --title "<title>" --body "$(cat <<'EOF'
## Summary
<2-3 bullets of what changed>

## Oogmatik Checklist
- [ ] pedagogicalNote in all AI outputs
- [ ] AppError format used
- [ ] No `any` type
- [ ] Tests pass: npm run test:run
- [ ] Build passes: npm run build
EOF
)"
```

#### Option 3: Keep As-Is

Report: "Keeping branch <name>. Worktree preserved at <path>."

#### Option 4: Discard

**Confirm first:**
```
This will permanently delete:
- Branch <name>
- All commits: <commit-list>

Type 'discard' to confirm.
```

### Step 5: Cleanup Worktree

For Options 1, 2, 4:
```bash
git worktree list | grep $(git branch --show-current)
git worktree remove <worktree-path>
```

## Red Flags

**Never:**
- Proceed with failing tests
- Merge without verifying tests on result
- Delete work without confirmation
- Skip `npm run build` check

**Always:**
- Verify tests before offering options
- Present exactly 4 options
- Get typed confirmation for Option 4

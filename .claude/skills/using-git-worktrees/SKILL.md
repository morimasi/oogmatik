---
name: using-git-worktrees
description: Use when starting feature work that needs isolation from current workspace or before executing implementation plans - creates isolated git worktrees with smart directory selection and safety verification
---

# Using Git Worktrees

## Overview

Git worktrees create isolated workspaces sharing the same repository, allowing work on multiple branches simultaneously without switching.

**Core principle:** Systematic directory selection + safety verification = reliable isolation.

**Announce at start:** "I'm using the using-git-worktrees skill to set up an isolated workspace."

## Directory Selection Process

### 1. Check Existing Directories

```bash
ls -d .worktrees 2>/dev/null
```

**If found:** Use that directory. Verify it's ignored.

### 2. Check CLAUDE.md

```bash
grep -i "worktree.*director" CLAUDE.md 2>/dev/null
```

### 3. Ask User

If no directory exists and no CLAUDE.md preference:

```
No worktree directory found. Where should I create worktrees?

1. .worktrees/ (project-local, hidden)
2. ~/.config/superpowers/worktrees/oogmatik/ (global location)

Which would you prefer?
```

## Safety Verification

### For `.worktrees/` (Project-Local)

**MUST verify directory is ignored before creating worktree:**

```bash
git check-ignore -q .worktrees 2>/dev/null
```

**If NOT ignored:**
1. Add `.worktrees/` to `.gitignore`
2. Commit the change
3. Proceed with worktree creation

### Creation Steps

```bash
# Create worktree with new branch
git worktree add .worktrees/<branch-name> -b <branch-name>
cd .worktrees/<branch-name>

# Install dependencies
npm install

# Verify clean baseline
npm run test:run
```

**Report:**
```
Worktree ready at .worktrees/<branch-name>
Tests passing (<N> tests, 0 failures)
Ready to implement <feature-name>
```

## Common Mistakes

- **Skipping ignore verification** — Worktree contents get tracked, pollute git status
- **Proceeding with failing tests** — Can't distinguish new bugs from pre-existing issues

## Red Flags

**Never:**
- Create worktree without verifying it's ignored (project-local)
- Skip baseline test verification
- Proceed with failing tests without asking

## Integration

**Called by:**
- **brainstorming** — REQUIRED when design is approved and implementation follows
- **subagent-driven-development** — REQUIRED before executing any tasks
- **executing-plans** — REQUIRED before executing any tasks

**Pairs with:**
- **finishing-a-development-branch** — Cleans up worktree after work complete

---
name: using-superpowers
description: Use when starting any conversation - establishes how to find and use skills, requiring Skill tool invocation before ANY response including clarifying questions
---

<SUBAGENT-STOP>
If you were dispatched as a subagent to execute a specific task, skip this skill.
</SUBAGENT-STOP>

<EXTREMELY-IMPORTANT>
If you think there is even a 1% chance a skill might apply to what you are doing, you ABSOLUTELY MUST invoke the skill.

IF A SKILL APPLIES TO YOUR TASK, YOU DO NOT HAVE A CHOICE. YOU MUST USE IT.

This is not negotiable. This is not optional. You cannot rationalize your way out of this.
</EXTREMELY-IMPORTANT>

## Instruction Priority

Superpowers skills override default system prompt behavior, but **user instructions always take precedence**:

1. **User's explicit instructions** (CLAUDE.md, GEMINI.md, AGENTS.md, direct requests) — highest priority
2. **Superpowers skills** — override default system behavior where they conflict
3. **Default system prompt** — lowest priority

If CLAUDE.md says "don't use TDD" and a skill says "always use TDD," follow CLAUDE.md.

**Oogmatik-Specific Override:** The Oogmatik expert team rules (Elif Yıldız pedagoji, Dr. Ahmet Kaya klinik, Bora Demir mühendislik, Selin Arslan AI) always take precedence. Never violate pedagogicalNote requirement, AppError standard, or KVKK rules.

**Conflict Example:**
- Superpowers skill says: "Write the simplest code to pass the test"
- Oogmatik rule says: "AppError format `{ success, error: { message, code }, timestamp }` is mandatory"
- **Resolution:** Follow Oogmatik rule — the error format IS the simplest correct code in this project

## How to Access Skills

**In Claude Code:** Use the `Skill` tool. Skills live in `.claude/skills/<skill-name>/SKILL.md`. When you invoke a skill, its content is loaded and presented to you—follow it directly.

**In other environments:** Read the skill files directly from `.claude/skills/<name>/SKILL.md`.

## Available Skills in This Project

| Skill | Purpose |
|-------|---------|
| `brainstorming` | Before any creative/implementation work |
| `writing-plans` | After design approval, before coding |
| `test-driven-development` | During implementation (always) |
| `subagent-driven-development` | For executing plans with subagents |
| `executing-plans` | For executing plans inline |
| `systematic-debugging` | Before fixing any bug |
| `requesting-code-review` | After completing tasks |
| `verification-before-completion` | Before claiming work is done |
| `finishing-a-development-branch` | When implementation is complete |
| `using-git-worktrees` | For isolated feature work |

# Using Skills

## The Rule

**Invoke relevant or requested skills BEFORE any response or action.** Even a 1% chance a skill might apply means that you should invoke the skill to check. If an invoked skill turns out to be wrong for the situation, you don't need to use it.

## Red Flags

These thoughts mean STOP—you're rationalizing:

| Thought | Reality |
|---------|---------|
| "This is just a simple question" | Questions are tasks. Check for skills. |
| "I need more context first" | Skill check comes BEFORE clarifying questions. |
| "Let me explore the codebase first" | Skills tell you HOW to explore. Check first. |
| "I can check git/files quickly" | Files lack conversation context. Check for skills. |
| "Let me gather information first" | Skills tell you HOW to gather information. |
| "This doesn't need a formal skill" | If a skill exists, use it. |
| "I remember this skill" | Skills evolve. Read current version. |
| "This doesn't count as a task" | Action = task. Check for skills. |
| "The skill is overkill" | Simple things become complex. Use it. |
| "I'll just do this one thing first" | Check BEFORE doing anything. |

## Skill Priority

When multiple skills could apply, use this order:

1. **Process skills first** (brainstorming, debugging) - these determine HOW to approach the task
2. **Implementation skills second** - these guide execution

"Let's build X" → brainstorming first, then implementation skills.
"Fix this bug" → debugging first, then domain-specific skills.

## Skill Types

**Rigid** (TDD, debugging): Follow exactly. Don't adapt away discipline.

**Flexible** (patterns): Adapt principles to context.

The skill itself tells you which.

## User Instructions

Instructions say WHAT, not HOW. "Add X" or "Fix Y" doesn't mean skip workflows.

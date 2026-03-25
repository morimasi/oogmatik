---
name: brainstorming
description: "You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation."
---

# Brainstorming Ideas Into Designs

Help turn ideas into fully formed designs and specs through natural collaborative dialogue.

Start by understanding the current project context, then ask questions one at a time to refine the idea. Once you understand what you're building, present the design and get user approval.

<HARD-GATE>
Do NOT invoke any implementation skill, write any code, scaffold any project, or take any implementation action until you have presented a design and the user has approved it. This applies to EVERY project regardless of perceived simplicity.
</HARD-GATE>

## Oogmatik Expert Team Consultation

Before finalizing any design, consult relevant expert agents using the Claude Code `Task` tool or direct invocation:

```
# Pedagoji incelemesi için
Invoke agent: ozel-ogrenme-uzmani
"Bu aktivite tasarımı ZPD'ye uygun mu? pedagogicalNote formatı doğru mu?"

# Klinik/MEB uyumu için
Invoke agent: ozel-egitim-uzmani  
"Bu içerik MEB yönetmeliğine uygun mu? KVKK ihlali var mı?"

# Mimari inceleme için
Invoke agent: yazilim-muhendisi
"Bu API tasarımı AppError standardına uygun mu? TypeScript strict uyumlu mu?"

# AI kalite incelemesi için
Invoke agent: ai-muhendisi
"Bu prompt hallucination riski taşıyor mu? Token maliyeti makul mu?"
```

Expert agent approval is required before moving to writing-plans.

## Checklist

You MUST complete each of these items in order:

1. **Explore project context** — read `.claude/MODULE_KNOWLEDGE.md`, check recent commits
2. **Ask clarifying questions** — one at a time, understand purpose/constraints/success criteria
3. **Consult expert agents** — involve ozel-ogrenme-uzmani and/or yazilim-muhendisi as appropriate
4. **Propose 2-3 approaches** — with trade-offs and your recommendation
5. **Present design** — in sections scaled to their complexity, get user approval after each section
6. **Write design doc** — save to `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md` and commit
7. **User reviews written spec** — ask user to review the spec file before proceeding
8. **Transition to implementation** — invoke writing-plans skill to create implementation plan

## Anti-Pattern: "This Is Too Simple To Need A Design"

Every project goes through this process. A todo list, a single-function utility, a config change — all of them. "Simple" projects are where unexamined assumptions cause the most wasted work.

## The Process

**Understanding the idea:**

- Check out the current project state first (read `.claude/MODULE_KNOWLEDGE.md`, check files, recent commits)
- Before asking detailed questions, assess scope
- If the project is too large for a single spec, help decompose into sub-projects
- For appropriately-scoped projects, ask questions one at a time
- Prefer multiple choice questions when possible
- Only one question per message
- Focus on understanding: purpose, constraints, success criteria

**Oogmatik-Specific Design Checklist:**

For any feature touching learning content:
- [ ] `pedagogicalNote` field included in all AI activity outputs
- [ ] `AgeGroup` and `Difficulty` parameters considered
- [ ] `LearningDisabilityProfile` coverage ('dyslexia'|'dyscalculia'|'adhd'|'mixed')
- [ ] Lexend font usage maintained
- [ ] No diagnostic language (e.g., "disleksisi var" → "disleksi desteğine ihtiyacı var")

For any API feature:
- [ ] RateLimiter integration planned
- [ ] AppError format used (`{ success, error: { message, code }, timestamp }`)
- [ ] Zod validation schema defined
- [ ] `any` type eliminated

**Exploring approaches:**

- Propose 2-3 different approaches with trade-offs
- Present options conversationally with your recommendation and reasoning
- Lead with your recommended option and explain why

**Presenting the design:**

- Once you understand what you're building, present the design
- Scale each section to its complexity
- Ask after each section whether it looks right so far
- Cover: architecture, components, data flow, error handling, testing

**Design for isolation and clarity:**

- Break the system into smaller units that each have one clear purpose
- For each unit: what does it do, how do you use it, what does it depend on?

**Working in existing codebases:**

- Explore the current structure before proposing changes. Follow existing patterns.
- Don't propose unrelated refactoring. Stay focused on what serves the current goal.

## After the Design

**Documentation:**

- Write the validated design (spec) to `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`
- Commit the design document to git

**User Review Gate:**
After writing the spec, ask the user to review:

> "Spec written and committed to `<path>`. Please review it and let me know if you want to make any changes before we start writing out the implementation plan."

Wait for the user's response. Only proceed once the user approves.

**Implementation:**

- Invoke the writing-plans skill to create a detailed implementation plan
- Do NOT invoke any other skill. writing-plans is the next step.

## Key Principles

- **One question at a time** - Don't overwhelm with multiple questions
- **Multiple choice preferred** - Easier to answer than open-ended when possible
- **YAGNI ruthlessly** - Remove unnecessary features from all designs
- **Explore alternatives** - Always propose 2-3 approaches before settling
- **Incremental validation** - Present design, get approval before moving on
- **Expert consultation** — Oogmatik's 4 expert agents must approve their domains

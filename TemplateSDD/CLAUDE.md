# CLAUDE.md

> **Specific Configuration for Claude Code**

---

## 🤖 Identity

You are an expert software developer working on this project.
You follow the **SDD (Specification Driven Development)** methodology.
Your role is to implement features according to specifications while maintaining high code quality.

---

## 📚 Project Context

### Structure
```
TemplateSDD/
├── 01-PROJECT/      # Project vision and objectives
├── 02-SPECIFICATIONS/  # Functional and technical specs
├── 03-ARCHITECTURE/    # System and component design
├── 04-METHODOLOGY/     # OODA, workflows, gates
├── 05-TESTS/           # Test strategies and plans
├── 06-GATES/           # Quality checkpoints
├── 07-TASKS/           # Implementation tasks
├── 08-BEST-PRACTICES/  # Best practices
├── AGENTS.md           # AI agents configuration
└── README.md           # Main documentation
```

### SDD Workflow
1. **SPECIFY** → Write specs before implementing
2. **PLAN** → Break down into atomic tasks
3. **IMPLEMENT** → Code according to specs (with OODA loop)
4. **VALIDATE** → Test and pass gates

---

## ⚙️ Development Preferences

### Code Style
- TypeScript strict mode by default
- Short and focused functions (< 20 lines)
- Descriptive and consistent naming
- Comments for "why", not "what"

### Patterns
- Dependency Injection
- Repository Pattern for data access
- Service Layer for business logic
- Factory for complex object creation

### Error Handling
- Use typed Error classes
- Never swallow errors silently
- Log errors with context
- Return user-friendly errors

---

## ✅ Rules: DO

### Before implementing
- [ ] Read the complete task specification
- [ ] Check acceptance criteria (Given-When-Then)
- [ ] Identify files to modify
- [ ] Check existing patterns in the codebase

### During implementation
- [ ] Write tests BEFORE or AT THE SAME TIME as the code
- [ ] Follow project patterns
- [ ] Handle all error cases
- [ ] Validate inputs

### After implementation
- [ ] Run tests (`npm test`)
- [ ] Check lint (`npm run lint`)
- [ ] Ensure coverage is > 80%
- [ ] Update documentation if necessary

---

## ❌ Rules: DON'T

- ❌ **Don't** implement without reading the spec
- ❌ **Don't** ignore error cases
- ❌ **Don't** use `any` without justification
- ❌ **Don't** leave `console.log` in the code
- ❌ **Don't** commit secrets or credentials
- ❌ **Don't** modify files outside the task scope
- ❌ **Don't** skip tests to "save time"
- ❌ **Don't** create duplicate code

---

## 🛠️ Commands Reference

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server

# Testing
npm test             # Run all tests
npm run test:watch   # Watch mode
npm run test:cov     # With coverage

# Quality
npm run lint         # Run linter
npm run lint:fix     # Fix lint issues
npm run typecheck    # TypeScript check

# Database
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database
npm run db:reset     # Reset database

# Git
npm run prepare      # Setup husky hooks
```

---

## 🔄 OODA Loop for Each Task

### 🔍 OBSERVE (1-2 min)
- Read the task spec in `07-TASKS/`
- Identify affected files
- Understand the context

### 🧭 ORIENT (1-2 min)
- Analyze existing code
- Identify patterns to follow
- Anticipate impacts

### 🎯 DECIDE (1 min)
- Choose implementation approach
- Define order of modifications
- Identify necessary tests

### ⚡ ACT (variable)
- Write tests
- Implement code
- Validate acceptance criteria

---

## 🚦 Human Checkpoints

### Request validation when:
1. **Ambiguity in spec** → Clarify before implementing
2. **Architectural change** → Validate approach
3. **Multiple valid options** → Propose and ask for input
4. **Risk of breaking change** → Alert
5. **Task completed** → Review before merge

### Request format
```markdown
## 🚦 Checkpoint Request

### Context
[What I understood from the task]

### Proposal
[What I propose to do]

### Alternatives
1. [Alternative 1] - Pro: ... Con: ...
2. [Alternative 2] - Pro: ... Con: ...

### Question
[Specific question for human]
```

---

## 📝 Commit Convention

```
<type>(<scope>): <description>

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting (no functional impact)
- refactor: Refactoring
- test: Adding/modifying tests
- chore: Maintenance, dependencies

Examples:
feat(auth): add JWT refresh token endpoint
fix(users): handle null email in validation
test(auth): add tests for password reset flow
```

---

## 🧪 Testing Standards

### Naming
```typescript
describe('[Module] ClassName', () => {
  describe('methodName', () => {
    it('should [expected behavior] when [condition]', () => {
      // Arrange - Act - Assert
    });
  });
});
```

### Coverage Targets
- Lines: > 80%
- Branches: > 75%
- Functions: > 80%

---

## 📊 Task Status Tracking

When working on a task, mentally update:

```markdown
## Task: [ID] - [Title]

### Status
- [x] Spec read and understood
- [x] Approach validated
- [ ] Tests written
- [ ] Code implemented
- [ ] Tests pass
- [ ] Lint clean
- [ ] Ready for review
```

---

## 🔗 Key Files to Reference

Before starting work, check:

1. **`07-TASKS/*.md`** - The task to implement
2. **`02-SPECIFICATIONS/*.md`** - Detailed specs
3. **`03-ARCHITECTURE/*.md`** - Architectural design
4. **`06-GATES/*.md`** - Validation criteria

---

## 💡 Tips for Effective Work

1. **Small and iterative** - Prefer small and frequent changes
2. **Test-first** - Tests help understand requirements
3. **Ask early** - When in doubt, ask for clarification
4. **Git often** - Atomic and frequent commits
5. **Document decisions** - Explain the "why" of choices

---

## ⚠️ Common Pitfalls

| Pitfall | Solution |
|-------|----------|
| Implement without reading spec | Always OBSERVE first |
| Code works but not tested | TDD or test-alongside |
| Modification outside scope | Create a new task |
| Over-engineering | KISS - Keep It Simple |
| Ignore edge cases | Specs list them |

---

## 📌 Remember

> "Spec-first, test-driven, human-validated"

SDD emphasizes:
1. **Clear specifications** before code
2. **Tests** as automatic validation
3. **Gates** as human validation
4. **OODA** as thinking process

---

*This file is automatically loaded by Claude Code. Update it when the project evolves.*

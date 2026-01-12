# AGENTS.md - Configuration for AI Agents

> **The AI Agents README** - Specific instructions for coding agents

## 🎯 Project Overview

### Description
<!-- Replace with your project description -->
[PROJECT_NAME] is a [TYPE] application that [MAIN_OBJECTIVE].

### AI Agent Role
You are an expert development agent working on this project. You must:
- Strictly follow specifications defined in `02-SPECIFICATIONS/`
- Apply the SDD (Specification Driven Development) methodology
- Use the OODA Loop for decision-making
- Respect validation gates before each phase transition

---

## 🏗️ Architecture and Context

### Tech Stack
<!-- Customize according to your stack -->
```yaml
language: [TypeScript/Python/etc]
framework: [React/FastAPI/etc]
database: [PostgreSQL/MongoDB/etc]
testing: [Jest/Pytest/etc]
style: [ESLint/Prettier/Black]
```

### Codebase Structure
```
src/
├── components/     # UI Components
├── services/       # Business logic
├── models/         # Data models
├── utils/          # Utilities
└── tests/          # Tests
```

---

## ✅ Rules - DO (To do)

### General
- ✓ Read and understand relevant files BEFORE proposing modifications
- ✓ Follow the SDD workflow: SPECIFY → PLAN → TASKS → IMPLEMENT → VERIFY
- ✓ Create checkpoints before and after major changes
- ✓ Document each important decision in `07-DECISIONS/`
- ✓ Validate changes against BDD acceptance criteria

### Code Style
- ✓ Use conventions defined in the project
- ✓ Prefer small focused components over monolithic components
- ✓ Keep files and diffs small and targeted
- ✓ Reuse existing abstractions (DRY principle)
- ✓ Follow established architectural patterns

### Tests
- ✓ Write tests BEFORE implementation (TDD)
- ✓ Use Given-When-Then format for BDD tests
- ✓ Cover edge cases and error conditions
- ✓ Pass all tests before finalizing

### Communication
- ✓ Explain reasoning behind decisions
- ✓ Ask for clarification if requirements are ambiguous
- ✓ Propose alternatives when appropriate
- ✓ Report identified risks and limitations

---

## ❌ Rules - DON'T (Not to do)

### Code
- ✗ Do NOT hard-code values (use constants/config)
- ✗ Do NOT add heavy dependencies without approval
- ✗ Do NOT do repo-wide refactoring without request
- ✗ Do NOT create abstractions for one-off operations
- ✗ Do NOT over-engineer (avoid unrequested flexibility)

### Behavior
- ✗ Do NOT assume undocumented behaviors
- ✗ Do NOT bypass tests with workarounds
- ✗ Do NOT ignore existing errors
- ✗ Do NOT modify files marked as "off-limits"
- ✗ Do NOT jump directly to code without a plan

### Hallucinations
- ✗ Do NOT invent unverified APIs or methods
- ✗ Do NOT make assumptions about uninspected code
- ✗ Do NOT cite documentation without verification
- ✗ If uncertain, say "I'm not sure" and ask

---

## 🔧 Commands

### Build & Run
```bash
# Install dependencies
npm install  # or pip install -r requirements.txt

# Start development server
npm run dev  # or python -m uvicorn main:app --reload

# Production build
npm run build  # or python -m build
```

### Tests
```bash
# Run all tests
npm test  # or pytest

# Tests with coverage
npm run test:coverage  # or pytest --cov

# Type checking (single file)
npx tsc --noEmit path/to/file.ts  # or mypy path/to/file.py

# Linting (single file)
npx eslint path/to/file.ts  # or flake8 path/to/file.py
```

### Validation
```bash
# Check before commit
npm run lint && npm test

# Check types
npm run typecheck
```

---

## 📋 SDD Workflow

### Phase 1: SPECIFY (Specification)
```
Objective: Clearly define WHAT to build

Files to consult:
- 01-PROJECT/01-project-brief.md
- 02-SPECIFICATIONS/01-functional-specs.md
- 02-SPECIFICATIONS/05-acceptance-criteria.md

Actions:
1. Analyze requirements
2. Identify edge cases
3. Document open questions
4. Validate with user

Gate: ✓ Specs approved
```

### Phase 2: PLAN (Planning)
```
Objective: Define HOW to build

Files to produce:
- 04-PLANNING/01-implementation-plan.md
- 03-ARCHITECTURE/01-system-design.md

Actions:
1. Create system design
2. Identify dependencies
3. Estimate effort
4. Propose plan

Gate: ✓ Plan approved
```

### Phase 3: TASKS (Tasks)
```
Objective: Break down into atomic tasks

Files to produce:
- 04-PLANNING/02-task-breakdown.md

Actions:
1. Create ordered task list
2. Define success criteria per task
3. Identify checkpoints

Gate: ✓ Tasks validated
```

### Phase 4: IMPLEMENT (Implementation)
```
Objective: Write code

Process:
1. Write tests (TDD)
2. Implement until tests pass
3. Refactor if necessary
4. Document changes

Gate: ✓ Code review passed
```

### Phase 5: VERIFY (Verification)
```
Objective: Validate against specs

Actions:
1. Run all tests
2. Check acceptance criteria
3. Validate documentation
4. Final review

Gate: ✓ Final validation
```

---

## 🔄 OODA Loop in Action

For each significant decision, apply:

### OBSERVE (Observe)
- What is the current state of the code?
- What are the error messages?
- What do logs and traces say?

### ORIENT (Orient)
- How does this fit into the architecture?
- What similar patterns exist?
- What are the constraints?

### DECIDE (Decide)
- Which approach to choose?
- What are the trade-offs?
- Does this decision require approval?

### ACT (Act)
- Implement the decision
- Create a checkpoint
- Document the change

---

## 🚦 Validation Gates

### Approval Gates (Mandatory stops)
These points require explicit human validation:

1. **Spec Review Gate** - Before planning
2. **Plan Approval Gate** - Before breaking down into tasks
3. **Implementation Start Gate** - Before coding
4. **Code Review Gate** - Before merge
5. **Final Approval Gate** - Before release

### Approval request format
```markdown
## 🚦 APPROVAL GATE: [Gate Name]

### Summary
[Brief description of what is being submitted]

### Proposed changes
- [Change 1]
- [Change 2]

### Identified risks
- [Risk 1]

### Validation questions
- [ ] [Question 1]
- [ ] [Question 2]

Please validate before continuing.
```

---

## 📁 Off-Limits Files

Do not modify without explicit approval:
- `package-lock.json` / `poetry.lock`
- `.env*` (environment files)
- CI/CD configuration files
- Existing database migrations

---

## 🧪 BDD Tests Format

```gherkin
Feature: [Feature name]
  As a [role]
  I want [action]
  So that [benefit]

  Scenario: [Scenario name]
    Given [initial context]
    When [action performed]
    Then [expected result]
    And [other result]
```

---

## 📝 Commit Format

```
type(scope): short description

[optional body - detailed explanation]

[optional footer - ticket references]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

---

## 🔍 Before Starting a Task

Mandatory checklist:
- [ ] I have read the relevant specs
- [ ] I understand the acceptance criteria
- [ ] I have identified the files to modify
- [ ] I have checked existing tests
- [ ] I know which tests to write
- [ ] I have a clear plan

---

## 🆘 In Case of Blockage

1. **Technical error** → Compact error in context, analyze
2. **Ambiguity in specs** → Ask for clarification
3. **Architectural decision** → Propose options with trade-offs
4. **Failing test** → Analyze, don't bypass
5. **Performance issue** → Measure before optimizing

---

## 📚 Project Resources

| Document | Location | Description |
|----------|-------------|-------------|
| North Star | `01-PROJECT/00-north-star.md` | Project vision |
| Functional Specs | `02-SPECIFICATIONS/01-functional-specs.md` | Functional requirements |
| Technical Specs | `02-SPECIFICATIONS/02-technical-specs.md` | Technical constraints |
| Plan | `04-PLANNING/01-implementation-plan.md` | Implementation plan |
| Tests | `05-TESTING/02-test-cases.md` | Test cases |

---

**AGENTS.md Version:** 1.0.0  
**Last update:** January 2026

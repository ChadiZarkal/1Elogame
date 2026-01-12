# 📋 Test Plan - Red or Green Game

> **Test plan for Red or Green Game MVP release**

---

## 📌 General Information

| Attribute | Value |
|----------|--------|
| **Feature/Release** | Red or Green Game - MVP v1.0 |
| **Version** | 1.0 |
| **Creation Date** | 2026-01-12 |
| **Author** | Development Team |
| **Last Update** | 2026-01-12 |
| **Status** | In Progress |

---

## 🎯 Scope

### In Scope

| # | Functionality | Priority | Test Type |
|---|----------------|----------|--------------|
| 1 | Stimulus generation and display | Critical | Unit, Integration, E2E |
| 2 | User response handling | Critical | Unit, Integration |
| 3 | Scoring and timing system | Critical | Unit, Integration |
| 4 | Practice mode full flow | High | E2E |
| 5 | Assessment mode full flow | High | E2E |
| 6 | Results display and statistics | High | Unit, E2E |
| 7 | Data persistence (localStorage) | Medium | Integration |
| 8 | Settings and configuration | Medium | Unit, E2E |
| 9 | Keyboard navigation | Medium | E2E, Accessibility |
| 10 | Responsive design | Low | E2E |

### Out of Scope

- Backend API integration (not implemented in MVP)
- Multi-user authentication (local-only in MVP)
- Data export to external systems
- Multi-language support (English only in MVP)
- Advanced analytics dashboard

---

## 🧪 Planned Test Types

| Type | Coverage | Automated | Responsible |
|------|------------|------------|-------------|
| Unit Tests | 80%+ | ✅ Yes | Dev |
| Integration Tests | Critical paths | ✅ Yes | Dev |
| E2E Tests | Main user journeys | ✅ Yes | QA |
| Performance Tests | Timing accuracy | ✅ Yes | Dev |
| Accessibility Tests | WCAG 2.1 AA | ✅ Yes | QA |
| Manual Tests | Edge cases | ❌ No | QA |

---

## 📊 Entry Criteria

Conditions that must be met before starting testing:

- [ ] Code developed and merged into test branch
- [ ] Build successful without errors
- [ ] Test environment available (local)
- [ ] Test data prepared (stimulus sets)
- [ ] Technical documentation available
- [ ] Acceptance criteria defined
- [ ] Game logic implementation complete
- [ ] UI components implemented

---

## ✅ Exit Criteria

Conditions that must be met to consider testing complete:

- [ ] All planned tests executed
- [ ] Code coverage ≥ 80%
- [ ] No critical or major bugs open
- [ ] Minor bugs documented and planned
- [ ] Performance within defined SLAs:
  - Stimulus display: < 16ms (60fps)
  - Response recording: < 50ms
  - Session completion: < 100ms
- [ ] QA approval
- [ ] Accessibility requirements met

---

## 🔄 Regression Strategy

### Approach

| Condition | Action |
|-----------|--------|
| New development | Complete unit + integration tests |
| Bug fix | Non-regression tests on affected area |
| Release | Complete regression suite |
| Hotfix | Critical tests only |

### Core Regression Suite

```markdown
## Core Regression Suite

### Game Logic
- [ ] Congruent stimulus: correct response accepted
- [ ] Incongruent stimulus: meaning color accepted, display color rejected
- [ ] Timeout handling (3000ms default)
- [ ] Score calculation accuracy
- [ ] Reaction time measurement

### User Flow
- [ ] Practice mode: complete 5-trial session
- [ ] Assessment mode: complete full session
- [ ] Settings: modify timing and trials
- [ ] Results: display accurate statistics
- [ ] Navigation: all buttons functional

### Data Persistence
- [ ] Session results saved to localStorage
- [ ] Settings persist across sessions
- [ ] History accessible after reload

### Performance
- [ ] Stimulus renders within 16ms (60fps)
- [ ] Response recorded within 50ms
- [ ] No UI freezing during gameplay

### Intégrations
- [ ] API externe 1
- [ ] API externe 2
```

---

## 🌍 Environnements de Test

| Environnement | URL | Base de Données | Usage |
|---------------|-----|-----------------|-------|
| Local | localhost:3000 | SQLite | Dev testing |
| CI | N/A | PostgreSQL container | Automated tests |
| Staging | staging.example.com | PostgreSQL | QA testing |
| Pre-prod | preprod.example.com | PostgreSQL (copy) | Final validation |

---

## 📅 Planning des Tests

### Timeline

```
Semaine 1: ████████░░░░░░░░░░░░ Unit Tests
Semaine 2: ░░░░░░░░████████░░░░ Integration Tests
Semaine 3: ░░░░░░░░░░░░░░░░████ E2E + Performance
```

### Jalons

| Jalon | Date | Livrable |
|-------|------|----------|
| Tests unitaires | <!-- Date --> | 100% unit tests passing |
| Tests intégration | <!-- Date --> | Integration suite green |
| Tests E2E | <!-- Date --> | E2E suite green |
| Sign-off QA | <!-- Date --> | Approbation formelle |

---

## 👥 Rôles et Responsabilités

| Rôle | Personne | Responsabilités |
|------|----------|-----------------|
| Test Lead | <!-- Nom --> | Stratégie, planning, reporting |
| Développeur | <!-- Nom --> | Unit tests, integration tests |
| QA | <!-- Nom --> | E2E tests, tests manuels |
| DevOps | <!-- Nom --> | Environnements, performance |

---

## 📈 Métriques de Succès

| Métrique | Objectif | Actuel | Statut |
|----------|----------|--------|--------|
| Couverture de code | ≥ 80% | -% | ⏳ |
| Tests passants | 100% | -% | ⏳ |
| Bugs critiques | 0 | - | ⏳ |
| Bugs majeurs | 0 | - | ⏳ |
| Temps de réponse P95 | < 500ms | - | ⏳ |

---

## 🐛 Gestion des Bugs

### Sévérités

| Sévérité | Définition | SLA de Résolution |
|----------|------------|-------------------|
| **Critical** | Bloque l'utilisation, perte de données | < 4h |
| **Major** | Fonctionnalité importante cassée | < 1 jour |
| **Minor** | Bug mineur, contournement existe | < 1 semaine |
| **Trivial** | Cosmétique | Backlog |

### Template de Bug

```markdown
## Bug Report

### Titre
[Description courte]

### Sévérité
Critical / Major / Minor / Trivial

### Environnement
- OS: 
- Browser: 
- Version app: 

### Steps to Reproduce
1. 
2. 
3. 

### Expected Result
[Ce qui devrait se passer]

### Actual Result
[Ce qui se passe]

### Screenshots/Logs
[Attachments]
```

---

## 📝 Cas de Tests Résumés

### Feature 1: <!-- Nom -->

| ID | Cas de Test | Priorité | Automatisé | Statut |
|----|-------------|----------|------------|--------|
| TC-001 | <!-- Description --> | High | Oui | ⏳ |
| TC-002 | <!-- Description --> | High | Oui | ⏳ |
| TC-003 | <!-- Description --> | Medium | Non | ⏳ |

### Feature 2: <!-- Nom -->

| ID | Cas de Test | Priorité | Automatisé | Statut |
|----|-------------|----------|------------|--------|
| TC-010 | <!-- Description --> | High | Oui | ⏳ |
| TC-011 | <!-- Description --> | Medium | Oui | ⏳ |

---

## 📊 Rapport de Progression

### Résumé Exécution

| Statut | Nombre | Pourcentage |
|--------|--------|-------------|
| ✅ Passé | 0 | 0% |
| ❌ Échoué | 0 | 0% |
| ⏭️ Skipped | 0 | 0% |
| ⏳ Non exécuté | 0 | 0% |
| **Total** | 0 | 100% |

### Graphique de Progression

```
Jour 1: ████░░░░░░░░░░░░░░░░ 20%
Jour 2: ████████░░░░░░░░░░░░ 40%
Jour 3: ████████████░░░░░░░░ 60%
Jour 4: ████████████████░░░░ 80%
Jour 5: ████████████████████ 100%
```

---

## 📎 Annexes

### Données de Test

```markdown
## Test Users

| Email | Password | Role | Usage |
|-------|----------|------|-------|
| admin@test.com | Test123! | Admin | Admin tests |
| user@test.com | Test123! | User | User tests |
```

### Scripts de Setup

```bash
# Initialiser la base de test
npm run db:seed:test

# Nettoyer après tests
npm run db:clean:test
```

---

## ✅ Sign-off

### Approbations

| Rôle | Nom | Date | Signature |
|------|-----|------|-----------|
| Test Lead | | | |
| Dev Lead | | | |
| Product Owner | | | |

---

🚦 **Rappel:** Ce plan de test doit être validé avant le début des tests et mis à jour en cas de changements de scope.

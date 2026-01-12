# 🔄 Development Workflow

> **Flux de développement SDD intégré**

---

## 📋 Vue d'Ensemble

Le workflow SDD suit une approche **Spec-First** où la spécification précède toujours l'implémentation. Ce document décrit le flux complet du développement.

---

## 🗺️ Workflow Complet

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           SDD DEVELOPMENT WORKFLOW                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ╔═══════════════╗                                                       │
│  ║   1. VISION   ║ ◄── North Star, Objectifs, Contraintes               │
│  ╚═══════╤═══════╝                                                       │
│          │                                                               │
│          ▼                                                               │
│  ╔═══════════════════════════════════════════════════════════════╗      │
│  ║                      2. SPECIFICATION                          ║      │
│  ║  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       ║      │
│  ║  │   PRD    │─▶│Functional│─▶│Technical │─▶│Acceptance│       ║      │
│  ║  │          │  │  Specs   │  │  Specs   │  │ Criteria │       ║      │
│  ║  └──────────┘  └──────────┘  └──────────┘  └──────────┘       ║      │
│  ╚═══════════════════════════════════════╤═══════════════════════╝      │
│                                          │                               │
│                                          ▼                               │
│  ╔═══════════════════════════════════════════════════════════════╗      │
│  ║                      3. ARCHITECTURE                           ║      │
│  ║  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       ║      │
│  ║  │  System  │  │Component │  │Integration│ │ Security │       ║      │
│  ║  │  Design  │  │  Design  │  │  Design  │  │  Design  │       ║      │
│  ║  └──────────┘  └──────────┘  └──────────┘  └──────────┘       ║      │
│  ╚═══════════════════════════════════════╤═══════════════════════╝      │
│                                          │                               │
│                      ┌───────────────────┴───────────────────┐           │
│                      │         🚦 SPEC REVIEW GATE           │           │
│                      │   Human approval before implementation │           │
│                      └───────────────────┬───────────────────┘           │
│                                          │                               │
│                                          ▼                               │
│  ╔═══════════════════════════════════════════════════════════════╗      │
│  ║                        4. PLANNING                             ║      │
│  ║  ┌──────────────────────────────────────────────────────┐     ║      │
│  ║  │  Découpage en Tâches  │  Estimation  │  Priorités    │     ║      │
│  ║  └──────────────────────────────────────────────────────┘     ║      │
│  ╚═══════════════════════════════════════╤═══════════════════════╝      │
│                                          │                               │
│                      ┌───────────────────┴───────────────────┐           │
│                      │         🚦 PLAN REVIEW GATE           │           │
│                      │     Human approval of task breakdown   │           │
│                      └───────────────────┬───────────────────┘           │
│                                          │                               │
│                                          ▼                               │
│  ╔═══════════════════════════════════════════════════════════════╗      │
│  ║                     5. IMPLEMENTATION                          ║      │
│  ║  ┌─────────────────────────────────────────────────────────┐  ║      │
│  ║  │  Pour chaque tâche:                                     │  ║      │
│  ║  │  ┌─────────┐    ┌─────────┐    ┌─────────┐             │  ║      │
│  ║  │  │  OODA   │───▶│  Code   │───▶│  Test   │──┐          │  ║      │
│  ║  │  │  Loop   │    │         │    │         │  │          │  ║      │
│  ║  │  └─────────┘    └─────────┘    └─────────┘  │          │  ║      │
│  ║  │       ▲                                      │          │  ║      │
│  ║  │       └──────────────────────────────────────┘          │  ║      │
│  ║  └─────────────────────────────────────────────────────────┘  ║      │
│  ╚═══════════════════════════════════════╤═══════════════════════╝      │
│                                          │                               │
│                      ┌───────────────────┴───────────────────┐           │
│                      │       🚦 IMPLEMENTATION GATE          │           │
│                      │    Code review + Acceptance tests      │           │
│                      └───────────────────┬───────────────────┘           │
│                                          │                               │
│                                          ▼                               │
│  ╔═══════════════════════════════════════════════════════════════╗      │
│  ║                       6. VALIDATION                            ║      │
│  ║  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       ║      │
│  ║  │  Unit    │  │ Integ    │  │  E2E     │  │ Security │       ║      │
│  ║  │  Tests   │  │  Tests   │  │  Tests   │  │  Audit   │       ║      │
│  ║  └──────────┘  └──────────┘  └──────────┘  └──────────┘       ║      │
│  ╚═══════════════════════════════════════╤═══════════════════════╝      │
│                                          │                               │
│                      ┌───────────────────┴───────────────────┐           │
│                      │       🚦 RELEASE GATE                 │           │
│                      │    Final approval for deployment       │           │
│                      └───────────────────┬───────────────────┘           │
│                                          │                               │
│                                          ▼                               │
│  ╔═══════════════════════════════════════════════════════════════╗      │
│  ║                       7. DEPLOYMENT                            ║      │
│  ║  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       ║      │
│  ║  │  Build   │─▶│  Stage   │─▶│  Canary  │─▶│  Prod    │       ║      │
│  ║  └──────────┘  └──────────┘  └──────────┘  └──────────┘       ║      │
│  ╚═══════════════════════════════════════════════════════════════╝      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📝 Phase 1: Vision

### Objectif
Définir clairement la direction et les contraintes du projet.

### Livrables
- `00-north-star.md` - Vision à long terme
- `01-project-brief.md` - Contexte et objectifs
- `03-executive-summary.md` - Résumé exécutif

### Critères de Sortie
- [ ] Objectif business clairement défini
- [ ] Contraintes identifiées
- [ ] Parties prenantes alignées

---

## 📋 Phase 2: Specification

### Objectif
Créer des spécifications complètes et non-ambiguës.

### Workflow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│     PRD      │────▶│  Functional  │────▶│  Technical   │
│              │     │    Specs     │     │    Specs     │
│  • Features  │     │  • Use cases │     │  • API       │
│  • Personas  │     │  • Workflows │     │  • Data      │
│  • Goals     │     │  • Rules     │     │  • Security  │
└──────────────┘     └──────────────┘     └──────────────┘
                                                │
                                                ▼
                                     ┌──────────────────┐
                                     │    Acceptance    │
                                     │     Criteria     │
                                     │  • Given-When-   │
                                     │    Then          │
                                     └──────────────────┘
```

### Livrables
- `02-prd.md` - Product Requirements Document
- `01-functional-specs.md` - Spécifications fonctionnelles
- `02-technical-specs.md` - Spécifications techniques
- `05-acceptance-criteria.md` - Critères d'acceptance

### Critères de Sortie
- [ ] Toutes les fonctionnalités documentées
- [ ] Critères d'acceptance en format Given-When-Then
- [ ] Revue par les stakeholders

---

## 🏗️ Phase 3: Architecture

### Objectif
Définir l'architecture technique qui répond aux spécifications.

### Livrables
- `01-system-design.md` - Architecture système
- `02-component-design.md` - Design des composants
- `03-integration-design.md` - Intégrations
- `04-security-design.md` - Sécurité
- `05-deployment-design.md` - Déploiement

### Critères de Sortie
- [ ] Architecture documentée et validée
- [ ] Choix technologiques justifiés
- [ ] Risques architecturaux identifiés

---

## 🚦 Gate: Spec Review

### Conditions de Passage

```markdown
## Spec Review Checklist

### Complétude
- [ ] Toutes les user stories documentées
- [ ] Critères d'acceptance pour chaque story
- [ ] API specs complètes
- [ ] Data models définis

### Clarté
- [ ] Pas d'ambiguïté dans les specs
- [ ] Termes techniques définis
- [ ] Exemples fournis

### Faisabilité
- [ ] Architecture validée
- [ ] Pas de blocages techniques identifiés
- [ ] Ressources disponibles

### Approbations
- [ ] Product Owner: _____________ Date: _______
- [ ] Tech Lead: _________________ Date: _______
- [ ] Security: __________________ Date: _______
```

---

## 📊 Phase 4: Planning

### Objectif
Découper le travail en tâches implémentables.

### Processus

1. **Décomposition des Features**
   ```
   Feature → Epic → User Story → Task
   ```

2. **Estimation**
   ```
   Task → Complexité (S/M/L/XL) → Story Points → Heures
   ```

3. **Priorisation**
   ```
   Must Have → Should Have → Could Have → Won't Have
   ```

### Template de Tâche

```markdown
## Task: [ID] - [Titre]

### Description
[Ce que la tâche accomplit]

### Specs Référencées
- [Lien vers la spec]

### Critères d'Acceptance
```gherkin
Given [contexte]
When [action]
Then [résultat attendu]
```

### Dépendances
- Bloqué par: [Task IDs]
- Bloque: [Task IDs]

### Estimation
- Complexité: [S/M/L/XL]
- Points: [1-13]
- Heures: [X-Y]
```

---

## ⚙️ Phase 5: Implementation

### Workflow par Tâche

```
┌─────────────────────────────────────────────────────────────────┐
│                    TASK IMPLEMENTATION                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. 📖 Lire la spec de la tâche                                 │
│          │                                                       │
│          ▼                                                       │
│  2. 🔍 OODA: Observer le code existant                          │
│          │                                                       │
│          ▼                                                       │
│  3. 🧭 OODA: Orienter - comprendre l'impact                     │
│          │                                                       │
│          ▼                                                       │
│  4. 🎯 OODA: Décider de l'approche                              │
│          │                                                       │
│          ▼                                                       │
│  5. ⚡ OODA: Agir                                                │
│      │                                                           │
│      ├──▶ 5a. Écrire les tests (TDD)                            │
│      │                                                           │
│      ├──▶ 5b. Implémenter le code                               │
│      │                                                           │
│      ├──▶ 5c. Faire passer les tests                            │
│      │                                                           │
│      └──▶ 5d. Refactorer si nécessaire                          │
│          │                                                       │
│          ▼                                                       │
│  6. ✅ Valider avec les critères d'acceptance                   │
│          │                                                       │
│          ▼                                                       │
│  7. 📝 Mettre à jour la documentation                           │
│          │                                                       │
│          ▼                                                       │
│  8. 🔄 Commit avec message conventionnel                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Convention de Commits

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage
- `refactor`: Refactoring
- `test`: Ajout/modification de tests
- `chore`: Maintenance

---

## ✅ Phase 6: Validation

### Pyramide de Tests

```
            ╱╲
           ╱  ╲
          ╱ E2E╲         ← Peu, lents, coûteux
         ╱──────╲
        ╱        ╲
       ╱Integration╲     ← Modéré
      ╱────────────╲
     ╱              ╲
    ╱   Unit Tests   ╲   ← Beaucoup, rapides, pas chers
   ╱──────────────────╲
```

### Checklist de Validation

```markdown
## Validation Checklist

### Tests
- [ ] Tests unitaires passent (100%)
- [ ] Tests d'intégration passent
- [ ] Tests E2E passent
- [ ] Couverture > 80%

### Qualité
- [ ] Linting sans erreurs
- [ ] Code review approuvée
- [ ] Pas de vulnérabilités connues

### Performance
- [ ] Temps de réponse < seuil
- [ ] Pas de memory leaks
- [ ] Stress test passé

### Documentation
- [ ] API documentée
- [ ] README à jour
- [ ] Changelog mis à jour
```

---

## 🚀 Phase 7: Deployment

### Stratégie de Déploiement

```
Development ──▶ Staging ──▶ Canary ──▶ Production
                   │           │
                   ▼           ▼
              QA Manual    Monitoring
                           (10% trafic)
```

### Rollback Plan

```markdown
## Rollback Procedure

### Triggers
- Error rate > 1%
- Latency p99 > 500ms
- Critical bug detected

### Steps
1. [ ] Activer le rollback automatique
2. [ ] Vérifier la version précédente
3. [ ] Notifier l'équipe
4. [ ] Analyser la cause
5. [ ] Planifier le fix
```

---

## 📊 Métriques du Workflow

### Lead Time

| Phase | Target | Actual |
|-------|--------|--------|
| Vision → Spec | 2-3 jours | |
| Spec → Architecture | 1-2 jours | |
| Architecture → Planning | 1 jour | |
| Planning → Implementation | Variable | |
| Implementation → Validation | 1 jour | |
| Validation → Deployment | < 1 jour | |

### Cycle Time par Tâche

| Complexité | Target | Actual |
|------------|--------|--------|
| Small (S) | < 2h | |
| Medium (M) | < 4h | |
| Large (L) | < 1 jour | |
| XLarge (XL) | < 2 jours | |

---

## 🔧 Outils du Workflow

| Phase | Outils |
|-------|--------|
| Vision | Notion, Confluence, Markdown |
| Specification | Markdown, Mermaid, OpenAPI |
| Architecture | Draw.io, Mermaid, C4 Model |
| Planning | Jira, Linear, GitHub Projects |
| Implementation | VS Code, Claude, GitHub Copilot |
| Validation | Jest, Playwright, k6 |
| Deployment | GitHub Actions, ArgoCD, Kubernetes |

---

🚦 **Rappel:** Chaque phase doit être complétée et validée avant de passer à la suivante. Les gates sont obligatoires.

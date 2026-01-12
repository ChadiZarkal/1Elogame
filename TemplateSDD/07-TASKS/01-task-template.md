# 📋 Task Template

> **Format standardisé pour les tâches d'implémentation**

---

## 📌 Structure d'une Tâche

Chaque tâche doit suivre ce format pour garantir la clarté et la traçabilité.

---

## 📝 Template Minimal

```markdown
## TASK-[ID]: [Titre court et descriptif]

### 📌 Métadonnées
| Attribut | Valeur |
|----------|--------|
| **ID** | TASK-XXX |
| **Type** | Feature / Bug / Chore / Refactor |
| **Priorité** | Critical / High / Medium / Low |
| **Estimation** | [Story Points] / [Heures] |
| **Assignee** | [Nom] |
| **Sprint** | [Sprint #] |
| **Status** | Todo / In Progress / Review / Done |

### 📖 Description
[Description claire de ce qui doit être fait]

### ✅ Acceptance Criteria
```gherkin
Given [contexte initial]
When [action effectuée]
Then [résultat attendu]
```

### 📎 Références
- Spec: [Lien vers la spec]
- Design: [Lien vers le design]
- Related: [Autres tâches liées]
```

---

## 📝 Template Complet

```markdown
## TASK-[ID]: [Titre court et descriptif]

---

### 📌 Métadonnées

| Attribut | Valeur |
|----------|--------|
| **ID** | TASK-XXX |
| **Epic** | [Epic parent] |
| **User Story** | [Story parent] |
| **Type** | Feature / Bug / Chore / Refactor / Spike |
| **Priorité** | Critical / High / Medium / Low |
| **Complexité** | S / M / L / XL |
| **Story Points** | [1-13] |
| **Estimation** | [X heures] |
| **Assignee** | [Nom] |
| **Reviewer** | [Nom] |
| **Sprint** | [Sprint #] |
| **Status** | Todo / In Progress / Review / Done |
| **Created** | [YYYY-MM-DD] |
| **Due** | [YYYY-MM-DD] |

---

### 📖 Description

#### Contexte
[Pourquoi cette tâche est nécessaire]

#### Objectif
[Ce que cette tâche accomplit]

#### Détails
[Description technique détaillée]

---

### ✅ Acceptance Criteria

```gherkin
Feature: [Nom de la feature]

  Scenario: [Scénario principal]
    Given [contexte initial]
    And [contexte additionnel]
    When [action effectuée]
    Then [résultat attendu]
    And [résultat additionnel]

  Scenario: [Scénario d'erreur]
    Given [contexte]
    When [action invalide]
    Then [comportement d'erreur attendu]
```

---

### 🔗 Dépendances

#### Bloqué par
- [ ] TASK-XXX: [Description]
- [ ] TASK-YYY: [Description]

#### Bloque
- [ ] TASK-ZZZ: [Description]

---

### 📁 Fichiers Impactés

| Fichier | Action | Description |
|---------|--------|-------------|
| `src/module/file.ts` | Modifier | [Ce qui change] |
| `src/new-file.ts` | Créer | [Ce qui est créé] |
| `tests/file.test.ts` | Modifier | [Tests à ajouter] |

---

### 🧪 Tests Requis

- [ ] Unit tests pour [composant/fonction]
- [ ] Integration tests pour [API/service]
- [ ] E2E tests pour [parcours utilisateur]

---

### 📎 Références

- **Spec:** [Lien vers la spécification]
- **Design:** [Lien vers le design/maquette]
- **API Doc:** [Lien vers la doc API]
- **Related Tasks:** TASK-XXX, TASK-YYY
- **Related PRs:** #XXX

---

### 📝 Notes d'Implémentation

[Notes techniques, approche suggérée, pièges à éviter]

---

### 📊 Suivi

#### Progression
- [ ] Analyse terminée
- [ ] Code écrit
- [ ] Tests écrits
- [ ] Tests passent
- [ ] Code review demandée
- [ ] Code review approuvée
- [ ] Mergé

#### Temps Passé
| Date | Durée | Activité |
|------|-------|----------|
| | | |

---

### 💬 Commentaires

[Historique des discussions et décisions]
```

---

## 🏷️ Types de Tâches

### Feature
Nouvelle fonctionnalité à implémenter.

```markdown
## TASK-001: Implémenter l'authentification JWT

### Type: Feature

### Description
Implémenter le système d'authentification basé sur JWT avec:
- Login endpoint
- Refresh token
- Logout

### Acceptance Criteria
```gherkin
Scenario: Successful login
  Given a user exists with email "user@example.com"
  When I POST /auth/login with valid credentials
  Then I should receive a 200 response
  And the response should contain an access token
  And the response should contain a refresh token
```
```

---

### Bug
Correction d'un comportement incorrect.

```markdown
## TASK-002: Fix - Login échoue avec email en majuscules

### Type: Bug

### Description du Bug
**Comportement actuel:**
Le login échoue quand l'email est saisi en majuscules (ex: "USER@example.com")

**Comportement attendu:**
Le login devrait fonctionner quelle que soit la casse de l'email

**Steps to reproduce:**
1. Créer un user avec email "user@example.com"
2. Tenter de se connecter avec "USER@example.com"
3. Observer l'erreur "User not found"

### Cause Probable
Comparaison d'email case-sensitive dans `UserRepository.findByEmail()`

### Fix Proposé
Normaliser l'email en lowercase avant la comparaison

### Acceptance Criteria
```gherkin
Scenario: Login with uppercase email
  Given a user exists with email "user@example.com"
  When I login with email "USER@EXAMPLE.COM"
  Then the login should succeed
```
```

---

### Chore
Tâche technique sans impact fonctionnel visible.

```markdown
## TASK-003: Upgrade Node.js de 18 à 20

### Type: Chore

### Description
Mettre à jour la version de Node.js pour bénéficier des dernières fonctionnalités et patches de sécurité.

### Actions
- [ ] Mettre à jour Dockerfile
- [ ] Mettre à jour .nvmrc
- [ ] Mettre à jour package.json engines
- [ ] Tester tous les workflows CI/CD
- [ ] Mettre à jour la documentation

### Risques
- Incompatibilités potentielles avec certaines dépendances
- Changements de comportement dans les APIs Node

### Rollback
Revenir au Dockerfile précédent si problèmes
```

---

### Refactor
Amélioration du code sans changement fonctionnel.

```markdown
## TASK-004: Refactor UserService pour utiliser le Repository pattern

### Type: Refactor

### Description
Extraire la logique d'accès aux données de UserService vers un UserRepository dédié.

### Motivation
- Améliorer la testabilité
- Respecter le Single Responsibility Principle
- Faciliter le changement de base de données si nécessaire

### Fichiers Impactés
| Avant | Après |
|-------|-------|
| `user.service.ts` (300 lignes) | `user.service.ts` (150 lignes) |
| - | `user.repository.ts` (150 lignes) |

### Acceptance Criteria
- [ ] Tous les tests existants passent toujours
- [ ] Pas de changement de comportement
- [ ] Couverture de tests maintenue
```

---

### Spike
Investigation/recherche technique.

```markdown
## TASK-005: Spike - Évaluer les options de cache distribué

### Type: Spike

### Time-box
4 heures maximum

### Objectif
Évaluer les options pour implémenter un cache distribué et faire une recommandation.

### Questions à Répondre
1. Redis vs Memcached vs autre ?
2. Managed vs Self-hosted ?
3. Coût estimé ?
4. Complexité d'intégration ?

### Options à Évaluer
| Option | Pros | Cons | Coût |
|--------|------|------|------|
| AWS ElastiCache Redis | | | |
| Self-hosted Redis | | | |
| Memcached | | | |

### Livrables
- [ ] Document de recommandation
- [ ] Estimation pour l'implémentation
- [ ] POC si temps disponible
```

---

## 📊 États des Tâches

```
┌─────────┐     ┌─────────────┐     ┌────────┐     ┌──────┐
│  TODO   │────▶│ IN PROGRESS │────▶│ REVIEW │────▶│ DONE │
└─────────┘     └─────────────┘     └────────┘     └──────┘
     │                │                  │
     │                │                  │
     ▼                ▼                  ▼
┌─────────┐     ┌─────────────┐     ┌────────┐
│ BLOCKED │     │   BLOCKED   │     │CHANGES │
└─────────┘     └─────────────┘     │REQUIRED│
                                    └────────┘
```

### Définitions

| État | Description |
|------|-------------|
| **Todo** | Prête à être prise, pas encore commencée |
| **In Progress** | En cours de développement |
| **Blocked** | Bloquée par une dépendance ou un problème |
| **Review** | Code terminé, en attente de review |
| **Changes Required** | Review faite, modifications demandées |
| **Done** | Mergée et validée |

---

## 🏷️ Labels/Tags

### Priorité
- `priority:critical` - Bloque la release
- `priority:high` - Important pour le sprint
- `priority:medium` - Normal
- `priority:low` - Nice to have

### Type
- `type:feature` - Nouvelle fonctionnalité
- `type:bug` - Correction de bug
- `type:chore` - Tâche technique
- `type:refactor` - Refactoring
- `type:spike` - Investigation

### Effort
- `size:S` - < 2 heures
- `size:M` - 2-4 heures
- `size:L` - 4-8 heures
- `size:XL` - > 8 heures

### Autres
- `needs:design` - Besoin de maquette
- `needs:spec` - Besoin de spécification
- `needs:review` - En attente de review
- `blocked` - Bloquée
- `breaking-change` - Changement cassant

---

## ✅ Definition of Done

Une tâche est considérée "Done" quand:

- [ ] Code implémenté selon la spec
- [ ] Tests unitaires écrits et passent
- [ ] Tests d'intégration si applicable
- [ ] Couverture de code > 80%
- [ ] Code review approuvée
- [ ] Documentation mise à jour
- [ ] Pas de bugs bloquants
- [ ] Mergé dans la branche principale
- [ ] Déployé en staging (si applicable)

---

🚦 **Rappel:** Une tâche bien définie est une tâche facile à implémenter. Investissez du temps dans la définition.

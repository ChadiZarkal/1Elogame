# 📋 Architecture Decision Records (ADR)

> **Documenter les décisions architecturales importantes**

---

## 📌 Qu'est-ce qu'un ADR?

Un **Architecture Decision Record (ADR)** est un document court qui capture une décision architecturale importante, son contexte et ses conséquences.

### Pourquoi les ADR?

| Bénéfice | Description |
|----------|-------------|
| **Mémoire** | Préserver le contexte des décisions |
| **Onboarding** | Aider les nouveaux à comprendre le "pourquoi" |
| **Évolution** | Savoir quand revisiter une décision |
| **Communication** | Aligner l'équipe sur les choix |

---

## 📁 Structure des ADR

```
03-ARCHITECTURE/
└── decisions/
    ├── 0001-use-postgresql.md
    ├── 0002-adopt-jwt-authentication.md
    ├── 0003-use-typescript-strict.md
    └── template.md
```

---

## 📝 Template ADR

```markdown
# ADR-[NNNN]: [Titre de la décision]

## Status

**[Proposed | Accepted | Deprecated | Superseded by ADR-XXXX]**

## Date

[YYYY-MM-DD]

## Context

[Décrivez le contexte et les forces en jeu.
Quel problème essayons-nous de résoudre?
Quelles sont les contraintes?]

## Decision

[Décrivez la décision prise et comment elle résout le problème.]

**Nous décidons de [décision].**

## Consequences

### Positives
- [Conséquence positive 1]
- [Conséquence positive 2]

### Negatives
- [Conséquence négative 1]
- [Conséquence négative 2]

### Neutral
- [Conséquence neutre 1]

## Alternatives Considered

### Option 1: [Nom]
- **Pros:** [...]
- **Cons:** [...]
- **Rejetée car:** [...]

### Option 2: [Nom]
- **Pros:** [...]
- **Cons:** [...]
- **Rejetée car:** [...]

## References

- [Lien vers documentation]
- [Lien vers discussion]
```

---

## 📋 Exemples d'ADR

### ADR-0001: Utiliser PostgreSQL comme base de données

```markdown
# ADR-0001: Utiliser PostgreSQL comme base de données

## Status
Accepted

## Date
2025-01-15

## Context

Nous devons choisir une base de données pour l'application. Les options 
principales sont:
- PostgreSQL (RDBMS)
- MongoDB (Document store)
- MySQL (RDBMS)

Nos besoins:
- Transactions ACID
- Requêtes complexes avec JOINs
- Support JSON pour flexibilité
- Maturité et stabilité
- Bonne performance pour charges mixtes read/write

## Decision

**Nous décidons d'utiliser PostgreSQL comme base de données principale.**

PostgreSQL offre le meilleur équilibre entre les fonctionnalités relationnelles 
traditionnelles et les capacités modernes (JSON, full-text search).

## Consequences

### Positives
- Support ACID complet pour les transactions
- Excellentes performances pour les JOINs complexes
- Support natif de JSON/JSONB pour flexibilité
- Large écosystème d'outils
- Expertise disponible dans l'équipe

### Negatives
- Plus complexe à scaler horizontalement que MongoDB
- Nécessite plus de planification pour les schémas

### Neutral
- Nécessite des migrations de schéma gérées

## Alternatives Considered

### MongoDB
- **Pros:** Flexible schema, scaling horizontal natif
- **Cons:** Pas de transactions multi-documents (limité), JOINs complexes
- **Rejetée car:** Besoin fort de transactions et requêtes relationnelles

### MySQL
- **Pros:** Très mature, large adoption
- **Cons:** Moins de fonctionnalités avancées que PostgreSQL
- **Rejetée car:** PostgreSQL offre plus de fonctionnalités modernes

## References
- https://www.postgresql.org/docs/
- Discussion interne: [lien]
```

---

### ADR-0002: Adopter JWT pour l'authentification

```markdown
# ADR-0002: Adopter JWT pour l'authentification

## Status
Accepted

## Date
2025-01-16

## Context

Nous devons implémenter l'authentification pour l'API. Options considérées:
- JWT (JSON Web Tokens)
- Sessions serveur (avec cookies)
- OAuth2 tokens opaques

Contraintes:
- API REST stateless préférée
- Support mobile et web
- Possibilité de microservices futurs

## Decision

**Nous décidons d'utiliser JWT avec refresh tokens pour l'authentification.**

Structure:
- Access token: JWT, durée courte (15 min)
- Refresh token: Opaque, stocké en base, durée longue (7 jours)

## Consequences

### Positives
- Stateless: pas de lookup base pour valider access token
- Scalable: fonctionne bien avec load balancing
- Information embarquée: claims utiles dans le token
- Standard: large support tooling

### Negatives
- Révocation complexe avant expiration
- Taille du token plus grande qu'un ID session
- Nécessite gestion sécurisée des refresh tokens

### Neutral
- Nécessite HTTPS obligatoire

## Alternatives Considered

### Sessions serveur
- **Pros:** Révocation simple, petits cookies
- **Cons:** Stateful, nécessite session store partagé
- **Rejetée car:** Contrainte de scalabilité

### OAuth2 tokens opaques
- **Pros:** Révocation simple
- **Cons:** Lookup base à chaque requête
- **Rejetée car:** Overhead de latence

## References
- RFC 7519: JWT
- https://auth0.com/docs/tokens
```

---

### ADR-0003: TypeScript en mode strict

```markdown
# ADR-0003: TypeScript en mode strict

## Status
Accepted

## Date
2025-01-17

## Context

Nous utilisons TypeScript pour le backend et frontend. Question: 
quel niveau de rigueur pour la configuration TypeScript?

Options:
- Mode permissif (default)
- Mode strict
- Mode très strict (strict + règles additionnelles)

## Decision

**Nous décidons d'utiliser TypeScript en mode strict avec les règles suivantes:**

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true
  }
}
```

## Consequences

### Positives
- Détection d'erreurs à la compilation
- Meilleure documentation via les types
- Refactoring plus sûr
- Réduction des bugs runtime

### Negatives
- Courbe d'apprentissage plus raide
- Plus de code de type à écrire
- Certaines librairies mal typées

### Neutral
- Temps de compilation légèrement plus long

## Alternatives Considered

### Mode permissif
- **Pros:** Plus rapide à démarrer, moins de friction
- **Cons:** Perd les bénéfices de TypeScript
- **Rejetée car:** Investissement long terme

## References
- https://www.typescriptlang.org/tsconfig
```

---

## 🔄 Lifecycle d'un ADR

```
┌─────────────────────────────────────────────────────────────────┐
│                      ADR LIFECYCLE                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────┐                                              │
│   │   PROPOSED   │ ◄── Nouvelle décision à discuter             │
│   └──────┬───────┘                                              │
│          │                                                       │
│          │ Revue et discussion                                   │
│          │                                                       │
│     ┌────┴────┐                                                  │
│     │         │                                                  │
│     ▼         ▼                                                  │
│ ┌────────┐ ┌────────┐                                           │
│ │ACCEPTED│ │REJECTED│                                           │
│ └───┬────┘ └────────┘                                           │
│     │                                                            │
│     │ Passage du temps                                           │
│     │ Nouvelles contraintes                                      │
│     │                                                            │
│     ▼                                                            │
│ ┌─────────────────┐                                             │
│ │   DEPRECATED    │ ◄── Plus recommandée mais encore en usage   │
│ └────────┬────────┘                                             │
│          │                                                       │
│          │ Nouvelle décision                                     │
│          ▼                                                       │
│ ┌─────────────────────────┐                                     │
│ │ SUPERSEDED by ADR-XXXX  │ ◄── Remplacée par nouvelle décision │
│ └─────────────────────────┘                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Index des ADR

Maintenir un index à jour:

```markdown
# ADR Index

| ADR | Titre | Status | Date |
|-----|-------|--------|------|
| [0001](./0001-use-postgresql.md) | Utiliser PostgreSQL | Accepted | 2025-01-15 |
| [0002](./0002-adopt-jwt-authentication.md) | Adopter JWT | Accepted | 2025-01-16 |
| [0003](./0003-use-typescript-strict.md) | TypeScript strict | Accepted | 2025-01-17 |

## By Status

### Accepted
- ADR-0001: PostgreSQL
- ADR-0002: JWT
- ADR-0003: TypeScript strict

### Proposed
(none)

### Deprecated
(none)

### Superseded
(none)
```

---

## ✅ Quand créer un ADR?

Créer un ADR quand:

- [ ] Choix de technologie majeur (DB, framework, language)
- [ ] Pattern architectural (CQRS, Event Sourcing, etc.)
- [ ] Convention d'équipe importante
- [ ] Changement de direction technique
- [ ] Décision qui impacte plusieurs composants
- [ ] Choix avec des trade-offs significatifs

Ne pas créer d'ADR pour:

- ❌ Choix mineurs ou réversibles facilement
- ❌ Décisions évidentes sans alternatives
- ❌ Détails d'implémentation locaux

---

## 🛠️ Processus de Décision

```
┌─────────────────────────────────────────────────────────────────┐
│                    DECISION PROCESS                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   1. Identifier le besoin de décision                           │
│          │                                                       │
│          ▼                                                       │
│   2. Créer l'ADR en status "Proposed"                           │
│          │                                                       │
│          ▼                                                       │
│   3. Partager avec l'équipe pour review                         │
│          │                                                       │
│          ▼                                                       │
│   4. Discussion (sync ou async)                                 │
│          │                                                       │
│          ▼                                                       │
│   5. Consensus ou décision par le tech lead                     │
│          │                                                       │
│          ▼                                                       │
│   6. Mettre à jour le status: Accepted/Rejected                 │
│          │                                                       │
│          ▼                                                       │
│   7. Implémenter si accepté                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💡 Bonnes Pratiques

1. **Concis mais complet** - Un ADR devrait tenir sur 1-2 pages
2. **Context first** - Le contexte est aussi important que la décision
3. **Alternatives** - Toujours documenter les alternatives rejetées
4. **Immutable (mostly)** - Ne pas modifier un ADR accepté, créer un nouveau
5. **Accessible** - Garder les ADR avec le code (pas dans un wiki séparé)
6. **Numérotation** - Utiliser des numéros séquentiels simples
7. **Date** - Toujours dater les ADR
8. **Status visible** - Le status doit être évident

---

🚀 **Rappel:** Les ADR sont une forme de documentation architecturale légère. Ils ne remplacent pas la documentation technique complète mais capturent les décisions importantes.

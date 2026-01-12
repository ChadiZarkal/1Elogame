# ✅ Gate Checklists

> **Checklists interactives pour chaque gate**

---

## 📋 Usage

Ces checklists sont conçues pour être copiées et utilisées lors de chaque passage de gate. Cochez les éléments au fur et à mesure de la validation.

---

## 🚀 Gate 0: Project Initiate

```markdown
# Gate 0 Checklist: Project Initiate
## Project: [Nom du projet]
## Date: [YYYY-MM-DD]
## Reviewer: [Nom]

### Business Value
- [ ] Problème à résoudre clairement défini
- [ ] Impact business estimé (€ ou métrique)
- [ ] Alignement avec la stratégie confirmé
- [ ] Priorité validée par rapport aux autres projets

### Resources
- [ ] Équipe identifiée
- [ ] Disponibilité confirmée
- [ ] Skills nécessaires disponibles
- [ ] Budget approuvé

### Scope
- [ ] Périmètre initial défini
- [ ] Out of scope documenté
- [ ] MVP identifié
- [ ] Success criteria définis

### Governance
- [ ] Sponsor exécutif identifié
- [ ] RACI défini
- [ ] Fréquence des updates définie
- [ ] Escalation path clair

### Timeline
- [ ] Deadline réaliste établie
- [ ] Milestones définis
- [ ] Dépendances externes identifiées
- [ ] Risques majeurs évalués

---

### Decision
- [ ] ✅ PASS - Proceed to Specification
- [ ] 🔄 CONDITIONAL - Fix items: _______________
- [ ] ❌ FAIL - Do not proceed: _______________

### Signatures
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Sponsor | | | |
| Product Owner | | | |
| Tech Lead | | | |
```

---

## 📋 Gate 1: Spec Review

```markdown
# Gate 1 Checklist: Specification Review
## Project: [Nom du projet]
## Date: [YYYY-MM-DD]
## Reviewer: [Nom]

### Product Requirements (PRD)
- [ ] Objectifs business documentés
- [ ] Personas/utilisateurs cibles définis
- [ ] Problem statement clair
- [ ] Success metrics identifiés
- [ ] MoSCoW prioritization fait

### User Stories
- [ ] Toutes les stories rédigées
- [ ] Format "As a... I want... So that..." respecté
- [ ] Stories indépendantes (INVEST)
- [ ] Stories estimables
- [ ] Stories testables

### Acceptance Criteria
- [ ] Critères en format Given-When-Then
- [ ] Critères pour happy path
- [ ] Critères pour error cases
- [ ] Critères pour edge cases
- [ ] Critères mesurables

### Non-Functional Requirements
- [ ] Performance (temps de réponse, throughput)
- [ ] Sécurité (authentification, autorisation, encryption)
- [ ] Disponibilité (uptime, SLA)
- [ ] Scalabilité (volume attendu)
- [ ] Conformité (RGPD, etc.)

### UI/UX (si applicable)
- [ ] Wireframes/maquettes disponibles
- [ ] User flows documentés
- [ ] Responsive design spécifié
- [ ] Accessibilité considérée (WCAG)

### Clarté
- [ ] Pas de termes ambigus
- [ ] Glossaire des termes techniques
- [ ] Exemples fournis
- [ ] Questions/clarifications résolues

---

### Review Notes
[Ajouter des commentaires ici]

### Action Items
| Item | Owner | Due Date | Status |
|------|-------|----------|--------|
| | | | |

### Decision
- [ ] ✅ PASS - Proceed to Architecture
- [ ] 🔄 CONDITIONAL - Fix items: _______________
- [ ] ❌ FAIL - Major rework needed: _______________

### Signatures
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Owner | | | |
| Tech Lead | | | |
```

---

## 🏗️ Gate 2: Design Review

```markdown
# Gate 2 Checklist: Architecture/Design Review
## Project: [Nom du projet]
## Date: [YYYY-MM-DD]
## Reviewer: [Nom]

### System Architecture
- [ ] Vue d'ensemble système documentée
- [ ] Diagrammes C4 (Context, Container, Component)
- [ ] Choix technologiques listés
- [ ] Justification des choix documentée
- [ ] Alternatives considérées notées

### Data Design
- [ ] Modèle de données défini
- [ ] ERD ou schéma équivalent
- [ ] Relations documentées
- [ ] Indexes identifiés
- [ ] Migrations planifiées

### API Design
- [ ] Endpoints listés
- [ ] OpenAPI/GraphQL spec
- [ ] Versioning strategy
- [ ] Error response format
- [ ] Rate limiting défini

### Integration Design
- [ ] Services externes identifiés
- [ ] Contrats d'intégration
- [ ] Fallback/retry strategies
- [ ] Circuit breakers planifiés

### Security Design
- [ ] Authentication method
- [ ] Authorization model (RBAC/ABAC)
- [ ] Encryption (at rest, in transit)
- [ ] Threat model réalisé
- [ ] OWASP Top 10 adressé

### Scalability
- [ ] Bottlenecks identifiés
- [ ] Scaling strategy (horizontal/vertical)
- [ ] Caching strategy
- [ ] CDN si applicable

### Operations
- [ ] Deployment architecture
- [ ] Monitoring strategy
- [ ] Logging strategy
- [ ] Alerting criteria
- [ ] Backup/recovery plan

### Maintainability
- [ ] Code structure définie
- [ ] Patterns à utiliser
- [ ] Couplage faible
- [ ] Documentation technique

---

### Review Notes
[Ajouter des commentaires ici]

### Technical Debt Accepted
| Item | Reason | Plan to Address |
|------|--------|-----------------|
| | | |

### Decision
- [ ] ✅ PASS - Proceed to Planning
- [ ] 🔄 CONDITIONAL - Fix items: _______________
- [ ] ❌ FAIL - Redesign needed: _______________

### Signatures
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Tech Lead | | | |
| Architect | | | |
| Security | | | |
```

---

## 📊 Gate 3: Plan Review

```markdown
# Gate 3 Checklist: Planning Review
## Project: [Nom du projet]
## Date: [YYYY-MM-DD]
## Reviewer: [Nom]

### Task Breakdown
- [ ] Features → Epics → Stories → Tasks
- [ ] Toutes les tâches identifiées
- [ ] Tâches de taille raisonnable (< 2 jours)
- [ ] Technical tasks incluses (setup, infra)
- [ ] Testing tasks incluses

### Dependencies
- [ ] Dépendances entre tâches mappées
- [ ] Dépendances externes identifiées
- [ ] Chemin critique calculé
- [ ] Blockers potentiels notés

### Estimates
- [ ] Toutes les tâches estimées
- [ ] Estimation en story points ou heures
- [ ] Buffer de 20% inclus
- [ ] Validation par l'équipe
- [ ] Vélocité historique considérée

### Resource Allocation
- [ ] Développeurs assignés
- [ ] Pas de surcharge (< 80% capacité)
- [ ] Skills match tasks
- [ ] Congés/absences considérés
- [ ] Backup identifié

### Risks
- [ ] Risques identifiés
- [ ] Impact et probabilité évalués
- [ ] Plan de mitigation
- [ ] Owner pour chaque risque
- [ ] Triggers définis

### Definition of Done
- [ ] DoD défini et partagé
- [ ] Critères de qualité clairs
- [ ] Review process défini

---

### Sprint/Iteration Plan
| Sprint | Goals | Stories |
|--------|-------|---------|
| 1 | | |
| 2 | | |
| 3 | | |

### Decision
- [ ] ✅ PASS - Proceed to Implementation
- [ ] 🔄 CONDITIONAL - Adjust: _______________
- [ ] ❌ FAIL - Re-plan: _______________

### Signatures
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Tech Lead | | | |
| PM | | | |
```

---

## 💻 Gate 4: Code Review

```markdown
# Gate 4 Checklist: Code Review
## PR: [#XXX] - [Title]
## Author: [Nom]
## Reviewer: [Nom]
## Date: [YYYY-MM-DD]

### Automated Checks
- [ ] ✅ Build passes
- [ ] ✅ Unit tests pass
- [ ] ✅ Integration tests pass
- [ ] ✅ Lint/format clean
- [ ] ✅ Coverage threshold met (>80%)
- [ ] ✅ Security scan clean
- [ ] ✅ No new vulnerabilities

### Functionality
- [ ] Implements spec correctly
- [ ] Acceptance criteria met
- [ ] Happy path works
- [ ] Error cases handled
- [ ] Edge cases covered

### Code Quality
- [ ] Code lisible et compréhensible
- [ ] Nommage clair et cohérent
- [ ] Pas de code dupliqué (DRY)
- [ ] Fonctions/méthodes courtes
- [ ] Single responsibility respecté

### Architecture
- [ ] Patterns du projet respectés
- [ ] Separation of concerns
- [ ] Couplage faible
- [ ] Injection de dépendances si applicable

### Testing
- [ ] Tests unitaires présents
- [ ] Tests d'intégration si API
- [ ] Tests des edge cases
- [ ] Mocks appropriés
- [ ] Tests lisibles et maintenables

### Security
- [ ] Pas de secrets dans le code
- [ ] Input validation présente
- [ ] Output encoding correct
- [ ] Pas de vulnérabilités introduites
- [ ] Auth/authz correct

### Performance
- [ ] Pas de N+1 queries
- [ ] Indexes appropriés
- [ ] Caching où nécessaire
- [ ] Pas de memory leaks
- [ ] Algorithmes optimaux

### Documentation
- [ ] Code auto-documenté ou commenté
- [ ] JSDoc/TSDoc pour APIs publiques
- [ ] README mis à jour si nécessaire
- [ ] Changelog entry si breaking change

---

### Review Comments
[Ajouter des commentaires de review ici]

### Required Changes
| File | Line | Comment |
|------|------|---------|
| | | |

### Decision
- [ ] ✅ APPROVE - Ready to merge
- [ ] 🔄 REQUEST CHANGES - See comments above
- [ ] ❌ REJECT - Major issues: _______________
```

---

## ✅ Gate 5: QA Approval

```markdown
# Gate 5 Checklist: QA Approval
## Release: [Version]
## Date: [YYYY-MM-DD]
## QA Lead: [Nom]

### Test Execution Summary
| Type | Total | Passed | Failed | Skipped |
|------|-------|--------|--------|---------|
| Unit | | | | |
| Integration | | | | |
| E2E | | | | |
| Manual | | | | |

### Automated Tests
- [ ] Unit tests: 100% pass
- [ ] Integration tests: 100% pass
- [ ] E2E tests: 100% pass
- [ ] Regression suite: 100% pass

### Manual Testing
- [ ] Happy path tested
- [ ] Error scenarios tested
- [ ] Edge cases tested
- [ ] Cross-browser tested (if web)
- [ ] Mobile tested (if applicable)
- [ ] Accessibility tested

### Bug Status
| Severity | Open | Fixed | Won't Fix |
|----------|------|-------|-----------|
| Critical | | | |
| Major | | | |
| Minor | | | |
| Trivial | | | |

- [ ] 0 Critical bugs open
- [ ] 0 Major bugs open
- [ ] Minor bugs tracked for next release

### Performance Testing
- [ ] Load test executed
- [ ] Response times within SLA
- [ ] P95 < [X]ms
- [ ] Error rate < 1%
- [ ] No resource leaks detected

### Security Testing
- [ ] SAST scan clean
- [ ] DAST scan clean
- [ ] Dependency audit clean
- [ ] Pen test passed (if required)

### User Acceptance
- [ ] UAT completed
- [ ] All acceptance criteria validated
- [ ] Stakeholder feedback incorporated
- [ ] Sign-off obtained

---

### Known Issues
| Issue | Severity | Workaround | Planned Fix |
|-------|----------|------------|-------------|
| | | | |

### Decision
- [ ] ✅ PASS - Ready for Release
- [ ] 🔄 CONDITIONAL - Fix before release: _______________
- [ ] ❌ FAIL - Not ready: _______________

### Signatures
| Role | Name | Signature | Date |
|------|------|-----------|------|
| QA Lead | | | |
| Product Owner | | | |
```

---

## 🚀 Gate 6: Release Approval

```markdown
# Gate 6 Checklist: Release Approval
## Release: [Version]
## Date: [YYYY-MM-DD]
## Release Manager: [Nom]

### Prerequisites
- [ ] Gate 5 (QA) passed
- [ ] All features complete
- [ ] Documentation ready

### Staging Validation
- [ ] Staging deployment successful
- [ ] Smoke tests pass
- [ ] No new issues found
- [ ] Performance acceptable

### Documentation
- [ ] Release notes finalized
- [ ] Changelog updated
- [ ] User documentation ready
- [ ] API documentation updated
- [ ] Runbook/playbook updated

### Rollback Plan
- [ ] Rollback procedure documented
- [ ] Rollback tested on staging
- [ ] Rollback triggers defined
- [ ] Rollback owner identified

### Operations Readiness
- [ ] Monitoring dashboards ready
- [ ] Alerts configured
- [ ] Log aggregation working
- [ ] On-call team briefed
- [ ] Escalation path confirmed

### Communication
- [ ] Stakeholders notified
- [ ] Support team briefed
- [ ] External comms prepared (if needed)
- [ ] Downtime announced (if any)

### Infrastructure
- [ ] Secrets configured in prod
- [ ] Environment variables set
- [ ] Database migrations ready
- [ ] Feature flags configured
- [ ] CDN cache rules updated

### Final Checks
- [ ] Tag created in git
- [ ] Docker image tagged
- [ ] Artifacts stored
- [ ] Backup verified

---

### Deployment Window
- **Start:** [Date/Time]
- **End:** [Date/Time]
- **Downtime Expected:** [Yes/No - Duration]

### Decision
- [ ] ✅ APPROVED - Deploy to Production
- [ ] 🔄 HOLD - Wait for: _______________
- [ ] ❌ ABORT - Reason: _______________

### Signatures
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Tech Lead | | | |
| Product Owner | | | |
| DevOps | | | |
```

---

## ✨ Gate 7: Post-Deployment Validation

```markdown
# Gate 7 Checklist: Post-Deployment Validation
## Release: [Version]
## Deployed: [Date/Time]
## Validator: [Nom]

### Immediate (0-15 minutes)
- [ ] Application accessible
- [ ] Health endpoints responding
- [ ] Smoke tests passing
- [ ] No error spikes in logs
- [ ] Response times normal

### Short-term (15 min - 1 hour)
- [ ] Business metrics normal
- [ ] No user complaints
- [ ] No alerts triggered
- [ ] Memory usage stable
- [ ] CPU usage normal

### Canary Metrics (if applicable)
- [ ] Error rate same as stable
- [ ] Latency same as stable
- [ ] No anomalies detected
- [ ] Ready for full rollout

### Stabilization (1-24 hours)
- [ ] No memory leaks detected
- [ ] Performance consistent
- [ ] No degradation over time
- [ ] No bugs reported

### Closeout
- [ ] Rollback window closed
- [ ] Release tag finalized
- [ ] Metrics baseline updated
- [ ] Success communicated
- [ ] Retrospective scheduled

---

### Issues Encountered
| Time | Issue | Action Taken | Resolution |
|------|-------|--------------|------------|
| | | | |

### Decision
- [ ] ✅ STABLE - Release successful
- [ ] ⚠️ MONITORING - Under observation: _______________
- [ ] ❌ ROLLBACK - Initiated: _______________

### Sign-off
| Role | Name | Time | Status |
|------|------|------|--------|
| On-call | | | |
| Tech Lead | | | |
```

---

🚦 **Rappel:** Ces checklists sont des minimums. Adaptez-les aux besoins spécifiques de votre projet.

# 🚀 Template SDD - Specification Driven Development

> **Un framework complet pour le développement agentique optimisé**

## 📋 Vue d'ensemble

Ce template implémente la méthodologie **SDD (Specification Driven Development)** combinée aux meilleures pratiques de développement agentique, incluant :

- **OODA Loop** (Observe, Orient, Decide, Act)
- **12-Factor Agents**
- **Context Engineering**
- **TDD/BDD pour l'ère IA**
- **Gated Phases Workflow**

## 🎯 Philosophie SDD

> "La spécification devient la source de vérité, et le code devient l'output, pas le point de départ."

Le SDD sépare les phases de **conception** et **d'implémentation** :

1. **SPECIFY** - Définir les exigences et comportements attendus
2. **PLAN** - Créer un plan d'implémentation détaillé
3. **TASKS** - Décomposer en tâches atomiques
4. **IMPLEMENT** - Générer le code guidé par les specs
5. **VERIFY** - Valider contre les spécifications

## 📁 Structure du Template

```
TemplateSDD/
├── README.md                          # Ce fichier
├── AGENTS.md                          # Instructions pour agents IA (standard)
├── CLAUDE.md                          # Instructions spécifiques Claude Code
│
├── 01-PROJECT/
│   ├── 00-north-star.md              # Vision et objectifs fondamentaux
│   ├── 01-project-brief.md           # Brief projet détaillé
│   ├── 02-prd.md                     # Product Requirements Document
│   └── 03-executive-summary.md       # Résumé exécutif
│
├── 02-SPECIFICATIONS/
│   ├── 01-functional-specs.md        # Spécifications fonctionnelles
│   ├── 02-technical-specs.md         # Spécifications techniques
│   ├── 03-api-specs.md               # Spécifications API (OpenAPI)
│   ├── 04-data-models.md             # Modèles de données
│   └── 05-acceptance-criteria.md     # Critères d'acceptation BDD
│
├── 03-ARCHITECTURE/
│   ├── 01-system-design.md           # Architecture système globale
│   ├── 02-component-design.md        # Design des composants
│   ├── 03-integration-design.md      # Design d'intégration
│   ├── 04-security-design.md         # Design sécurité
│   ├── 05-deployment-design.md       # Design déploiement
│   └── 06-adr-template.md            # Architecture Decision Records
│
├── 04-METHODOLOGY/
│   ├── 01-ooda-loop.md               # Guide OODA Loop
│   ├── 02-development-workflow.md    # Workflow de développement SDD
│   ├── 03-gates-methodology.md       # Méthodologie des Gates
│   ├── 04-context-engineering.md     # Guide Context Engineering
│   └── 05-12-factor-agents.md        # 12 Facteurs pour Agents IA
│
├── 05-TESTS/
│   ├── 01-test-strategy.md           # Stratégie de test
│   ├── 02-test-plan.md               # Plan de test détaillé
│   └── 03-test-cases.md              # Cas de test BDD
│
├── 06-GATES/
│   ├── 01-gate-definitions.md        # Définition des Gates
│   └── 02-gate-checklists.md         # Checklists de validation
│
├── 07-TASKS/
│   ├── 01-task-template.md           # Template de tâche atomique
│   └── 02-task-tracking.md           # Suivi des tâches
│
└── 08-BEST-PRACTICES/
    ├── best-practices.md             # Bonnes pratiques générales
    └── cursor-rules.md               # Règles pour Cursor AI
```

## 🔄 Workflow SDD + OODA Loop

```
┌─────────────────────────────────────────────────────────────────┐
│                        OODA LOOP                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐ │
│   │ OBSERVE  │───▶│  ORIENT  │───▶│  DECIDE  │───▶│   ACT    │ │
│   └──────────┘    └──────────┘    └──────────┘    └──────────┘ │
│        │                                                  │      │
│        └──────────────────◀───────────────────────────────┘      │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                     SDD PHASES                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  SPECIFY ──▶ PLAN ──▶ TASKS ──▶ IMPLEMENT ──▶ VERIFY            │
│     │         │        │           │            │               │
│     └─────────┴────────┴───────────┴────────────┘               │
│              (Itération continue via OODA)                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 🚦 Gates et Checkpoints

Chaque transition de phase nécessite une **validation humaine** (Approval Gate) :

| Phase | Gate | Critères de passage |
|-------|------|---------------------|
| SPECIFY → PLAN | 🚦 Spec Review | Specs complètes et validées |
| PLAN → TASKS | 🚦 Plan Approval | Plan réalisable approuvé |
| TASKS → IMPLEMENT | 🚦 Task Review | Tâches atomiques définies |
| IMPLEMENT → VERIFY | 🚦 Code Review | Code répond aux specs |
| VERIFY → DONE | 🚦 Final Approval | Tous tests passent |

## 🛠️ Utilisation

### 1. Initialisation du projet
```bash
# Copier le template dans votre projet
cp -r TemplateSDD/ votre-projet/.sdd/
```

### 2. Configurer l'AGENTS.md
Personnaliser le fichier `AGENTS.md` avec vos conventions et contraintes.

### 3. Démarrer avec la North Star
Commencer par définir la vision dans `01-PROJECT/00-north-star.md`

### 4. Suivre le workflow SDD
Progresser à travers les phases en respectant les gates.

## 📚 Documentation Associée

- [OODA Loop Guide](./04-METHODOLOGY/01-ooda-loop.md)
- [12-Factor Agents](./04-METHODOLOGY/05-12-factor-agents.md)
- [Context Engineering](./04-METHODOLOGY/04-context-engineering.md)
- [Gates Methodology](./04-METHODOLOGY/03-gates-methodology.md)
- [ADR Template](./03-ARCHITECTURE/06-adr-template.md)
- [Best Practices](./08-BEST-PRACTICES/best-practices.md)

## 🤖 Compatibilité Agents IA

Ce template est optimisé pour :

- **Claude Code** (Anthropic)
- **GitHub Copilot** (Coding Agent)
- **Cursor** (AI IDE)
- **Kiro** (AWS)
- **Gemini CLI** (Google)
- **OpenAI Codex**

## 📖 Références

- [Spec-Driven Development - ThoughtWorks](https://www.thoughtworks.com)
- [12-Factor Agents](https://github.com/humanlayer/12-factor-agents)
- [OODA Loop - John Boyd](https://en.wikipedia.org/wiki/OODA_loop)
- [Context Engineering](https://www.kubiya.ai/blog/context-engineering-ai-agents)
- [AGENTS.md Standard](https://agents.md)

---

**Version:** 1.0.0  
**Dernière mise à jour:** Janvier 2026  
**Licence:** MIT

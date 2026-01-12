# 🧠 Context Engineering

> **L'art de structurer le contexte pour les LLM**

---

## 📋 Introduction

Le **Context Engineering** est la discipline de conception et structuration de toutes les informations qui alimentent un modèle de langage (LLM) pour maximiser la fiabilité et la pertinence de ses réponses.

### Définition

> "Context engineering is the art and science of filling the context window with the right information for the next step"
> — Andrej Karpathy

---

## 🧩 Composants du Contexte

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        CONTEXT WINDOW                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                      SYSTEM PROMPT                               │   │
│   │  • Identity & Role                                               │   │
│   │  • Instructions                                                  │   │
│   │  • Rules & Constraints                                           │   │
│   │  • Output Format                                                 │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                      STATIC CONTEXT                              │   │
│   │  • Project documentation                                         │   │
│   │  • Coding standards                                              │   │
│   │  • API references                                                │   │
│   │  • Domain knowledge                                              │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                      DYNAMIC CONTEXT                             │   │
│   │  • Current file content                                          │   │
│   │  • Recent changes                                                │   │
│   │  • Tool outputs                                                  │   │
│   │  • Search results                                                │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                      CONVERSATION HISTORY                        │   │
│   │  • Previous messages                                             │   │
│   │  • Decisions made                                                │   │
│   │  • Clarifications                                                │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                      USER QUERY                                  │   │
│   │  • Current request                                               │   │
│   │  • Attachments                                                   │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Types de Contexte

### 1. System Prompt (Instructions)

Le system prompt définit qui est l'agent et comment il doit se comporter.

```markdown
# System Prompt Template

## Identity
You are [ROLE] for [PROJECT].

## Core Responsibilities
1. [Responsibility 1]
2. [Responsibility 2]
3. [Responsibility 3]

## Rules
- ALWAYS: [mandatory behaviors]
- NEVER: [forbidden behaviors]
- PREFER: [preferred approaches]

## Output Format
[How to structure responses]

## Error Handling
[How to handle errors and edge cases]
```

### 2. Static Context (Knowledge)

Informations qui changent rarement et définissent le cadre du projet.

| Type | Exemples | Format |
|------|----------|--------|
| **Project Docs** | README, Architecture | Markdown |
| **Coding Standards** | Style guides, conventions | Markdown |
| **API References** | OpenAPI specs | YAML/JSON |
| **Domain Knowledge** | Business rules, glossary | Markdown |
| **Examples** | Code samples, patterns | Code |

### 3. Dynamic Context (State)

Informations qui changent fréquemment pendant l'exécution.

| Type | Source | Refresh |
|------|--------|---------|
| **Current Files** | Editor | Real-time |
| **Search Results** | Code search | Per query |
| **Tool Outputs** | Terminal, tests | Per execution |
| **Git State** | Git | Per action |
| **Error Logs** | Runtime | Per error |

### 4. Conversation History (Memory)

Historique des échanges et décisions.

```markdown
## Conversation Memory Types

### Short-term
- Current conversation thread
- Recent tool calls and results
- Active task context

### Long-term
- Decisions made
- Preferences learned
- Patterns identified
```

---

## 🎯 Principes du Context Engineering

### 1. Pertinence (Relevance)

> Inclure seulement ce qui est pertinent pour la tâche courante.

```markdown
## Relevance Checklist

- [ ] Ce contexte est-il nécessaire pour cette tâche?
- [ ] Est-il à jour?
- [ ] Est-il le plus pertinent parmi les options?
```

### 2. Concision (Brevity)

> Être concis sans perdre d'information critique.

```markdown
## Before (verbose)
The user wants to create a function that takes a string as input 
and returns the string with all vowels removed. The function should 
handle both uppercase and lowercase vowels. Edge cases include 
empty strings and strings with no vowels.

## After (concise)
Function: removeVowels(str: string): string
- Remove all vowels (a,e,i,o,u, case-insensitive)
- Handle: empty strings, no-vowel strings
```

### 3. Structure (Organization)

> Organiser le contexte de manière hiérarchique et navigable.

```markdown
## Context Structure Template

### High Priority (Always Include)
1. Current task specification
2. Relevant code files
3. Error messages if any

### Medium Priority (Include if Space)
4. Related documentation
5. Similar examples
6. Recent conversation

### Low Priority (Include if Needed)
7. Full project structure
8. Historical decisions
9. Detailed logs
```

### 4. Fraîcheur (Freshness)

> Prioriser les informations récentes et à jour.

```markdown
## Freshness Rules

1. Tool outputs: Use most recent
2. File content: Refresh before using
3. Git state: Check before operations
4. Conversation: Summarize old, keep recent
```

---

## 🔧 Techniques de Context Engineering

### 1. RAG (Retrieval-Augmented Generation)

```
┌─────────────────────────────────────────────────────────────────┐
│                         RAG PIPELINE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User Query                                                      │
│      │                                                           │
│      ▼                                                           │
│  ┌─────────────────────┐                                        │
│  │  Embed Query        │                                        │
│  └──────────┬──────────┘                                        │
│             │                                                    │
│             ▼                                                    │
│  ┌─────────────────────┐     ┌─────────────────────┐            │
│  │  Vector Search      │────▶│  Knowledge Base     │            │
│  └──────────┬──────────┘     │  (Embeddings)       │            │
│             │                 └─────────────────────┘            │
│             ▼                                                    │
│  ┌─────────────────────┐                                        │
│  │  Retrieve Top-K     │                                        │
│  │  Relevant Docs      │                                        │
│  └──────────┬──────────┘                                        │
│             │                                                    │
│             ▼                                                    │
│  ┌─────────────────────┐                                        │
│  │  Augment Prompt     │                                        │
│  │  with Retrieved     │                                        │
│  └──────────┬──────────┘                                        │
│             │                                                    │
│             ▼                                                    │
│  ┌─────────────────────┐                                        │
│  │  Generate Response  │                                        │
│  └─────────────────────┘                                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Context Prioritization

```python
# Pseudo-code pour prioriser le contexte

def prioritize_context(available_context, max_tokens):
    prioritized = []
    current_tokens = 0
    
    # Trier par priorité
    sorted_context = sorted(
        available_context, 
        key=lambda x: x.priority, 
        reverse=True
    )
    
    for item in sorted_context:
        item_tokens = count_tokens(item.content)
        if current_tokens + item_tokens <= max_tokens:
            prioritized.append(item)
            current_tokens += item_tokens
        else:
            # Essayer de résumer si important
            if item.priority >= HIGH:
                summary = summarize(item.content)
                summary_tokens = count_tokens(summary)
                if current_tokens + summary_tokens <= max_tokens:
                    prioritized.append(summary)
                    current_tokens += summary_tokens
    
    return prioritized
```

### 3. Context Windowing

```markdown
## Sliding Window Technique

### Pour les longues conversations:

1. Garder le system prompt (fixe)
2. Garder les N derniers messages
3. Résumer les messages plus anciens
4. Conserver les décisions importantes

### Implémentation:
```

```python
def window_conversation(messages, max_context_tokens):
    system = messages[0]  # Toujours garder
    
    # Essayer de garder le maximum de messages récents
    recent_messages = []
    token_count = count_tokens(system)
    
    for msg in reversed(messages[1:]):
        msg_tokens = count_tokens(msg)
        if token_count + msg_tokens <= max_context_tokens:
            recent_messages.insert(0, msg)
            token_count += msg_tokens
        else:
            # Résumer les anciens messages
            old_messages = messages[1:len(messages) - len(recent_messages)]
            summary = summarize_conversation(old_messages)
            break
    
    return [system, summary] + recent_messages
```

### 4. Context Injection Points

```markdown
## When to Inject Context

### Before Task Start
- Project documentation
- Relevant specifications
- Coding standards

### During Task
- File contents on demand
- Search results
- Error outputs

### After Tool Use
- Tool execution results
- Test outputs
- Build logs
```

---

## 📐 AGENTS.md Context

Le fichier AGENTS.md est le contexte statique principal pour les agents.

```markdown
# AGENTS.md Structure

## 1. Identity Section
```
# AI Coding Agent Instructions

You are an AI coding assistant for [PROJECT].
```

## 2. Rules Section
```
## Rules

### DO:
- [Action 1]
- [Action 2]

### DON'T:
- [Forbidden 1]
- [Forbidden 2]
```

## 3. Knowledge Section
```
## Project Knowledge

### Architecture
[Architecture summary]

### Patterns
[Common patterns]
```

## 4. Procedures Section
```
## Standard Procedures

### For New Features:
1. Step 1
2. Step 2

### For Bug Fixes:
1. Step 1
2. Step 2
```
```

---

## 🔄 Context Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       CONTEXT LIFECYCLE                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌─────────────┐                                                        │
│   │   CREATE    │ ◄── Nouvelle session / Nouveau projet                 │
│   └──────┬──────┘                                                        │
│          │                                                               │
│          ▼                                                               │
│   ┌─────────────┐                                                        │
│   │   ENRICH    │ ◄── Ajouter specs, files, search results             │
│   └──────┬──────┘                                                        │
│          │                                                               │
│          ▼                                                               │
│   ┌─────────────┐                                                        │
│   │   PRUNE     │ ◄── Supprimer contenu non pertinent                   │
│   └──────┬──────┘                                                        │
│          │                                                               │
│          ▼                                                               │
│   ┌─────────────┐                                                        │
│   │   COMPRESS  │ ◄── Résumer si trop long                              │
│   └──────┬──────┘                                                        │
│          │                                                               │
│          ▼                                                               │
│   ┌─────────────┐                                                        │
│   │   REFRESH   │ ◄── Mettre à jour avec dernières infos               │
│   └──────┬──────┘                                                        │
│          │                                                               │
│          └──────────────────────────────────────────┐                    │
│                                                     │                    │
│                                                     ▼                    │
│                                              ┌─────────────┐             │
│                                              │   ARCHIVE   │             │
│                                              └─────────────┘             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Métriques de Qualité du Contexte

| Métrique | Description | Cible |
|----------|-------------|-------|
| **Relevance Score** | % du contexte utilisé dans la réponse | > 70% |
| **Token Efficiency** | Tokens utiles / Total tokens | > 80% |
| **Staleness Rate** | % de contexte obsolète | < 10% |
| **Retrieval Precision** | Pertinence des docs RAG | > 85% |
| **Context Hit Rate** | Réponses sans "I don't know" | > 95% |

---

## ✅ Checklist Context Engineering

### Configuration Initiale

- [ ] AGENTS.md créé avec rules claires
- [ ] Specs indexées et accessibles
- [ ] RAG pipeline configuré
- [ ] Context window calculé

### Par Session

- [ ] Contexte pertinent chargé
- [ ] Files critiques inclus
- [ ] Historique résumé si long
- [ ] Tools outputs capturés

### Maintenance

- [ ] Context régulièrement audité
- [ ] Obsolète supprimé
- [ ] Patterns mis à jour
- [ ] Performance mesurée

---

🧠 **Rappel:** Le contexte est le carburant de l'IA. Un bon contexte = de bonnes réponses. Un mauvais contexte = hallucinations et erreurs.

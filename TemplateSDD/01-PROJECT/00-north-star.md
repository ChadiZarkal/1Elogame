# ⭐ North Star - Red or Green Game

> **This document defines the strategic vision and fundamental objectives of the project. Every decision must be challenged against these principles.**

## 🎯 Vision

### Vision Statement
```
Red or Green Game will enable groups of friends (16-26 years old) to play an ultra-simple 
mobile game that creates instant debate and engagement, in a frictionless way, 
resulting in viral social content and memorable party moments.
```

### Core Mantra
> **"Simple, Fast, Viral - without compromising on fluidity."**

---

## 🌟 North Star Metric

### Primary Metric

| Metric | Definition | Target |
|--------|------------|--------|
| **Duels Played per Session** | Average number of duels completed per player session | > 10 duels |

### Secondary Metrics

| Metric | Definition | Target |
|--------|------------|--------|
| Session Duration | Average time spent playing | > 3 minutes |
| Star Rate | % of duels that receive a star | > 30% |
| Streak Achievement | % of players reaching 5+ streak | > 40% |
| Return Rate | % of players returning within 7 days | > 30% |

---

## 🚫 RED LINES (Non-Negotiable)

### 1. ⚡ PERFORMANCE: ZERO LATENCY
**Game fluidity is SACRED.**

- ❌ **FORBIDDEN**: Any solution that introduces perceptible latency
- ❌ Loading time between duels > 200ms = UNACCEPTABLE
- ❌ Choppy animations = FAILURE
- ✅ Player must chain duels without waiting
- ✅ Instant reactivity on click/tap

**Validation Test:** If there's even one second of hesitation between duels due to loading, it's a failure.

---

### 2. � SIMPLICITY: FRICTIONLESS
**The game must be INSTINCTIVE.**

- ❌ No tutorial needed
- ❌ No mandatory user account
- ❌ No complicated configuration
- ✅ Arrive, click, play
- ✅ Minimalist interface: 2 large clickable zones
- ✅ No buttons to search, no complex menus

**Validation Test:** Someone discovering the game must instantly understand how to play, without any explanation.

---

### 3. 🎲 VIRALITY & DEBATE: THE SOUL OF THE GAME
**Content must provoke discussion.**

- ✅ Absurd, quirky, controversial duels
- ✅ Unexpected comparisons between different categories
- ✅ Surprising results
- ✅ Shareable and memorable statistics
- ❌ Bland or predictable content = death of the game

**Validation Test:** If at a party, people don't debate after seeing a duel, the content isn't strong enough.

---

### 4. 🔥 USAGE CONTEXT: PARTY WITH FRIENDS
**Played in groups, not alone in bed.**

- ✅ Phone passing from hand to hand
- ✅ Results commented out loud
- ✅ Festive, quirky, slightly provocative atmosphere
- ❌ Not a "solitary" or "introspective" game
- ❌ Not a serious questionnaire

**Validation Test:** Imagine the game at a student party, at 11pm, after a few drinks. Does it work?

---

## 🎪 Strategic Objectives

### Short term (0-3 months) - MVP
1. **Validate the concept with ~15 real users**
   - Key Result: 70% of players complete at least 10 duels
   - Key Result: At least 30% of duels receive a star
   - Key Result: 95% of votes processed in < 200ms

2. **Create engaging content**
   - Key Result: 200 elements created and categorized
   - Key Result: 50%+ of duels generate memorable debates

### Medium term (3-6 months)
1. **Scale based on feedback**
   - Key Result: Iterate on content based on ELO data
   - Key Result: Identify and amplify viral content patterns

### Long term (6-12 months)
1. **Expand reach**
   - Key Result: Develop sharing features
   - Key Result: Community-contributed content (V2)

---

## 👥 Target Users

### Primary Persona
```yaml
Name: Alex - The Party Starter
Age: 18-24 years old
Context: Student parties, friend gatherings
Objective: Create fun, engaging moments with friends
Pain Points:
  - Boring party games that require too much explanation
  - Games that lose momentum due to slow setup
  - Predictable, non-controversial content
Needs:
  - Instant gratification
  - Content that sparks debate
  - Easy to share results
Behavior:
  - Mobile-first
  - Short attention span
  - Loves surprising statistics
```

### Secondary Personas
```yaml
Name: Jordan - The Content Creator
Role: Social media enthusiast
Objective: Find shareable, viral-worthy content
Interest: Statistics that create controversy/debate
```

---

## 💎 Value Proposition

### Main Problem
> Party games are either too complicated to start, too boring to maintain engagement, or fail to create genuine debate and laughter among friends.

### Solution
> Red or Green Game offers instant, frictionless gameplay where every duel creates debate. Players compare unexpected options and discover what the majority thinks, leading to surprising revelations and endless discussions.

### Key Differentiators
1. **Zero Friction:** No account, no tutorial, instant play
2. **Cross-Category Absurdity:** "Being a policeman" vs "Liking feet" = unexpected viral debates
3. **ELO-Powered Statistics:** Meaningful percentages from day one
4. **Party-Optimized:** Designed for passing the phone around

---

## ⚖️ Decision Matrix

### Golden Rule
**"ALWAYS choose the SIMPLEST solution... unless it impacts PERFORMANCE or USER EXPERIENCE."**

| Criterion | Priority | Action |
|-----------|----------|--------|
| 🚀 Performance/Fluidity | 🔴 CRITICAL | Accept complexity if necessary |
| 🎮 UX/Simplicity | 🔴 CRITICAL | Accept complexity if necessary |
| 🎲 Content Virality | 🟠 MAJOR | Prioritize |
| 🔧 Dev Ease | 🟡 IMPORTANT | Unless negative impact on red criteria |
| 💰 Cost | 🟢 SECONDARY | Minimize reasonably |
| 🔒 Security/GDPR | 🟢 SECONDARY | MVP = test phase, anonymous data |

---

## 🚫 Non-Goals (What we are NOT doing)

1. ❌ **User accounts/Login** - Reason: Adds friction, not needed for MVP
2. ❌ **Personal vote history** - Reason: Complexity without value for party context
3. ❌ **Native mobile app** - Reason: Web is sufficient and faster to deploy
4. ❌ **Serious quiz/educational content** - Reason: Not aligned with party vibe
5. ❌ **Advanced analytics (Mixpanel, etc.)** - Reason: MVP simplicity
6. ❌ **Sound/Music** - Reason: Party context already noisy
7. ❌ **Community contribution system** - Reason: V2 feature
8. ❌ **Monetization/Ads** - Reason: Test concept first
9. ❌ **Full GDPR compliance** - Reason: Anonymous data only for MVP
10. ❌ **Offline mode** - Reason: Always connected context

---

## 📊 Critères de Succès

### Succès MVP
- [ ] [Critère 1]
- [ ] [Critère 2]
- [ ] [Critère 3]

### Succès V1
- [ ] [Critère 1]
- [ ] [Critère 2]

### Succès Long Terme
- [ ] [Critère 1]

---

## 🔮 Principes Directeurs

Ces principes guident toutes les décisions :

1. **[Principe 1]:** [Explication]
   > *Exemple: "Spec First - Toujours spécifier avant de coder"*

2. **[Principe 2]:** [Explication]
   > *Exemple: "Human in the Loop - Validation humaine aux points critiques"*

3. **[Principe 3]:** [Explication]
   > *Exemple: "Iterate Fast - Préférer les petites itérations fréquentes"*

---

## 🗺️ Roadmap Visuelle

```
Q1 2026          Q2 2026          Q3 2026          Q4 2026
    │                │                │                │
    ▼                ▼                ▼                ▼
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│   MVP   │───▶│   V1    │───▶│   V2    │───▶│  Scale  │
│ [Focus] │    │ [Focus] │    │ [Focus] │    │ [Focus] │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
```

---

## 📝 Notes et Contexte Additionnel

<!-- Ajoutez ici tout contexte important pour comprendre la vision -->

### Historique
[Si applicable, contexte historique]

### Contraintes Externes
[Contraintes marché, réglementaires, etc.]

### Opportunités
[Opportunités identifiées]

---

## 🔄 Revue et Mise à Jour

| Date | Version | Auteur | Changements |
|------|---------|--------|-------------|
| [Date] | 1.0 | [Auteur] | Création initiale |

---

**Ce document doit être revu et validé avant de commencer les spécifications détaillées.**

🚦 **Gate:** Validation de la North Star requise avant de procéder.

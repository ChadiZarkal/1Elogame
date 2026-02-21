# 🚩 Red Flag Games — Architecture Documentation

## Vue d'ensemble

Red Flag Games est une application web de type "party game social" construite avec **Next.js 16** (App Router, Turbopack), **TypeScript**, **Tailwind CSS 4**, **Zustand**, et **Supabase**.

---

## Table des matières

1. [Stack technique](#stack-technique)
2. [Architecture des dossiers](#architecture-des-dossiers)
3. [Flux de données](#flux-de-données)
4. [Modules clés](#modules-clés)
5. [Tests](#tests)
6. [API Routes](#api-routes)
7. [Déploiement](#déploiement)

---

## Stack technique

| Couche | Technologie | Version |
|--------|-------------|---------|
| Framework | Next.js (App Router) | 16.1.1 |
| Langage | TypeScript | 5+ |
| Styles | Tailwind CSS | 4.x |
| State | Zustand | 5.0.10 |
| Animations | Framer Motion | 12.x |
| BDD | Supabase (Postgres) | cloud |
| IA | Google Gemini / Vertex AI | - |
| Tests | Vitest + Testing Library | 4.0.18 |
| Validation | Zod | - |

---

## Architecture des dossiers

```
src/
├── app/                    # Pages & API routes (Next.js App Router)
│   ├── page.tsx           # Page d'accueil (Hub des 3 jeux)
│   ├── jeu/               # Red Flag Duel
│   │   ├── page.tsx       # Formulaire de profil
│   │   └── jouer/page.tsx # Interface de jeu
│   ├── flagornot/         # Flag or Not (IA Judge)
│   │   ├── constants.ts   # Types & constantes du jeu
│   │   ├── useFlagOrNot.ts # Hook principal (239 lignes)
│   │   ├── IdlePhase.tsx  # Phase de saisie
│   │   ├── LoadingPhase.tsx # Phase de chargement
│   │   └── RevealPhase.tsx # Phase de révélation
│   ├── classement/        # Leaderboard
│   ├── admin/             # Panel d'administration (7 pages)
│   └── api/               # 14 API routes
│       ├── duel/          # Sélection de paire
│       ├── vote/          # Soumission de vote + ELO
│       ├── leaderboard/   # Classement
│       ├── feedback/      # star/thumbs
│       ├── flagornot/     # judge + community
│       ├── admin/         # login, stats, algorithm, elements
│       ├── analytics/     # Session tracking
│       └── stats/         # Stats publiques
├── components/
│   ├── ui/                # Composants UI réutilisables (9 composants)
│   │   ├── index.ts       # Barrel exports
│   │   ├── Button.tsx, Loading.tsx, Shimmer.tsx
│   │   ├── AnimatedBackground.tsx, AnimatedCounter.tsx
│   │   ├── CategoryBadge.tsx, ErrorBoundary.tsx
│   │   └── AnalyticsProvider.tsx
│   ├── game/              # Composants spécifiques au jeu (7 composants)
│   │   ├── index.ts       # Barrel exports
│   │   ├── DuelInterface.tsx (main game loop)
│   │   ├── ResultDisplay.tsx (466 lignes — le plus complexe)
│   │   ├── ProfileForm.tsx, GameModeMenu.tsx
│   │   ├── CompactResult.tsx, AllDuelsExhausted.tsx
│   │   └── StreakDisplay.tsx
│   ├── admin/             # Composants admin
│   │   └── AdminNav.tsx
│   └── magicui/           # Composants décoratifs (Magic UI)
│       ├── AnimatedGradientText.tsx, BorderBeam.tsx
│       ├── FlipWords.tsx, Sparkles.tsx
│       └── index.ts
├── lib/                   # Utilitaires & logique métier (14 modules)
│   ├── index.ts           # Barrel exports
│   ├── elo.ts             # Calcul ELO (K-factor adaptatif)
│   ├── algorithm.ts       # Sélection de paires de duel
│   ├── algorithmConfig.ts # Configuration dynamique de l'algo
│   ├── analytics.ts       # Tracking côté client
│   ├── gemini.ts          # Intégration Vertex AI / Gemini
│   ├── hooks.ts           # Hooks custom (reduceMotion, haptics)
│   ├── mockData.ts        # Données de test (mode mock)
│   ├── rateLimit.ts       # Rate limiter in-memory
│   ├── sanitize.ts        # Sanitize des inputs utilisateur
│   ├── session.ts         # Gestion de session localStorage
│   ├── supabase.ts        # Client Supabase
│   ├── utils.ts           # cn(), formatNumber()
│   ├── validations.ts     # Schémas Zod
│   └── adminAuth.ts       # Auth admin (bcrypt + JWT)
├── stores/
│   └── gameStore.ts       # Store Zustand (395 lignes)
├── config/
│   └── categories.ts      # Config des 4 catégories
├── types/
│   ├── index.ts           # Barrel exports
│   ├── database.ts        # Types BDD (Element, SexeVotant, etc.)
│   ├── game.ts            # Types jeu (Duel, VoteResult, etc.)
│   └── api.ts             # Types API (requests/responses)
└── test/
    └── setup.tsx           # Config globale Vitest + mocks
```

---

## Flux de données

### Duel Red Flag
```
1. ProfileForm → setProfile(sex, age) dans Zustand
2. DuelInterface → GET /api/duel (sélection paire)
3. Utilisateur clique → POST /api/vote (calcul ELO)
4. ResultDisplay → affichage pourcentages + streak
5. POST /api/feedback (optionnel: star/thumbs)
```

### Flag or Not
```
1. Saisie texte → POST /api/flagornot/judge
2. Cascade IA: Gemini → OpenAI → fallback local
3. Résultat: verdict (red/green) + justification
4. POST /api/flagornot/community (archivage)
```

---

## Modules clés

### `gameStore.ts` (Zustand)
- State: profile, currentDuel, result, history, streak, gameMode
- Actions: setProfile, fetchDuel, submitVote, submitFeedback, setGameMode
- Hydratation depuis localStorage pour persistence de session

### `elo.ts`
- Algorithme ELO adaptatif avec K-factor variable
- Segments: global + par sexe (homme/femme) + par tranche d'âge

### `algorithm.ts`
- Sélection de paires avec pondération (closeness, recency, participation)
- Anti-repeat: cooldown circulaire + max-appearances par session

### `validations.ts` (Zod)
- 4 catégories valides : `sexe`, `lifestyle`, `quotidien`, `bureau`
- Schémas pour vote, duel, feedback, élément, algorithme

---

## Tests

### Statistiques actuelles
- **48 fichiers de test**
- **493 tests** — tous ✅
- **Couverture** : lib (100%), API routes (100%), composants (95%+), pages (principales)

### Organisation des tests
```
src/
├── lib/__tests__/          # Tests unitaires (160+ tests)
├── app/api/__tests__/      # Tests routes API (95 tests)
├── app/__tests__/          # Tests pages (19 tests)
├── app/flagornot/__tests__/ # Tests hook useFlagOrNot (10 tests)
├── components/ui/__tests__/ # Tests composants UI (24 tests)
├── components/game/__tests__/ # Tests composants jeu (42 tests)
├── components/admin/__tests__/ # Tests admin (5 tests)
├── components/__tests__/   # Tests provider (7 tests)
├── stores/__tests__/       # Tests Zustand (31 tests)
└── config/__tests__/       # Tests config (10 tests)
```

### Patterns de test
- **API routes** : `vi.resetModules()` + `process.env.NEXT_PUBLIC_MOCK_MODE` + import dynamique
- **Composants** : `@testing-library/react` avec mocks framer-motion dans setup.tsx
- **Hooks** : `renderHook()` de Testing Library
- **Gemini** : `vi.hoisted()` pour mocks stables + class-based MockVertexAI

---

## API Routes

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/duel` | GET | Sélection paire de duel |
| `/api/vote` | POST | Soumission vote + calcul ELO |
| `/api/leaderboard` | GET | Classement (sort, filter, segment) |
| `/api/feedback` | POST | Feedback star/thumbs |
| `/api/flagornot/judge` | POST | Jugement IA (cascade) |
| `/api/flagornot/community` | GET/POST | Soumissions communauté |
| `/api/stats/public` | GET | Stats agrégées publiques |
| `/api/analytics/session` | POST/GET | Tracking session |
| `/api/admin/login` | POST | Auth admin (bcrypt) |
| `/api/admin/stats` | GET | Stats admin détaillées |
| `/api/admin/algorithm` | GET/POST | Config algorithme |
| `/api/admin/elements` | GET/POST | CRUD éléments |
| `/api/admin/elements/[id]` | PATCH/DELETE | Édition élément |
| `/api/admin/demographics` | GET | Données démographiques |

---

## Déploiement

- **Build** : `next build` (Turbopack)
- **Tests** : `npx vitest run`
- **Lint** : `npx eslint .`
- **Type check** : `npx tsc --noEmit`
- **Mode mock** : `NEXT_PUBLIC_MOCK_MODE=true` (pas de Supabase requis)

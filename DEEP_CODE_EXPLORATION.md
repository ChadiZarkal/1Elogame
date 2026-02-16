# Deep Code Exploration — Plan v3.8.0
## 150+ Étapes OODA (Observe → Orient → Decide → Act)

**Objectif**: Exploration profonde, nettoyage, upgrade, tests, documentation

---

## PHASE 1 — Infrastructure & Testing Setup (Étapes 1-10)

| # | Étape | Type | Fichiers |
|---|-------|------|----------|
| 1 | Installer Vitest + @testing-library/react | Infra | package.json |
| 2 | Configurer vitest.config.ts | Infra | vitest.config.ts |
| 3 | Configurer test setup (jsdom, mocks) | Infra | src/test/setup.ts |
| 4 | Ajouter scripts npm test/test:watch | Infra | package.json |
| 5 | Build de vérification (0 erreurs) | Verify | - |
| 6 | Lancer le serveur dev + screenshots baseline | Verify | scripts/screenshot.js |
| 7 | Créer premier test trivial (smoke test) | Test | src/lib/utils.test.ts |
| 8 | Vérifier le pipeline test passe | Verify | - |
| 9 | Créer .env.test avec mock mode | Infra | .env.test |
| 10 | Documenter la structure de test | Doc | - |

## PHASE 2 — Types & Validations (Étapes 11-25)

| # | Étape | Type | Fichiers |
|---|-------|------|----------|
| 11 | Supprimer `| string` de Categorie type | Fix | types/database.ts |
| 12 | Tests unitaires types/validation schemas | Test | lib/validations.test.ts |
| 13 | Fix categorieSchema alignment avec DB type | Fix | lib/validations.ts |
| 14 | Fix adminLoginSchema (retirer email inutile) | Fix | lib/validations.ts |
| 15 | Ajouter max-length sur seenDuels validation | Fix | lib/validations.ts |
| 16 | Supprimer `elo_nonbinaire` orphelin du type | Fix | types/database.ts |
| 17 | Tests unitaires elo.ts complets | Test | lib/elo.test.ts |
| 18 | Ajouter ELO floor (minimum 100) | Fix | lib/elo.ts |
| 19 | Fix JSDoc `didMatchMajority` param naming | Fix | lib/elo.ts |
| 20 | Tests unitaires algorithm.ts | Test | lib/algorithm.test.ts |
| 21 | Extraire `getPairKey` dupliqué → utils | Refactor | lib/utils.ts, session.ts, algorithm.ts |
| 22 | Tests unitaires session.ts | Test | lib/session.test.ts |
| 23 | Fix admin token storage key mismatch | Fix | session.ts, AdminNav.tsx |
| 24 | Screenshot vérification post-Phase2 | Verify | - |
| 25 | Build vérification + commit | Verify | - |

## PHASE 3 — Lib Cleanup & Documentation (Étapes 26-45)

| # | Étape | Type | Fichiers |
|---|-------|------|----------|
| 26 | Fix env.ts var names → NEXT_PUBLIC_* | Fix | lib/env.ts |
| 27 | Supprimer `validateEnvVars` dupliqué de utils.ts | Refactor | lib/utils.ts |
| 28 | Tests unitaires utils.ts complets | Test | lib/utils.test.ts |
| 29 | Audit `randomDelay` et `sleep` usage | Audit | lib/utils.ts |
| 30 | Supprimer exports morts de utils.ts | Clean | lib/utils.ts |
| 31 | Fix gemini.ts : supprimer import JWT mort | Fix | lib/gemini.ts |
| 32 | Fix gemini.ts : security credential search | Fix | lib/gemini.ts |
| 33 | Tests unitaires gemini.ts (mock Vertex) | Test | lib/gemini.test.ts |
| 34 | Fix supabase.ts non-null assertions | Fix | lib/supabase.ts |
| 35 | Supprimer re-export inutile `createClient` | Clean | lib/supabase.ts |
| 36 | Tests unitaires analytics.ts | Test | lib/analytics.test.ts |
| 37 | Fix analytics mixed storage strategy docs | Doc | lib/analytics.ts |
| 38 | Vérifier trackAIRequest est utilisé | Audit | - |
| 39 | Fix mockData.ts : globalThis pattern | Fix | lib/mockData.ts |
| 40 | Documenter tous les fichiers lib/* avec JSDoc | Doc | lib/*.ts |
| 41 | Tests unitaires config/categories.ts | Test | config/categories.test.ts |
| 42 | Fix emoji corrompu dans categories config | Fix | config/categories.ts |
| 43 | Screenshot vérification post-Phase3 | Verify | - |
| 44 | Build vérification | Verify | - |
| 45 | Commit Phase 3 | Git | - |

## PHASE 4 — Store & State Management (Étapes 46-60)

| # | Étape | Type | Fichiers |
|---|-------|------|----------|
| 46 | Supprimer duplication GameMode/GameModeSelection | Refactor | gameStore.ts, GameModeMenu.tsx |
| 47 | Supprimer DEFAULT_GAME_MODE dupliqué | Refactor | gameStore.ts, GameModeMenu.tsx |
| 48 | Tests unitaires gameStore actions | Test | stores/gameStore.test.ts |
| 49 | Ajouter AbortController aux fetchs du store | Fix | stores/gameStore.ts |
| 50 | Fix optimistic streak update race | Fix | stores/gameStore.ts |
| 51 | Réduire MAX_HISTORY si nécessaire | Optimize | stores/gameStore.ts |
| 52 | Documenter gameStore avec JSDoc | Doc | stores/gameStore.ts |
| 53 | Tests intégration store + session | Test | stores/gameStore.test.ts |
| 54 | Screenshot post-Phase4 | Verify | - |
| 55 | Build vérification | Verify | - |
| 56 | Commit Phase 4 | Git | - |
| 57-60 | Buffer pour issues découvertes | - | - |

## PHASE 5 — UI Components (Étapes 61-85)

| # | Étape | Type | Fichiers |
|---|-------|------|----------|
| 61 | Tests Button.tsx | Test | ui/Button.test.tsx |
| 62 | Fix Button loading text configurable | Fix | ui/Button.tsx |
| 63 | Tests Loading.tsx + aria attributes | Test | ui/Loading.test.tsx |
| 64 | Ajouter role="status" + aria-live à Loading | Fix | ui/Loading.tsx |
| 65 | Tests ErrorBoundary.tsx | Test | ui/ErrorBoundary.test.tsx |
| 66 | Fix ErrorBoundary reset vs full reload | Fix | ui/ErrorBoundary.tsx |
| 67 | Tests DuelInterface.tsx | Test | game/DuelInterface.test.tsx |
| 68 | Fix DuelInterface: utiliser cn() pour classes | Fix | game/DuelInterface.tsx |
| 69 | Fix DuelInterface: afficher category label | Fix | game/DuelInterface.tsx |
| 70 | Tests ProfileForm.tsx | Test | game/ProfileForm.test.tsx |
| 71 | Fix ProfileForm: role="radiogroup" | Fix | game/ProfileForm.tsx |
| 72 | Tests ResultDisplay.tsx | Test | game/ResultDisplay.test.tsx |
| 73 | Fix ResultDisplay: extraire share logic | Refactor | game/ResultDisplay.tsx |
| 74 | Fix ResultDisplay: auto-advance 4s → 6s | Fix | game/ResultDisplay.tsx |
| 75 | Tests StreakDisplay.tsx | Test | game/StreakDisplay.test.tsx |
| 76 | Tests CompactResult.tsx | Test | game/CompactResult.test.tsx |
| 77 | Tests GameModeMenu.tsx | Test | game/GameModeMenu.test.tsx |
| 78 | Fix GameModeMenu: Escape key handler | Fix | game/GameModeMenu.tsx |
| 79 | Tests AllDuelsExhausted.tsx | Test | game/AllDuelsExhausted.test.tsx |
| 80 | Fix AllDuelsExhausted: URL configurable | Fix | game/AllDuelsExhausted.tsx |
| 81 | Tests AdminNav.tsx | Test | admin/AdminNav.test.tsx |
| 82 | Tests AnalyticsProvider.tsx | Test | AnalyticsProvider.test.tsx |
| 83 | Screenshot vérification post-Phase5 | Verify | - |
| 84 | Build vérification | Verify | - |
| 85 | Commit Phase 5 | Git | - |

## PHASE 6 — API Routes Security & Quality (Étapes 86-110)

| # | Étape | Type | Fichiers |
|---|-------|------|----------|
| 86 | Fix admin token validation → real check | Security | api/admin/login + all admin routes |
| 87 | Tests api/admin/login | Test | api/admin/login.test.ts |
| 88 | Fix PATCH elements → Zod validation | Security | api/admin/elements/[id] |
| 89 | Tests api/duel/route.ts | Test | api/duel.test.ts |
| 90 | Tests api/vote/route.ts | Test | api/vote.test.ts |
| 91 | Fix vote route `as never` casts | Fix | api/vote/route.ts |
| 92 | Tests api/feedback/route.ts | Test | api/feedback.test.ts |
| 93 | Fix feedback mock → globalThis pattern | Fix | api/feedback/route.ts |
| 94 | Tests api/analytics/session | Test | api/analytics/session.test.ts |
| 95 | Fix analytics GET → require auth | Security | api/analytics/session |
| 96 | Tests api/flagornot/judge | Test | api/flagornot/judge.test.ts |
| 97 | Fix judge: self-referential HTTP → direct call | Fix | api/flagornot/judge |
| 98 | Tests api/flagornot/community | Test | api/flagornot/community.test.ts |
| 99 | Fix community: input sanitization | Security | api/flagornot/community |
| 100 | Tests api/leaderboard | Test | api/leaderboard.test.ts |
| 101 | Fix leaderboard: add cache headers | Perf | api/leaderboard |
| 102 | Tests api/stats/public | Test | api/stats/public.test.ts |
| 103 | Fix stats/public: SQL aggregate au lieu de fetch all | Perf | api/stats/public |
| 104 | Fix api/admin/elements GET : pas fetch tous les votes | Perf | api/admin/elements |
| 105 | Tests api/admin/demographics | Test | api/admin/demographics.test.ts |
| 106 | Fix demographics auth mock mode | Fix | api/admin/demographics |
| 107 | Fix demographics: agrément rate & return rate | Fix | api/admin/demographics |
| 108 | Screenshot vérification post-Phase6 | Verify | - |
| 109 | Build vérification | Verify | - |
| 110 | Commit Phase 6 | Git | - |

## PHASE 7 — Page Components (Étapes 111-135)

| # | Étape | Type | Fichiers |
|---|-------|------|----------|
| 111 | Fix page.tsx: version badge → dynamic | Fix | app/page.tsx |
| 112 | Fix page.tsx: stats fetch error handling | Fix | app/page.tsx |
| 113 | Fix sitemap.ts: real lastModified dates | Fix | app/sitemap.ts |
| 114 | Fix redflag/page.tsx: supprimer unused import | Clean | app/redflag/page.tsx |
| 115 | Fix admin/categories: supprimer Link unused | Clean | admin/categories/page.tsx |
| 116 | Fix admin/elements: supprimer Link unused | Clean | admin/elements/page.tsx |
| 117 | Fix admin/stats: supprimer Link unused | Clean | admin/stats/page.tsx |
| 118 | Fix admin/moderation: supprimer Link unused | Clean | admin/moderation/page.tsx |
| 119 | Fix admin/stats: 10s refresh → 60s | Fix | admin/stats/page.tsx |
| 120 | Fix admin/dashboard: label activity chart as simulated | Fix | admin/dashboard/page.tsx |
| 121 | Fix admin/moderation: implement production mode fetch | Fix | admin/moderation/page.tsx |
| 122 | Fix admin/elements: type `is_starred` properly | Fix | admin/elements/page.tsx |
| 123 | Fix admin/elements: add pagination | Feature | admin/elements/page.tsx |
| 124 | Refactor flagornot/page.tsx: split sub-components | Refactor | flagornot/ |
| 125 | Fix flagornot: enlever random verdict fallback | Fix | flagornot/page.tsx |
| 126 | Fix jeu/jouer: document double fetchNextDuel | Doc | jeu/jouer/page.tsx |
| 127 | Screenshot toutes les pages public | Verify | - |
| 128 | Screenshot toutes les pages admin | Verify | - |
| 129 | Build vérification | Verify | - |
| 130 | Commit Phase 7 | Git | - |
| 131-135 | Buffer pour issues découvertes | - | - |

## PHASE 8 — CSS & Accessibility (Étapes 136-145)

| # | Étape | Type | Fichiers |
|---|-------|------|----------|
| 136 | Audit globals.css: supprimer classes mortes | Clean | globals.css |
| 137 | Supprimer .sr-only dupliqué (Tailwind natif) | Clean | globals.css |
| 138 | Audit animations utilisées | Audit | globals.css |
| 139 | Ajouter aria-labels aux éléments interactifs | A11y | Components |
| 140 | Fix focus-visible styles cohérent | A11y | globals.css |
| 141 | Audit contraste texte (WCAG AA) | A11y | - |
| 142 | Fix min-h-screen / min-h-[100dvh] duplication | Clean | Multiple pages |
| 143 | Screenshot final toutes pages | Verify | - |
| 144 | Build vérification finale | Verify | - |
| 145 | Commit Phase 8 | Git | - |

## PHASE 9 — Documentation & Final (Étapes 146-155+)

| # | Étape | Type | Fichiers |
|---|-------|------|----------|
| 146 | Documenter architecture globale | Doc | ARCHITECTURE.md |
| 147 | Documenter API endpoints | Doc | API.md |
| 148 | Documenter game flow (algorithme, ELO) | Doc | - |
| 149 | Documenter config & deployment | Doc | - |
| 150 | Audit final: eslint --fix | Verify | - |
| 151 | Run full test suite | Verify | - |
| 152 | Screenshot regression finale | Verify | - |
| 153 | Bump version → 3.8.0 | Release | package.json |
| 154 | Commit & tag v3.8.0 | Git | - |
| 155 | Push v3.8.0 | Git | - |

---

**Total: 155 étapes planifiées** + buffers pour découvertes

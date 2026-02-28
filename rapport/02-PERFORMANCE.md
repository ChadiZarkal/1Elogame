# ⚡ Brique 2 — Performance & Web Vitals

**Priorité globale : 🔴 CRITIQUE**  
**Score de préparation : 5/10**

---

## 📊 Données Vercel (Production réelle — Mobile)

| Métrique | P75 | P90 | Verdict | Seuil Google |
|----------|-----|-----|---------|--------------|
| **FCP** | 2.67s | — | ⚠️ Needs Improvement | < 1.8s |
| **LCP** | 1.86s | — | ✅ Great | < 2.5s |
| **INP** | 152ms | — | ✅ Great | < 200ms |
| **CLS** | 0.02 | — | ✅ Great | < 0.1 |
| **FID** | 14ms | — | ✅ Great | < 100ms |
| **TTFB** | 0.21s | — | ✅ Great | < 0.8s |

### 🚨 Routes problématiques

| Route | Métrique | Valeur | Gravité |
|-------|----------|--------|---------|
| `/jeu` | FCP | **12.86s** | 🔴 CATASTROPHIQUE |
| `/ressources/[slug]` | LCP | **15.94s** | 🔴 CATASTROPHIQUE |
| `/jeu/jouer` | LCP | **4.21s** | 🟠 PROBLÉMATIQUE |
| `/jeu/jouer` | TTFB | **1.42s** | 🟠 PROBLÉMATIQUE |
| `/jeu` | CLS | **0.25** | 🟠 PROBLÉMATIQUE |
| `/jeu/jouer` | CLS | **0.22** | 🟠 PROBLÉMATIQUE |
| `/jeu/jouer` | INP | **232ms** | 🟡 LÉGER |

---

## 🔴 Problèmes critiques

### 1. FCP de /jeu à 12.86s (7 data points)
- La page `/jeu` est entièrement client-side (`'use client'`)
- Au chargement : efface le profil → affiche `ProfileForm` → charge `AnimatedBackground`
- Le `AnimatedBackground` crée des éléments DOM animés (orbes gradient + bruit) qui bloquent le premier paint
- Le bundle JS de `/jeu` inclut : Framer Motion + Zustand + Lucide icons + AnimatedBackground
- **Cause probable :** Bundle JS lourd + animations CSS complexes au premier rendu

### 2. LCP de /ressources/[slug] à 15.94s (3 data points)
- Page quiz complète (350+ lignes) entièrement client-side
- Charge 928 lignes de données de meters (`meters-data.ts`) dans le bundle client
- Les questions et résultats sont dans un fichier de config de ~30Ko
- Pas de code splitting sur les phases (intro/quiz/résultat)

### 3. LCP de /jeu/jouer à 4.21s
- Page de jeu principale : charge le duel depuis l'API `fetch('/api/duel')`
- Le LCP attend la réponse API avant d'afficher le contenu significatif
- L'API `/duel` fait : load config + fetch elements + fetch starred pairs + run algorithm
- Chaîne de waterfall : page load → JS parse → hydration → fetch API → render

---

## 🟠 Problèmes haute priorité

### 4. CLS de 0.25 sur /jeu
- Layout shifts causés par :
  - `ProfileForm` qui apparaît après `mounted` state change
  - Orbes `AnimatedBackground` qui s'injectent dynamiquement
  - `GameModeMenu` avec hauteur variable
- Le pattern `useEffect → setMounted(true)` crée un flash où le contenu apparaît soudainement

### 5. CLS de 0.22 sur /jeu/jouer
- Shifts causés par :
  - Chargement asynchrone du duel (squelette → contenu réel)
  - `StreakDisplay` qui apparaît/disparaît selon le streak
  - `CompactResult` history qui s'allonge dynamiquement
  - `FeedbackBar` qui s'affiche après le vote

### 6. TTFB de 1.42s sur /jeu/jouer (depuis Roumanie)
- Route `force-dynamic` côté API
- Latence géographique vers la base Supabase (probablement en Europe de l'Ouest ou US)
- Pas de CDN/cache sur les réponses API

### 7. INP de 232ms sur /jeu/jouer
- Interactions lentes probablement dues à :
  - `canvas-confetti` importé dynamiquement au moment du clic
  - Traitement du vote : mise à jour optimiste + fetch API + animation
  - Framer Motion animations déclenchées au tap

---

## 🟡 Améliorations recommandées

### 8. Toutes les pages de jeu sont 'use client'
- Aucune n'utilise de Server Components
- La page d'accueil elle-même est full client avec un `fetch` côté client pour les stats
- Opportunité : les stats publiques et le hub pourraient être des Server Components avec du streaming

### 9. Pas de prefetching des duels
- Le store charge un duel à la fois
- Pendant que l'utilisateur répond, le prochain duel pourrait déjà être chargé en parallèle
- Le store a un `preloadNextDuel` mais il n'est appelé qu'après le vote

### 10. Import dynamique de canvas-confetti
- Bien fait (dynamic import) mais déclenché au moment du clic = micro-freeze perceptible
- Pourrait être pré-chargé en idle

### 11. Framer Motion bundle
- Utilisé partout : `template.tsx`, toutes les pages de jeu, les composants magicui
- Bundle Framer Motion ≈ 30-40Ko gzippé
- Alternative plus légère possible pour les animations simples (CSS natif ou Web Animations API)

### 12. Pas de caching des réponses API
- Les routes API utilisent `force-dynamic`
- Le leaderboard et les stats publiques pourraient avoir un `Cache-Control` ou `revalidate`
- Les duels ne peuvent pas être cachés (aléatoires) mais la config algorithme pourrait l'être

---

## 👀 Analyse par persona

### 🧑‍💼 CEO 
> - Le FCP de 12.86s sur `/jeu` signifie que **les utilisateurs quittent avant même de voir le jeu**
> - Google pénalise les sites lents dans les résultats de recherche (Core Web Vitals = facteur de ranking)
> - Sur mobile, chaque seconde de chargement = -7% de conversions
> - **Action immédiate :** Corriger `/jeu` et `/ressources/[slug]` avant tout lancement publicitaire

### 👩‍💻 CTO
> - Convertir le hub homepage en Server Component avec streaming SSR
> - Lazy-load `AnimatedBackground` et `meters-data.ts` (code splitting)
> - Utiliser `Suspense` boundaries pour afficher du contenu progressivement
> - Pré-charger `canvas-confetti` via `requestIdleCallback`
> - Ajouter `stale-while-revalidate` sur les endpoints cachables (leaderboard, stats)
> - Réserver des hauteurs fixes pour les éléments dynamiques (éviter CLS)

### 📈 Growth Hacker
> - Un FCP > 3s = bounce rate de 53% sur mobile (données Google)
> - Les utilisateurs venant de publicités (Instagram, TikTok) ont une patience encore plus faible (~2s)
> - **Impératif :** Le jeu doit charger en < 2s pour que les campagnes pub soient rentables
> - Les Core Web Vitals impactent le Quality Score des Google Ads = CPC plus cher si mauvais

---

## 📋 Checklist performance avant lancement

- [ ] Réduire le FCP de `/jeu` de 12.86s à < 2s
- [ ] Réduire le LCP de `/ressources/[slug]` de 15.94s à < 2.5s
- [ ] Réduire le LCP de `/jeu/jouer` de 4.21s à < 2.5s
- [ ] Corriger le CLS de `/jeu` (0.25 → < 0.1)
- [ ] Corriger le CLS de `/jeu/jouer` (0.22 → < 0.1)
- [ ] Réserver des hauteurs pour les éléments dynamiques (skeleton screens)
- [ ] Pré-charger le prochain duel pendant que l'utilisateur joue
- [ ] Ajouter du caching sur les endpoints publics (leaderboard, stats)
- [ ] Évaluer le remplacement de Framer Motion par des animations CSS sur les chemins critiques
- [ ] Pré-importer `canvas-confetti` via `requestIdleCallback`
- [ ] Mettre en place un budget performance en CI (Lighthouse CI)

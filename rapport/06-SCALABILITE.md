# 📈 Brique 6 — Scalabilité & Infrastructure

**Priorité globale : 🟠 HAUTE**  
**Score de préparation : 5/10**

---

## Architecture actuelle

```
Client (React SPA) → Next.js App Router (Vercel Serverless) → Supabase (PostgreSQL)
                                    ↓
                            Google Gemini AI (Oracle)
                            OpenAI (fallback Oracle)
```

### Points forts
- Vercel serverless = scaling auto des fonctions
- Supabase managed = PostgreSQL managé + API REST
- Pas de state serveur (stateless) = scalable horizontalement
- Cache in-memory de la config algorithme via `globalThis`
- Assets statiques servis par CDN Vercel

### Points faibles
- Aucun cache intermédiaire (Redis, KV store)
- Rate limiting en mémoire (inefficace en serverless)
- Race conditions sur les opérations d'écriture en DB
- Pas de queue/worker pour les opérations lourdes

---

## 🔴 Problèmes critiques

### 1. Rate limiting en mémoire
- **Fichier :** `src/lib/rateLimit.ts`
- Utilise `new Map()` en mémoire → perdu à chaque cold start, non partagé entre instances
- **Si le jeu devient viral (10K+ utilisateurs simultanés) :** Le rate limiting est inexistant
- Routes de login admin exposées au brute force à grande échelle
- **Solution :** Upstash Redis (`@upstash/ratelimit`) — coût : ~10€/mois pour 10K req/jour

### 2. Race conditions sur les votes ELO
- **Fichier :** `src/lib/repositories/votes.ts`
- Processus actuel : `SELECT elo` → calcul en JS → `UPDATE SET elo = nouvelle_valeur`
- Si 2 votes arrivent simultanément sur le même élément :
  - Vote A lit `elo = 1000`
  - Vote B lit `elo = 1000`
  - Vote A écrit `elo = 1016`
  - Vote B écrit `elo = 1008` ← **écrase le résultat de A**
- 8 opérations parallèles dans `processVote()` aggravent le risque
- **Solution :** Utiliser `UPDATE elements SET elo = elo + delta` (atomique en PostgreSQL) ou une RPC Supabase

### 3. Race conditions sur les feedbacks
- **Fichier :** `src/lib/repositories/feedback.ts`
- Même pattern select-then-update → les thumbs/stars peuvent être perdus
- **Solution :** `UPDATE SET nb_thumbs_up = nb_thumbs_up + 1`

---

## 🟠 Problèmes haute priorité

### 4. `getAllElementsEnriched` charge toutes les votes
- **Fichier :** `src/lib/repositories/elements.ts`
- Pour compter les participations, la fonction fetch **TOUTES les votes** de la table puis compte en JS
- Avec 10K votes → ~100Ko de données transférées à chaque appel
- Avec 1M votes → ce sera inutilisable
- **Solution :** Créer une vue SQL ou une RPC qui fait le `COUNT GROUP BY` côté Supabase

### 5. Leaderboard sans pagination
- **Fichier :** `src/app/api/leaderboard/route.ts`
- Retourne TOUS les éléments actifs en une requête
- Actuellement ~94 éléments → OK
- Avec 500+ éléments → réponse lente, gros JSON, mémoire client
- **Solution :** Pagination avec `limit/offset` + infinite scroll côté client

### 6. Pas de caching des réponses API
- Toutes les routes API utilisent `force-dynamic` (Next.js `export const dynamic = 'force-dynamic'`)
- Le leaderboard est recalculé à chaque requête
- Les stats publiques aussi
- **Solution :** 
  - Leaderboard : `Cache-Control: s-maxage=60, stale-while-revalidate=300`
  - Stats publiques : `Cache-Control: s-maxage=30`
  - Config algorithme : Déjà cachée en mémoire, mais pas partagée entre instances

### 7. Cache config algorithme non partagé
- **Fichier :** `src/lib/algorithmConfig.ts`
- Utilise `globalThis.__algorithmConfigCache` pour cacher la config
- Chaque instance serverless Vercel a son propre cache
- Avec beaucoup de trafic → chaque cold start = requête DB supplémentaire
- **Solution :** Vercel KV ou Upstash Redis comme cache partagé

---

## 🟡 Points d'attention à moyen terme

### 8. Coûts API IA (Gemini + OpenAI)
- Chaque utilisation de l'Oracle = 1 appel Gemini (ou OpenAI en fallback)
- Gemini Flash est peu coûteux mais pas gratuit à grande échelle
- 10K jugements/jour × 30 jours = 300K appels/mois
- **Solution :** Cacher les résultats pour les situations similaires (fuzzy matching)

### 9. Supabase limites
- Plan gratuit : 500Mo DB, 50K auth, 2Go bandwidth
- Plan Pro (~25€/mois) : 8Go DB, 100K auth, 250Go bandwidth
- Avec 10K utilisateurs/jour : ~5Go bandwidth/mois → plan Pro nécessaire
- **À surveiller :** Taille de la table votes (croissance linéaire avec l'usage)

### 10. Vercel limites
- Plan Hobby : 100Go bandwidth, serverless function timeout 10s
- Plan Pro (~20€/mois) : 1To bandwidth, timeout 60s
- La route Oracle utilise `maxDuration = 30` → **nécessite le plan Pro**
- **À surveiller :** Coûts bandwidth si le site devient très populaire

---

## ✅ Ce qui est bien fait

| Élément | Détail |
|---------|--------|
| Architecture stateless | Pas d'état serveur → scaling horizontal naturel |
| Compression activée | `compress: true` dans `next.config.ts` |
| Images optimisées | `formats: ['image/avif', 'image/webp']` |
| Cache long sur les statics | `immutable` sur manifest.json |
| AbortController | Annule les requêtes abandonées (changement de mode) |
| Dynamic imports | `canvas-confetti` et autres libs lourdes en lazy loading |
| Skeleton/Shimmer | Loading states pour éviter les layout shifts |
| Error boundaries | Capture des erreurs sans crash global |

---

## 👀 Analyse par persona

### 🧑‍💼 CEO
> - Si le jeu devient viral (objectif !), les coûts vont augmenter rapidement
> - **Budget infrastructure estimé pour 10K utilisateurs/jour :**
>   - Vercel Pro : 20€/mois
>   - Supabase Pro : 25€/mois
>   - Upstash Redis : 10€/mois
>   - Gemini API : 20-50€/mois
>   - **Total : ~75-105€/mois**
> - Les race conditions ELO ne sont pas visibles par l'utilisateur mais dégradent la qualité des classements
> - **Le rate limiting cassé est un risque business** (abus, scrapage, DDoS)

### 👩‍💻 CTO
> - **Sprint 1 :** Upstash Redis pour le rate limiting (2-3h)
> - **Sprint 1 :** Requêtes atomiques pour les votes ELO (2h)
> - **Sprint 2 :** Pagination leaderboard (3h)
> - **Sprint 2 :** Vue SQL pour les participations (1h)
> - **Sprint 3 :** Cache Redis pour leaderboard et stats (3h)
> - **Sprint 3 :** Cache des résultats Oracle similaires (1j)
> - Mettre en place des alertes de coûts sur Vercel et Supabase

### 📈 Growth Hacker
> - La scalabilité est invisible pour l'utilisateur SAUF quand ça casse
> - Un site down pendant une campagne virale = argent brûlé
> - Les temps de réponse API impactent l'engagement (chaque 100ms de latence = -1% engagement)
> - L'Oracle (Gemini) est le produit le plus "wow" → il doit être le plus fiable

---

## 📋 Checklist scalabilité avant lancement

- [ ] Remplacer le rate limiting in-memory par Upstash Redis
- [ ] Corriger les race conditions ELO (requêtes atomiques SQL)
- [ ] Corriger les race conditions feedback (UPDATE incrémental)
- [ ] Créer une vue SQL pour les participations (remplacer le fetch de toutes les votes)
- [ ] Ajouter la pagination au leaderboard
- [ ] Ajouter des headers `Cache-Control` sur les endpoints publics
- [ ] Estimer les coûts mensuels pour 1K, 10K, 100K utilisateurs/jour
- [ ] Configurer des alertes de coûts sur Vercel, Supabase, GCP
- [ ] Vérifier que le plan Vercel supporte `maxDuration=30` (Pro requis)
- [ ] Considérer un cache des résultats Oracle pour réduire les appels IA

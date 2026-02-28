# 🧹 Brique 9 — Qualité du Code & Maintenabilité

**Priorité globale : 🟡 MOYENNE**  
**Score de préparation : 8/10**

---

## État des lieux

La qualité du code est **globalement excellente**. C'est le meilleur aspect du projet. L'architecture est propre, modulaire, et bien organisée. Les problèmes identifiés sont mineurs.

### ✅ Points forts

| Élément | Détail |
|---------|--------|
| Architecture en couches | Types → Config → Lib → Repositories → Stores → Components → Pages |
| Pattern Repository | Abstraction propre mock/Supabase dans `src/lib/repositories/` |
| Barrel exports | `index.ts` dans chaque dossier → imports propres |
| TypeScript strict | Typage complet, interfaces bien définies |
| Validation Zod | Schémas de validation sur tous les inputs API |
| State management | Zustand bien structuré avec actions claires |
| Tests unitaires | Bonne couverture sur les libs, hooks, API routes |
| Tests E2E | Puppeteer pour les flux critiques |
| Error handling | `withApiHandler` wrapper, `ErrorBoundary`, try/catch systématique |
| Clean API responses | Format standardisé `{ success, data, error }` |
| ESLint configuré | Avec `eslint-config-next` |
| Vitest configuré | Avec couverture via `@vitest/coverage-v8` |

---

## 🟠 Problèmes à corriger

### 1. Types dupliqués (database.ts vs supabase.ts)
- **Fichiers :** `src/types/database.ts` (manuel, 160 lignes) et `src/types/supabase.ts` (auto-généré, 373 lignes)
- Les deux définissent le type `Database` mais avec des schémas différents
- Le type manuel a des champs (`nb_participations_*`) absents du type auto-généré
- **Risque :** Drift silencieux entre les types et la vraie DB
- **Solution :** Utiliser uniquement le type auto-généré + l'étendre si nécessaire

### 2. Page admin modération non fonctionnelle
- **Fichier :** `src/app/admin/moderation/page.tsx`
- Utilise des données mockées hardcodées (`mockFeedbackData`)
- Le fetch Supabase est commenté
- **Impact :** L'admin ne peut pas modérer les contenus en production
- **Solution :** Implémenter le vrai fetch Supabase

### 3. Dashboard admin avec données simulées
- **Fichier :** `src/app/admin/dashboard/page.tsx`
- Le graphique d'activité 7 jours utilise des données aléatoires basées sur le total
- L'admin voit un graphique qui ne reflète pas la réalité
- **Solution :** Créer une table/vue temporelle dans Supabase ou utiliser les timestamps des votes

### 4. `as any` dans les helpers Supabase
- **Fichier :** `src/lib/supabase.ts`
- Les fonctions `typedInsert`, `typedUpdate`, `typedUpsert` utilisent `as any` pour contourner les génériques Supabase
- Perte de type safety sur les opérations d'écriture
- **Solution :** Utiliser les types Supabase générés correctement

### 5. Polling admin trop agressif
- **Fichier :** `src/app/admin/stats/page.tsx` — refresh toutes les 10 secondes
- **Fichier :** `src/app/admin/demographics/page.tsx` — refresh toutes les 30 secondes
- Consomme de la bande passante et des requêtes Supabase inutilement
- **Solution :** Passer à 30s minimum pour les stats, 60s pour les demographics, ou utiliser un refresh manuel

### 6. Version hardcodée
- **Fichier :** `src/app/page.tsx` — affiche "v4.0"
- Le `package.json` a version "3.8.0"
- **Solution :** Lire la version depuis `package.json` ou une variable d'environnement

---

## 🟡 Points d'attention

### 7. Pas de documentation des env vars
- 11 variables d'environnement utilisées dans le code
- Aucun fichier `.env.example` ou documentation explicite
- **Solution :** Créer `.env.example` avec toutes les variables et commentaires

### 8. Console logs en production
- Certaines erreurs sont `console.error()` sans plus de traitement
- Pas de service de logging structuré (Sentry, LogRocket, etc.)
- **Solution :** Intégrer un service de monitoring d'erreurs (Sentry recommandé)

### 9. Pas de CI/CD formalisé
- Pas de fichier `.github/workflows/` pour les tests automatisés
- Pas de linting en CI
- Pas de check Lighthouse en CI
- **Solution :** Créer un workflow GitHub Actions : lint → test → build → lighthouse

### 10. Migrations SQL dans le repo
- 8 fichiers de migration dans `supabase/migrations/`
- Pas de outil de migration automatisé dans les scripts npm
- **Solution :** Ajouter `supabase db push` ou équivalent dans les scripts

---

## ✅ Bonnes pratiques déjà en place

| Pratique | Détail |
|---------|--------|
| Separation of concerns | Chaque fichier a une responsabilité unique |
| DRY | Fonctions utilitaires centralisées dans `src/lib/` |
| Naming conventions | Noms explicites en anglais, constantes en UPPER_CASE |
| Error boundaries | Capture globale + gestion par composant |
| Optimistic UI | Pattern bien implémenté dans le store |
| AbortController | Annulation propre des requêtes en vol |
| Dynamic imports | Code splitting pour les libs lourdes |
| Zod schemas | Validation stricte des inputs API |
| Mock mode | Développement possible sans Supabase |
| Rate limiting (intention) | L'intention est là même si l'implémentation est limitée |

---

## 👀 Analyse par persona

### 🧑‍💼 CEO
> - La qualité du code est un **investissement** : un code propre = itérations rapides, moins de bugs
> - Le projet est bien structuré pour accueillir de nouveaux développeurs
> - La dette technique est faible, ce qui est rare pour un projet de cette taille
> - **Seul point bloquant :** La modération admin cassée doit être corrigée avant le lancement

### 👩‍💻 CTO
> - Unifier les types Database (priorité moyenne mais important pour la maintenabilité)
> - Configurer un CI/CD basique (GitHub Actions) — 2h de setup
> - Ajouter Sentry pour le monitoring d'erreurs en production — 1h
> - Créer `.env.example` — 15min
> - Le code est propre, bien testé, et prêt pour une équipe de 2-3 développeurs

### 📈 Growth Hacker
> - La qualité du code impacte indirectement la vitesse d'itération
> - Plus le code est propre, plus vite on peut implémenter des features de growth (A/B tests, etc.)
> - Le monitoring d'erreurs (Sentry) est essentiel pour détecter les problèmes avant les utilisateurs

---

## 📋 Checklist qualité du code avant lancement

- [ ] Unifier les types Database (un seul source of truth)
- [ ] Réparer la page admin modération (implémenter le vrai fetch)
- [ ] Remplacer les données simulées du dashboard admin
- [ ] Créer `.env.example` avec documentation
- [ ] Créer un workflow CI/CD (GitHub Actions)
- [ ] Intégrer un service de monitoring (Sentry)
- [ ] Réduire le polling admin (10s → 30s minimum)
- [ ] Synchroniser la version affichée avec `package.json`
- [ ] Auditer et supprimer les `as any` dans le code
- [ ] Ajouter un `supabase db push` script dans `package.json`

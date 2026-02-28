# 🔒 Brique 3 — Sécurité & Protection des Données

**Priorité globale : 🔴 CRITIQUE**  
**Score de préparation : 4/10**

---

## 🔴 Vulnérabilités critiques

### 1. Secret admin par défaut en production
- **Fichier :** `src/lib/adminAuth.ts`
- **Problème :** Le secret de signature des tokens admin fallback est `'dev-secret-change-me-in-production'`
- Si la variable `ADMIN_TOKEN_SECRET` n'est pas définie en production, n'importe qui peut forger un token admin valide en moins de 5 minutes
- **Risque :** Accès total au panel admin (CRUD éléments, stats, algorithme, données utilisateurs)
- **Sévérité :** CRITIQUE

### 2. Mode mock bypass en production
- **Fichier :** `src/lib/apiHelpers.ts` + `src/app/api/admin/login/route.ts`
- **Problème :** `isMockMode()` retourne `true` quand `NEXT_PUBLIC_SUPABASE_URL` est vide
- En mode mock, le login admin accepte le mot de passe **"admin"**
- Si par erreur l'env var Supabase est absente en prod → admin ouvert à tous
- **Risque :** Accès admin complet
- **Sévérité :** CRITIQUE

### 3. Aucune validation de démarrage des env vars
- **Problème :** Aucun fichier ne vérifie au build/start que les variables critiques sont présentes
- Variables critiques non vérifiées :
  - `ADMIN_TOKEN_SECRET`
  - `ADMIN_PASSWORD_HASH`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
- **Risque :** Le site démarre silencieusement en mode dégradé/dangereux
- **Sévérité :** CRITIQUE

---

## 🟠 Vulnérabilités haute priorité

### 4. Rate limiting in-memory (non fonctionnel en serverless)
- **Fichier :** `src/lib/rateLimit.ts`
- **Problème :** Le rate limiter utilise un `Map()` en mémoire
- Sur Vercel (serverless), chaque invocation peut être une instance différente
- Le rate limiting est donc inefficace : un attaquant touche des instances différentes à chaque requête
- Après un cold start, tout le compteur est remis à zéro
- **Routes affectées :** `/api/vote`, `/api/admin/login`, `/api/feedback`, `/api/leaderboard`
- **Risque :** Brute force admin login, spam de votes, DDoS sur les endpoints
- **Sévérité :** HAUTE

### 5. Route analytics POST non authentifiée
- **Fichier :** `src/app/api/analytics/session/route.ts`
- **Problème :** L'endpoint POST n'a aucune authentification ni rate limiting
- N'importe qui peut envoyer des données analytics fausses
- L'endpoint GET expose aussi les sessions sans authentification
- **Risque :** Pollution des données analytics, exposition de données de session
- **Sévérité :** HAUTE

### 6. Route community POST sans rate limiting
- **Fichier :** `src/app/api/flagornot/community/route.ts`
- **Problème :** L'endpoint POST pour soumettre des situations n'a pas de rate limiting
- Un bot pourrait spammer des milliers de submissions
- **Risque :** Pollution de la communauté, coûts Supabase, contenu inapproprié
- **Sévérité :** HAUTE

### 7. Credentials GCP dans /tmp
- **Fichier :** `src/lib/gemini.ts`
- **Problème :** Écrit les credentials de service account dans `/tmp/gcp-credentials-*.json`
- Permissions fichier par défaut (lisible par le process)
- Sur Vercel serverless, `/tmp` est partagé au sein d'une même instance
- **Risque :** Fuite potentielle des credentials GCP
- **Sévérité :** HAUTE

---

## 🟡 Points d'attention

### 8. Sanitization regex-based
- **Fichier :** `src/lib/sanitize.ts`
- La sanitization XSS utilise des regex custom (strip HTML, event handlers, `javascript:`)
- Couvre les vecteurs principaux mais les regex XSS sont connues pour être contournables
- Recommandation : auditer avec des payloads XSS standards, ou ajouter DOMPurify

### 9. Token admin stateless sans révocation
- **Fichier :** `src/lib/adminAuth.ts`
- Les tokens ont un TTL de 4h, HMAC-SHA256, avec constant-time comparison
- Mais aucun mécanisme de révocation (impossible de déconnecter un admin compromis avant 4h)
- Acceptable pour un projet de cette taille mais à noter

### 10. IP extraction de x-forwarded-for
- **Fichier :** `src/lib/rateLimit.ts`
- L'IP est extraite de `x-forwarded-for` qui peut être spoofée si pas derrière un proxy de confiance
- Vercel gère correctement ce header, mais si le déploiement change, c'est un risque
- L'IP sert uniquement pour le rate limiting (cf. point 4)

### 11. Service Role Key côté serveur
- **Fichier :** `src/lib/supabase.ts`
- Le `createServerClient()` utilise la Service Role Key qui bypass les Row Level Security
- Usage correct (serveur only) mais toute fuite de cette clé = accès total à la DB
- Vérifier que la variable n'est jamais exposée côté client (pas de prefix `NEXT_PUBLIC_`)

---

## ✅ Ce qui est bien fait

| Élément | Détail |
|---------|--------|
| Headers de sécurité | `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` |
| `poweredByHeader: false` | Pas de header `X-Powered-By: Next.js` |
| Validation Zod | Toutes les entrées API sont validées avec des schémas stricts |
| bcrypt pour le password admin | En mode production, le mot de passe est vérifié avec bcrypt |
| HMAC-SHA256 tokens | Tokens admin signés avec constant-time comparison |
| Sanitization des inputs | Strip HTML, event handlers, javascript: URLs |
| Admin routes protégées | `requireAdmin()` sur toutes les routes admin |
| `noopener,noreferrer` | Sur les liens externes |
| Pas de données sensibles côté client | Les calculs ELO, les stats admin restent côté serveur |

---

## 👀 Analyse par persona

### 🧑‍💼 CEO
> - Les failles de sécurité 1 et 2 sont des **show-stoppers absolus** : si quelqu'un accède à l'admin, il peut détruire toutes les données du jeu
> - Un incident de sécurité au lancement = mort du projet (confiance perdue)
> - Les pages légales (RGPD, CGU) sont absentes — voir rapport [08-ACCESSIBILITE-LEGAL.md](08-ACCESSIBILITE-LEGAL.md)
> - **Action :** Ne JAMAIS lancer sans avoir corrigé les 3 premiers points

### 👩‍💻 CTO
> - Ajouter un fichier `src/lib/env.ts` qui valide toutes les env vars au démarrage
> - Remplacer le rate limiter par Upstash Redis (`@upstash/ratelimit`) — 1h de travail
> - Ajouter un rate limit sur `/api/flagornot/community` et `/api/analytics/session`
> - Utiliser les credentials GCP via `GoogleAuth` in-memory au lieu d'écrire dans `/tmp`
> - Ajouter une alerte si `ADMIN_TOKEN_SECRET` est le fallback

### 📈 Growth Hacker
> - La sécurité n'est pas "sexy" mais un hack visible = fin de la croissance
> - Les pages RGPD/CGU sont requises par les régies publicitaires (Google Ads, Meta Ads)
> - Sans page de politique de confidentialité, les campagnes publicitaires seront rejetées

---

## 📋 Checklist sécurité avant lancement

- [ ] Vérifier que `ADMIN_TOKEN_SECRET` est défini en production (≠ fallback)
- [ ] Vérifier que `NEXT_PUBLIC_SUPABASE_URL` est défini en production (≠ mock mode)
- [ ] Créer un validateur d'env vars au démarrage (`src/lib/env.ts`)
- [ ] Remplacer le rate limiting in-memory par Upstash Redis
- [ ] Ajouter rate limiting sur `/api/flagornot/community` POST
- [ ] Ajouter rate limiting ou validation sur `/api/analytics/session` POST
- [ ] Protéger `/api/analytics/session` GET avec `requireAdmin`
- [ ] Auditer la sanitization avec des payloads XSS standards
- [ ] Vérifier les permissions du fichier GCP dans `/tmp` (ou passer en in-memory)
- [ ] Documenter toutes les env vars requises dans un `.env.example`

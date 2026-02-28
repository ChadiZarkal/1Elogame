# 📊 Brique 10 — Analytics & Pilotage Data

**Priorité globale : 🟡 MOYENNE**  
**Score de préparation : 4/10**

---

## État des lieux

### ✅ Ce qui existe

| Outil | Détail | Fichier |
|-------|--------|---------|
| Vercel Analytics | Intégré via `@vercel/analytics` | `layout.tsx` |
| Vercel Speed Insights | Web Vitals en production | `layout.tsx` |
| Analytics custom | Tracking sessions/événements maison | `AnalyticsProvider.tsx` + `analytics.ts` |
| Admin dashboard | Stats internes (votes, top flags, participations) | `admin/dashboard/page.tsx` |
| Admin stats | Distributions ELO, gender gaps, insights marketing | `admin/stats/page.tsx` |
| Admin demographics | Graphiques démographiques (âge, genre) | `admin/demographics/page.tsx` |

### ❌ Ce qui manque

| Élément | Pourquoi c'est critique | Priorité |
|---------|------------------------|----------|
| Google Analytics 4 (GA4) | Attribution des campagnes pub, funnel, comportement | 🔴 |
| Meta Pixel (Facebook) | Attribution des pubs Instagram/Facebook | 🔴 |
| UTM tracking | Savoir d'où viennent les visiteurs | 🔴 |
| Funnel de conversion | Mesurer le parcours : arrivée → jeu → rétention | 🟠 |
| Événements business | Mesurer les revenus, conversions, engagements clés | 🟠 |
| Tableaux de bord temps réel | Dashboard CEO accessible sans être développeur | 🟠 |
| A/B testing | Optimiser les CTA, les flows, les emplacements pub | 🟡 |
| Heatmaps | Comprendre le comportement visuel des utilisateurs | 🟡 |

---

## 🔴 Problèmes critiques

### 1. Pas de Google Analytics 4
- **Impossible de mesurer le ROI des campagnes publicitaires**
- GA4 est nécessaire pour :
  - Attribution des sources de trafic (organique vs paid vs social vs direct)
  - Funnel de conversion (arrivée → engagement → rétention → monétisation)
  - Audiences pour le remarketing Google Ads
  - Rapports démographiques natifs
  - Intégration avec Google Ads pour l'optimisation automatique des campagnes

### 2. Pas de Meta Pixel
- Si vous faites de la pub sur Instagram/Facebook/TikTok (très probable pour un jeu viral) :
  - Le Pixel est indispensable pour mesurer les conversions
  - Le Pixel alimente l'algo de Meta pour cibler les bons utilisateurs
  - Sans Pixel, le coût par acquisition (CPA) sera 2-5x plus élevé
  - Le Pixel nécessite le consentement cookies (CMP) — cf. rapport 08

### 3. Pas de tracking UTM
- Les liens partagés, les campagnes pub, les posts sur les réseaux n'ont pas de paramètres UTM
- Impossible de savoir quel canal apporte quels utilisateurs
- **Exemple de lien manquant :** `redflaggames.fr/?utm_source=instagram&utm_medium=paid&utm_campaign=launch_v1`

---

## 🟠 Problèmes haute priorité

### 4. Analytics custom non exploité
- Le système custom (`AnalyticsProvider.tsx`) track :
  - Pages vues
  - Entrées dans les jeux
  - Durée des sessions
  - Événements custom
- Mais ces données sont envoyées à `/api/analytics/session` qui :
  - N'a **pas d'authentification** sur le POST (spam possible)
  - N'a **pas de dashboard** pour les visualiser (seulement dans Supabase)
  - N'a **pas d'export** ou d'intégration avec des outils de BI
- **Résultat :** Des données sont collectées mais personne ne les regarde

### 5. Pas de funnel de conversion défini
- Aucun événement ne trace le parcours :
  1. Arrivée sur le site → quel % joue ?
  2. Choix du jeu → quel jeu est le plus populaire ?
  3. Première partie → quel % finit une partie ?
  4. Retour J+1 → quel % revient ?
  5. Partage → quel % partage un résultat ?
  6. Monétisation → quel % clique sur une pub / achète ?
- Sans funnel, impossible d'optimiser quoi que ce soit

### 6. Dashboard admin incomplet pour le pilotage business
- Le dashboard actuel montre des métriques de jeu (ELO, votes, top flags)
- Il manque :
  - Nombre de sessions par jour/semaine/mois
  - Trafic par source
  - Taux de rétention J+1, J+7, J+30
  - Revenus (quand la monétisation sera en place)
  - Coût d'acquisition par canal

---

## 🟡 Améliorations recommandées

### 7. Événements à tracker côté client

| Événement | Catégorie | Quand |
|-----------|-----------|-------|
| `page_view` | Navigation | Chaque page | 
| `game_start` | Engagement | Début de partie (duel/oracle/meter) |
| `game_complete` | Engagement | Fin de partie |
| `vote_cast` | Engagement | Chaque vote |
| `share_click` | Viralité | Clic sur Partager |
| `share_complete` | Viralité | Partage effectué (navigator.share success) |
| `profile_created` | Onboarding | Formulaire profil rempli |
| `streak_milestone` | Engagement | Streak 3, 5, 10, 15, 20 |
| `oracle_submit` | Engagement | Situation soumise à l'Oracle |
| `meter_complete` | Engagement | Quiz meter terminé |
| `ad_impression` | Monétisation | Pub affichée |
| `ad_click` | Monétisation | Clic sur pub |
| `error` | Technique | Erreur JS capturée |

### 8. A/B testing infrastructure
- Pas d'infrastructure d'A/B test actuellement
- Testable :
  - Texte des CTA ("JOUER" vs "COMMENCER" vs "C'EST PARTI")
  - Ordre des jeux sur le hub
  - Couleur des boutons de vote
  - Fréquence des pubs interstitielles
- **Outils :** Vercel Feature Flags, Posthog, ou simple cookie-based split

### 9. Heatmaps et session replays
- Pour comprendre pourquoi les utilisateurs quittent à certaines étapes
- **Outils :** Hotjar (freemium), PostHog (open source), Microsoft Clarity (gratuit)

### 10. Alertes automatiques
- Aucune alerte en cas de :
  - Pic de trafic anormal
  - Taux d'erreur élevé
  - Chute brutale du nombre de parties
  - Coûts API Gemini qui explosent
- **Outils :** Vercel alertes natives, Sentry pour les erreurs, Upstash pour les custom alerts

---

## 👀 Analyse par persona

### 🧑‍💼 CEO
> - **Sans GA4 et Meta Pixel, vous dépensez de l'argent en pub à l'aveugle**
> - Chaque euro investi en publicité doit être tracé : combien a coûté chaque utilisateur, combien rapporte-t-il
> - Les KPI prioritaires à suivre :
>   - **CAC** (Coût d'Acquisition Client) : combien coûte un nouvel utilisateur
>   - **LTV** (Lifetime Value) : combien rapporte un utilisateur sur sa durée de vie
>   - **Rétention J+1/J+7** : efficacité de l'engagement
>   - **K-factor** (coefficient viral) : combien de nouveaux utilisateurs chaque joueur rapporte
>   - **ARPU** (Average Revenue Per User) : revenu moyen par utilisateur
> - Objectif : **LTV > CAC** (sinon la croissance n'est pas viable)

### 👩‍💻 CTO
> - **Sprint 1 :** Intégrer GA4 (`gtag.js`) + Meta Pixel avec consentement cookies
> - **Sprint 1 :** Ajouter les UTM sur tous les liens partagés
> - **Sprint 2 :** Définir et implémenter les événements custom dans GA4
> - **Sprint 2 :** Créer un dashboard Supabase ou Metabase pour les métriques business
> - **Sprint 3 :** A/B testing avec Vercel Feature Flags
> - Tous les scripts tiers doivent être conditionnés au consentement cookies (CMP)

### 📈 Growth Hacker
> - GA4 + Meta Pixel sont **non négociables** avant toute dépense publicitaire
> - Le setup de base prend 1-2h mais rapporte des milliers d'euros d'insights
> - Les UTM permettent de savoir quel post TikTok, quel influenceur, quelle story Instagram fonctionne
> - Les audiences de remarketing (GA4 → Google Ads, Pixel → Meta Ads) sont cruciales pour réduire le CPA
> - **Conseil :** Installer Microsoft Clarity (gratuit, illimité) pour les heatmaps et session replays

---

## 📋 Checklist analytics avant lancement

- [ ] Créer un compte Google Analytics 4 et intégrer le script
- [ ] Créer un Meta Pixel et intégrer le script
- [ ] Configurer le consentement cookies pour les scripts tiers (CMP)
- [ ] Définir et implémenter les événements clés (voir tableau ci-dessus)
- [ ] Ajouter des paramètres UTM à tous les liens partagés
- [ ] Créer un funnel de conversion dans GA4
- [ ] Sécuriser le POST `/api/analytics/session` (rate limiting minimum)
- [ ] Protéger le GET `/api/analytics/session` avec `requireAdmin`
- [ ] Installer Microsoft Clarity pour les heatmaps (gratuit)
- [ ] Configurer des alertes de base (erreurs, coûts, trafic anormal)
- [ ] Créer un dashboard récapitulatif des KPI business
- [ ] Connecter GA4 avec Google Ads pour le remarketing

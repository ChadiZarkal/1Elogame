# 🎮 Brique 7 — UX/UI & Rétention Utilisateur

**Priorité globale : 🟠 HAUTE**  
**Score de préparation : 7/10**

---

## État des lieux

Le UX/UI est globalement **bon** — c'est le point fort du projet. Le jeu est fonctionnel, intuitif, et visuellement soigné. Cependant, les mécanismes de **rétention** sont presque absents.

### ✅ Points forts UX/UI

| Élément | Détail |
|---------|--------|
| Design dark mode cohérent | Palette sombre avec accents rouge/vert/violet bien définis |
| Animations soignées | Framer Motion transitions, confettis, compteurs animés |
| Mobile-first | CSS responsive, safe-area-inset, touch-friendly |
| Feedback haptique | `navigator.vibrate` pour les interactions |
| UI optimiste | Résultat affiché instantanément, raffiné avec l'API |
| Loading states | Skeleton/shimmer screens sur toutes les pages |
| Error boundaries | Erreurs capturées avec bouton retry |
| Accessibilité de base | `role="radiogroup"`, `aria-checked`, `focus-visible` |
| Reduced motion | Respect de `prefers-reduced-motion` |
| Quick exit | Bouton d'échappement rapide sur les pages sensibles (ressources) |
| Toasts | Feedback utilisateur via Sonner (thème dark) |

### ❌ Ce qui manque pour la rétention

| Élément | Impact sur la rétention |
|---------|----------------------|
| Aucun compte utilisateur | 🔴 Impossible de suivre la progression long terme |
| Pas de streak quotidien | 🟠 Aucune raison de revenir demain |
| Pas de notifications push | 🟠 Aucun rappel d'engagement |
| Pas de gamification profonde | 🟠 Streaks seuls ne suffisent pas |
| Pas de profil public | 🟡 Pas de statut social / compétition |
| Pas de mode multijoueur | 🟡 Pas d'interaction sociale in-game |

---

## 🔴 Problèmes critiques

### 1. Aucun mécanisme de rétention jour+1
- L'utilisateur joue, s'amuse… puis ne revient jamais
- Pas de compte → pas d'historique persistant entre appareils
- Les données sont en `localStorage` → perdues si le navigateur est vidé
- Pas de raison intrinsèque de revenir le lendemain
- **Taux de rétention J+1 estimé sans mécanisme : 5-10%**
- **Avec un bon streak daily : 20-35%**

### 2. Le streak n'est pas quotidien
- Le streak actuel compte les bonnes réponses consécutives dans une session
- Il ne persiste pas entre les jours → pas de "daily streak" à la Wordle/Duolingo
- Pas de notion de "reviens demain pour maintenir ton streak"
- **C'est le mécanisme de rétention le plus efficace et le plus simple à implémenter**

---

## 🟠 Problèmes haute priorité

### 3. Onboarding minimal
- L'utilisateur arrive sur le hub → 3 cartes de jeu
- Pas d'explication du concept, pas de tutoriel
- Le "Red Flag Test" principal envoie vers un site externe (redflagtest.redorgreen.fr)
- Pour un utilisateur venant d'une pub, le parcours est : pub → hub → choix du jeu → formulaire profil → jeu
- **4 étapes avant de jouer = trop de friction**

### 4. Formulaire de profil obligatoire
- Avant de jouer aux duels, l'utilisateur DOIT remplir sexe + tranche d'âge
- Frein à l'engagement rapide — pas de mode "invité" pour essayer
- Certains utilisateurs abandonnent ici (surtout venant de pubs)
- **Suggestion :** Permettre de jouer sans profil, demander le profil après le 3e duel

### 5. Pas de système de récompenses / gamification
- Pas de badges, trophées, ou achievements
- Pas de niveaux ou progression
- Pas de "Daily challenge" ou question du jour
- Les milestones de streak (3, 5, 10, 15, 20) déclenchent des confettis mais pas de récompense persistante

### 6. Le hub principal redirige vers un site externe
- Le jeu principal "Red Flag Test" (la carte mise en avant) envoie vers `redflagtest.redorgreen.fr`
- L'utilisateur quitte le site → perte de tracking, de monétisation, et de rétention
- Si c'est un sous-domaine personnel → créer une configuration pour le garder dans l'écosystème
- Si c'est un site tiers → reconsidérer la mise en avant

---

## 🟡 Améliorations recommandées

### 7. Pas de personnalisation
- L'expérience est identique pour tous les utilisateurs
- Pas de "tes duels basés sur ton historique"
- Pas de recommandation basée sur les votes passés
- Le `seenDuels` empêche les doublons mais ne personnalise pas

### 8. Résultat de duel peu engageant
- Le résultat montre les pourcentages et le rang — informatif mais pas émotionnel
- Pas de message personnalisé ("Tu votes comme 73% des gens !")
- Pas de "fait amusant" ou anecdote sur le résultat
- Le `FeedbackBar` offre étoile + thumbs + partage mais pas de call-to-action vers la suite

### 9. Historique limité
- L'historique des duels est en scroll horizontal dans le même écran
- Pas de page dédiée "Mon historique" avec filtres et stats personnelles
- Le histogramme de consistance est dans l'admin uniquement, pas côté joueur

### 10. Pas d'audio / son
- Pas de feedback audio (tap, correct, confetti)
- Les sons renforcent l'engagement mobile (cf. Duolingo, TikTok)
- Ajouter des sons courts et optionnels pour les interactions clés

---

## 👀 Analyse par persona

### 🧑‍💼 CEO
> - La rétention est **le facteur #1 de rentabilité** : acquérir un utilisateur coûte de l'argent (pub)
> - Si l'utilisateur ne revient pas, le coût d'acquisition est perdu
> - **Métriques cibles :**
>   - Rétention J+1 : > 25%
>   - Rétention J+7 : > 10%
>   - Sessions/utilisateur/semaine : > 3
> - Un daily streak + notifications push peuvent multiplier la rétention par 3-5x
> - Le formulaire de profil obligatoire fait perdre ~30% des nouveaux utilisateurs

### 👩‍💻 CTO
> - Implémenter un "daily streak" persisté en localStorage + cookie
> - Ajouter les notifications push via Service Worker (PWA déjà configurée)
> - Rendre le profil optionnel (demander après le 3e duel)
> - Créer un "Daily Red Flag" — un duel unique par jour que tout le monde vote
> - Ajouter des badges/achievements avec conditions (10 duels, 5 streaks, etc.)

### 📈 Growth Hacker
> - **Boucle de rétention idéale :**
>   1. Notification push le matin : "🚩 Ton Red Flag du jour est prêt !"
>   2. L'utilisateur ouvre → joue au Daily Red Flag → voit son streak
>   3. Partage son résultat → un ami arrive → le cycle recommence
> - Le "Daily Red Flag" est le Wordle du Red Flag — une seule question par jour
> - Ajouter un compteur "X personnes ont voté aujourd'hui" pour le FOMO
> - Le formulaire de profil devrait être après l'engagement, pas avant

---

## 📋 Checklist UX/rétention avant lancement

- [ ] Rendre le profil optionnel (jouer en mode invité possible)
- [ ] Implémenter un daily streak avec persistance cross-session
- [ ] Créer un "Red Flag du jour" (Daily challenge)
- [ ] Ajouter les notifications push via PWA Service Worker
- [ ] Réduire le parcours d'onboarding (pub → jeu en < 2 taps)
- [ ] Ajouter des badges / achievements simples
- [ ] Enrichir les résultats de duel (messages personnalisés, fun facts)
- [ ] Créer une page "Mon profil" avec stats personnelles
- [ ] Considérer l'ajout de retour audio (sons optionnels)
- [ ] Évaluer si le Red Flag Test externe doit être intégré au site

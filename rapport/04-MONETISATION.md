# 💰 Brique 4 — Monétisation & Modèle Économique

**Priorité globale : 🔴 CRITIQUE**  
**Score de préparation : 1/10**

---

## État des lieux

**Situation actuelle : AUCUNE monétisation n'est implémentée.**

Le projet n'a actuellement :
- ❌ Aucune intégration publicitaire
- ❌ Aucun produit payant
- ❌ Aucune infrastructure de paiement
- ❌ Aucun emplacement prévu pour les publicités
- ❌ Aucune bannière de consentement cookies (nécessaire pour la pub)
- ❌ Aucune page CGU/CGV

---

## 🔴 Éléments à mettre en place

### 1. Choix du modèle de monétisation

Le projet a 3 pistes naturelles de revenus :

#### Piste A — Publicité display (recommandée en premier)
- **Google AdSense** ou **Carbon Ads** entre les duels
- Interstitiel après chaque 3-5 duels
- Bannière native dans le leaderboard
- **Revenus estimés** (1000 sessions/jour) : 50-200€/mois
- **Revenus estimés** (10000 sessions/jour) : 500-2000€/mois

#### Piste B — Produits dérivés
- T-shirts/stickers "I'm a Red Flag 🚩"
- Résultats de quiz personnalisés imprimables
- Partenariat avec des boutiques en ligne
- **Revenus estimés :** Variable, dépend du merchandising

#### Piste C — Fonctionnalités premium (freemium)
- Mode privé entre amis (création de room)
- Catégories exclusives
- Statistiques avancées personnelles
- Suppression de la pub
- **Revenus estimés :** 2-5% de conversion × prix mensuel

### 2. Infrastructure publicitaire à créer

| Élément | Détail | Priorité |
|---------|--------|----------|
| Bannière de consentement cookies | Obligatoire pour RGPD + pub | 🔴 |
| Intégration Google AdSense | Script dans `layout.tsx`, emplacements dans les pages | 🔴 |
| Emplacement pub entre les duels | Interstitiel toutes les X parties | 🟠 |
| Emplacement pub dans le leaderboard | Bannière native | 🟠 |
| Emplacement pub dans les résultats Oracle | Après le verdict | 🟠 |
| Emplacement pub dans les résultats des meters | Après le score | 🟡 |

### 3. Pages légales obligatoires pour la monétisation

| Page | Pourquoi | Bloquant pour |
|------|----------|---------------|
| Mentions légales | Obligatoire par la loi française | Tout |
| CGU (Conditions Générales d'Utilisation) | Obligatoire si service interactif | Google Ads |
| Politique de confidentialité | RGPD + régies pub | Google AdSense, Meta Ads |
| Politique de cookies | RGPD + publicité ciblée | Toute publicité |

### 4. Consentement cookies (CMP)

- Nécessaire pour toute publicité, analytics tiers, ou tracking
- Solutions : Axeptio, Cookiebot, Tarteaucitron.js (gratuit)
- Doit gérer les catégories : nécessaires, analytics, publicité, réseaux sociaux
- Doit bloquer les scripts publicitaires tant que le consentement n'est pas donné

---

## 🟠 Optimisations pour maximiser les revenus

### 5. Emplacements publicitaires stratégiques

| Emplacement | Format | Moment | Impact UX |
|-------------|--------|--------|-----------|
| **Entre les duels** | Interstitiel/natif | Toutes les 4-5 parties | Moyen |
| **Page de résultat** | Bannière bas de page | Après chaque vote | Faible |
| **Leaderboard** | Natif dans la liste | Permanent | Faible |
| **Oracle résultat** | Bannière avant verdict | Après le jugement | Moyen |
| **Accueil** | Bannière basse | Permanent | Faible |
| **Meters résultat** | Natif post-résultat | Après le score | Faible |

### 6. Conversion vers le merchandising

- Les résultats des quiz/tests sont hautement partageables
- "Tu es un Red Flag à 87% 🚩" → image partageable + lien vers boutique
- T-shirt "Certified Red Flag" / "Green Flag Energy"
- Canvas personnalisé avec le score à commander

### 7. Partenariats et affiliation

- Les pages "Ressources" (violentomètre, etc.) touchent un public sensibilisé
- Partenariats possibles avec :
  - Associations (contenu sponsorisé éthique)
  - Plateformes de développement personnel
  - Apps de rencontre (native ads)

---

## 🟡 Modèle freemium futur

### 8. Fonctionnalités premium potentielles

| Feature | Prix suggéré | Complexité |
|---------|-------------|------------|
| Mode soirée (room privée 2-10 joueurs) | 2.99€/soirée | HAUTE |
| Statistiques personnelles avancées | 1.99€/mois | MOYENNE |
| Catégories exclusives (spicy, NSFW) | 0.99€/pack | FAIBLE |
| Sans pub | 2.99€/mois | FAIBLE (si pub déjà en place) |
| Badges et personnalisation profil | 0.49€/badge | FAIBLE |

---

## 👀 Analyse par persona

### 🧑‍💼 CEO
> **C'est LE sujet #1.** Sans monétisation, le projet brûle du cash (hébergement, API Gemini, Supabase).
> 
> **Plan recommandé en 3 phases :**
> 1. **Semaine 1 :** Google AdSense + bannière cookies + pages légales = premiers euros
> 2. **Mois 1 :** Optimiser les emplacements pub + lancer le merchandising
> 3. **Mois 3 :** Mode premium / soirée en freemium
>
> **Coûts actuels estimés :**
> - Vercel Pro : ~20€/mois
> - Supabase Pro : ~25€/mois  
> - API Gemini : Variable (0-50€/mois selon usage)
> - **Total : ~50-100€/mois à couvrir minimum**
>
> **Seuil de rentabilité :** ~5000-10000 sessions mensuelles avec AdSense

### 👩‍💻 CTO
> - Créer un composant `<AdSlot />` réutilisable avec lazy loading
> - Intégrer Google Publisher Tag (GPT) ou AdSense auto ads
> - Implémenter un CMP (Consent Management Platform) dans le `layout.tsx`
> - Prévoir un système de feature flags pour activer/désactiver les fonctions premium
> - Créer un endpoint API pour vérifier le statut premium d'un utilisateur

### 📈 Growth Hacker
> - Les interstitiels publicitaires entre les duels ont le meilleur ratio eCPM (revenu par 1000 impressions)
> - **Ne jamais mettre de pub AVANT le premier duel** — laisser l'utilisateur goûter au jeu d'abord
> - Les résultats partageables avec branding = publicité gratuite
> - Le merchandising "Red Flag" a un potentiel viral sur TikTok/Instagram
> - Prévoir un code promo pour le merch dans les résultats de quiz

---

## 📋 Checklist monétisation avant lancement

- [ ] Choisir le modèle principal (pub d'abord recommandé)
- [ ] Créer les pages légales (CGU, mentions légales, politique de confidentialité)
- [ ] Intégrer une CMP (bannière de consentement cookies)
- [ ] S'inscrire à Google AdSense et obtenir l'approbation
- [ ] Créer un composant `<AdSlot />` avec les emplacements stratégiques
- [ ] Ne pas bloquer le lancement sur le merchandising (phase 2)
- [ ] Prévoir l'infrastructure pour le mode premium (mais pas le développer tout de suite)
- [ ] Mettre en place le tracking des revenus (Google AdSense dashboard)

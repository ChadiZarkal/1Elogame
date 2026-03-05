# 🔍 Audit UI/UX — Page Récapitulatif (GameRecap)

**Version**: v1 (avant corrections)  
**Date**: 5 mars 2026  
**Screenshots**: `screenshots/recap-full-v1.png`, `screenshots/recap-fold-v1.png`, `screenshots/recap-card-v1.png`  
**Viewport**: iPhone 14 Pro (393×852 @3x)

---

## ⚒️ Méthodologie

Audit basé sur les screenshots Puppeteer (mobile 393×852) et analyse du code source. Critères : hiérarchie visuelle, partageabilité, densité informationnelle, cohérence avec la page d'accueil, accessibilité mobile.

---

## 📐 Mesures clés

| Métrique | Valeur | Verdict |
|----------|--------|---------|
| Hauteur totale | 1383px logiques (4149px @3x) | ❌ 1.62× le viewport — scroll excessif |
| Contenu au-dessus du fold | Screenshot card + début highlights | ⚠️ Le CTA partage est sous le fold |
| Nb de sections distinctes | 8 sections (card, highlights, analysis, categories, duels, actions, links, footer) | ❌ Trop de sections au même niveau |
| Nb de boutons d'action | 5 (partager, nouvelle partie, continuer, classement, voir duels) | ⚠️ Trop de choix — paradoxe du choix |
| Nb de liens vers /classement | 2 (bouton + footer) | ❌ Doublon |
| Logo Red or Green | Absent (texte emoji seulement) | ❌ Manque d'identité de marque |

---

## 🔴 Problèmes critiques (Score actuel : 6/10)

### 1. 🏗️ Absence de hiérarchie visuelle — Score : 4/10

**Constat** : Les 8 sections ont toutes le même poids visuel. Même background (#0C0C0E), même border-radius (10px), même padding. Aucun signal visuel ne dit "ceci est le message principal" vs "ceci est un détail".

**Impact** : L'utilisateur ne sait pas quoi regarder en premier. L'œil saute d'une section à l'autre sans ancrage. Le message clé (archetype + partage) se noie dans la masse.

**Détails** :
- La card archetype (le contenu le plus "partageable") occupe ~35% du fold mais n'est pas suffisamment séparée du reste
- Les highlights (populaire/clivant) et les stats (accord/vitesse) sont visuellement identiques → confusion
- Le duel-by-duel review a autant de poids visuel que le score global
- Les actions sont perdues entre le duel review et le footer

### 2. 📤 Partageabilité faible — Score : 5/10

**Constat** : Le CTA "PARTAGER" est sous le fold. Le prompt "📸 Screenshot ou partage ton profil" est en 0.6rem gris (#555) — quasi invisible. Pas de notion d'urgence ou de récompense émotionnelle.

**Impact** : L'utilisateur finit par lire les stats, scroll... et ne partage jamais. Le parcours de partage est "opt-in" au lieu d'être "opt-out".

**Détails** :
- Le bouton partage (0.75rem, padding 0.6rem) est APRÈS la card — pas dedans
- Pas de micro-animation ou de "hey, capture ça !" 
- Pas de preview de ce que le partage produit
- Le shareText est correct mais jamais montré à l'utilisateur avant le partage

### 3. 📊 Information overload — Score : 4/10

**Constat** : 8 sections empilées sans regroupement logique. L'utilisateur voit :
1. Card archetype (OK — c'est l'ancre)
2. Prompt screenshot (texte faible)
3. Highlights 2×2 (populaire + clivant)
4. Analysis 2×2 (accord + vitesse)
5. Category breakdown (barres)
6. Duel review (15 duels × 2 cartes chacun)
7. 4 boutons d'action
8. 2 liens + footer

**Impact** : Cognitive overload. L'utilisateur ne sait pas quoi faire. Scroll fatigue. Sentiment de "c'est trop" plutôt que "c'est fun".

### 4. 🏷️ Deux liens Classements — Score : 3/10

**Constat** : 
- Bouton `🏆 Classements` dans la section actions
- Lien `Explorer →` dans le footer sociologique

**Impact** : Confusion UX — "pourquoi deux fois la même chose ?" Donne une impression de page mal finie.

### 5. 🖼️ Logo absent — Score : 3/10

**Constat** : La page d'accueil utilise `<img src="/logo-rog-new.svg">` (identité forte). La page recap utilise seulement un texte emoji "🚩 RED OR GREEN" en 0.6rem.

**Impact** : Rupture d'identité de marque. Le screenshot partagé ne porte pas le logo officiel. Moins viral car moins reconnaissable.

---

## 🟡 Problèmes secondaires

### 6. Duel review trop dense
Chaque duel affiche 2 sous-cartes côte à côte (Ton choix VS l'autre). Avec 15 duels, ça représente ~600px de scroll. Le ratio signal/bruit est très faible — la plupart des duels n'apportent rien de mémorable.

**Recommandation** : Afficher seulement les 3 duels les plus intéressants (les plus serrés + le plus populaire + celui où l'utilisateur était en minorité). Masquer le reste derrière un expandable.

### 7. Section « Par catégorie » peu lisible
Les barres de progression (5px de hauteur) sur 55px de large sont presque invisibles. Les labels sont tronqués (ellipsis).

### 8. Buttons d'action sans hiérarchie
Partager, Nouvelle partie, Continuer, Classement — 4 boutons visuellement proches. Le CTA principal (partager) devrait dominer, les autres sont secondaires.

### 9. Footer sociologique redondant
"Tes votes alimentent les classements par sexe et âge" + "Explorer →" — déjà dit via le bouton Classement. Double emploi.

---

## ✅ Points positifs

| Élément | Évaluation |
|---------|-----------|
| Système d'archétypes | ✅ Excellent — personnalisé, fun, partageable |
| Card screenshot | ✅ Bon contenu (archetype + 3 stats + tagline) |
| Confetti à l'arrivée | ✅ Récompense émotionnelle |
| Duel A vs B | ✅ Bonne idée de montrer les deux éléments |
| Use of hub CSS classes | ✅ Cohérence visuelle avec la home |
| Speed profile | ✅ Ajoute une dimension ludique |

---

## 📋 Plan de correction (priorité)

| # | Action | Impact | Effort |
|---|--------|--------|--------|
| 1 | **Restructurer en 3 niveaux** : Zone 1 (Hero = card + share), Zone 2 (Stats compactes), Zone 3 (Détails repliés) | ⬆️⬆️⬆️ | Moyen |
| 2 | **Monter le CTA Partager dans la card** ou immédiatement après, bien visible au-dessus du fold | ⬆️⬆️⬆️ | Faible |
| 3 | **Ajouter le logo SVG** dans la card à la place du texte emoji | ⬆️⬆️ | Faible |
| 4 | **Supprimer le doublon Classement** : garder un seul lien dans les actions | ⬆️⬆️ | Faible |
| 5 | **Réduire le duel review** à 3 duels clés (plus intéressant + en minorité + plus serré) | ⬆️⬆️ | Moyen |
| 6 | **Fusionner highlights + analysis** en une seule section « Tes stats » avec hiérarchie interne | ⬆️⬆️ | Moyen |
| 7 | **Rendre la catégorie breakdown optional** (repliée par défaut) | ⬆️ | Faible |
| 8 | **Renforcer la séparation visuelle** entre les 3 zones avec des separators ou des labels de section | ⬆️⬆️ | Faible |

---

## 🎯 Score cible

| Critère | Score actuel | Score cible |
|---------|:---:|:---:|
| Hiérarchie visuelle | 4/10 | 9/10 |
| Partageabilité | 5/10 | 9.5/10 |
| Densité information | 4/10 | 9/10 |
| Cohérence marque | 3/10 | 10/10 |
| Actions claires | 5/10 | 9.5/10 |
| **GLOBAL** | **6/10** | **9.5/10** |

---

*Rapport généré automatiquement. Screenshots disponibles dans `screenshots/`.*

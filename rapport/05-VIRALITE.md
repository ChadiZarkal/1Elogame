# 🚀 Brique 5 — Viralité & Partage Social

**Priorité globale : 🟠 HAUTE**  
**Score de préparation : 3/10**

---

## État des lieux

### ✅ Ce qui existe

| Élément | Détail |
|---------|--------|
| `navigator.share()` | Implémenté dans `FeedbackBar.tsx` et `AllDuelsExhausted.tsx` |
| Fallback clipboard | Si `navigator.share` indisponible, copie le lien |
| Open Graph tags | Complets sur la homepage |
| Twitter Cards | Configurées (summary_large_image) |
| Image OG dynamique | Via `opengraph-image.tsx` (edge runtime) |

### ❌ Ce qui manque

| Élément | Impact |
|---------|--------|
| Résultats partageables en image | 🔴 La mécanique virale #1 est absente |
| Image OG statique | 🔴 `/og-image.png` n'existe pas (404) |
| OG dynamique par page | 🟠 Toutes les pages partagent la même preview |
| Invitation par lien | 🟠 Pas de système "invite un ami" |
| Deeplinks vers un duel | 🟠 Impossible de partager un résultat spécifique |
| Score/profil partageable | 🟠 Pas de page profil publique |
| Boutons de partage dédiés par réseau | 🟡 Uniquement `navigator.share` ou clipboard |

---

## 🔴 Problèmes critiques

### 1. Aucun résultat visuel partageable
- C'est **LE levier viral #1** pour un jeu de type quiz/vote
- Quand un utilisateur obtient un résultat Oracle ("RED FLAG 🚩 à 85%") ou finit une série de duels, il n'y a aucune image à partager
- Exemples de ce qui explose sur Instagram/TikTok :
  - "Mon résultat Red Flag Test : 87% Red Flag 🚩"
  - "Red or Green : J'ai voté comme 73% des gens sur 8/10 duels"
  - "Mon violentomètre : Score 3/20 ✅"
- **Cette image doit être générée côté serveur** (API route avec `@vercel/og` ou canvas)
- Le partage doit inclure un lien retour vers le jeu pour boucler la viralité

### 2. Image OG statique absente
- Le fichier `/og-image.png` référencé dans les Twitter Cards est un 404
- Quand quelqu'un partage le lien sur WhatsApp, Discord, Instagram stories → pas d'image
- L'image OG dynamique fonctionne pour la racine mais pas pour les sous-routes
- **Impact direct :** Un lien sans image a un taux de clic 3x plus faible

### 3. Pas de deeplinks vers les résultats
- Impossible de partager un résultat spécifique de l'Oracle
- Impossible de montrer un duel en particulier
- Le partage donne juste un lien vers la homepage
- **Impact :** L'ami qui reçoit le lien n'est pas engagé par le résultat de son ami

---

## 🟠 Éléments à développer

### 4. Boucle virale du jeu Oracle (Flag or Not)
```
Utilisateur → Soumet une situation → Reçoit un verdict
    ↓
Partage le résultat (image + lien)
    ↓
Ami voit l'image → Clique sur le lien
    ↓
Arrive sur le jeu → Soumet sa propre situation → Boucle
```

**Actuellement :** La boucle se casse à l'étape "Partage le résultat" car il n'y a pas d'image générée.

### 5. Boucle virale des Meters (violentomètre, etc.)
```
Utilisateur → Fait le test → Score X/20
    ↓
Partage "Mon résultat violentomètre" (image)
    ↓
Ami curieux → Fait le test → Partage à son tour
```

**Actuellement :** Le résultat du test n'est pas partageable. Aucun bouton de partage sur l'écran de résultat des meters.

### 6. Boucle virale Red or Green (duels)
```
Utilisateur → Joue 10 duels → Streak de 7
    ↓
Partage "Score streak 7 🔥" (image + stats)
    ↓
Ami → Essaie de battre le score → Challenge
```

**Actuellement :** Le share dans `FeedbackBar` partage juste un texte/lien. Pas d'image, pas de score cumulé.

### 7. Système de challenge / invitation
- "Envoie ce lien à un ami pour qu'il vote sur le même duel"
- Comparaison des réponses entre amis → discussion → viralité
- Pas d'infrastructure d'invitation actuellement

---

## 🟡 Optimisations futures

### 8. Boutons de partage par plateforme
- WhatsApp (préfill message + lien)
- Instagram Stories (image optimisée format story 1080x1920)
- TikTok (format vidéo court avec résultat)
- Twitter/X (tweet préformaté)
- Snapchat (sticker/filtre)
- Copier le lien (déjà fait)

### 9. Meta tags dynamiques par page
- Chaque page devrait avoir son propre OG title/description/image
- `/flagornot` → "Oracle Red Flag — Soumets ta situation"
- `/jeu` → "Red or Green — Quel est le pire ?"
- `/ressources/violentometre` → "Violentomètre en ligne — Fais le test"

### 10. Contenu "meme-able"
- Les résultats les plus extrêmes du leaderboard (le #1 red flag) = contenu viral naturel
- Afficher des stats fun : "73% des gens pensent que X est un red flag"
- Intégrer des fonctionnalités de réaction/commentaire sur les résultats

---

## 👀 Analyse par persona

### 🧑‍💼 CEO
> - La viralité est **le seul moyen d'avoir de la croissance gratuite**
> - Un coefficient viral > 1 signifie croissance exponentielle sans dépenser en pub
> - Actuellement, le coefficient viral est proche de 0 (pas de mécanisme de partage efficace)
> - **Priorité #2 après la monétisation :** Chaque utilisateur doit être un vecteur de croissance
> - Les résultats partageables ont fait exploser des jeux comme "Wordle", "This or That", "Rice Purity Test"

### 👩‍💻 CTO
> - Créer une API route `/api/share/[type]/[id]` qui génère une image OG dynamique
> - Utiliser `@vercel/og` (déjà utilisé pour `opengraph-image.tsx`)
> - Format image : 1200x630 pour OG, 1080x1920 pour stories
> - Stocker les images générées dans un CDN/cache pour ne pas les re-générer
> - Ajouter un paramètre `?ref=share` sur les liens partagés pour tracker la viralité

### 📈 Growth Hacker
> - **La mécanique virale #1 est le résultat partageable en image**
> - Framework AARRR appliqué au jeu :
>   - **Acquisition :** Image partagée → ami curieux clique
>   - **Activation :** Première partie jouée en < 10 secondes
>   - **Rétention :** Streak, historique, nouvelles catégories
>   - **Referral :** Bouton partage → coefficient viral
>   - **Revenue :** Pub inter-duels + merchandising
> - Créer un "Red Flag Score" personnel cumulé qui donne envie d'être partagé
> - Ajouter un "Classement entre amis" pour la compétition sociale

---

## 📋 Checklist viralité avant lancement

- [ ] Créer une image OG statique `/og-image.png` dans `/public/`
- [ ] Implémenter la génération d'images de résultats partageables (Oracle, Duels, Meters)
- [ ] Ajouter des boutons de partage dédiés sur chaque écran de résultat
- [ ] Créer des OG images dynamiques par page
- [ ] Ajouter des deeplinks vers les résultats (ex: `/share/oracle/[id]`)
- [ ] Ajouter le tracking `?ref=share` sur tous les liens partagés
- [ ] Implémenter le format story (1080x1920) pour Instagram/TikTok
- [ ] Créer un "Red Flag Score" cumulé personnel partageable
- [ ] Tester le partage sur WhatsApp, Discord, Instagram, Twitter, SMS

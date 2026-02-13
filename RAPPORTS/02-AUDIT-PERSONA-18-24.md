# 🎯 Audit UX/Code — Point de vue Persona 18-24 ans

> Audit effectué en parcourant le codebase comme un jeune français progressiste, sarcastique, jouant en soirée avec les potes
> Date: 13 février 2026

---

## 🧑 Qui est ce Persona?

**Profil:**
- Âge: 18-24 ans
- Lieu: France (métropole, grandes villes)
- Contexte: Joue sur mobile en soirée, à plusieurs (jeu = prétexte à débat)
- Valeurs: Progressiste, féministe, anti-patriarcat, queer-friendly
- Attentes: Humour, sarcasme, engagement politique modéré, viralité, authenticité
- Motivation: S'amuser, créer du débat, partager sur réseaux (flex), voir le classement

---

## 🚨 FRICTION CRITIQUE — Tue l'expérience immédiatement

### 1. ❌ ZÉRO ONBOARDING
**Problème:**
- Utilisateur arrive sur la homepage: 3 jeux, pas d'explication
- Question implicite: "C'est quoi ce truc?"
- Persona quitte probablement sans essayer

**Code:**
```tsx
// game/src/app/page.tsx
// → Simple hub avec 3 cards, c'est tout
// Pas de splash screen
// Pas de "how to play" modal
// Pas de "why should I care"
```

**Impact:** Bounce rate catastrophique sur nouveaux utilisateurs

**Quick Win Fix:**
- Ajouter un splashscreen 5s mode "welcome" avec explications:
  - "Choisis le pire de 2 options (Red Flag)"
  - "L'IA juge ce que tu dis (Flag or Not)"
  - "Prends le quiz externe"
- OU Modal interstitiel au premier load: "C'est quoi Red Flag Games?"

---

### 2. ❌ PAS DE CONTEXTE SOCIAL — Pourquoi jouer?
**Problème:**
- Pas de leaderboard public visible AVANT de jouer
- Pas de "X duels joués", "Y joueurs actifs" sur homepage
- Persona ne voit pas "pourquoi" c'est cool/populaire

**Code:**
```tsx
// game/src/app/page.tsx, lines 20-30
{stats && (
  <motion.div ... >
    <span>{stats.estimatedPlayers} joueurs</span>
    <span>{stats.totalVotes.toLocaleString()} votes</span>
  </motion.div>
)}
// ✓ Les stats SONT là! Mais:
// - Trop petit, trop haut
// - Format "estimatedPlayers" n'est pas viral
// - Pas de "trending now" (duel le plus voté du jour)
```

**Impact:** FOMO minimal, pas de raison immédiate de rester

**Fix:**
- Monter les stats plus gros sur la homepage
- Ajouter "🔥 Trending: [element] vs [element]" (duel le plus voté)
- Ajouter "⚡ X personnes jouent EN CE MOMENT" (Supabase Realtime)

---

### 3. ❌ APRÈS UN VOTE: PAS DE PARTAGE
**Problème:**
- Utilisateur vote, voit résultat, où est le bouton "Partager"?
- Pas d'image à partager sur WhatsApp/Insta
- Zéro viralité de résults

**Code:**
```tsx
// game/src/components/game/ResultDisplay.tsx, lines 450+
<motion.button
  className="bg-[#EF4444] ..."
  whileTap={{ scale: 0.95 }}
>
  Encore ! 🔥
</motion.button>
// AUCUN bouton "Partager ce résultat"
// AUCUN bouton "Copier le lien"
// AUCUNE card shareable avec screenshot
```

**Impact:** Persona joue, s'amuse, puis → rien. Pas moyen de partager = pas de viralité

**Fix:**
- Ajouter bouton "Partager ce duel" (WhatsApp, Twitter, copy link)
- Générer card visuelle: "[Persona chose A] mais t'es team [B] ❌"
- Share URL: `?challenge=duel_id` pré-remplit ce duel quand ami clique

---

### 4. ❌ FLAG or NOT: IA Verdict pas pédagogue
**Problème:**
- Persona tape "fumer un cigare"
- L'IA dit: "Tabac de luxe machiste. Red Flag"
- Persona pense: "Pourquoi machiste? Explication rapide?"
- Il n'y a PAS de vraie justification

**Code:**
```tsx
// game/src/app/flagornot/page.tsx, lines 390-410
<motion.p
  className="text-[#9CA3AF] text-lg text-center font-medium"
>
  {result.justification}
</motion.p>
// La justification EXISTE mais:
// - Format une ligne uniquement
// - Pas d'options pour "expliquer plus" ou "débattre"
// - L'IA ne peut pas expliquer "pourquoi" sociologiquement
```

**Impact:** Persona ne comprend pas l'IA → moins engagé avec Flag or Not

**Fix:**
- Ajouter "ℹ️ Plus d'explications?" → modal avec contexte sociologique
- Dans le prompt Gemini: ajouter field optionnel "explanation_emoji" (🧠, 📊, 💬, etc.)
- Ajouter bouton "Je suis pas d'accord" → enregistre vote utilisateur vs IA (feedback)

---

## 🟡 FRICTIONS MAJEURES — Tue l'engagement après 5 min

### 5. ❌ RED FLAG GAME: Pas d'historique visible
**Problème:**
- Persona joue 10 duels, puis sort
- Lendemain: il veut revoir ses votes, pas moyen
- "Quelle était ma réaction sur X vs Y?"

**Code:**
```tsx
// game/src/app/jeu/jouer/page.tsx, lines 100-110
{duelHistory.length > 0 && (
  <div className="pt-4 pb-2">
    <div className="text-center text-[#555] text-xs mb-3">
      <span>{duelHistory.length} duels précédents</span>
    </div>
    {duelHistory.map((entry, i) => (
      <CompactResult ... />
    ))}
  </div>
)}
// ✓ L'HISTORIQUE EST LÀ!
// Mais: Comment accéder à une session antérieure?
// Pas de boutons "voir tous mes votes"
```

**Impact:** Pas de raison de revenir (pas d'archivage)

**Fix:**
- Ajouter bouton "Mes statistiques" sur homepage
- Page `/mon-historique`: tous les votes groupés par date
- Stats "Vous avez voté pour [RED]: 60%, [GREEN]: 40%"
- Filtrer par catégorie, date range

---

### 6. ❌ LEADERBOARD: Pas visible publiquement
**Problème:**
- Persona a une streak de 12, mais personne ne le sait
- Pas de page publique pour montrer ses perfs
- "Je m'appelle X et j'ai X duels gagnés" → zéro flex

**Code:**
```tsx
// game/src/app/classement/page.tsx exists!
// BUT: Comment arrive-t-on là?
// Bouton "Voir le classement" est VRAIMENT petit (footer-style)
// Sur homepage: au lieu d'être un CTA principal

// Pas de:
// - "🏆 Vous êtes #234 sur 10K joueurs!"
// - "📈 Progression cette semaine"
// - "🔥 Meilleure streak: 15 duels"
```

**Impact:** Zero gamification, zero motivation de grind

**Fix:**
- Ajouter **"Classement global" comme CTA principal** (bouton 2e ligne, après les 3 jeux)
- Afficher votre rang si vous avez joué (petite badge sur home)
- Ajouter onglets: "Global / Amis / Cette semaine"
- Pages: "Top 100 + votre position", "Trending duels", "Votre profil public"

---

### 7. ❌ AUCUN MODE COMPÉTITIF/CHALLENGE
**Problème:**
- Persona joue seul indéfiniment
- Pas de "défi 10 duels" avec score final
- Pas de mode battle (2 joueurs font des choix, IA juge qui était le plus red flag)
- Pas de raison de "terminer" une session

**Code:**
```tsx
// game/src/app/jeu/jouer/page.tsx
// Aucun concept de "game mode"
// Juste: jouez indéfiniment, accumlez des duels
// Pas de: limite, score, défi, compétition
```

**Impact:** Engagement plateau → persona s'en va après 15 min

**Fix:**
- "Mode défi 10 duels": 10 duels d'affilée, score final shareable
- "Streak challenge": battre votre record précédent
- "Duels du jour": 5 duels spécialisés refresh daily
- "Battle mode": invite ami, soumettez vos choix, leaderboard

---

### 8. ❌ PROFILE FORM: Pas assez personnalisé
**Problème:**
- Formulaire genre/âge très minimaliste
- Pas de "pseudo", "bio", "apparence"
- Persona peut pas se dire "je suis unique"

**Code:**
```tsx
// game/src/components/game/ProfileForm.tsx
// Juste 2 champs: sexe + âge
// Button: "JOUER"
// C'est ça. Zéro personnalisation.

// Pas de:
// - Pseudo (pour leaderboard)
// - Couleur/emoji avatar
// - Citation/bio
// - Équipe (rouge/vert preference?)
```

**Impact:** Persona se sent anonymous, moins attaché

**Fix:**
- Ajouter champs optionnels: Pseudo, Avatar emoji, Couleur préf
- Suggestion: "Si pas de pseudo, on met Anonyme_[ID aléatoire]"
- Leaderboard montre avatar + pseudo + streak

---

## 🟢 CE QUI MARCHE BIEN ✨

### ✅ ANIMATIONS + FEEDBACK
- Particle burst sur verdict (emoji explosifs)
- Streak emoji dynamique (🔥→😱→🤯)
- Pulsing orb en loading (très satisfaisant)
- **C'est du Polish!**

### ✅ TONE + PROMPTS
- "Consultation du tribunal des flags ⚖️" (humor IA loading)
- Suggestions contextuelus ("Il regarde ton téléphone", "Elle te prépare un café")
- **Persona reconnaît son vécu**

### ✅ CATEGORISATION (thématique)
- Menu mode "Toutes catégories" vs catégories spécialisées
- **Personnalisation = engagement**

### ✅ MOBILE-FIRST
- Layout responsive
- Bottom input (jeu Red Flag)
- Prend tout l'écran = immersion

---

## 📋 AMÉLIORATIONS RANGÉES PAR IMPACT & EFFORT

### 🔴 P0 — Do ASAP (impact énorme, effort petit)

| # | Amélioration | Impact | Effort | Code |
|---|---|---|---|---|
| A1 | **Share duel result** | Viralité 🚀 | 1j | Bouton share → copy link + image |
| A2 | **Trending duel badge** (homepage) | FOMO, social proof | 0.5j | Ajouter stat "🔥 Le plus voté" |
| A3 | **Splash screen onboarding** | Comprendre jeu | 1j | Modal 1ère visite |
| A4 | **Badge "Vous êtes #X"** sur home | Gamification | 0.5j | Query leaderboard, afficher rank |
| A5 | **Bouton Leaderboard plus visible** | Découverte | 0.5j | Déplacer de footer à CTA principal |
| A6 | **Historique accessible** | Retention | 0.5j | Page `/mon-historique` simple |

### 🟠 P1 — Soon (impact bon, effort moyen)

| # | Amélioration | Impact | Effort | Raison |
|---|---|---|---|---|
| B1 | Mode défi 10 duels | Engagement | 2j | Score shareable, less "scroll infinite" |
| B2 | Battle mode (2 joueurs) | Social, compétitif | 3j | Multiplayer = viral |
| B3 | Personnalisation profil (pseudo, avatar) | Identification | 1j | Leaderboard avec faces |
| B4 | Flag or Not: feedback "pas d'accord" | Engagement IA | 1j | Votes utilisateur vs IA |
| B5 | Leaderboard onglets (global/semaine/amis) | Navigation | 1j | Contextes différents |
| B6 | Duels du jour spécialisés | Daily habit | 1j | Raison de revenir |

### 🟡 P2 — Later (impact spécifique, effort moyen)

| # | Amél | Impact | Effort |
|---|---|---|---|
| C1 | Explications IA améliorées (sociologie context) | Éducation | 1j |
| C2 | Badges/titres (basés sur streak) | Gamification | 2j |
| C3 | Musique/haptics sur vote | Polish, feedback | 0.5j |
| C4 | Invitations amis (share code) | Growth viral | 1.5j |
| C5 | Compteur "joueurs en ligne" realtime | Social proof | 1j (Supabase) |

---

## 🚨 BUGS/ISSUES BLOQUANTS (Code Quality)

| # | Type | Sévérité | Description |
|---|---|---|---|
| [BUG-01] | UX | HAUTE | Homepage: stats "estimatedPlayers" peut être 0 → "0 joueurs" = RIP |
| [BUG-02] | UX | MOYENNE | Red Flag game: "All duels exhausted" screen → pas de bouton retry clair |
| [BUG-03] | Data | MOYENNE | Historique duels limité à 10 (`MAX_HISTORY`) — après 10 duels, anciens disparaissent |
| [BUG-04] | UX | BASSE | Flag or Not: placeholder de input change toutes les 3.5s: distraction |
| [BUG-05] | Perf | MOYENNE | Leaderboard complet: pas de pagination → peut charger 100K rows en prod |

---

## 🎯 STRATÉGIE DE DÉPLOIEMENT (pour persona)

### Phase 1: Quick Wins (1 semaine)
- Share duel + image
- Splash screen
- Leaderboard badge homepage
- Onboarding visible

### Phase 2: Engagement (2 semaines)
- Mode défi 10
- Historique visible
- Pseudo + avatar

### Phase 3: Social (1 mois)
- Battle mode (multiplayer)
- Duels du jour
- Invitations amis

---

## 💡 OBSERVATIONS FINALES

1. **Le jeu MARCHE** — Animations, tone, gameplay sont solides
2. **Mais il manque**: contexte social, partage, raison de revenir
3. **Persona veut**: jouer EN GROUPE → partager → flex → compétition
4. **Donc**: features sociales > features de gameplay additionnel

**En un mot: Moins de "plus de jeux", plus de "partage + leaderboard + compétition"**

---

*À utiliser comme backlog urgences pour maximiser engagement des 18-24 ans.*

# 🚀 Améliorations proposées — Flag Games

> Dernière mise à jour — après intégration Gemini AI + 35 itérations UX mobile  
> Les éléments marqués ✅ ont déjà été implémentés. Les autres sont des propositions.

---

## ✅ Déjà implémenté

### Phase 1 — Architecture & Hub

| # | Amélioration | Détail |
|---|---|---|
| 1 | **Page Hub centralisée** | Page d'accueil `/` avec choix entre les deux jeux, design cohérent charte sombre + rouge |
| 2 | **Jeu "Red Flag ou Green Flag ?"** | Interface mobile-first input → IA → verdict coloré |
| 3 | **`.env.local.example`** | Template de variables d'environnement documenté |

### Phase 2 — Intégration Gemini AI (Vertex AI)

| # | Amélioration | Détail |
|---|---|---|
| 4 | **Google Cloud Vertex AI** | JWT RS256 auth via service account, token caching 1h, Gemini 2.0 Flash |
| 5 | **Cascade IA intelligente** | Gemini → OpenAI → Fallback local. Basculement automatique si un provider est down |
| 6 | **Réponse JSON structurée** | `responseMimeType: application/json` + `responseSchema` pour output garanti |
| 7 | **Prompt jeune français** | System prompt calibré 18-24 ans, ton complice, français parlé, références culture |
| 8 | **Fallback local enrichi** | 20+ mots-clés normalisés (NFD) + 7 justifications par couleur, analyse multi-critère |

### Phase 3 — 35 itérations UX mobile

| Iter | Amélioration | Catégorie |
|---|---|---|
| 1 | **Layout bottom-pinned input** | Input toujours en bas (zone pouce) comme appli de chat | 
| 2 | **Phase state machine** | 3 phases clean : `idle` → `loading` → `reveal` (pas de booléens multiples) |
| 3 | **Safe area handling** | `env(safe-area-inset-*)` partout pour notch + indicateur home |
| 4 | **Viewport height fix** | `--app-height` via `visualViewport` API, fini le jump avec le clavier |
| 5 | **Typographie responsive** | `clamp()` implicite avec `sm:` breakpoints, tailles optimisées mobile |
| 6 | **Placeholders rotatifs** | 8 exemples qui défilent toutes les 3.5s |
| 7 | **12 suggestions horizontales** | Scroll horizontal snap avec emoji, plus varié, un tap = input rempli |
| 8 | **Bouton envoi 52×52px** | Toucher target > 44pt Apple, glow rouge quand actif |
| 9 | **Input 16px** | Empêche le zoom auto iOS sur focus |
| 10 | **Auto-focus retour idle** | Focus automatique de l'input après chaque verdict |
| 11 | **Orbe pulsant rouge/vert** | Animation loading alternant gradients radiaux + scale |
| 12 | **Box shadow animé loading** | Halos red/green qui alternent pendant la réflexion |
| 13 | **Minimum 900ms loading** | Suspense dramatique même si réponse instantanée |
| 14 | **Phrases loading rotatives** | 8 phrases différentes, aléatoires, avec emojis |
| 15 | **Dots animés tricolores** | 3 points qui cyclent gris → rouge → vert |
| 16 | **14 particules burst** | Plus de particules, plus d'emojis variés (7 red, 7 green) |
| 17 | **Emoji géant spring** | 96px+ avec stiffness 180, damping 12, rotation + drop |
| 18 | **Texte verdict avec glow** | Text-shadow double (40px + 100px) pour effet néon |
| 19 | **Justification auto-affichée** | Plus besoin de cliquer — card glass visible immédiatement |
| 20 | **Background gradient ambient** | Radial gradient qui s'adapte à chaque phase |
| 21 | **Top bar avec back + score** | Navigation + score pill toujours visibles |
| 22 | **Score pill emoji** | `🚩 3 · 🟢 5` au lieu de chiffres secs |
| 23 | **Haptic différencié** | Red = double vibration [80, 40, 80], Green = simple [60] |
| 24 | **Bouton Encore full-width** | 100% largeur, py-18px, glow couleur verdict, spring animation |
| 25 | **Touch targets 48px minimum** | Tous les boutons ≥ 48×48px pour accessibilité |
| 26 | **Keyboard dismiss on submit** | `inputRef.blur()` avant loading pour max viewport |
| 27 | **Glass morphism** | `.glass` class : blur(20px) + semi-transparent bg |
| 28 | **Texte original affiché** | Le texte soumis visible en loading ET en reveal |
| 29 | **Snap scroll suggestions** | `snap-x snap-mandatory` pour défilement chip par chip |
| 30 | **Active scale sur tout** | `active:scale-95` / `active:scale-[0.97]` sur chaque touchable |
| 31 | **Aria labels** | Labels d'accessibilité sur boutons et navigation |
| 32 | **AnimatePresence mode wait** | Transitions fluides entre TOUTES les phases |
| 33 | **History pills en idle** | 5 derniers jugements sous le contenu central |
| 34 | **Progress bar en reveal** | Barre red/green sous le bouton Encore |
| 35 | **Scrollbar hide utility** | Classe `.scrollbar-hide` pour cacher les scrollbars sur suggestions |

---

## 🎯 Propositions d'amélioration (à valider)

### Priorité haute — Forte chance d'acceptation

| # | Proposition | Impact | Effort |
|---|---|---|---|
| 1 | **Partage social du verdict** | Bouton "Partager" qui génère une image/story avec la phrase + verdict. Viral par nature. Persona Alex adore partager du contenu fun. | Fort | Moyen |
| 2 | **Mode multijoueur "Hot take"** | Un joueur écrit, les autres devinent red/green avant que l'IA ne tranche. Parfait pour les soirées (use case principal du persona). | Fort | Moyen |
| 3 | **Suggestions de phrases** | Boutons "suggestions" avec des phrases pré-écrites pour inspirer les joueurs qui manquent d'idées. Réduit la friction d'entrée. | Moyen | Faible |
| 4 | **Compteur de streak "d'accord avec l'IA"** | Comme le streak du jeu 1 mais inversé : combien de fois tu devines ce que l'IA va dire. Gamification addictive. | Moyen | Faible |
| 5 | **Animation de résultat plus punch** | Confetti pour green flag, "explosion" pour red flag. Rend le moment du verdict plus mémorable et shareable. | Moyen | Faible |

### Priorité moyenne

| # | Proposition | Impact | Effort |
|---|---|---|---|
| 6 | **Statistiques globales "Flag-O-Mètre"** | Dashboard anonyme montrant les phrases les plus red/green soumises par tous les joueurs. Encourage la curiosité et le retour. | Moyen | Moyen |
| 7 | **Catégories de phrases** | Permettre de choisir un thème (couple, amitié, travail, famille) pour contextualiser les jugements IA. | Moyen | Moyen |
| 8 | **Rate limiting côté API** | Limiter à ~30 requêtes/minute/IP pour éviter l'abus de l'API OpenAI et contrôler les coûts. | Faible (sécurité) | Faible |
| 9 | **Cache des jugements** | Sauvegarder les jugements en Supabase pour ne pas re-juger la même phrase. Réduit les coûts API. | Moyen (coûts) | Moyen |
| 10 | **PWA / Add to Home Screen** | Manifest + service worker pour "installer" le jeu sur l'écran d'accueil mobile. Zero friction au retour. | Moyen | Faible |

### Priorité basse — Nice to have

| # | Proposition | Impact | Effort |
|---|---|---|---|
| 11 | **Dark/Light mode toggle** | Le persona joue surtout en soirée, le dark mode est déjà par défaut. Le light mode serait un plus mineur. | Faible | Faible |
| 12 | **Sons / SFX** | Petit son au verdict (buzzer red, ding green). Désactivable. Le brief original l'exclut ("context already noisy"). | Faible | Faible |
| 13 | **Multilingue (EN/FR)** | Supporter l'anglais pour élargir l'audience. Le prompt IA s'adapterait automatiquement. | Moyen | Moyen |
| 14 | **Score AI confidence** | Montrer un pourcentage de "certitude" de l'IA (ex: "87% sûr que c'est Red Flag"). Ajoute une dimension ludique. | Faible | Faible |

---

## 🔧 Notes techniques

### ✅ Architecture IA — Cascade Gemini → OpenAI → Local (FONCTIONNEL)
```
Requête utilisateur
    │
    ▼
┌──────────────────────────┐
│  Gemini 2.0 Flash 001    │ ← Service account + @google-cloud/vertexai
│  (Vertex AI)             │   **IMPORTANT: Utiliser gemini-2.0-flash-001 avec suffixe -001**
└────────┬─────────────────┘
         │ si erreur
         ▼
┌──────────────────────────┐
│  OpenAI GPT              │ ← OPENAI_API_KEY env var (optionnel)
│  (optionnel)             │
└────────┬─────────────────┘
         │ si erreur
         ▼
┌──────────────────────────┐
│  Fallback local          │ ← Mots-clés NFD + justifications pré-écrites
│  (toujours OK)           │   Réseau local OK, pas d'API
└──────────────────────────┘
```

### 📋 Variables d'environnement (optionnelles)
```env
# Vertex AI Gemini (automatique si service account présent)
VERTEX_AI_LOCATION=us-central1
VERTEX_AI_MODEL=gemini-2.0-flash-001  # IMPORTANT: suffixe -001 obligatoire

# OpenAI (optionnel, fallback)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# Supabase (jeu 1, si utilisé)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 📁 Structure des fichiers finalisée
```
game/
├── src/
│   ├── lib/gemini.ts                     # ✅ Auth @google-cloud/vertexai
│   ├── app/
│   │   ├── page.tsx                      # Hub sélection de jeu
│   │   ├── redflag/page.tsx              # Landing jeu 1
│   │   ├── flagornot/page.tsx            # Jeu 2 (35 itérations UX)
│   │   ├── api/flagornot/judge/route.ts  # ✅ Cascade Gemini→OpenAI→Local
│   │   └── globals.css                   # Animations + glass morphism
│   └── ...
├── ai-agent-cha-2y53-c855d0c34cb8.json  # Service account (racine game/)
├── .env.local.example                    # Template env vars
└── package.json                          # Dépendances inclues
```

### 🎯 Coûts estimés
- **Gemini 2.0 Flash 001** : ~$0.075 par M input tokens + $0.30 par M output tokens (très bon marché)
- **OpenAI gpt-4o-mini** : ~$0.15 par jugement
- **Local fallback** : Gratuit (pas d'API)
- 10 000 jugements ≈ $1.50 USD
- Le fallback local est **gratuit** et fonctionne sans clé API

---

## 📱 Compatibilité mobile testée

- [x] Clavier virtuel ne cache pas l'input (visualViewport API)
- [x] Hauteur dynamique avec `100dvh`
- [x] Safe areas (notch iPhone)
- [x] Touch feedback (`active:scale`, haptic vibration)
- [x] Pas de zoom automatique sur focus input (`maximumScale: 1`)
- [x] Transitions GPU-accelerated (framer-motion)

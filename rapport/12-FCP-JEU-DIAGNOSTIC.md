# Rapport 12 — Diagnostic FCP 10.19s sur `/jeu`

**Date :** Post-commit `50e65da`  
**Données source :** Vercel Speed Insights (P75 mobile)  
**Scope :** Page `/jeu` (ProfileForm — saisie du prénom avant la partie)

---

## 1. Données mesurées

| Métrique | Valeur | Seuil Google | Statut |
|----------|--------|-------------|--------|
| **TTFB** | 0.04s | < 0.8s | ✅ Excellent |
| **FCP** | 10.19s | < 1.8s | 🔴 Critique |
| **LCP** | 1.24s | < 2.5s | ✅ Bon |
| **CLS** | 0.25 | < 0.1 | 🟠 À corriger |
| **INP** | 200ms | < 200ms | 🟡 Limite |

**Observation clé :** TTFB = 0.04s → le serveur répond instantanément.  
Le gap de **10 secondes entre réception du HTML et premier pixel peint** est un problème purement front-end/CSS.

---

## 2. Cause racine identifiée

### 2.1 Architecture actuelle de `/jeu`

```
src/app/jeu/page.tsx          → 'use client' → ProfileForm
src/components/game/ProfileForm.tsx → 'use client' → 222 lignes
```

Le HTML est bien généré côté serveur (SSR) et livré en 0.04s.  
**Mais rien n'est visible** à cause de l'enchaînement bloquant suivant :

```
HTML reçu (0.04s)
    ↓
CSS doit télécharger  [84 KB compilé — BLOQUANT]
    ↓
animations CSS démarrent (from { opacity: 0 } sur TOUS les éléments)
    ↓
FCP enregistré seulement quand les pixels deviennent visibles
```

### 2.2 Le problème exact : `animation-fill-mode: both` + `from { opacity: 0 }`

Dans `globals.css`, TOUS les keyframes utilisés par ProfileForm commencent à `opacity: 0` :

```css
@keyframes fade-in       { from { opacity: 0; }       to { opacity: 1; } }
@keyframes fade-slide-up { from { opacity: 0; transform: translateY(20px); } ... }
@keyframes fade-scale-in { from { opacity: 0; transform: scale(0.95); }    ... }
```

Les classes appliquées par ProfileForm :
- `animate-pf-logo`    → `animate-pf-logo 0.8s ease-out forwards`
- `animate-pf-form`    → `animation-delay: 0.2s` + `animation-fill-mode: both`
- `animate-pf-howto`   → `animation-delay: 0.4s` + `animation-fill-mode: both`
- `animate-fade-in`    → délai 0.1–0.4s selon le contexte

**`animation-fill-mode: both`** applique l'état `from` AVANT que l'animation commence.  
Résultat : tous les éléments sont à `opacity: 0` dès que le CSS est parsé.  
Le navigateur ne peut pas peindre un pixel visible → **FCP bloqué**.

### 2.3 Le correctif précédent ciblait le mauvais coupable

Le lazy-loading de `AnimatedBackgroundCSS` (commit `ccb224d`) a différé l'arrière-plan,  
mais l'arrière-plan ne contribue pas au FCP — c'est le formulaire lui-même qui bloque.

### 2.4 Facteur aggravant : bundle JS lourd sur mobile lent

```
Top 3 chunks (non compressés) :
  221 KB
  219 KB  
  187 KB
  + 35 autres chunks → ~2.5 MB total
```

Sur 3G/4G lente (France, P75 = portion significative du trafic) :
- 84 KB CSS + 200+ KB JS critiques → plusieurs secondes de téléchargement
- Main thread bloqué pendant le parse JS → retarde encore l'animation CSS

---

## 3. Plans de correction — classés par impact/effort

---

### ⚡ Plan A — Quick Win : CSS animations uniquement post-hydration (2 lignes, 0 risque)

**Principe :** SSR rend les éléments avec `opacity: 1`. Les animations s'appliquent APRÈS que React se monte côté client.

**Implémentation :**

```tsx
// ProfileForm.tsx
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

// Dans le JSX :
<div className={mounted ? 'animate-pf-logo' : ''}>
  {/* logo */}
</div>
<div className={mounted ? 'animate-pf-form' : ''}>
  {/* form */}
</div>
```

**Sans animation class au SSR :**
- Le HTML est livré avec `opacity: 1` (pas de classe CSS d'animation)
- FCP se déclenche immédiatement à la réception du HTML
- After hydration (~500ms), les animations s'appliquent (bel effet de transition)
- **Aucun régression visuelle** — l'utilisateur voit le formulaire puis les animations le "raffrachissent"

**Impact estimé :**
- FCP : 10.19s → **< 1s** (= TTFB + réseau HTML ~100ms)
- Effort : 30 minutes
- Risque : Très faible (aucune refactorisation architecturale)

**⚠️ Point CLS :** Si les animations déplacent des éléments (translateY), appliquer `min-height` fixes sur les conteneurs pour éviter le layout shift.

---

### 🏗️ Plan B — Architectural : Convertir `/jeu` en Server Component + Client Island

**Principe :** La page `/jeu` et son shell statique deviennent un Server Component.  
`ProfileForm` reste Client mais chargé en île.

**Implémentation :**

```tsx
// src/app/jeu/page.tsx — AVANT (actuel)
'use client';
export default function JeuPage() {
  const clearProfile = useGameStore(...)
  useEffect(() => clearProfile(), [])
  return <ProfileForm />
}
```

```tsx
// src/app/jeu/page.tsx — APRÈS
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const ProfileFormClient = dynamic(
  () => import('@/components/game/ProfileForm'),
  { ssr: false, loading: () => <ProfileFormSkeleton /> }
);

export default function JeuPage() {
  return (
    <main>
      <Suspense fallback={<ProfileFormSkeleton />}>
        <ProfileFormClient />
      </Suspense>
    </main>
  );
}
```

```tsx
// ProfileFormSkeleton — HTML statique visible immédiatement
function ProfileFormSkeleton() {
  return (
    <div style={{ opacity: 1 }}>
      <h1>Bienvenue</h1>
      <p>Chargement du jeu...</p>
    </div>
  );
}
```

**Impact estimé :**
- FCP : 10.19s → **< 0.3s** (le skeleton static est peint immédiatement)
- LCP non régressé
- CLS potentiellement amélioré si le skeleton occupe le même espace
- Effort : 2-3 heures (refactorisation + déplacement logique Zustand)
- Risque : Moyen — la logique `clearProfile()` dans useEffect doit migrer dans ProfileForm

---

### 🎯 Plan C — Neutraliser `animation-fill-mode: both` pour les classes critiques

**Principe :** Changer uniquement les classes ProfileForm pour ne pas commencer à `opacity: 0`.

**Dans `globals.css` ou `tailwind.config` :**

```css
/* AVANT */
.animate-pf-logo {
  animation: fade-in 0.8s ease-out forwards;
  animation-fill-mode: both; /* ← cause le opacity:0 initial */
}

/* APRÈS */
.animate-pf-logo {
  animation: fade-in 0.8s ease-out;
  /* fill-mode: none → l'élément part de opacity:1 (son état naturel) */
  /* et fade-in s'applique depuis opacity:0 MAIS seulement pendant l'animation */
  /* Résultat : visible immédiatement, léger "flash" au démarrage */
}
```

**Variante propre (sans flash) :**

```css
/* Keyframe modifié pour les classes pf uniquement */
@keyframes pf-appear {
  /* PAS de from: opacity:0 — commence directement depuis l'état visible */
  from { transform: translateY(10px); }
  to   { transform: translateY(0); }
}

.animate-pf-logo {
  animation: pf-appear 0.5s ease-out both;
  /* opacity reste à 1 tout au long — seul le translateY anime */
}
```

**Impact estimé :**
- FCP : 10.19s → **< 1.5s** (CSS doit encore télécharger, mais les éléments sont visibles dès le parse CSS)
- Attention : Si CSS met 2s à télécharger sur 3G → FCP reste à 2s (amélioration de 8s mais pas optimal)
- Effort : 1 heure
- Risque : Très faible

---

### 🚀 Plan D — Critical CSS Inline + Déférer le reste

**Principe :** Extraire les 20 règles CSS critiques pour ProfileForm et les inliner dans `<head>`.  
Le reste du CSS (84 KB) est chargé de façon non-bloquante.

**Dans `src/app/layout.tsx` :**

```tsx
const CRITICAL_CSS = `
  .animate-pf-logo { animation: none; opacity: 1; }
  .animate-pf-form { animation: none; opacity: 1; }
  .animate-pf-howto { animation: none; opacity: 1; }
  /* + les styles de base du formulaire : fonts, layout, couleurs */
`;

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <style dangerouslySetInnerHTML={{ __html: CRITICAL_CSS }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

**Simultanément, charger le CSS principal en non-bloquant :**

```html
<link rel="preload" href="/_next/static/chunks/styles.css" as="style" onload="this.rel='stylesheet'">
```

**Impact estimé :**
- FCP : 10.19s → **< 0.5s**
- Effort : 3-4 heures (identifier le CSS critique, tester les visuels)
- Risque : Moyen — le CSS inline peut entrer en conflit avec les purges Tailwind, FOUC possible

---

### 🏎️ Plan E — Radical : Formulaire HTML natif + Server Action

**Principe :** Supprimer tout JavaScript de l'initial render de `/jeu`.  
Le formulaire HTML pur est peint immédiatement. Le prénom est soumis via Server Action.

**Implémentation :**

```tsx
// src/app/jeu/page.tsx
import { redirect } from 'next/navigation';

async function startGame(formData: FormData) {
  'use server';
  const name = formData.get('name') as string;
  // Stocker dans cookie ou param URL
  redirect(`/jeu/play?name=${encodeURIComponent(name)}`);
}

export default function JeuPage() {
  return (
    <main className="jeu-container">
      <h1>Quel est ton prénom ?</h1>
      <form action={startGame}>
        <input 
          name="name" 
          type="text" 
          placeholder="Ton prénom..." 
          required 
          autoFocus
        />
        <button type="submit">Jouer →</button>
      </form>
    </main>
  );
}
```

**La sélection du genre (M/F/Autre) via CSS natif :**

```html
<input type="radio" name="gender" id="m" value="M" hidden />
<label for="m" class="gender-option">Masculin</label>
<!-- CSS :checked + ~ sibling selector pour l'état actif -->
```

**Impact estimé :**
- FCP : 10.19s → **~0.04s** (= TTFB, HTML pur sans JS)
- Effort : 6-8 heures (refactorisation complète, migration Zustand → cookie/URL state)
- Risque : Élevé — remise en question de l'architecture state management

---

## 4. Comparaison des plans

| Plan | FCP estimé | Effort | Risque | Réversible |
|------|-----------|--------|--------|------------|
| **A** — Post-hydration classes | < 1s | 30 min | 🟢 Très faible | ✅ |
| **B** — Server Component + Island | < 0.3s | 2-3h | 🟡 Moyen | ✅ |
| **C** — Neutraliser fill-mode | < 1.5s | 1h | 🟢 Très faible | ✅ |
| **D** — Critical CSS inline | < 0.5s | 3-4h | 🟡 Moyen | ✅ |
| **E** — HTML natif + Server Action | ~0.04s | 6-8h | 🔴 Élevé | ⚠️ |

---

## 5. Recommandation — Stratégie en 3 temps

### Temps 1 — Immédiat (aujourd'hui, 30 min) : Plan A

Appliquer le `mounted` pattern dans `ProfileForm.tsx`.  
C'est 5 lignes de code, sans risque, et cible exactement la cause racine.

```tsx
// ProfileForm.tsx — patch minimal
const [mounted, setMounted] = useState(false);
useEffect(() => { setMounted(true); }, []);

// Classes conditionnelles en SSR vs client
const animationClasses = {
  logo:   mounted ? 'animate-pf-logo'   : '',
  form:   mounted ? 'animate-pf-form'   : '',
  howto:  mounted ? 'animate-pf-howto'  : '',
  fadeIn: mounted ? 'animate-fade-in'   : '',
};
```

### Temps 2 — Cette semaine (2-3h) : Plan B

Réarchitecturer `/jeu/page.tsx` en Server Component avec skeleton.  
Découple la page de Zustand et réduit le JS critique path.

### Temps 3 — Sprint suivant : CLS 0.25

Identifier les éléments sources de layout shift :
- Potentiellement : hauteur du formulaire change quand les boutons de genre se chargent
- Fix : `min-height` fixes sur les conteneurs d'animation, `aspect-ratio` sur les images

---

## 6. Résumé de la cause racine

```
❌ Ce qui se passe aujourd'hui :
   HTML livré (0.04s) → tout est opacity:0 → attend CSS (84KB, ~8s sur 3G) 
   → animations déclenchées → premier pixel visible (10.19s)

✅ Ce qui doit se passer :
   HTML livré (0.04s) → éléments visibles immédiatement (opacity:1) 
   → CSS télécharge → animations "embellissent" ce qui est déjà visible
   → FCP < 1s
```

**Le correctif principal n'est pas une optimisation de performance — c'est un bug d'UX : les éléments ne sont pas visibles à cause de l'état initial des animations CSS.**

---

*Rapport généré post-investigation — commit `50e65da`*  
*Outils : Vercel Speed Insights, analyse des chunks .next, grep CSS keyframes*

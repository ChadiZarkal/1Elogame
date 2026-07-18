# Audit SEO â€” Red or Green
**Domaine:** redorgreen.fr | **Date:** Juillet 2025

---

## RÃ©sumÃ©

| Axe | Score | Ã‰tat |
|-----|-------|------|
| SEO Technique | 9/10 | âœ… TrÃ¨s bon |
| MÃ©tadonnÃ©es par page | 9/10 | âœ… ComplÃ¨tes (aprÃ¨s ce sprint) |
| Contenu SEO | 4/10 | âš ï¸ Ã€ dÃ©velopper |
| Off-page / Backlinks | 3/10 | âŒ Manquant |
| Core Web Vitals | 6/10 | âš ï¸ Ã€ optimiser |

---

## âœ… Ce qui a Ã©tÃ© implÃ©mentÃ© (ce sprint)

### 1. Layout `/flashflag` â€” crÃ©Ã© de zÃ©ro
La page Flash Flag Sprint n'avait **aucun fichier `layout.tsx`**. Page entiÃ¨rement en `'use client'` sans aucune balise SEO.

**CrÃ©Ã©:** `src/app/flashflag/layout.tsx`
- Title: `Flash Flag Sprint â€” Quiz Red Flag chronomÃ©trÃ©`
- Description + keywords ciblÃ©s (`flash flag`, `quiz red flag rapide`, `test chronomÃ©trÃ©`â€¦)
- OpenGraph + Twitter card
- Canonical: `/flashflag`
- JSON-LD: `WebApplication` + `BreadcrumbList`

### 2. Sitemap â€” `/flashflag` ajoutÃ©
`src/app/sitemap.ts` â€” La page Flash Flag Ã©tait absente du sitemap (Google ne la trouvait pas efficacement).

```
/flashflag â†’ priority 0.9, changeFrequency: 'weekly'
```

### 3. Robots.txt â€” liste allow Ã©tendue
`src/app/robots.ts` â€” Ajout de `/flashflag`, `/cgu`, `/mentions-legales`, `/confidentialite` dans la liste `allow`.

### 4. Twitter cards â€” ajoutÃ©es sur 5 layouts
Les layouts existants avaient des OG tags mais **aucune directive `twitter:`**. Le root layout imposait son titre gÃ©nÃ©rique dans toutes les cartes de partage Twitter/X.

CorrigÃ© sur: `/jeu`, `/flagornot`, `/classement`, `/redflag`, `/ressources`

```typescript
// Avant (hÃ©ritait du root)
openGraph: { title: 'Red or Green Duelâ€¦', url: '/jeu' }

// AprÃ¨s (carte Twitter spÃ©cifique)
twitter: {
  card: 'summary_large_image',
  title: 'Red or Green Duel â€” Quel est le plus gros Red Flag ?',
  description: 'Choisis entre deux comportementsâ€¦',
}
```

### 5. Pages lÃ©gales â€” `follow: true`
`/cgu`, `/mentions-legales`, `/confidentialite` avaient `robots: { index: false, follow: false }`.

ChangÃ© en `follow: true` : les pages restent non-indexÃ©es (c'est voulu) mais le **PageRank peut dÃ©sormais circuler** depuis les liens qui pointent vers ces pages.

---

## âœ… DÃ©jÃ  en place (avant ce sprint)

Ces Ã©lÃ©ments Ã©taient dÃ©jÃ  bien implÃ©mentÃ©s et n'ont pas Ã©tÃ© touchÃ©s.

### MÃ©tadonnÃ©es complÃ¨tes par page
- `/jeu` â†’ `VideoGame` schema, title, description, keywords, canonical
- `/flagornot` â†’ `WebApplication` schema, title, keywords, canonical
- `/classement` â†’ `ItemList` schema, title, keywords, canonical
- `/redflag` â†’ `VideoGame` schema, title, keywords, canonical
- `/ressources` â†’ `ItemList` + `BreadcrumbList`, title, keywords, canonical
- `/ressources/[slug]` â†’ `generateMetadata()` dynamique + `Quiz` + `FAQPage` + `BreadcrumbList` par outil

### Root layout
- `metadataBase`, title template, description globale
- OpenGraph + Twitter root
- JSON-LD: `WebApplication` + `WebSite` + `Organization` + `BreadcrumbList`
- Google Site Verification, canonical, `lang="fr"`

### OG Images dynamiques (Edge runtime)
- `opengraph-image.tsx` pour root, `/jeu`, `/flagornot`, `/ressources`, `/ressources/[slug]`
- APIs `/api/og/*` pour partage dynamique (Oracle, meters)

### Technique
- Images AVIF + WebP, security headers, gzip, font-display swap, powered-by supprimÃ©

---

## âš ï¸ Ce qui reste Ã  faire (faisable en code, mais touche Ã  l'UX/contenu)

### Contenu SEO manquant sur les pages de jeu

Les pages ont peu de texte indexable (Google voit surtout des boutons).

| Page | ProblÃ¨me | Solution |
|------|----------|----------|
| `/` | Quasi-aucun texte | Section 150 mots "Qu'est-ce qu'un Red Flag ?" |
| `/jeu` | Aucun "How to play" | Intro + FAQ structurÃ©e |
| `/flagornot` | Aucune description de l'IA | Bloc "Comment fonctionne l'Oracle" |
| `/classement` | Aucune intro | Paragraphe contextuel |
| `/flashflag` | Aucune description | Paragraphe avant le formulaire |

### Blog / Articles

| Mot-clÃ© | Volume est. | Page Ã  crÃ©er |
|---------|-------------|--------------|
| `red flag dÃ©finition` | ~850/mois | `/blog/red-flag-definition` |
| `green flag dÃ©finition` | ~420/mois | `/blog/green-flag-definition` |
| `quiz couple` | ~95/mois | `/blog/quiz-couple` |
| `violentomÃ¨tre en ligne` | ~180/mois | DÃ©jÃ  couvert âœ… |

### OG Images manquantes pour 2 pages
`/classement` et `/redflag` utilisent l'image root gÃ©nÃ©rique. CrÃ©er `opengraph-image.tsx` pour chacune.

### FAQ Schema sur pages de jeu
Ajouter `FAQPage` JSON-LD + Q&A visibles sur `/jeu`, `/flagornot`, `/flashflag`.

---

## âš ï¸ Core Web Vitals (code seul, mais risque sur animations)

Faisable en code mais impacte les animations â€” non implÃ©mentÃ© pour ne pas risquer de casser l'UX.

| MÃ©trique | Actuel | Cible | Cause principale |
|----------|--------|-------|-----------------|
| LCP | ~12.86s | <2.5s | Bundle Framer Motion trop grand |
| INP | ~150ms | <100ms | JS trop lourd sur thread principal |
| CLS | ~0.15 | <0.1 | Ã‰lÃ©ments sans dimensions rÃ©servÃ©es |

```typescript
// Code-split Framer Motion dans next.config.ts
webpack: (config) => {
  config.optimization.splitChunks.cacheGroups.animations = {
    test: /[\\/]node_modules[\\/]framer-motion/,
    name: 'animations', priority: 5,
  };
  return config;
},
```

```css
/* globals.css â€” rÃ©server espace pour Ã©viter layout shift */
.game-card { min-height: 280px; }
html { overflow-y: scroll; }
```

---

## âŒ Off-page SEO (hors code â€” action humaine)

| Action | Impact | Effort |
|--------|--------|--------|
| Google Search Console â†’ soumettre sitemap.xml | â­â­â­â­â­ | 15 min |
| Google Business Profile | â­â­â­â­â­ | 30 min |
| Guest posts sur blogs relationnels | â­â­â­â­ | 2h/sem |
| Profils sociaux (LinkedIn, Instagram) | â­â­â­ | 1h |
| Annuaires jeux / apps franÃ§aises | â­â­â­ | 2h |

---

## Roadmap

```
âœ… FAIT   â€” Layout flashflag, sitemap, robots, twitter cards, follow lÃ©gal (pages)
ðŸ”² URGENT â€” Google Search Console + soumettre sitemap.xml
ðŸ”² COURT  â€” Texte intro sur pages de jeu (sans modifier l'UI)
ðŸ”² MOYEN  â€” 3-5 articles blog sur mots-clÃ©s cibles
ðŸ”² LONG   â€” Core Web Vitals, backlinks, OG images /classement /redflag
```

---

*DerniÃ¨re mise Ã  jour : Juillet 2025*


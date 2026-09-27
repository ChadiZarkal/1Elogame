# Accueil — grande refonte

Branche `accueil-grande-refonte`, partie de `pageacceuilseptembre` (deux jeux
phares, grand logo, barre unique dans les jeux). Septembre 2026.

Ce document dit ce que la recherche a établi, quelles bibliothèques ont été
examinées et pourquoi aucune n'a été installée, puis ce qui a été construit et
mesuré. Il complète `DESIGN-MOBILE-RECHERCHE.md` (branche
`refontemaximale-front`), dont les conclusions restent valables.

---

## 1. Ce que dit la recherche

**Le premier écran porte l'essentiel, mais il doit annoncer la suite.** Les
utilisateurs passent environ 57 % de leur temps de lecture au-dessus de la
ligne de flottaison, et 74 % dans les deux premiers écrans [1]. NN/g range le
« faux plancher » — une page qui semble finir au bas de l'écran — parmi les
quatre erreurs d'accueil les plus courantes [2]. Le remède le plus cité est du
contenu *partiellement* visible en bas d'écran, et un mouvement discret [3][4].

**La zone du pouce.** Les actions principales vont dans les deux tiers bas de
l'écran visible, sur des cibles d'au moins 44 × 44 px espacées de 8 px [4][5].
Le premier bouton de l'accueil tombe à 384 px du haut sur un 360 × 670 : pile
dans cette zone.

**Montrer plutôt que décrire.** Le premier écran doit porter la proposition de
valeur, un signal de preuve sociale et une action claire [5]. Ici, la preuve
sociale existait déjà — le classement — mais sous la ligne de flottaison et en
liste figée.

**Le mouvement, sans JavaScript.** Les animations pilotées par le défilement
(`animation-timeline: view()`) tournent en CSS pur dans Chrome, Edge, Firefox
et Safari 26 — environ 84 % du parc mi-2026 [6][7]. Animées sur `transform` et
`opacity`, elles tournent sur le fil du compositeur, aussi fluides que le
défilement lui-même [8]. Dans les navigateurs qui ne les connaissent pas, `@supports`
les ignore et la page reste en place [6].

**Les transitions de vue** (`<ViewTransition>` de React) sont encore
expérimentales dans React 19.x et demandent un drapeau dans Next.js 16 [9][10].
Écartées pour l'instant : elles toucheraient la navigation de tout le site.

---

## 2. Les bibliothèques examinées

| Bibliothèque | Ce qu'elle apporte | Décision |
|---|---|---|
| **Magic UI** [11] | 150+ composants animés (Marquee, Border Beam, Number Ticker), React + Tailwind + Motion, à copier dans le projet | **Motifs repris**, réécrits en CSS pur |
| **Aceternity UI** [12] | Effets de vitrine spectaculaires (Spotlight, Background Beams, cartes 3D) | Écartée : trop théâtrale pour une page traversée en quinze secondes, et chaque effet charge Motion |
| **React Bits** [12] | 110+ composants, variantes CSS pures ou Tailwind, sans Motion obligatoire | Bonne référence ; rien de nécessaire que le CSS ne fasse déjà |
| **Motion** (framer-motion) | Déjà dans le projet, pour les jeux | **Pas sur l'accueil** : `template.tsx` l'a déjà retirée des routes pour économiser ~40 Ko de JS critique |
| **NumberFlow** [13] | Compteur animé, sans dépendance, sur `Intl.NumberFormat` | Écartée : le seul nombre de l'accueil est au premier écran, et l'animer depuis zéro afficherait un faux chiffre avant l'hydratation |
| **GSAP**, **Lenis** | Animation au défilement, défilement « lissé » | Écartées : le CSS fait le premier, et un défilement réinterprété nuit au geste natif sur téléphone |

**Aucune dépendance n'a été ajoutée.** Ce n'est pas une économie de principe :
l'accueil est la page la plus visitée, elle est rendue statiquement et
régénérée toutes les cinq minutes, et chaque kilo-octet de JavaScript s'y paie
en temps de réponse au premier toucher. Les trois motifs retenus — Border Beam,
Marquee, apparition au défilement — sont tous faisables en CSS, avec un
résultat identique à l'œil et un coût nul en JavaScript.

---

## 3. Ce qui a été construit

### Les deux jeux phares

- **Une bordure lumineuse qui tourne**, dans la teinte du jeu : l'effet
  « Border Beam » de Magic UI, refait avec un dégradé conique en rotation,
  masqué par la carte. Seule `rotate` est animée.
- **Une miniature de la mécanique**, à droite du bouton, sur la même rangée —
  donc sans une ligne de plus :
  - Red Flag Test : une jauge du vert au rouge dont le curseur cherche sa
    place, sous un « ?? % ». Elle dit « tu auras un score, il se lit ici ».
  - « C'est un 10 mais… » : une note à rouleau qui chute, 10, 8, 6, 3. Elle
    dit « le 10 ne tiendra pas ».
- **Une entrée échelonnée** : les deux cartes glissent en place l'une après
  l'autre. L'opacité part de 0,35 et non de 0 : un élément invisible n'est pas
  compté comme peint, et la carte ne doit pas retarder la mesure du LCP.

### Le verdict des joueurs

L'ancien accueil avait un bandeau défilant **écrit à la main**, décoratif, à
15 % d'opacité. Il revient, mais **lu dans le classement** :

- une rangée rouge, les huit comportements jugés les plus graves ;
- une rangée verte, en sens inverse, les huit jugés les moins graves ;
- les bords s'effacent, la rangée s'arrête au doigt pour qu'on la lise ;
- un comportement ne figure jamais dans les deux rangées (classement court) ;
- sous quatre comportements, la rangée n'est pas affichée : la boucle se
  verrait.

Suivi du podium des trois pires et du lien vers le classement complet.

Côté serveur, les trois lectures (compteur, haut et bas du classement) passent
par `Promise.allSettled` : une panne du compteur n'emporte plus le podium.

### L'apparition au défilement

Le verdict, les repères et le bloc d'aide se posent à mesure qu'ils entrent
dans l'écran, par `animation-timeline: view()` — sans JavaScript ni
observateur.

### Ce qui ne bouge pas

Sous `prefers-reduced-motion`, **rien ne bouge** : ni bordure, ni jauge, ni
note, ni bandeau — qui se fait alors défiler au doigt —, ni entrée, ni
apparition. La page reste entière.

---

## 4. Mesuré

À 320 × 568, 360 × 670 et 390 × 664, puis en tablette 768 × 1024 :

- aucun débordement horizontal, bandeau pleine largeur compris ;
- rien sous 12 px ; aucune cible sous 44 px ; contraste minimal 5,21:1 ;
- cartes phares à 163 px, les deux boutons dans le premier écran à 360 et
  390 ; « Et aussi » et le haut de L'Oracle visibles dessous (44 px à 360,
  29 px à 390) ;
- en tablette, les deux jeux phares côte à côte, boutons alignés.

**Non vérifiable ici :** la fluidité sur un vrai téléphone d'entrée de gamme.
L'argument est structurel — uniquement `rotate`, `translate` et `opacity`,
qui ne déclenchent ni mise en page ni peinture —, pas une mesure.

**Limite connue :** à 320 × 568, le second bouton finit 2 px sous le bas de
l'écran ; sa carte reste visible.

---

## Sources

1. [Above the Fold: Examples, Elements & Best Practices — Omniconvert](https://www.omniconvert.com/blog/above-the-fold-design/)
2. [Homepage Design: 4 Common Mistakes — NN/g](https://www.nngroup.com/videos/homepage-design-mistakes/)
3. [Scrolling UX Best Practices — Abbacus Technologies](https://www.abbacustechnologies.com/scrolling-ux-best-practices-to-improve-your-users-journey/)
4. [Mobile Landing Page Best Practices for 2026 — OptinMonster](https://optinmonster.com/mobile-landing-page-best-practices/)
5. [The Best CTA Placement Strategies for 2026 Landing Pages — LandingPageFlow](https://www.landingpageflow.com/post/best-cta-placement-strategies-for-landing-pages)
6. [A guide to Scroll-driven Animations with just CSS — WebKit](https://webkit.org/blog/17101/a-guide-to-scroll-driven-animations-with-just-css/)
7. [animation-timeline — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-timeline)
8. [CSS Scroll-Driven Animations: Ditch Scroll JS — BuildMVPFast](https://www.buildmvpfast.com/blog/css-scroll-driven-animations-replace-js-2026)
9. [Guides: View transitions — Next.js](https://nextjs.org/docs/app/guides/view-transitions)
10. [React 19.2 View Transitions: Next.js 16 Navigation — Digital Applied](https://www.digitalapplied.com/blog/react-19-2-view-transitions-animate-navigation-nextjs-16)
11. [Border Beam — Magic UI](https://magicui.design/docs/components/border-beam)
12. [react-bits vs Aceternity UI vs Magic UI 2026 — PkgPulse](https://www.pkgpulse.com/guides/react-bits-animated-components-2026)
13. [NumberFlow — Max Barvian](https://number-flow.barvian.me/)

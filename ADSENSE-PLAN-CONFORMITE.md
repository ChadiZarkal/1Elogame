# Plan de mise en conformité AdSense — Red or Green

**Motif du refus :** « Contenu à faible valeur informative »
**Domaine :** redorgreen.fr · **Éditeur AdSense :** pub-9698016157098549
**Date du plan :** 27 juillet 2026
**Contrainte directrice :** rétablir la conformité **sans dénaturer le site**

> **La conclusion en une ligne :** ce n'est pas un problème d'écriture, c'est un problème de **rendu**. Le contenu existe déjà en base et dans le code — il n'arrive simplement jamais dans le HTML que Google reçoit.

---

## 0. 🚨 À traiter avant tout le reste — hors sujet AdSense

Deux constats sortis de l'audit qui ne peuvent pas attendre le calendrier du plan.

### 0.1 Panneau d'administration public et non authentifié

[`dixmais/admin/page.tsx:53`](game/src/app/dixmais/admin/page.tsx:53) appelle `setToken('open')` dans un `useEffect` et affiche le tableau de bord **sans aucune authentification**.
Aggravants :
- Il n'existe **aucun `middleware.ts`** dans le dépôt.
- [`robots.ts:28`](game/src/app/robots.ts:28) interdit `/admin/`, ce qui **ne couvre pas** `/dixmais/admin`.
- La page est donc **publiquement accessible et explorable par les moteurs**.

**C'est une faille de sécurité, pas un point SEO.** À corriger immédiatement, indépendamment d'AdSense.

### 0.2 Les textes légaux décrivent un dispositif qui n'existe pas

La politique de confidentialité affirme que le consentement publicitaire est recueilli *« via une interface de gestion conforme au cadre de transparence et de consentement (TCF) »* ([confidentialite/page.tsx:136](game/src/app/confidentialite/page.tsx:136)), et que l'utilisateur peut le modifier *« depuis les paramètres de confidentialité affichés sur le site »* (L141). Le §9 des CGU fait la même promesse.

**Aucune de ces interfaces n'existe.** Une recherche exhaustive (`consent`, `CMP`, `__tcfapi`, `fundingchoices`, `didomi`, `axeptio`, `tarteaucitron`…) ne retourne aucune implémentation.

Au-delà du RGPD, cela relève des « Déclarations malhonnêtes » du règlement Google. À corriger en même temps que la CMP (WS-6).

---

## 1. Diagnostic

### 1.1 Ce que le crawler reçoit réellement

Mesures croisées : lecture du HTML servi en production **et** audit du code. Les deux méthodes concordent.

| Route | Prose dans le HTML serveur | État |
|---|---:|---|
| `/jeu/recap` | **0 mot** | 🔴 Page littéralement vide |
| `/classement` | **~3 mots** | 🔴 « Chargement du verdict... » |
| `/flagornot/stats` | **~3 mots** | 🔴 Spinner seul |
| `/flashflag/session/[code]` | **~3 mots** | 🔴 Spinner seul |
| `/dixmais/leaderboard` | ~20 mots | 🔴 |
| `/jeu` | ~25 mots | 🔴 |
| `/flagornot` | ~25 mots | 🔴 |
| `/jeu/jouer` | ~35 mots | 🔴 |
| `/dixmais` | ~40 mots | 🔴 |
| `/redflag` | ~45 mots | 🔴 |
| `/` (accueil) | ~50-120 mots | 🔴 **porte la seule régie du site** |
| `/ressources` | ~110 mots | 🔴 |
| `/flashflag` | ~150 mots | 🟠 |
| `/ressources/[slug]` ×5 | ~180-220 chacune | 🟡 Quasi-dupliquées entre elles |
| `/guide` | ~480 mots | 🟢 Seule page correcte |

**Bilan :** **22 URL publiques** · **16 minces** · **5 ne servent quasiment rien** (0-3 mots) · **1 seule correcte**.
Prose indexable totale : **~2 000 mots**, dont **~1 900 sur des pages légales en `noindex`** — elles ne comptent donc pas.

### 1.2 Cause racine — corrigée

Idée reçue à écarter : **`'use client'` n'est pas le coupable.** Le App Router pré-rend les composants client. Le HTML est vide pour **trois raisons précises et corrigeables** :

**(a) Verrous de chargement en early-return**
```js
if (isLoading) return <Loading text="Chargement du verdict..." />
```
Cas de `/classement` ([page.tsx:344](game/src/app/classement/page.tsx:344)) : **961 lignes de code qui servent trois mots au crawler.**

**(b) Contenu conditionné à un état par défaut fermé**
`{howToPlayOpen && …}`, `phase === 'profile-select'`, accordéons repliés.
Sur l'accueil, les ~270 mots des tiroirs « Comment jouer » et « Safe Zone » ne sont **jamais** émis, et seule 1 des 4 cartes de jeu est rendue. Sur `/guide`, ~460 mots d'exemples sont enfermés dans des accordéons fermés ([guide/page.tsx:150](game/src/app/guide/page.tsx:150)).

**(c) `dynamic(..., { ssr: false })` — zéro HTML**
[`jeu/recap/page.tsx`](game/src/app/jeu/recap/page.tsx) fait 12 lignes ; son unique enfant est chargé en `ssr: false`. Le crawler reçoit **une page sans le moindre contenu**.

**Conséquence stratégique :** l'essentiel du déficit se corrige **sans écrire une ligne de contenu**.

### 1.3 Registre des problèmes

#### A. Infractions AdSense actives

| # | Problème | Gravité |
|---|---|---|
| **A1** | **Régie sur page sans contenu éditeur.** Le règlement « Valeur de l'inventaire » interdit les annonces sur des écrans « sans contenu de l'éditeur ou avec un contenu à faible valeur informative ». L'unique emplacement (accueil, slot `3749254789`, [page.tsx:581](game/src/app/page.tsx:581)) est posé sur la page la plus mince du site. | 🔴 |
| **A2** | **Script AdSense chargé sur 100 % des routes** ([layout.tsx:197](game/src/app/layout.tsx:197)), y compris les 10 pages `/admin/*`, `/dixmais/admin`, les pages légales et les pages à zéro contenu. **Si les annonces automatiques sont activées, des annonces s'injectent dans des pages vides et dans les panneaux d'administration.** Exposition latente majeure. | 🔴 |
| **A3** | **Aucune CMP** alors que le domaine est `.fr` et l'audience européenne. Violation des règles de consentement UE. | 🔴 |
| **A4** | **Pages légales introuvables.** Les 3 pages sont en `noindex` **et** liées depuis la seule page d'accueil, la confidentialité étant intitulée **« Secret »** ([page.tsx:405](game/src/app/page.tsx:405)). Il n'existe **aucun composant de pied de page partagé** : un examinateur arrivant sur `/jeu`, `/guide` ou `/classement` n'a **aucun chemin vers la politique de confidentialité**. | 🔴 |

#### B. Passifs à purger

| # | Problème | Gravité |
|---|---|---|
| **B1** | **Texte caché à destination des moteurs.** [guide/page.tsx:437](game/src/app/guide/page.tsx:437) contient une `<section className="sr-only">` précédée du commentaire `{/* Hidden SEO content for search engines */}`, avec des titres empilés (« Red Flag définition », « Green Flag définition »…). Même schéma en [ressources/[slug]/layout.tsx:189](game/src/app/ressources/[slug]/layout.tsx:189), qui **duplique en plus** un texte déjà affiché visiblement sur la même page. | 🔴 **Risque d'action manuelle** |
| **B2** | **Données structurées sans équivalent visible.** Les FAQ substantielles n'existent **que** en JSON-LD ([guide/layout.tsx:50](game/src/app/guide/layout.tsx:50), [ressources/[slug]/layout.tsx:89](game/src/app/ressources/[slug]/layout.tsx:89)) : invisibles pour un examinateur humain. Le balisage doit refléter un contenu réellement affiché — « Problème lié aux données structurées » figure parmi les actions manuelles. | 🔴 |
| **B3** | **Canonicals erronées.** `/dixmais` et `/dixmais/leaderboard` n'ont **aucun `layout.tsx`** : ils héritent du canonical racine ([layout.tsx:45](game/src/app/layout.tsx:45) → `'/'`) et **se déclarent doublons de l'accueil**. Idem `/jeu/jouer` et `/jeu/recap` → `/jeu` ; `/flagornot/stats` → `/flagornot` ; `/flashflag/session/[code]` → `/flashflag`. | 🔴 |
| **B4** | **Pages `/ressources/*` quasi-dupliquées** : template identique sur les 5 outils, seuls le nom, la description et l'intro varient. | 🟠 |
| **B5** | Bandeau défilant de l'accueil **dupliqué mot pour mot** ([page.tsx:184-185](game/src/app/page.tsx:184)) ; données `stats` récupérées puis **jamais affichées** ([page.tsx:103](game/src/app/page.tsx:103)). | 🟡 |

#### C. Contenu sensible et mineurs

| # | Problème | Gravité |
|---|---|---|
| **C1** | **Contenu sexuel exposé à un public mineur.** Tranches d'âge dès **16-18 ans**, et **32 éléments** de catégorie « sexe » dont, au niveau de provocation maximal : *OnlyFans, nudes, sexting avec des inconnus, domination, fétichisme*. Relève de règles **distinctes** du contenu à faible valeur → **motif de second refus**. | 🔴 |
| **C2** | Aucune annonce ne devrait figurer sur `/ressources/*` (violence, inceste, harcèlement) — politique **et** éthique. | 🟠 |

#### D. Technique et expérience

| # | Problème | Gravité |
|---|---|---|
| **D1** | **`data-ad-format="responsive"` est une valeur invalide** ([AdBanner.tsx:19](game/src/components/ads/AdBanner.tsx:19), passée en [page.tsx:585](game/src/app/page.tsx:585)). Google attend `auto`. L'unique unité est **mal configurée** et ne se remplira pas correctement. | 🟠 |
| **D2** | L'annonce est **hors de `<main>`, sous le pied de page légal**, donc systématiquement sous la ligne de flottaison : **visibilité quasi nulle**. Même approuvée, elle ne rapporterait presque rien. | 🟠 |
| **D3** | `.ad-container` **n'a aucun style défini** ; l'`<ins>` porte un `minHeight: 90` en dur → **bloc blanc de 90 px** tant qu'aucune annonce ne remplit, et décalage de mise en page (CLS) quand elle remplit à 250 px. | 🟠 |
| **D4** | **Navigation non explorable** : la sélection des jeux est un carrousel à swipe, sans menu texte. Critère AdSense explicite. | 🟠 |
| **D5** | **LCP ≈ 12,86 s** (audit interne `game/SEO-ANALYSIS-2025.md`), cible < 2,5 s. | 🟠 |

### 1.4 Le gisement inexploité

Le contenu substantiel **existe déjà** et n'est jamais rendu :

| Actif | Volume | Où il dort |
|---|---|---|
| Comportements classés | **243 actifs** (260 au total) | Supabase |
| Votes communautaires réels | **17 723** | Supabase |
| Segmentation ELO | par **genre** et par **âge** (16-18 → 27+) | Supabase |
| Écarts hommes/femmes mesurés | **jusqu'à 270 points ELO** | Supabase |
| Questions d'auto-évaluation | **53**, sourcées institutionnellement | `src/config/meters-data.ts` — **dans aucun HTML** |
| Exemples par type de flag | 30 (6 × 5 flags) | Accordéons fermés de `/guide` |

---

## 2. Stratégie — trois principes

### P1 — Le jeu reste le héros
Aucun texte au-dessus de la ligne de flottaison sur les routes de jeu. Le contenu va **sous le jeu** (invisible pour le joueur, lisible par le crawler) ou sur **de nouvelles routes**. Le parcours de jeu n'est modifié nulle part.

### P2 — Le contenu doit être extrait des données du site, pas plaqué à côté
Un écart de **270 points ELO** entre hommes et femmes sur un même comportement, mesuré sur 17 723 votes, est une donnée originale que personne d'autre ne détient. C'est l'« information gain » que Google récompense.

⚠️ **Ajouter cinq articles de blog génériques à côté d'un jeu mince ne change rien au verdict.** C'est l'erreur qui mène au second refus.

### P3 — La publicité suit le contenu, jamais l'inverse
Un site conforme avec peu d'emplacements vaut infiniment mieux qu'un site banni.

---

## 3. Chantiers

### WS-0 — Arrêt de l'infraction · J+0 · 🔴 BLOQUANT · effort : ~1 h

| Action | Détail |
|---|---|
| Retirer l'unique régie | `AdBanner` de [page.tsx:581](game/src/app/page.tsx:581) — un seul emplacement dans tout le site |
| **Désactiver les annonces automatiques** dans le compte AdSense | Sinon A2 injecte des annonces partout, y compris sur les pages vides et les panneaux d'admin |
| Conditionner le script AdSense par route | Ne plus le charger sur `/admin/*`, `/dixmais/admin`, les pages légales et les pages sans contenu |
| Règle permanente | Aucune annonce sur `/ressources/*` |
| Corriger `data-ad-format` | `responsive` → `auto` (D1), pour la réactivation future |

### WS-1 — Rendre visible l'existant · J+1 → J+5 · ⭐ ROI maximal · zéro rédaction

| Cible | Action |
|---|---|
| `/jeu/recap` | Supprimer `ssr: false` |
| `/classement` | Rendu serveur (SSR/ISR) du classement au lieu du spinner |
| `/flagornot/stats`, `/flashflag/session/[code]` | Rendre un état initial avec contenu |
| `/guide` | Accordéons **ouverts par défaut** → +460 mots immédiatement |
| Accueil | Rendre les 4 cartes et le contenu « Comment jouer » dans le HTML |
| `/ressources/[slug]` | Rendre les **53 questions** (aujourd'hui invisibles) |
| **B1** | Supprimer les blocs `sr-only` et **réintégrer ce texte visiblement** |
| **B2** | Afficher visiblement les FAQ qui n'existent qu'en JSON-LD |
| **B3** | Créer `dixmais/layout.tsx` + métadonnées propres ; corriger les canonicals enfants ; compléter `sitemap.ts` et `robots.ts` |

À lui seul, ce chantier fait passer le site de ~2 000 à plus de 5 000 mots indexables — **sans écrire une phrase**.

### WS-2 — L'Observatoire : la donnée devient éditorial · J+6 → J+20 · ⭐ Le différenciateur

Objectif : **10 à 15 pages substantielles** adossées aux 17 723 votes.

1. **Le classement commenté des 243 comportements**
2. **« Hommes vs femmes : les 20 comportements qui divisent le plus »** — écarts jusqu'à 270 pts ELO
3. **« Ce que les 16-18 ans jugent red flag et pas les 27+ »**
4. **Méthodologie : comment on classe un red flag** — ELO, échantillon, biais, limites
5. **Analyses par catégorie** — quotidien (211) vs sexe (32)
6. **Baromètre trimestriel** — contenu frais récurrent

> ### ⚠️ Anti-pattern à ne surtout pas commettre
> **Ne pas générer 243 pages, une par comportement.** C'est la définition littérale des « pages satellites » du règlement : cela transformerait un refus en sanction plus lourde. **Peu de pages riches**, jamais l'inverse.

### WS-3 — Contenu pilier éditorial · J+10 → J+30

Rédaction humaine, 1 000-1 500 mots, utile en soi :
red flag (définition, exemples, quand s'inquiéter) · green flag · red flag ≠ dealbreaker ≠ incompatibilité · que faire quand on en repère un.

**Règle :** chaque page cite les données propres du site — c'est ce qui la rend non-générique.
⚠️ Pas de remplissage généré à la chaîne : détecté, et cela réactive le motif initial.

### WS-4 — Signaux de confiance (E-E-A-T) · J+6 → J+12

| Page | Contenu |
|---|---|
| `/a-propos` | Qui édite le site, pourquoi, quelle légitimité |
| `/methodologie` | ELO, échantillon, biais assumés, limites |
| `/sources` | Références institutionnelles |
| `/contact` | Moyen de contact réel |

**Les sources sont déjà dans le code**, en en-tête de [meters-data.ts](game/src/config/meters-data.ts) : Université de Poitiers (mission égalité-diversité), Département de Seine-Saint-Denis / Centre Hubertine Auclert, Association Face à l'inceste / Mémoire Traumatique. Il suffit de les **rendre publiques**.

Également :
- **Créer un composant de pied de page partagé** présent sur *toutes* les routes (corrige A4)
- Renommer **« Secret » → « Confidentialité »**
- Passer les pages légales en **indexables** (+~1 900 mots de substance)

### WS-5 — Contenu sensible et mineurs · J+2 → J+8

| Action | Justification |
|---|---|
| Aucune annonce sur `/ressources/*` | Violence, inceste, harcèlement |
| Ne pas servir les 32 items « sexe » à la tranche 16-18 | Protection des mineurs |
| Revoir les 24 items de provocation niveau 4 | Écarter l'explicite du flux tout public |
| Désactiver la personnalisation publicitaire sur ces parcours | Interdiction de cibler sur les comportements sexuels |

### WS-6 — Consentement et confidentialité · J+1 → J+5

- Déployer une **CMP certifiée Google** (obligatoire, audience UE) — **et la séquencer avant le script AdSense**, ce que le `<script>` brut actuel ([layout.tsx:202](game/src/app/layout.tsx:202)) ne permet pas : le passer en `next/script`
- **Mettre les textes légaux en accord avec la réalité** (§0.2)
- Ajouter la formule standard : les tiers, dont Google, utilisent des cookies pour diffuser des annonces basées sur les visites antérieures
- **Ajouter le lien manquant** vers `google.com/policies/technologies/partner-sites/` (absent du dépôt)
- `ads.txt` : conforme ✅

### WS-7 — Navigation et performance · J+10 → J+25

- **Navigation texte explorable** vers toutes les pages de contenu (le carrousel est conservé, mais **complété**)
- Corriger le bloc publicitaire : styles réels, espace réservé, plus de bloc blanc de 90 px (D3)
- Code-splitting de Framer Motion ; cible LCP < 2,5 s

### WS-8 — Demande de réexamen · en dernier, sans exception

1. Vérifier que tout est **en ligne, explorable et indexé** (Search Console → inspection d'URL, demande d'indexation)
2. Tenir un **journal des modifications** daté
3. Rédiger la demande en trois points, comme Google le demande : le problème identifié · les mesures prises · les résultats obtenus
4. **Une seule demande à la fois.** Ne pas relancer avant réponse.

**Attentes réalistes :** ~2 semaines par cycle, plusieurs cycles possibles. C'est normal.

---

## 4. Séquencement

| Phase | Fenêtre | Chantiers | Objectif |
|---|---|---|---|
| **🚨 Urgence** | Immédiat | §0 | Fermer la faille admin, cesser les affirmations fausses |
| **0 — Stop** | J+0 | WS-0 | Plus d'annonce sur page vide ; annonces auto désactivées |
| **1 — Révéler** | Semaine 1 | WS-1, WS-6 | Contenu existant visible ; passifs B1-B3 purgés ; CMP |
| **2 — Moat** | Semaines 2-3 | WS-2, WS-4, WS-5 | Donnée originale + confiance |
| **3 — Étoffer** | Semaine 4 | WS-3, WS-7 | Piliers, navigation, performance |
| **4 — Réexamen** | Semaine 5+ | WS-8 | Dépôt du dossier |

**Ordre imposé :** §0 et WS-0 immédiatement. WS-1 avant WS-2. WS-8 en dernier.

---

## 5. Critères de sortie — grille binaire

Tant qu'une ligne est ❌, on ne dépose pas.

| # | Critère | Seuil |
|---|---|---|
| 1 | Régie | 0 annonce sur toute page < 300 mots dans le HTML serveur |
| 2 | Annonces automatiques | Désactivées, ou strictement limitées aux pages conformes |
| 3 | Volume | ≥ 15 pages à ≥ 800 mots visibles **sans JavaScript** |
| 4 | Rendu | Aucune page ne servant qu'un spinner ; plus aucun `ssr: false` sur du contenu |
| 5 | Texte caché | **0 bloc `sr-only` à visée SEO** dans le dépôt |
| 6 | Données structurées | Tout JSON-LD adossé à un contenu **visible** |
| 7 | Canonicals | Chaque route déclare sa propre URL |
| 8 | Navigation | Pied de page partagé sur **toutes** les routes ; contenu atteignable en ≤ 2 clics |
| 9 | Pages légales | Indexables, intitulées clairement, accessibles depuis n'importe quelle page |
| 10 | Confiance | `/a-propos`, `/methodologie`, `/sources`, `/contact` en ligne |
| 11 | Consentement | CMP certifiée active **et** textes légaux conformes à la réalité |
| 12 | Confidentialité | AdSense, cookies, tiers mentionnés + lien `partner-sites` |
| 13 | Mineurs | Aucun contenu sexuel dans le parcours 16-18 |
| 14 | Sécurité | `/dixmais/admin` authentifié et non explorable |
| 15 | Performance | LCP < 2,5 s sur les 5 pages principales |
| 16 | Indexation | Nouvelles pages indexées, vérifiées en Search Console |

> **Test de vérité, à faire soi-même :** désactiver JavaScript et parcourir le site.
> **Ce qui reste à l'écran est exactement ce que voit l'examinateur AdSense.**
> Aujourd'hui : page blanche sur `/jeu/recap`, spinner sur `/classement`.

---

## 6. Risques et erreurs à éviter

| Risque | Conséquence | Parade |
|---|---|---|
| Générer 243 pages depuis la base | Pages satellites → sanction aggravée | 10-15 pages riches maximum |
| Ajouter un blog générique | Même refus au second tour | Contenu adossé aux données propres |
| Conserver les blocs `sr-only` | **Action manuelle** pour texte caché | Rendre visible ou supprimer |
| Laisser les annonces automatiques actives | Annonces injectées sur pages vides et admin | Désactiver avant toute chose |
| Remplissage généré à la chaîne | Motif initial réactivé | Rédaction humaine, apport réel |
| Toucher au parcours de jeu | Perte de l'identité produit | Contenu sous le jeu ou routes dédiées |
| Redemander un examen trop tôt | Cycles perdus | Grille §5 intégralement verte |
| Ignorer le volet mineurs/sexe | Second refus sur un **autre** motif | WS-5 dans le même cycle |

---

## 7. Ce qui ne change pas

- ✅ Les 4 jeux, leurs règles, leur enchaînement : **inchangés**
- ✅ Le carrousel à swipe : **conservé** (une navigation texte s'y ajoute, ne le remplace pas)
- ✅ Identité visuelle, ton, emojis, animations : **conservés**
- ✅ Le jeu reste la première chose que voit un visiteur

Ce qui change : **ce que voit le crawler** — c'est-à-dire ce qui est aujourd'hui vide.

---

## 8. Synthèse

Le site ne manque pas de contenu : il en a **beaucoup**, mais il ne le montre pas.
243 comportements et 17 723 votes derrière un spinner. 53 questions sourcées jamais rendues. 460 mots dans des accordéons fermés. Une page de récapitulatif à zéro mot.

S'y ajoutent des passifs à purger — texte caché à visée SEO, FAQ existant seulement en balisage, canonicals dupliquées, contenu sexuel exposé aux mineurs, textes légaux décrivant une CMP inexistante — une régie mal configurée posée sous le pied de page de la seule page que Google regardait, et un panneau d'administration ouvert à tous.

Le chemin est court, et il commence par du code, pas par de la rédaction.

---

*Plan établi le 27 juillet 2026, sur mesures en production et audit du dépôt.*

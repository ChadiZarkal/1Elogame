# Journal des modifications — mise en conformité AdSense

Support de la demande de réexamen. Chaque entrée renvoie au problème identifié
dans [ADSENSE-PLAN-CONFORMITE.md](ADSENSE-PLAN-CONFORMITE.md).

**Statut : deux passes.** La première (juillet, § 1 à 10) est en production.
Un second refus pour « contenu à faible valeur informative » est arrivé
malgré elle — la seconde passe (§ 11 à 15) y répond.

---

# Seconde passe — août 2026

## Pourquoi la première n'a pas suffi

La première passe a produit cinq pages solides : `/guide` (~1 000 mots),
`/observatoire` (~400 mots plus les tableaux), `/methodologie` (~480),
`/a-propos` (~410), `/classement` (rendu serveur). Aucune n'est une page
d'entrée. Un examinateur arrive sur l'accueil, clique sur un jeu, et ne
rencontre jamais ces pages.

Mesuré sur le HTML réellement servi :

| Route | Prose dans le HTML | Statut |
|---|---|---|
| `/` | **~35 mots** | priorité 1.0 au sitemap |
| `/jeu` | ~45 | indexable |
| `/dixmais` | ~60 | indexable |
| `/flagornot` | ~55 | indexable |
| `/ressources` | ~110 | indexable |
| `/jeu/jouer` | **~2** | indexable, hors sitemap |
| `/flagornot/stats` | **~3** | indexable, hors sitemap |
| `/dixmais/leaderboard` | **~15** | indexable, **au sitemap** |
| `/redflag` | ~35 | page de porte vers `/jeu` |

La cause est la même partout : les écrans de jeu sont des composants client
dont le texte est conditionné par un état. Le carrousel de l'accueil ne rend
qu'une carte sur quatre au premier passage, et ses deux tiroirs — qui
contiennent la description des jeux — restent démontés tant qu'on ne clique
pas. Ce n'est pas un manque de contenu, c'est un contenu qui n'arrive pas.

## 11. Contenu éditorial sur les pages d'entrée

Nouveau module `src/content/page-notes.ts` : la prose est une donnée typée,
pas du JSX. Rendue par les `layout.tsx`, qui sont des composants serveur, et
placée **sous** le jeu — l'écran de jeu reste le premier élément vu.

Environ 4 500 mots ajoutés sur l'accueil, `/jeu`, `/dixmais`, `/flagornot`,
`/flashflag`, `/ressources` et `/classement`. Pour chaque jeu : ce qu'il
mesure, pourquoi ce format, comment lire un résultat, et ce qu'il ne dit pas.

*Choix assumé, à nouveau :* aucun article de conseil relationnel générique.
Le fond vient de la mécanique réelle de chaque jeu et des données du site —
pourquoi la comparaison par paires vaut mieux qu'une note sur 10, pourquoi
« est-ce un red flag ? » est une question mal posée, ce que le score Elo
signifie. Les chiffres cités sur `/classement` sont ceux du rendu en cours,
pas des valeurs écrites en dur.

L'accueil passe en composant serveur (`page.tsx` → `HubClient.tsx`) et reçoit
un `h1` : la page n'en avait aucun, le logo n'étant qu'une image.

## 12. Routes indexables sans contenu

- `/dixmais/leaderboard` est rendue côté serveur, comme `/classement` l'avait
  été. Elle figurait au sitemap en ne servant qu'un indicateur de chargement.
- `/jeu/jouer` et `/flagornot/stats` passent en `noindex` : écrans d'état
  éphémère, sans contenu propre à indexer.
- `/redflag` est supprimée et redirigée en permanent vers `/jeu`. Elle ne
  portait qu'un titre et un bouton — une page de porte, que les consignes
  qualité de Google désignent explicitement.

## 13. Balisage aligné sur ce qui est affiché

- **`/ressources/[slug]`** : le balisage `FAQPage` et la FAQ affichée étaient
  deux objets écrits à la main, avec des libellés et un nombre de questions
  différents — trois questions déclarées pour le violentomètre, deux à
  l'écran. Source unique (`src/content/meter-faq.ts`). C'est le défaut que la
  première passe avait corrigé sur `/guide` sans le voir ici.
- **`/classement`** : `ItemList` annonçait `numberOfItems: 50` pour 30 lignes
  rendues, sans aucun `itemListElement`. Le balisage est désormais émis par
  la page, qui seule connaît ses lignes.
- **`BreadcrumbList` site-wide** retiré : le site n'affiche aucun fil
  d'Ariane, et le balisage était émis jusque sur les pages légales.

## 14. Traces de texte écrit pour les moteurs

- CSS mort `.hub__seo*`, sous un commentaire `/* ── SEO content section ── */`,
  en `font-size: 0.7rem; color: #555` sur fond `#0D0D0D`.
- Bloc de liens de `/ressources` rendu en `#3D3D3D` sur fond sombre, précédé
  du commentaire `SEO-rich footer section with internal links`. Les mêmes
  liens figurent maintenant dans la section éditoriale, à contraste normal.
- `keywords` ramenée de 26 à 6 termes ; `google-site-verification` n'est plus
  émise vide sur chaque page.

## 15. Qualité rédactionnelle et confiance

- `/flashflag` était rédigée en français sans accents ni apostrophes — « la
  personne repond », « Aucun test standard actif n est disponible »,
  « Selectionne d abord ». Environ 90 corrections.
- Lien de contact ajouté au pied de page : l'adresse n'était joignable que
  depuis le corps de quatre pages.
- **CGU et confidentialité** décrivaient un recueil de consentement
  publicitaire inexistant et listaient AdSense en sous-traitant, alors
  qu'aucune annonce n'est diffusée. Ces pages disent désormais ce qui est
  vrai aujourd'hui et annoncent leur mise à jour préalable à toute diffusion.

## Ce qui reste, et qui ne peut pas être fait en code

| Point | Où |
|---|---|
| **Message de consentement (CMP)** | Compte AdSense → Confidentialité et messages. Aucun code ne peut le remplacer. **À activer avant la première annonce**, sans quoi les textes légaux redeviennent faux et la conformité UE n'est pas atteinte. |
| **Annonces automatiques** | À laisser désactivées tant que les pages concernées ne portent pas de contenu. Aucun emplacement publicitaire n'est rendu par le site : toute annonce viendrait des annonces automatiques. |
| **Authentification admin** | `adminAuth.ts` neutralise toute vérification — `/admin/dashboard` et `/dixmais/admin` restent accessibles en écriture. `noindex` empêche l'indexation, pas l'accès. Écarté du périmètre par décision explicite. |
| **Build** | Non exécuté localement : Node est absent de la machine de développement. La vérification passe par la CI GitHub et le déploiement Vercel. |

---

# Troisième passe — août 2026, audit critère par critère

Vérification du site **en ligne** contre les critères cités par le refus, et
non plus contre notre propre lecture du problème. Trois manques restaient.

## 16. Barre de navigation

Les consignes la qualifient d'« essentielle ». Le site n'en avait aucune :
**zéro lien dans le `<header>` de chaque page**. La seule navigation en liens
texte était le pied de page, et sur les écrans de jeu — qui occupent toute la
fenêtre — il n'existait aucun chemin visible vers le reste du site.

Barre ajoutée sur les 21 routes publiques : marque, raccourcis à plat dès
640 px, et un menu de 18 entrées groupées par thème — Jouer, Comprendre,
S'évaluer, Le site — comme le demande le point « classez les articles et les
contenus par thème ». C'est un `<details>` : il s'ouvre sans JavaScript et son
contenu est dans le HTML même fermé.

Les quatre points de contrôle cités par Google : alignement vérifié de 360 à
1280 px sans débordement horizontal ; contraste et taille conformes ; cibles
tactiles à 44 px ; les 18 liens résolvent en 200.

Les écrans pleine hauteur passent en `calc(100dvh - var(--header-h, 3rem))`
pour lui laisser sa place, et l'accueil se resserre sous 720 px de haut : sur
un 360×640, le bouton qui lance le jeu était repassé sous la ligne de
flottaison.

## 17. Hiérarchie des titres

`/jeu` n'avait **aucun `h1`** — le logo est une image, l'accroche un
paragraphe. Et le pied de page, rendu partout, ajoutait trois `h2` qui, le
contenu étant diffusé en flux, **précédaient le `h1`** dans le HTML servi sur
17 pages sur 21. Les intitulés de groupe du pied de page et du menu sont
désormais des `p` ; le `nav` et son `aria-label` portent le repérage.

## 18. Cinq pages d'outil trop semblables

12 à 20 % de texte commun entre elles : le châssis de l'écran d'accueil
— durée, mention d'anonymat, avertissement, échelle — est identique et pesait
lourd sur des pages de 430 à 640 mots. Les consignes demandent, dans ce cas,
de *développer* chaque page.

Chaque outil a reçu sa notice : origine du barème, périmètre couvert, ce qui
le distingue des autres, et vers qui se tourner. Pour le harcèlomètre et le
discriminomètre, il est écrit noir sur blanc qu'il s'agit d'adaptations sans
valeur officielle. Duplication maximale ramenée à 13,1 %.

## Grille de contrôle finale, mesurée en production

| Contrôle | Résultat |
|---|---|
| Toute page indexable au-dessus de 250 mots | 275 à 1 119 mots |
| Exactement un `h1` par page | 21/21 |
| Aucun titre ne précède le `h1` | 21/21 |
| Barre de navigation | 21/21 |
| Données structurées conformes à l'affichage | 44 questions, 0 écart |
| Duplication entre pages | 13,1 % au maximum |
| Liens internes cassés | 0 sur 29 |
| Images sans `alt` | 0 |
| Titres et descriptions uniques | oui |
| Bourrage de mots-clés | aucune page au-dessus de 10 termes |
| Pages satellites | `/redflag` supprimée, 308 vers `/jeu` |

---

# Première passe — juillet 2026

## 1. Publicités retirées des pages sans contenu (A1, A2)

- Suppression de l'unique emplacement publicitaire du site, en bas de la page
  d'accueil (slot `3749254789`), qui reposait sur une page d'environ 100 mots.
- Le script AdSense n'est plus chargé sur **toutes** les routes : nouveau
  composant `AdSenseScript` qui l'exclut des panneaux d'administration et des
  pages d'état éphémère. Auparavant, avec les annonces automatiques activées,
  des annonces pouvaient s'injecter dans des pages vides et dans l'admin.
- Passage du `<script>` brut à `next/script`, ce qui permettra de séquencer le
  chargement après un message de consentement.
- Correction de `data-ad-format` : `responsive` (valeur inexistante) → `auto`.
  L'unité était mal configurée. Ajout d'une garde contre le double `push` et
  suppression du `minHeight: 90` qui laissait un bloc blanc quand aucune
  annonce ne remplissait.

**Position retenue :** aucune annonce ne sera réactivée sur une page tant
qu'elle ne dépasse pas 300 mots de contenu réellement servi dans le HTML.
Aucune annonce ne sera diffusée sur `/ressources/*` (violence, inceste,
harcèlement).

## 2. Contenu rendu visible au crawler (F2)

Le site ne manquait pas de contenu : il ne le livrait pas dans le HTML.

- **`/classement`** ne servait que « Chargement du verdict... », soit 3 mots,
  pour 243 comportements et plus de 17 000 votes en base. La page est désormais
  rendue côté serveur (ISR, 5 min) : le classement figure dans le HTML.
- **`/jeu/recap`** était chargé en `ssr: false` et ne servait **aucun contenu**.
  Corrigé.
- **`/guide`** : le contenu des accordéons (~460 mots d'exemples) était retiré
  du DOM tant qu'ils étaient fermés. Il est maintenant toujours présent dans le
  HTML, simplement replié en CSS — l'affichage pour l'utilisateur est inchangé.
- **`/ressources/[slug]`** : les FAQ et la navigation entre outils sont
  désormais rendues visiblement, sous l'outil.

## 3. Texte caché supprimé (B1)

Deux blocs `sr-only` destinés aux moteurs ont été supprimés :

- `guide/page.tsx` contenait une section masquée précédée du commentaire
  `Hidden SEO content for search engines`, avec des titres empilés ;
- `ressources/[slug]/layout.tsx` masquait un texte déjà affiché ailleurs sur la
  même page, **ainsi qu'une navigation entière**.

Ces contenus n'ont pas été supprimés mais **rendus visibles** aux utilisateurs.

## 4. Données structurées adossées à du contenu affiché (B2)

Le balisage `FAQPage` de `/guide` décrivait 6 questions qui n'existaient nulle
part à l'écran. La FAQ est extraite dans un module unique (`guide/faq.ts`)
importé à la fois par le balisage et par l'affichage : les deux ne peuvent plus
diverger.

## 5. Canonicals corrigées (B3)

`/dixmais` et `/dixmais/leaderboard` n'avaient aucun `layout.tsx` et héritaient
du canonical racine : ils se déclaraient **doublons de la page d'accueil**.
Même défaut sur `/jeu/jouer`, `/jeu/recap`, `/flagornot/stats` et
`/flashflag/session/[code]`.

Six layouts ont été créés. Les pages d'état éphémère (récapitulatif de partie,
session Flash Flag) sont en `noindex` plutôt que bloquées par `robots.txt`,
afin que Google puisse explorer la directive.

## 6. Navigation et accès aux pages légales (A4, D4)

- Nouveau pied de page présent sur **toutes** les routes publiques, avec une
  navigation en liens texte vers les pages de contenu. Auparavant, un visiteur
  arrivant sur `/jeu` ou `/guide` n'avait **aucun chemin** vers la politique de
  confidentialité, et la sélection des jeux se faisait par un carrousel à swipe
  qu'aucun crawler ne peut parcourir.
- Le lien « Secret » est renommé « Confidentialité ».
- Les trois pages légales passent de `noindex` à indexables et entrent au
  sitemap.

## 7. Protection des mineurs (C1)

Le jeu propose une tranche 16-18 ans, et la catégorie « Amour & Sexe » contient
des propositions explicites.

- Le serveur écarte désormais ces éléments lorsque la tranche déclarée est
  16-18, et refuse la catégorie si elle est demandée explicitement.
- L'interface ne propose plus cette catégorie aux mineurs, et purge une
  sélection restaurée depuis le stockage local.

## 8. Textes légaux mis en accord avec la réalité (§0.2, A3)

La politique de confidentialité et les CGU affirmaient que le consentement
publicitaire était recueilli « via une interface de gestion conforme au cadre de
transparence et de consentement (TCF) » et modifiable « depuis les paramètres de
confidentialité affichés sur le site ». **Aucune de ces interfaces n'existait.**

- Les formulations décrivent maintenant le dispositif réel.
- Ajout de la mention standard sur l'usage de cookies par des fournisseurs
  tiers, dont Google.
- Ajout du lien manquant vers « Comment Google utilise les données lorsque vous
  utilisez les sites de ses partenaires », ainsi que des liens d'opposition
  (paramètres des annonces Google, aboutads.info).

## 9. Contenu éditorial et signaux de confiance (WS-2, WS-4)

Quatre pages créées, toutes adossées à des faits vérifiables :

- **`/observatoire`** — analyse des votes de la communauté : les comportements
  sur lesquels hommes et femmes divergent le plus, ceux qui séparent les
  générations, puis une mesure d'amplitude sur les six groupes qui distingue les
  comportements les plus clivants de ceux qui font consensus. Calculé côté
  serveur à partir des données réelles, avec un seuil de participation minimum
  et les limites explicitées.

  *Choix assumé :* aucun article de conseil relationnel générique n'a été
  rédigé. Ce type de contenu est précisément ce que Google qualifie de faible
  valeur. La profondeur vient de l'analyse des données propres au site, que
  personne d'autre ne peut produire.
- **`/methodologie`** — fonctionnement du score Elo, facteur K variable selon la
  participation, comparaisons par groupe, et ce que le classement **n'est pas**
  (échantillon auto-sélectionné, absence de valeur diagnostique).
- **`/sources`** — références institutionnelles des outils d'auto-évaluation
  (Université de Poitiers, Département de Seine-Saint-Denis / Centre Hubertine
  Auclert, Face à l'inceste / Mémoire Traumatique). Ces sources figuraient
  jusqu'ici en commentaire dans le code.
- **`/a-propos`** — nature du site, partis pris, limites assumées, contact.

## 10. Premier affichage débloqué (WS-7)

Le LCP mesuré à ~12,9 s n'était pas dû aux images — l'ensemble de `public/`
pèse 114 Ko et `next/image` est correctement utilisé. La cause était que les
éléments porteurs du contenu étaient rendus à `opacity: 0` par framer-motion et
n'apparaissaient qu'après téléchargement du bundle, hydratation, puis animation.

- **Accueil** : la carte héro, élément LCP de la page, portait
  `initial={{ opacity: 0 }}`. `AnimatePresence` passe à `initial={false}` : la
  carte est peinte au premier rendu, et le morph entre jeux reste animé.
- **`/classement`** : le titre (40-56 px, élément LCP probable), le podium et
  les lignes du classement étaient tous voilés — ce qui annulait le bénéfice du
  rendu serveur ajouté au point 2. L'entrée n'est désormais animée que pour les
  jeux de données récupérés après un changement de filtre.
- **`/guide`** : les cartes de flags conservent leur glissement mais perdent le
  fondu, de sorte que le texte est peint immédiatement.

Les animations de `/dixmais` n'ont pas été touchées : ce sont des transitions
de phase de jeu, non un premier affichage.

---

*Les réserves de cette première passe sont reprises et actualisées dans « Ce
qui reste » de la seconde, plus haut. La fusion vers la production, qui y
figurait, est faite : `main` est déployée.*

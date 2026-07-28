# Journal des modifications — mise en conformité AdSense

Support de la demande de réexamen. Chaque entrée renvoie au problème identifié
dans [ADSENSE-PLAN-CONFORMITE.md](ADSENSE-PLAN-CONFORMITE.md).

**Statut : implémenté, non déployé.** Le build n'a pas encore été exécuté.

---

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
  sur lesquels hommes et femmes divergent le plus, et ceux qui séparent les
  générations. Calculé côté serveur à partir des données réelles, avec un seuil
  de participation minimum et les limites explicitées.
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

## Reste à faire

| Point | Nature |
|---|---|
| **Message de consentement (CMP)** | À activer dans AdSense → Confidentialité et messages. Aucun code supplémentaire n'est requis, mais **la conformité UE n'est pas atteinte tant que ce n'est pas fait**. |
| **Annonces automatiques** | À désactiver dans le compte AdSense tant que les pages ne dépassent pas le seuil de contenu. |
| **Authentification admin** | `adminAuth.ts` neutralise toute vérification : les API `/api/admin/*` restent accessibles en écriture. Écarté du périmètre par décision explicite. |
| **Contenus piliers (WS-3)** | Rédaction humaine, non entamée. |
| **Core Web Vitals — mesure** | Les causes de paint identifiées sont corrigées (point 10), mais le gain reste à mesurer sur PageSpeed Insights après déploiement. |
| **Build et déploiement** | `npm --prefix game run build` non exécuté (Node absent de la machine de développement). |

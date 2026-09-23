# Concevoir pour le téléphone — ce que dit la recherche

Document de travail pour la refonte du front de redorgreen.fr.
Établi en septembre 2026 à partir de sources primaires ; les URL sont en fin de
document, numérotées, et chaque affirmation chiffrée renvoie à la sienne.

---

## 0. Comment lire ce document

La recherche en conception d'interface se présente sous trois formes, et les
confondre coûte cher.

**Des mesures.** Des études d'eye-tracking, des observations de terrain, des
campagnes de tests. Elles donnent des nombres qu'on peut opposer à une opinion.
Elles vieillissent lentement : la manière dont une main tient un objet ne change
pas au rythme des modes.

**Des normes.** WCAG, les recommandations d'Apple et de Google. Ce ne sont pas
des observations mais des seuils décidés, souvent à partir de mesures. Elles ont
force d'argument : on ne discute pas un minimum de contraste, on s'y conforme ou
on documente pourquoi non.

**Des tendances.** Ce que font les sites primés cette année. Aucune valeur
probante. Utile pour savoir ce qu'un visiteur a déjà vu ailleurs — donc ce qu'il
saura lire sans effort — et rien de plus.

Ce document sépare les trois. Quand une section relève de la mode, c'est écrit.

Un avertissement sur les sources : la requête « bonnes pratiques mobile 2026 »
renvoie surtout des articles d'agences qui se recopient, avec des statistiques
sans étude derrière (« les sites mobiles convertissent 40 % de plus »). Ces
chiffres-là ne sont pas repris ici. Ce qui suit vient du W3C, d'Apple, de
Nielsen Norman Group, de Baymard, de Steven Hoober, de MDN et de web.dev.

---

## 1. Ce qui est mesuré

### 1.1 Comment les gens tiennent leur téléphone

Steven Hoober a observé 1 333 personnes en situation réelle, en 2013 [1]. C'est
toujours l'étude de référence, et elle a été confirmée depuis.

| Prise | Part |
|---|---|
| Une main, pouce sur l'écran | 49 % |
| Téléphone tenu d'une main, index ou pouce de l'autre | 36 % |
| Deux mains, deux pouces | 15 % |

Environ 75 % des interactions se font au pouce [2]. Il en découle la carte des
zones d'atteinte : le bas et le centre sont confortables, les côtés à mi-hauteur
demandent un étirement, **les deux coins hauts sont hors de portée** sans changer
de prise.

Deux nuances que les articles de seconde main perdent en route :

- **La carte dépend de la taille de la main et de celle de l'écran.** Il n'y a
  pas une zone du pouce mais une famille de zones. Depuis 2013 les écrans ont
  grandi — un téléphone de 6,5 pouces rend le coin haut gauche franchement
  inatteignable pour une main droite.
- **La prise change en cours d'usage.** Les gens passent d'une main à deux selon
  la tâche. Concevoir pour le pouce ne veut pas dire tout entasser en bas ; ça
  veut dire ne pas mettre une action fréquente dans un coin haut.

Pour les gestes : une zone de balayage doit faire au moins 45 px de côté [2].

### 1.2 Jusqu'où les gens défilent

Deux résultats coexistent et on les cite souvent l'un contre l'autre. Ils sont
compatibles, et c'est leur conjonction qui est utile.

**Le haut de page capte l'essentiel du regard.** L'étude d'eye-tracking de
Jakob Nielsen (57 453 fixations sur 541 pages) donne **80,3 % du temps de
regard au-dessus de la ligne de flottaison, 19,7 % en dessous** [3]. L'attention
décroît continûment vers le bas.

**Et pourtant les gens défilent.** Sur mobile, **70 % des visiteurs font défiler
la page d'accueil pour se faire une idée du site** [4]. Une mesure plus récente
de NN/g donne 92 % de pages où le visiteur descend sous la ligne, quand le
contenu donne visuellement l'impression de continuer.

La synthèse, qui est la seule chose à retenir :

> On défile volontiers, mais on regarde surtout le haut. Le rôle du premier
> écran n'est pas de tout contenir — c'est de donner envie du second.

Ce qui déclenche le défilement, d'après les mêmes travaux : la pertinence
perçue dès le premier écran, et **l'élan visuel** — une carte coupée par le bas
de l'écran, un rythme régulier, un indice que ça continue. Une page qui se
termine proprement au pixel près en bas de fenêtre se lit comme terminée.

**Conséquence directe, et c'est le point le plus important de ce document :**
vouloir tout faire tenir dans une fenêtre sans défilement est une erreur de
raisonnement. Ça ne supprime pas le besoin d'espace, ça le rationne — et la
variable d'ajustement finit toujours par être la taille du texte.

### 1.3 Ce qu'il faut montrer sur une page d'accueil mobile

Baymard, sur du commerce en ligne, mais le mécanisme est général [4] :

- Le visiteur se fait une idée de l'étendue de l'offre pendant son premier
  défilement, et cette idée est difficile à corriger ensuite.
- **42 % des pages d'accueil mobiles donnent une idée fausse** de ce que le site
  propose, parce qu'elles ne montrent pas assez de catégories.
- Recommandation : montrer 30 à 40 % des catégories de premier niveau
  directement dans la page.
- **Ne jamais replier les catégories derrière un menu à ouvrir.** C'est nommé
  explicitement comme la faute à ne pas commettre.

Le test des cinq secondes, méthode standard : on montre le premier écran cinq
secondes, on retire, on demande « qu'est-ce que fait ce site ? » et « est-ce que
vous restez ? ». Un premier écran doit répondre à trois questions — *qu'est-ce
que c'est, pour qui, pourquoi rester*.

### 1.4 Les seuils de performance

Core Web Vitals, seuils « bons » au 75e centile des visites réelles, mesurés sur
28 jours glissants [5] :

| Métrique | Bon | Mauvais au-delà de |
|---|---|---|
| LCP — apparition du plus gros élément | ≤ 2,5 s | 4 s |
| INP — délai de réponse à une interaction | ≤ 200 ms | 500 ms |
| CLS — décalages de mise en page | ≤ 0,1 | 0,25 |

Les seuils sont les mêmes sur mobile et sur ordinateur ; ils sont beaucoup plus
durs à tenir sur mobile.

Deux seuils perceptifs, plus anciens et plus fondamentaux :

- **100 ms** : au-delà, un retour visuel se remarque comme un délai [6].
- Un écran de squelette est perçu comme plus rapide qu'un indicateur tournant à
  durée réelle égale, parce qu'il annonce la forme de ce qui arrive [6].

### 1.5 Les seuils d'accessibilité

| Règle | Seuil | Source |
|---|---|---|
| Taille de cible (WCAG 2.2, AA, 2.5.8) | 24 × 24 px CSS | [7] |
| Taille de cible recommandée (Apple) | 44 × 44 pt | [8] |
| Taille de cible recommandée (Material) | 48 × 48 dp | — |
| Contraste texte normal (WCAG 2.1, AA) | 4,5:1 | [9] |
| Contraste texte large — ≥ 24 px, ou ≥ 18,5 px en gras | 3:1 | [9] |

Sur 2.5.8, deux précisions qui comptent :

- Une **icône visuellement petite peut respecter la règle** si sa zone tactile
  est agrandie par du remplissage ou un enrobage invisible. C'est la surface
  cliquable qui compte, pas le dessin.
- Il existe une dérogation d'**espacement**, souvent mal citée. L'énoncé exact :
  un cercle de 24 px de diamètre centré sur la cible ne doit croiser ni une autre
  cible, ni le cercle d'une autre cible. Ce n'est pas « 24 px entre deux cibles ».
  Le critère compte quatre autres dérogations : fonction équivalente ailleurs,
  cible en ligne dans du texte, taille imposée par le navigateur, présentation
  essentielle.

Les 24 px de WCAG sont un plancher légal, pas un objectif de confort ; les 44 pt
d'Apple et les 48 dp de Material sont des recommandations de constructeur, plus
exigeantes et plus anciennes. **Viser 44, pas 24.**

*Réserve de méthode :* les deux seuils W3C ci-dessus ont été vérifiés sur
w3.org. La page correspondante d'Apple est rendue en JavaScript et n'a pas pu
être lue directement ; les 44 pt sont une valeur documentée de longue date, mais
elle est reprise ici de sources secondaires.

Apple ajoute deux consignes de disposition [8] : ne rien mettre d'interactif
sous la barre d'état, l'îlot dynamique ou l'indicateur d'accueil ; éviter les
coins extrêmes, difficiles à atteindre.

### 1.6 Mouvement et troubles vestibulaires

`prefers-reduced-motion` signale qu'une personne a demandé à son système de
limiter les animations [10]. Les mouvements à risque sont les grands
déplacements, les changements d'échelle, la parallaxe et les défilements
automatiques — ils peuvent provoquer vertiges et nausées.

La bonne réponse n'est pas de tout supprimer : on garde les petites transitions,
on retire les grands mouvements, et **quand une animation porte une
information** (un état de chargement), on la remplace par un équivalent fixe
plutôt que par rien.

---

## 2. Les lois de conception qui s'appliquent ici

Ce ne sont pas des métaphores : ce sont des modèles vérifiés, avec un domaine de
validité.

**Loi de Fitts.** Le temps pour atteindre une cible dépend du rapport entre la
distance et la taille de la cible. Conséquence sur mobile : une grande cible
proche du pouce bat une petite cible bien placée. C'est l'argument qui justifie
de rendre *toute une carte* cliquable plutôt qu'un bouton dans un coin.

**Loi de Hick.** Le temps de décision croît avec le nombre d'options — de façon
logarithmique, pas linéaire. Deux conséquences opposées qu'il faut tenir
ensemble : réduire le nombre de choix accélère la décision, *mais* cacher des
choix ne les supprime pas, ça ajoute une étape. Un carrousel de quatre onglets
n'applique pas la loi de Hick, il la contourne mal.

**Loi de Miller.** La mémoire de travail tient 5 à 9 éléments. Elle justifie de
grouper, pas de tronquer : un groupe nommé de quatre jeux et un groupe nommé de
deux repères se retiennent mieux que six entrées à plat.

**Piste informationnelle** (*information scent*). Un lien doit laisser prévoir ce
qu'il y a derrière. Ce qui renforce la piste : un verbe précis, un nombre
(« 412 comportements »), un format (« 2 min », « à plusieurs »), un aperçu du
contenu réel. Ce qui l'affaiblit : un intitulé abstrait, une icône seule, un
mot-valise comme « Découvrir ».

**Divulgation progressive.** Montrer d'abord l'essentiel, le détail à la demande.
C'est légitime pour du détail secondaire. Ce n'est **pas** un permis pour cacher
le contenu principal derrière un bouton : la recherche de Baymard sur les menus
repliés dit exactement l'inverse [4].

---

## 3. Méthode UX — l'ordre des opérations

Ce qui distingue une refonte qui tient d'une refonte qui se refait six mois plus
tard, c'est l'ordre.

1. **Nommer la tâche.** Que vient faire quelqu'un sur cette page ? Sur une page
   d'accueil, presque toujours : comprendre ce qu'est le site, puis choisir quoi
   faire. Tout le reste est secondaire.
2. **Inventorier ce qui existe** — toutes les routes, y compris celles qu'on a
   oubliées. C'est là qu'on découvre les impasses.
3. **Trier, puis grouper, puis nommer les groupes.** Dans cet ordre. Nommer avant
   de trier produit des catégories qui arrangent l'auteur.
4. **Écrire le texte avant de dessiner.** Une mise en page conçue sur du faux
   texte casse au premier vrai contenu. Les textes longs sont la contrainte, pas
   les courts.
5. **Concevoir à 320 px de large d'abord**, puis élargir. L'inverse ne marche
   pas : on ne retire pas de la complexité, on la compresse.
6. **Mesurer dans un vrai navigateur**, pas à l'œil sur une maquette.
7. **Vérifier au clavier et au lecteur d'écran.** La structure de titres est le
   premier mode de navigation des utilisateurs de lecteurs d'écran [11].

### Ce qui se vérifie, et comment

| Question | Méthode | Coût |
|---|---|---|
| Comprend-on ce qu'est le site ? | Test des 5 secondes, 5 personnes | très faible |
| Trouve-t-on ce qu'on cherche ? | Test d'utilisabilité, 5 personnes | faible |
| Les groupes sont-ils les bons ? | Tri de cartes | moyen |
| Quelle version convertit ? | A/B, à partir de quelques milliers de visites | élevé |
| Est-ce lisible et atteignable ? | Mesure dans le navigateur | nul, automatisable |

La dernière ligne est la seule qui donne des réponses binaires. Elle doit être
faite systématiquement, pas quand on y pense.

---

## 4. Méthode UI — les systèmes qui portent la mise en page

### 4.1 Typographie

**Une échelle, pas des valeurs choisies au cas par cas.** On pose une base
(16 px sur mobile) et un rapport — 1,2 (mineure tierce), 1,25 ou 1,333 sont les
usages courants. Chaque taille du site est une marche de cette échelle.

**Le plancher.** Aucune norme n'impose de taille minimale, mais 16 px est la
taille par défaut des navigateurs, et sous ~12 px la lecture devient pénible sur
un écran tenu à bout de bras. Un intitulé en capitales avec de l'interlettrage
peut descendre à 12 px ; du texte courant, non.

**La longueur de ligne.** 45 à 75 caractères pour du texte suivi. Sur un
téléphone de 360 px, à 15 px, on est naturellement autour de 35–40 caractères —
court, mais acceptable pour des paragraphes brefs. La contrainte se gère avec
`max-width` en `ch`, pas en pixels.

**Typographie fluide.** `clamp(min, préférée, max)` donne une taille qui suit la
largeur de fenêtre entre deux bornes [12]. Utile pour les titres. À manier avec
précaution pour le texte courant : une taille qui dépend de la fenêtre peut
empêcher le zoom, ce qui contrevient à WCAG.

**Le chargement des polices.** Une police web chargée en `swap` provoque une
recomposition au moment où elle arrive : la police de repli n'a pas les mêmes
métriques, le texte change de largeur, le nombre de lignes change, la mise en
page saute. C'est du CLS, et c'est un défaut qui ne se voit pas en
développement. `next/font` génère automatiquement un repli aux métriques
ajustées, ce qui supprime le problème — encore faut-il que la police passe par
lui. **Une `@font-face` écrite à la main ne bénéficie pas de cet ajustement.**

### 4.2 Espacement

Une échelle de 8 px (avec 4 px pour les ajustements fins) : 4, 8, 12, 16, 24,
32, 48, 64 [13]. L'argument n'est pas esthétique mais technique — ces valeurs
tombent juste aux densités d'écran 1×, 1,5×, 2× et 3×, là où des valeurs
arbitraires produisent des demi-pixels et du flou.

L'argument pratique est plus fort encore : une échelle fermée est un vocabulaire
partagé. « Deux crans » veut dire la même chose pour tout le monde, et le rythme
vertical tient tout seul.

### 4.3 Couleur

**OKLCH plutôt que hexadécimal** pour définir un système [14]. En HSL ou en hex,
deux couleurs de même « clarté » nominale n'ont pas la même luminosité perçue —
un jaune à 50 % paraît bien plus clair qu'un bleu à 50 %. En OKLCH, la clarté est
perceptuellement uniforme : une même valeur L donne la même impression de
luminosité quelle que soit la teinte. Résultat concret : les états (survol,
appui, désactivé) se dérivent par arithmétique au lieu d'être retouchés un par
un, et le contraste devient prévisible. Tailwind 4 utilise OKLCH en interne.

**Contraste.** WCAG 2 impose 4,5:1. Mais son calcul est une simple division de
luminances, et il est connu pour mal se comporter dans les tons sombres [15] :
il surestime le contraste des couleurs proches du noir. APCA, l'algorithme
candidat pour WCAG 3, modélise la perception réelle et tient compte de la
polarité (clair sur sombre ≠ sombre sur clair) et de la graisse du texte.

Position raisonnable aujourd'hui : **se conformer à WCAG 2 pour la conformité,
vérifier avec APCA pour la lisibilité réelle.** Les deux ne sont pas
interchangeables et APCA n'a aucune valeur légale.

### 4.4 Le cas particulier du sombre

C'est la section la plus directement applicable à ce site, et elle contredit
une partie de ce qui y est fait.

**Le noir pur est un mauvais fond.** `#000000` sous du texte clair provoque de
l'*halation* : le texte semble déborder, vibrer, et la lecture prolongée
fatigue [16]. Sur un écran OLED, les pixels noirs sont éteints, et le passage
répété entre zones éteintes et zones allumées pendant le défilement ajoute un
effet de scintillement.

L'usage professionnel est un gris très sombre — `#0F0F0F` à `#121212` — en
réservant le noir pur aux lecteurs vidéo plein écran. La différence est presque
invisible côte à côte et se sent après trente secondes de lecture.

**Le blanc pur est un mauvais texte** sur fond sombre, pour la même raison. Un
blanc cassé autour de `#E0E0E0` réduit l'éblouissement sans perdre de lisibilité.

**Les couleurs saturées vibrent** sur fond sombre. Un rouge ou un vert pleine
saturation sur du noir crée une vibration optique désagréable, surtout en
grandes surfaces ou en texte. La correction est de désaturer légèrement les
accents en usage texte, tout en gardant la version saturée pour les aplats et
les signaux.

**L'élévation ne se fait pas par l'ombre mais par la lumière.** Sur fond clair,
une carte se détache par une ombre portée. Sur fond sombre, l'ombre ne se voit
pas : c'est la surface qui doit s'éclaircir. D'où des paliers de gris
(`#0F0F0F` → `#16161A` → `#1E1E24`) à la place d'une échelle d'ombres.

### 4.5 Mouvement

Le mouvement sert trois choses et une seule à la fois : **orienter** (d'où vient
cet écran), **confirmer** (mon appui a été pris en compte), **attirer** (quelque
chose a changé ici).

Durées usuelles : 100–150 ms pour un retour d'appui, 200–300 ms pour une
transition d'état, 300–500 ms pour un changement d'écran. Au-delà de 500 ms on
attend.

Coût sur téléphone : animer `transform` et `opacity` est gratuit — le compositeur
s'en charge. Animer `width`, `height`, `top` ou `box-shadow` force un recalcul de
mise en page à chaque image.

**Le flou est cher.** Le coût de composition d'un `backdrop-filter` croît avec le
rayon et la surface [17]. Recommandations : rester sous 20 px de rayon pour des
éléments de plus de 400 × 400 px, ne pas empiler plus de trois ou quatre flous
dans une même fenêtre, et **ne jamais animer un rayon de flou** — ça relance la
composition à chaque image. Un `filter: blur()` sur un élément de couleur unie
est nettement moins coûteux qu'un `backdrop-filter`, parce qu'il n'a pas à
rééchantillonner ce qu'il y a derrière ; il reste bon de le promettre au GPU.

### 4.6 CSS moderne effectivement disponible

À utiliser sans réserve aujourd'hui : requêtes de conteneur, `:has()`, `@layer`,
imbrication native, `clamp()`, OKLCH, `dvh`/`svh`/`lvh`, `subgrid` [18].

À utiliser avec un repli : `@scope`, l'API de transitions de vue, les animations
pilotées par le défilement.

Les unités de fenêtre méritent une note : `vh` sur mobile ne tient pas compte de
la barre d'outils du navigateur, qui apparaît et disparaît au défilement — d'où
des sauts de mise en page. `svh` (petite), `lvh` (grande) et `dvh` (dynamique)
règlent le problème. `dvh` suit la barre, donc **provoque lui-même des
recalculs** pendant le défilement : pour une hauteur minimale de page, `svh` est
souvent le bon choix, `dvh` pour un élément qui doit vraiment remplir.

---

## 5. Direction artistique

La direction artistique n'est pas la décoration. C'est l'ensemble des décisions
qui font qu'on reconnaît un site sans lire son nom, et qu'on devine son ton avant
d'avoir lu une phrase.

### 5.1 De quoi elle est faite

Une DA tient en peu de choses, et c'est ce qui la rend défendable :

1. **Une palette restreinte** — deux ou trois couleurs qui portent le sens, le
   reste en neutres.
2. **Un couple typographique** — souvent une seule famille suffit si elle a assez
   de graisses.
3. **Un traitement de la forme** — rayon des angles, épaisseur des traits,
   présence ou absence d'ombre.
4. **Un rapport à l'espace** — dense ou aéré, centré ou aligné à gauche.
5. **Un ton d'écriture** — le tutoiement, la longueur des phrases, le degré
   d'ironie. C'est la partie la plus souvent oubliée, et la plus reconnaissable.

### 5.2 Ce qu'on peut changer sans trahir une DA

C'est la question posée ici, donc elle mérite d'être traitée de front.

**Se change sans conséquence sur l'identité :** la densité, l'échelle
typographique, les paliers de gris, la structure de la page, le nombre de
colonnes, le rythme vertical, l'élévation.

**Ne se change pas sans changer d'identité :** les teintes qui portent le sens,
la famille typographique, le ton, la forme signature (ici : capitales grasses,
angles arrondis, accents néon sur fond sombre).

Autrement dit : **remplacer `#000000` par `#0E0E11`, désaturer un accent de
quelques pour cent, passer d'une échelle typographique arbitraire à une échelle
réglée — tout cela laisse la DA intacte.** Ce sont des réglages d'exécution, pas
des choix d'identité. Changer le rouge pour un orange, ou Space Grotesk pour une
grotesque neutre, ce serait autre chose.

### 5.3 Les tendances de 2026, et ce qu'elles valent

Section « mode », sans valeur probante — mais utile pour savoir ce qu'un
visiteur reconnaîtra.

- **Néo-brutalisme / brutalisme tactile.** Grilles visibles, typographie dure,
  contrastes agressifs, refus du poli. Revendique l'authenticité et la main
  humaine — argument devenu courant à mesure que les interfaces générées se
  ressemblent. *Ce que ça vaut :* la lisibilité y survit mal quand c'est pris au
  pied de la lettre. À prendre comme une autorisation d'être franc, pas comme
  une consigne de rendre les choses illisibles.
- **La typographie comme architecture.** Le titre porte l'écran, à la place de
  l'illustration de héros. *Ce que ça vaut :* beaucoup, et pas pour des raisons
  de mode — du texte pèse mille fois moins qu'une image, s'indexe, se traduit,
  se lit au lecteur d'écran, et n'a pas de LCP à optimiser.
- **Typographie cinétique, animations au défilement.** Les lettres se
  compriment, s'étirent, réagissent au défilement. *Ce que ça vaut :* joli,
  coûteux, et à gâcher sous `prefers-reduced-motion`. À réserver à une page
  éditoriale, jamais à une vitrine qu'on traverse.
- **Éditorial.** Échelle de magazine, hiérarchie forte, grande respiration.
  *Ce que ça vaut :* compatible avec tout le reste de ce document. C'est la
  tendance la plus alignée avec les mesures.

---

## 6. Ce que tout cela dit de l'accueil de redorgreen.fr

Confrontation de la page actuelle (branche `mainmenurefactoring`) aux éléments
ci-dessus. Ce qui est déjà conforme est noté aussi brièvement que ce qui ne
l'est pas.

### Conforme

| Point | État |
|---|---|
| Menus repliés supprimés [4] | Les deux tiroirs ont disparu |
| Tous les contenus visibles au défilement [4] | Jeux, palmarès, repères, secours |
| Élan visuel vers le bas [3] | 3 cartes entières + la 4e coupée à 390 px |
| Cibles tactiles ≥ 44 px [8] | Mesuré : aucune sous 44 |
| Plancher typographique | Mesuré : rien sous 12 px |
| Repli de police aux métriques ajustées | `next/font` s'en charge |
| Toute la carte cliquable (Fitts) | Oui |
| Structure sémantique [11] | `h1` unique, `h2` par section, `h3` par jeu |
| Preuve chiffrée en haut [test 5 s] | Nombre de votes, palmarès réel |

### À corriger

| Point | Constat | Source |
|---|---|---|
| **Fond noir pur** | `bg-black` = `#000000`. Halation, vibration des accents saturés, scintillement OLED au défilement | [16] |
| **Accents saturés en texte** | `#2ECC71`, `#F59E0B` en capitales sur noir : vibration optique | [16] |
| **Pas de verbe d'action** | Les cartes portent un titre et une flèche, aucun verbe. La version à onglets avait « FAIRE LE TEST », « LANCER LE DUEL ». Piste informationnelle affaiblie | [19] |
| **Échelle typographique arbitraire** | 11,5 / 12 / 13,5 / 14 / 15 / 19 / 20 px — choisies une par une | §4.1 |
| **Échelle d'espacement partielle** | Tailwind donne la grille de 4 px, mais les valeurs employées ne suivent pas de progression décidée | [13] |
| **Zone du pouce inexploitée** | Aucun élément persistant en bas ; tout se joue en haut et au centre | [1] |
| **Couleurs en hexadécimal** | États dérivés à la main, contraste non prévisible d'une teinte à l'autre | [14] |
| **Deux halos flous fixes** | 110 px et 100 px de rayon, sous une page qui défile désormais. Promus au GPU, mais le rayon reste au-dessus des 20 px conseillés | [17] |
| **`min-h-dvh`** | `dvh` suit la barre d'outils mobile et se recalcule au défilement ; `svh` suffit pour une hauteur minimale | [18] |

### Deux points à trancher, pas à corriger d'office

**Une barre de navigation basse.** La recherche la soutient : 3 à 5 destinations
de premier niveau, dans la zone du pouce, et des gains d'usage mesurés contre un
menu hamburger en haut [20]. Le site a quatre jeux et trois pages de lecture, ce
qui entre dans le format. Mais elle consomme de la hauteur en permanence sur
l'écran où elle sert le moins — la page d'accueil, dont le contenu *est* la
navigation. Elle a plus de sens sur les pages de jeu et de lecture, où il
n'existe aujourd'hui qu'un en-tête statique.

**La densité du premier écran.** 80 % du regard va au-dessus de la ligne [3].
Aujourd'hui l'en-tête occupe 189 px sur 568 — un tiers d'un petit téléphone —
pour un logo et deux phrases. On peut descendre à un quart et gagner une carte
entière. Le contre-argument est que ce tiers fait aussi le travail du test des
cinq secondes. Il y a un arbitrage réel, à régler par la mesure et non par
principe.

---

## 7. Liste de vérification

À passer avant de livrer une page, dans cet ordre.

**Mesures automatisables** (à faire dans le navigateur, à 320, 360 et 390 px) :

- [ ] `document.documentElement.scrollWidth - innerWidth === 0`
- [ ] Aucune police sous 12 px
- [ ] Aucune cible interactive sous 44 × 44 px
- [ ] Aucun texte sous 4,5:1 de contraste (3:1 si ≥ 24 px, ou ≥ 18,5 px gras)
- [ ] Hauteurs de cartes homogènes au sein d'une même liste
- [ ] Au moins un élément coupé par le bas du premier écran

**Vérifications humaines :**

- [ ] Un titre `h1` unique, des `h2`/`h3` en ordre, sans saut de niveau
- [ ] Parcours complet au clavier, focus toujours visible
- [ ] Rendu correct sous `prefers-reduced-motion: reduce`
- [ ] Chaque lien annonce sa destination hors contexte
- [ ] Le premier écran répond à : qu'est-ce que c'est, pour qui, pourquoi rester
- [ ] Rien d'important n'est caché derrière un geste

---

## 8. Sources

1. Steven Hoober, *How Do Users Really Hold Mobile Devices?*, UXmatters, 2013 —
   https://www.uxmatters.com/mt/archives/2013/02/how-do-users-really-hold-mobile-devices.php
2. *The Thumb Zone: Designing For Mobile Users*, Smashing Magazine —
   https://www.smashingmagazine.com/2016/09/the-thumb-zone-designing-for-mobile-users/
3. Jakob Nielsen, *Scrolling and Attention*, Nielsen Norman Group —
   https://www.nngroup.com/articles/scrolling-and-attention-original-research/
4. *42% of Mobile Homepages Risk Setting Wrong Expectations for Their Users*,
   Baymard Institute — https://baymard.com/blog/mobile-homepage-usability
5. *Defining the Core Web Vitals metrics thresholds*, web.dev —
   https://web.dev/articles/defining-core-web-vitals-thresholds
6. Simon Hearne, *Optimistic UI Patterns for Improved Perceived Performance* —
   https://simonhearne.com/2021/optimistic-ui-patterns/
7. *Success Criterion 2.5.8 Target Size (Minimum)*, W3C WCAG 2.2 —
   https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
8. *Layout*, Apple Human Interface Guidelines —
   https://developer.apple.com/design/human-interface-guidelines/layout
9. *Contrast (Minimum)*, W3C WCAG —
   https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
10. *prefers-reduced-motion*, MDN —
    https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
11. *Semantics and screen readers*, web.dev —
    https://web.dev/articles/semantics-and-screen-readers
12. *Creating a Fluid Type Scale with CSS Clamp*, Aleksandr Hovhannisyan —
    https://www.aleksandrhovhannisyan.com/blog/fluid-type-scale-with-css-clamp/
13. *Spacing*, Atlassian Design System —
    https://atlassian.design/foundations/spacing
14. *oklch()*, CSS-Tricks — https://css-tricks.com/almanac/functions/o/oklch/
15. *The Easy Intro to the APCA Contrast Method* —
    https://git.apcacontrast.com/documentation/APCAeasyIntro.html
16. *Dark Mode UI Design: Best Practices for Accessible Dark Themes*, Atmos —
    https://atmos.style/blog/dark-mode-ui-best-practices
17. *backdrop-filter*, MDN —
    https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter
18. *Modern CSS Features 2026*, Pol Gubau —
    https://polgubau.com/blog/modern-css-2026
19. *Progressive Disclosure*, Nielsen Norman Group —
    https://www.nngroup.com/articles/progressive-disclosure/
20. *Bottom Navigation Pattern On Mobile Web Pages*, Smashing Magazine —
    https://www.smashingmagazine.com/2019/08/bottom-navigation-pattern-mobile-web-pages/

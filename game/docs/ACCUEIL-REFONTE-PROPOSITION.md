# Accueil — proposition de refonte

Fait suite à [DESIGN-MOBILE-RECHERCHE.md](./DESIGN-MOBILE-RECHERCHE.md), dont
les numéros de source sont repris ici.

**Les lots 1 à 4 sont mis en œuvre** — voir la §7 en fin de document pour l'état
exact et ce que la mesure a corrigé. Les lots 5 et 6 restent des propositions.

**Contrainte posée :** conserver la direction artistique. Tout ce qui suit est
donc un réglage d'exécution, jamais un changement d'identité — la §5.2 du
document de recherche explique où passe la frontière.

---

## 1. Le contrat : ce qui ne bouge pas

Pour que la suite soit lisible comme une refonte et non comme un remplacement :

- **Noir, rouge, vert.** Le rouge et le vert restent les deux couleurs qui
  portent le sens. Le fond reste très sombre.
- **Space Grotesk**, en graisses lourdes, capitales pour les titres.
- **Le ton.** Tutoiement, phrases courtes, pas de pédagogie condescendante.
- **Les angles arrondis généreux**, les accents néon, le halo autour du logo.
- **Le logo**, tel quel.

Ce qui suit ne touche à aucun de ces cinq points.

---

## 2. Les corrections de fond

Trois systèmes à poser avant toute question de mise en page. Ce sont eux qui
font la différence entre une page réglée et une page retouchée.

### 2.1 Les surfaces — sortir du noir pur

Le fond actuel est `#000000`. C'est le seul choix de la page qui soit
franchement contredit par la recherche : halation du texte clair, vibration
optique des accents saturés, scintillement OLED au défilement [16].

Proposition — quatre paliers au lieu d'une couleur :

| Jeton | Valeur | Emploi |
|---|---|---|
| `surface-0` | `#0B0B0E` | fond de page |
| `surface-1` | `#121216` | cartes, listes |
| `surface-2` | `#1A1A20` | survol, éléments actifs |
| `bordure` | `#FFFFFF` à 8 % | séparations |

Sur fond sombre, l'élévation ne se rend pas par l'ombre — invisible — mais par
la lumière : une carte est *plus claire* que son fond, pas *ombrée*.

La différence entre `#000000` et `#0B0B0E` est presque invisible côte à côte et
se sent au bout de trente secondes de lecture. **La DA n'y perd rien** : c'est
toujours un site noir.

### 2.2 Le texte et les accents

| Jeton | Valeur | Emploi |
|---|---|---|
| `texte-1` | `#E8E8EC` | texte principal |
| `texte-2` | `#A0A0AA` | texte secondaire |
| `texte-3` | `#6E6E78` | mentions, métadonnées |

Les accents gardent leur valeur actuelle **en aplat** (liserés, pastilles,
barres) et reçoivent une variante **pour le texte**, plus claire et un peu moins
chromatique — un vert pleine saturation en capitales sur fond sombre vibre [16].

| Jeu | Aplat (inchangé) | Texte |
|---|---|---|
| Red Flag Test | `#FFB4AA` | `#FFC4BC` |
| C'est un 10 mais… | `#F59E0B` | `#FFC04D` |
| L'Oracle | `#88CEFF` | `#A8DBFF` |
| Le pire des deux | `#2ECC71` | `#5FE39B` |

**Valeurs à vérifier par la mesure avant d'être retenues**, pas à l'œil : chaque
couleur de texte doit tenir 4,5:1 sur `surface-1`, et je propose de contrôler
aussi en APCA, qui décrit mieux le sombre [15].

Sur le moyen terme, écrire cette palette en OKLCH plutôt qu'en hexadécimal [14] :
les états dérivés (survol, appui) se calculent alors au lieu d'être choisis, et
le contraste devient prévisible d'une teinte à l'autre. Tailwind 4 travaille
déjà en OKLCH en interne.

### 2.3 L'échelle typographique

Aujourd'hui : 11,5 / 12 / 13,5 / 14 / 15 / 19 / 20 px, choisies une par une.

Proposition — base 16 px, rapport 1,2, arrondi :

| Jeton | px | Emploi |
|---|---|---|
| `t-cap` | 12 | capitales espacées uniquement (formats, intitulés de section) |
| `t-petit` | 13 | métadonnées |
| `t-base` | 16 | texte courant |
| `t-lead` | 19 | titres de carte |
| `t-titre` | 23 | titres de section forts |
| `t-hero` | 28 | accroche |

Le passage du texte courant de 14 à **16 px** est le changement le plus
important de cette section. C'est la taille par défaut des navigateurs, et la
lisibilité y gagne franchement sur un écran tenu à bout de bras.

Il a un coût : les cartes grandissent. **La compensation n'est pas de réduire la
taille mais d'écrire plus court** — deux lignes de 40 caractères au lieu de
trois. Moins de mots plus gros bat plus de mots plus petits.

### 2.4 L'échelle d'espacement

4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 [13]. Tailwind fournit déjà la grille ; il
s'agit de s'interdire les valeurs intermédiaires (`gap-2.5`, `py-3.5`, `mt-9`)
et de tenir un vocabulaire fermé.

---

## 3. La structure proposée

### 3.1 Le principe

La règle qui gouverne tout le reste, et qui est le résultat le plus solide de la
recherche : **80 % du regard va au premier écran [3], mais 70 % des visiteurs
défilent [4].** Le premier écran n'a donc pas à tout contenir — il doit répondre
à « qu'est-ce que c'est » et donner envie du second.

### 3.2 Écran par écran, sur un 390 × 844

```
┌─────────────────────────────┐
│           LOGO              │  ~90 px
│  « Red flag » désigne tout   │
│  et n'importe quoi. Ici, ce  │  ~48 px   ← le QUOI
│  sont les joueurs qui        │
│  tranchent.                  │
│                             │
│  ┌───────────────────────┐  │
│  │ 78 % jugent « il lit  │  │  ~72 px   ← la PREUVE, en direct
│  │ mes conversations »   │  │
│  │ pire que « il ment    │  │
│  │ sur son âge »         │  │
│  └───────────────────────┘  │
│                             │
│  LES JEUX                   │  ~28 px
│  ┌───────────────────────┐  │
│  │▌🧪 RED FLAG TEST   ↗  │  │  ~124 px
│  │   Le score de ce que  │  │
│  │   les autres voient   │  │
│  │   SOLO · ANONYME      │  │
│  │              FAIRE LE │  │
│  │              TEST  →  │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │▌⭐ C'EST UN 10 MAIS…  │  │  ~124 px
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │▌🔮 L'ORACLE           │  │  coupée  ← l'élan visuel
└─────────────────────────────┘
```

Puis, en défilant : la quatrième carte, le palmarès réel, les deux repères, le
bloc de secours, les notes éditoriales.

### 3.3 Le changement de fond : montrer le produit dès le premier écran

C'est la proposition principale de ce document, et la seule qui ne soit pas un
réglage.

Aujourd'hui le premier écran **affirme** que les joueurs tranchent. Le palmarès,
qui le **prouve**, est en troisième position — donc dans les 20 % de regard [3].

Proposition : une ligne unique, au-dessus des jeux, tirée des vraies données —
un arbitrage réel, avec son pourcentage. Pas un palmarès, pas un tableau : une
phrase.

> **78 %** jugent « il lit mes conversations » pire que « il ment sur son âge ».

Ce que ça fait, et pourquoi c'est mieux qu'une phrase de présentation :

- ça répond au test des cinq secondes par l'exemple plutôt que par la promesse ;
- ça montre l'étendue du catalogue, ce que Baymard identifie comme le défaut
  n°1 des accueils mobiles [4] ;
- ça donne envie de voir le reste — c'est de la piste informationnelle, pas de
  la décoration ;
- c'est du texte, donc indexable, gratuit en LCP, lisible au lecteur d'écran.

Coût technique : une requête de plus, dans le même `Promise.all` que les deux
existantes, avec le même repli silencieux. Il faut choisir la paire — le plus
simple et le plus honnête est de prendre les deux comportements adjacents au
classement dont l'écart Elo est le plus grand, ce qui donne mécaniquement un
arbitrage net.

Le bandeau défilant écrit à la main, supprimé à la refonte précédente, faisait ce
travail — en faux.

### 3.4 Rendre le verbe aux cartes

Régression que j'ai introduite et qu'il faut corriger. La version à onglets
portait « FAIRE LE TEST », « LANCER LE DUEL ». Les cartes actuelles n'ont qu'un
titre et une flèche : aucun verbe, donc une piste informationnelle plus faible
[19]. La recherche sur les intitulés est constante — verbe + objet, tourné vers
le résultat pour la personne [19].

Proposition : un intitulé d'action en bas à droite de chaque carte, en `t-cap`,
dans la teinte du jeu.

| Jeu | Intitulé |
|---|---|
| Red Flag Test | `FAIRE LE TEST →` |
| C'est un 10 mais… | `NOTER UN PROFIL →` |
| L'Oracle | `SOUMETTRE MON CAS →` |
| Le pire des deux | `LANCER UN DUEL →` |

Toute la carte reste cliquable (loi de Fitts) ; l'intitulé n'est pas un bouton
dans le bouton, c'est une étiquette.

### 3.5 Le reste de la page

Inchangé dans sa structure — jeux, palmarès, repères, secours — avec les
nouveaux jetons appliqués. Deux ajustements mineurs :

- **`min-h-dvh` → `min-h-svh`.** `dvh` suit la barre d'outils du navigateur
  mobile et se recalcule pendant le défilement [18]. Pour une hauteur minimale,
  `svh` suffit et ne bouge pas.
- **Les deux halos.** Rayons de 110 px et 100 px, au-delà des 20 px conseillés
  pour de grandes surfaces [17]. Ce sont des `filter: blur()` sur des aplats,
  pas des `backdrop-filter` — donc nettement moins coûteux, et déjà promus au
  GPU. À mesurer avant d'y toucher : si le défilement tient 60 images par
  seconde sur un téléphone d'entrée de gamme, il n'y a rien à corriger.

---

## 4. Ce que je ne recommande pas

Autant que la proposition, parce que ces options se défendent et qu'il faut
savoir pourquoi elles sont écartées.

**Une barre de navigation basse sur l'accueil.** La recherche la soutient — zone
du pouce, 3 à 5 destinations, gains mesurés contre un menu hamburger [20]. Mais
sur cette page précise, le contenu *est* la navigation : une barre y dupliquerait
la page en consommant de la hauteur en permanence. **Elle a en revanche du sens
sur les pages de jeu et de lecture**, où il n'existe aujourd'hui qu'un en-tête
statique en haut d'écran — c'est-à-dire hors d'atteinte du pouce [1]. À traiter
comme un sujet à part.

**La typographie cinétique et les animations au défilement.** Très présentes dans
les tendances 2026, séduisantes, et à désactiver entièrement sous
`prefers-reduced-motion` [10]. Sur une vitrine qu'on traverse en quinze
secondes, elles coûtent plus qu'elles ne rapportent. Sur une page éditoriale —
la méthodologie, l'observatoire — l'argument serait différent.

**Le verre dépoli.** Empiler des `backdrop-filter` est ce qui coûte le plus cher
au défilement sur téléphone [17], et ce n'est pas la DA de ce site.

**Tout carrousel, sous quelque forme que ce soit.** C'est le point de départ de
toute cette histoire.

**La personnalisation du premier écran.** Rien dans les données actuelles ne
permet de savoir ce qu'un visiteur veut, et une page d'accueil qui change d'une
visite à l'autre se mémorise moins bien.

---

## 5. Ordre de mise en œuvre

Du plus sûr au plus discutable, pour pouvoir s'arrêter à n'importe quelle ligne.

| # | Lot | Risque | Effet |
|---|---|---|---|
| 1 | Jetons de surface et de texte (§2.1, §2.2) | nul | confort de lecture |
| 2 | Échelles typographique et d'espacement (§2.3, §2.4) | faible | cohérence, lisibilité |
| 3 | Intitulés d'action sur les cartes (§3.4) | nul | piste informationnelle |
| 4 | `svh`, vérification des halos (§3.5) | nul | défilement |
| 5 | **L'arbitrage en direct au premier écran (§3.3)** | moyen — une requête de plus | c'est le vrai gain |
| 6 | Palette en OKLCH (§2.2) | faible, mais touche tout le site | prévisibilité |

Les lots 1 à 4 se font sans rien changer à la structure ni aux données. Le lot 5
est le seul qui mérite une discussion avant d'être écrit.

---

## 6. Comment on saura que c'est mieux

Sans mesure, une refonte est une préférence. Les critères, dans l'ordre de
solidité :

**Vérifiable par la machine, à 320, 360 et 390 px :**

- aucun débordement horizontal, aucune cible sous 44 px, rien sous 12 px ;
- tout texte au-dessus de 4,5:1 ;
- au moins un élément coupé par le bas du premier écran ;
- LCP ≤ 2,5 s et CLS ≤ 0,1 en conditions réelles [5].

**Vérifiable par cinq personnes, en vingt minutes :**

- test des cinq secondes : « qu'est-ce que fait ce site ? ». Aujourd'hui la
  réponse attendue est « des jeux sur les red flags » ; avec l'arbitrage en
  direct, elle devrait devenir « des gens votent sur ce qui est grave ».

**Vérifiable par les données du site :**

- part des visiteurs qui atteignent un jeu depuis l'accueil ;
- profondeur de défilement.

Si le lot 5 ne déplace ni l'un ni l'autre, il aura coûté une requête pour rien —
et il faudra le dire.

---

## 7. État — lots 1 à 4 mis en œuvre

Faits le 23 septembre 2026, sur la branche `refontemaximale-front`.

| Lot | État |
|---|---|
| 1 — surfaces et rampe de texte | fait |
| 2 — échelles typographique et d'espacement | fait |
| 3 — verbes d'action sur les cartes | fait |
| 4 — `svh`, vérification des halos | fait |
| 5 — arbitrage en direct au premier écran | **non fait**, en attente d'arbitrage |
| 6 — palette en OKLCH | **non fait** |

### Ce qui a été mesuré

À 320 × 568, 360 × 640 et 390 × 844 : aucun débordement horizontal, aucune
cible interactive sous 44 px, rien sous 12 px, les quatre cartes à 163 px
exactement, et une carte coupée par le bas du premier écran dans les trois cas.

Contraste : zéro texte sous son seuil, le pire rapport de la page étant 4,92:1
pour 4,5 requis.

### Trois choses trouvées en route

**La valeur que j'avais proposée pour le texte tertiaire était mauvaise.** Le
`#6E6E78` de la §2.2 semblait juste à l'œil et donnait **3,71:1** sur
`--surface-1`, pour 4,5 requis à 12 px. Cinq textes échouaient : la ligne des
garanties et les quatre lignes de format. La valeur retenue, `#82828D`, est
calculée pour tenir le seuil sur les deux surfaces, pas choisie. C'est
exactement le cas que la §2.2 annonçait — « à vérifier par la mesure, pas à
l'œil » — et il s'est produit.

**Le nombre de caractères ne prédit pas le nombre de lignes.** La carte de
l'Oracle et celle de « C'est un 10 mais… » portaient toutes deux 54 caractères ;
l'une tenait en deux lignes, l'autre en trois, selon l'endroit où tombaient les
coupures de mots. Trois tentatives de raccourcissement à l'estime ont échoué
avant de mesurer la largeur réelle et de déplacer la mise en garde de l'Oracle
vers sa ligne de format.

**Le fond noir n'était pas une décision, c'était un contournement.** Le site
possédait déjà `--bg-primary: #0A0A0B`, posé sur `body`, qui n'est pas du noir
pur. L'accueil posait `bg-black` par-dessus. Retirer cette classe suffisait :
il n'y avait pas de nouveau jeton de fond à inventer, seulement à cesser de
masquer celui qui existait.

**La vérification des halos a d'abord produit une conclusion fausse, corrigée.**
J'avais lu `getComputedStyle().transform` pour vérifier que le calque décoratif
était bien promu sur le GPU, et conclu que `transform-gpu` ne faisait rien
parce que la valeur calculée restait la matrice identité. Le test ne prouvait
rien : `translateZ(0)` **est** la matrice identité, et un élément promu de cette
façon est indistinguable d'un élément qui ne l'est pas. La promotion passe donc
maintenant par `will-change: transform`, qui demande la même chose et se lit
dans la feuille calculée — donc se teste.

Ce qui a réellement été établi sur le coût des halos : la page ne contient
**aucun** `backdrop-filter`, le cher, celui qui rééchantillonne ce qu'il y a
derrière. Les deux halos sont des `filter: blur()` sur des aplats de couleur,
et mesurent 320 × 320 et 256 × 256 — sous le seuil au-delà duquel un grand
rayon commence à peser. Les rayons n'ont donc pas été touchés.

**Ce qui n'a pas pu être vérifié :** la cadence de défilement sur un vrai
téléphone. La mesure d'images par seconde demande `requestAnimationFrame`, qui
ne se déclenche pas quand le volet du navigateur est masqué, et une mesure
prise sur cette machine ne dirait de toute façon rien d'un appareil d'entrée de
gamme. L'argument ci-dessus est structurel, pas expérimental.

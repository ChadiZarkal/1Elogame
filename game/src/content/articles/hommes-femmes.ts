/**
 * Red flags : les hommes et les femmes sont (presque) d'accord.
 *
 * Chiffres arrêtés au 29 septembre 2026, lus dans la table des votes, sur les
 * comportements du quotidien seulement (la catégorie « Amour & Sexe » n'est
 * pas publiée). Pour chaque comportement et chaque sexe : part des duels où il
 * a été désigné comme le pire. Retenus : les 111 comportements ayant au moins
 * 30 duels de chaque sexe. Écart jugé net quand un test de comparaison de
 * proportions le place sous le seuil de 5 % (|z| ≥ 1,96).
 */

import type { Article } from './types';

export const hommesFemmes: Article = {
  slug: 'red-flags-hommes-femmes-presque-d-accord',
  titre: "Red flags : les hommes et les femmes sont (presque) d'accord",
  chapo:
    "On s'attendait à une guerre des sexes. Sur les comportements du quotidien, les votes racontent l'inverse : hommes et femmes désignent les mêmes pires red flags, et les mêmes comportements sans gravité. Les quelques désaccords qui subsistent tiennent en une poignée — et ils ne sont pas là où on les attendait.",
  description:
    "Top des red flags et des comportements sans gravité chez les hommes et chez les femmes, d'après des milliers de votes : ce qui fait consensus, et les rares écarts nets.",
  emoji: '⚖️',
  auteur: 'Équipe Red or Green',
  publie: '2026-09-29',
  misAJour: '2026-09-29',
  chiffresAu: '29 septembre 2026',
  blocs: [
    { type: 'h2', texte: 'Les pires red flags : le même podium, ou presque' },
    {
      type: 'p',
      texte:
        "Dans [Le pire des deux](/jeu), on désigne le plus grave de deux comportements. Pour chacun, on peut donc mesurer la part de ses duels où il a été désigné comme le pire, selon le sexe de la personne qui vote. En tête des deux classements, on trouve la même famille : **l'hygiène**.",
    },
    {
      type: 'tableau',
      legende:
        "Les comportements les plus souvent désignés comme le pire, chez les hommes et chez les femmes : part des duels où ils ont été désignés.",
      entetes: ['', 'Hommes', 'Femmes'],
      lignes: [
        ['Avoir une haleine de chacal', '76 %', '84 %'],
        ['Bouffer ses crottes de nez', '74 %', '79 %'],
        ['Se laver une fois par semaine', '78 %', '66 %'],
        ['Ne jamais se brosser les dents le matin', '78 %', '66 %'],
        ['Réutiliser ses sous-vêtements trois jours', '75 %', '69 %'],
        ['Ne jamais tirer la chasse', '65 %', '79 %'],
      ],
    },
    {
      type: 'p',
      texte:
        "Les chiffres bougent de quelques points d'un sexe à l'autre, mais aucun de ces écarts n'est net : avec quelques dizaines de duels par comportement, ils restent dans la marge du hasard. Ce qui domine, c'est l'accord. Les femmes ajoutent à leur haut de tableau « vendre des formations bidons » (77 %) et « couper la parole tout le temps » (74 %) ; les hommes, « parler fort dans les transports » (82 %). Là encore, sans écart significatif avec l'autre sexe.",
    },

    { type: 'h2', texte: "À l'autre bout : ce que personne ne trouve grave" },
    {
      type: 'p',
      texte:
        "Le bas du classement est tout aussi consensuel. Chez les hommes comme chez les femmes, on y trouve des plaisirs sans victime : **lire des mangas** (désigné dans 19 % des duels chez les hommes, 33 % chez les femmes), **chanter sous la douche** (22 % et 32 %), **faire du yoga tous les jours** (24 % et 34 %). Chez les femmes, les moins désignés sont **aimer le vin** (22 %), **courir des marathons** (22 %) et **pleurer en public** (24 %).",
    },
    {
      type: 'p',
      texte:
        "Un comportement qui perd presque tous ses duels n'est pas un green flag pour autant — personne n'a voté pour dire qu'aimer le vin était une qualité. Il est simplement, pour les joueurs, sans gravité. Ce que sont vraiment les green flags est expliqué dans le [guide des flags](/guide).",
    },

    { type: 'h2', texte: 'Les rares désaccords nets' },
    {
      type: 'p',
      texte:
        "Sur les 111 comportements du quotidien assez votés des deux côtés pour être comparés, **sept** seulement présentent un écart net entre hommes et femmes. Six vont dans le même sens : ce sont les hommes qui jugent plus sévèrement.",
    },
    {
      type: 'tableau',
      legende:
        "Les comportements du quotidien où l'écart entre hommes et femmes est statistiquement net : part des duels où ils ont été désignés comme le pire.",
      entetes: ['', 'Hommes', 'Femmes'],
      lignes: [
        ['Être RH', '68 %', '44 %'],
        ['Être DJ', '59 %', '35 %'],
        ['Frauder dans les transports', '59 %', '35 %'],
        ['Coder pendant son temps libre', '58 %', '34 %'],
        ['Pleurer en public', '45 %', '24 %'],
        ['Courir des marathons', '43 %', '22 %'],
        ['Collectionner des figurines', '28 %', '50 %'],
      ],
    },
    {
      type: 'p',
      texte:
        "Le plus parlant est peut-être **« pleurer en public »** : presque deux fois plus souvent désigné comme le pire par les hommes que par les femmes. Une piste, pas une démonstration : c'est un comportement que l'éducation des garçons décourage souvent, et on ne s'étonnerait pas que ceux qui ont appris à ne pas pleurer le jugent plus durement chez les autres. À l'inverse, les femmes sont nettement plus sévères que les hommes avec **les figurines** — seul écart net dans ce sens.",
    },
    {
      type: 'encadre',
      titre: 'Pourquoi rester prudent',
      paragraphes: [
        "Sur 111 comparaisons, le hasard seul ferait apparaître environ six écarts de cette taille. On en compte sept. Autrement dit, il est probable que plusieurs des lignes du tableau soient des coïncidences, sans qu'on puisse dire lesquelles. Ces écarts sont des indices, pas des conclusions.",
        "Les joueurs forment par ailleurs un échantillon volontaire et plutôt jeune — près de huit votes sur dix viennent de personnes de moins de 27 ans. Ces chiffres décrivent la communauté du site, pas les Français.",
      ],
    },

    { type: 'h2', texte: 'Le vrai désaccord est ailleurs' },
    {
      type: 'p',
      texte:
        "Si les hommes et les femmes s'accordent sur l'haleine, les crottes de nez et la douche hebdomadaire, ils se séparent nettement dès qu'il est question de désir et de pouvoir au travail. « Coucher avec son boss » et « draguer les collègues » en sont l'exemple le plus frappant : deux verdicts exactement inversés, analysés dans [notre article dédié](/articles/coucher-avec-son-boss-draguer-ses-collegues).",
    },
    {
      type: 'p',
      texte:
        "Les écarts par tranche d'âge, et les comportements qui divisent le plus l'ensemble des groupes, sont suivis en continu dans l'[Observatoire](/observatoire). Et le classement complet, mis à jour chaque heure, est sur la page des [pires red flags](/red-flags).",
    },
  ],
  suite: [
    { href: '/articles/coucher-avec-son-boss-draguer-ses-collegues', label: 'Coucher avec son boss, draguer ses collègues : le vrai désaccord' },
    { href: '/red-flags', label: 'Les pires red flags, d’après les votes' },
    { href: '/observatoire', label: "L'Observatoire" },
    { href: '/jeu', label: 'Voter au pire des deux' },
  ],
  sources: [],
};

/**
 * Coucher avec son boss, draguer ses collègues.
 *
 * Chiffres arrêtés au 29 septembre 2026, lus dans la table des votes :
 * pour chaque comportement et chaque sexe, le nombre de duels où il figurait
 * et le nombre de fois où il a été désigné comme le pire. Les rangs sont ceux
 * des scores par sexe, sur les 266 comportements du jeu.
 *
 * Les deux comportements appartiennent à la catégorie « Amour & Sexe », qui
 * n'est pas publiée dans les classements (`CATEGORIES_HORS_VITRINE`). Ils sont
 * cités ici, dans un texte d'analyse, parce qu'ils ne relèvent ni de
 * l'explicite ni de l'orientation sexuelle — et l'article le dit au lecteur.
 */

import type { Article } from './types';

export const bossCollegues: Article = {
  slug: 'coucher-avec-son-boss-draguer-ses-collegues',
  titre: 'Coucher avec son boss, draguer ses collègues : les hommes et les femmes ne voient pas le même red flag',
  chapo:
    "Deux comportements de bureau, deux verdicts en miroir. Les hommes placent « coucher avec son boss » au 2e rang des pires red flags ; les femmes, au 33e. Pour « draguer les collègues », c'est l'inverse : 10e chez les femmes, 39e chez les hommes. Ce que cet écart dit — et ce qu'il ne dit pas.",
  description:
    "Coucher avec son boss : 2e red flag chez les hommes, 33e chez les femmes. Draguer ses collègues : l'inverse. Analyse de milliers de votes, et de ce que l'écart révèle.",
  emoji: '💼',
  auteur: 'Équipe Red or Green',
  publie: '2026-09-29',
  misAJour: '2026-09-29',
  chiffresAu: '29 septembre 2026',
  blocs: [
    { type: 'h2', texte: 'Ce que disent les votes' },
    {
      type: 'p',
      texte:
        "Dans [Le pire des deux](/jeu), chaque joueur voit deux comportements et désigne le plus grave. Le joueur a déclaré son sexe avant de commencer : on peut donc compter, pour chaque comportement, combien de fois les hommes et les femmes l'ont désigné comme le pire.",
    },
    {
      type: 'tableau',
      legende:
        "Part des duels où chaque comportement a été désigné comme le pire, et son rang parmi les 266 comportements du jeu, selon le sexe de la personne qui vote.",
      entetes: ['', 'Hommes', 'Femmes'],
      lignes: [
        ['Coucher avec son boss', '75 % des duels · 2e', '59 % des duels · 33e'],
        ['Draguer les collègues', '54 % des duels · 39e', '69 % des duels · 10e'],
      ],
    },
    {
      type: 'p',
      texte:
        "Les deux écarts vont en sens contraire. Sur « coucher avec son boss », les hommes sont les plus sévères ; sur « draguer les collègues », ce sont les femmes. Et ce ne sont pas deux comportements pris au hasard : ils parlent tous les deux du lieu de travail, de désir, et de qui a le pouvoir de dire non.",
    },

    { type: 'h2', texte: 'Un écart réel, à lire avec prudence' },
    {
      type: 'p',
      texte:
        "Ces pourcentages reposent sur **79 duels d'hommes** et **plus de 110 duels de femmes** pour chacun des deux comportements. C'est assez pour qu'un écart de quinze points ne soit pas un accident : pour chacun des deux, la probabilité qu'un tel écart vienne du seul hasard est inférieure à une chance sur vingt.",
    },
    {
      type: 'p',
      texte:
        "C'est un seuil, pas une preuve. Sur les 146 comportements qui ont assez de votes des deux sexes pour être comparés, le hasard seul produirait environ sept écarts de cette taille ; on en compte quinze. Autrement dit, certains écarts de la liste sont du bruit. Ce qui distingue ceux-ci, c'est qu'ils forment une paire : deux situations proches, deux verdicts inversés. Un accident statistique ne dessine pas de miroir.",
    },
    {
      type: 'encadre',
      titre: "Pourquoi ces deux comportements n'apparaissent pas dans le classement",
      paragraphes: [
        "Le jeu les range dans sa catégorie « Amour & Sexe ». Cette catégorie est jouée entre adultes mais n'est pas publiée dans les classements du site, parce qu'elle mêle des propositions explicites. Ces deux-là ne le sont pas : ils relèvent du travail, et c'est à ce titre qu'ils sont analysés ici.",
      ],
    },

    { type: 'h2', texte: '« Coucher avec son boss » : deux lectures' },
    {
      type: 'p',
      texte:
        "La phrase est neutre : elle ne dit ni qui couche, ni avec qui. Tout l'écart tient à ce que chacun met derrière.",
    },
    {
      type: 'p',
      texte:
        "**La lecture que nous défendons** est que la phrase n'évoque pas la même personne selon qui la lit. Pour beaucoup d'hommes, « coucher avec son boss » ravive le vieux soupçon de la promotion canapé : quelqu'un — le plus souvent imaginé comme une femme — qui obtiendrait par le lit ce qu'il n'aurait pas obtenu par le travail. Le red flag vise alors moins un comportement qu'une personne soupçonnée de tricher. Et ce soupçon a un genre : c'est en ce sens que l'écart peut se lire comme une trace de misogynie ordinaire dans le vote.",
    },
    {
      type: 'p',
      texte:
        "**Une autre lecture ne l'exclut pas.** Pour beaucoup de femmes, une relation avec un supérieur pose d'abord la question du rapport de force : peut-on vraiment dire non à la personne qui décide de votre poste ? Celle ou celui qui cède est alors moins un tricheur qu'une personne exposée. Juger moins sévèrement, ce serait refuser de blâmer la personne la plus fragile de la situation.",
    },
    {
      type: 'p',
      texte:
        "Les votes ne disent pas laquelle de ces lectures est la bonne : ils ne disent pas à qui pense la personne qui vote. Ils disent que les hommes et les femmes ne mettent pas la même chose derrière les mêmes mots.",
    },

    { type: 'h2', texte: '« Draguer les collègues » : les femmes savent de quoi elles parlent' },
    {
      type: 'p',
      texte:
        "Le second écart est plus simple à comprendre, parce que les enquêtes l'éclairent directement. En 2014, une étude de l'Ifop pour le Défenseur des droits établissait qu'**une femme active sur cinq** disait avoir fait face à une situation de harcèlement sexuel au travail — une proportion inchangée depuis 1991. Et dans **41 % des cas**, l'auteur était **un collègue**, sans lien hiérarchique avec la victime : plus souvent que le patron ou un supérieur. En 2018, une autre enquête Ifop, qui appliquait la définition juridique du harcèlement, portait la proportion à **près d'une femme sur trois**.",
    },
    {
      type: 'p',
      texte:
        "Quand une femme lit « draguer les collègues », elle ne pense pas à une abstraction. Elle pense à quelque chose qu'une sur cinq a vécu, et qui vient le plus souvent du bureau d'à côté. La sévérité du vote a une histoire.",
    },
    {
      type: 'p',
      texte:
        "Draguer n'est pas harceler, et le jeu ne dit pas « harceler ». Mais la loi française place la frontière à un endroit précis : des propos ou des comportements à connotation sexuelle **répétés**, qui humilient ou intimident. C'est exactement là que se loge le désaccord. Ce qui reste de la drague pour l'un peut être, pour l'autre, la troisième remarque de la semaine.",
    },
    {
      type: 'p',
      texte:
        "La même enquête mesurait d'ailleurs ce décalage de perception. **59 % des hommes** estimaient qu'un environnement de travail fait de blagues à caractère sexuel ne relève pas du harcèlement, contre 48 % des femmes. Pour l'affichage d'images à caractère sexuel, l'écart était de 41 % contre 26 %. Les votes du site racontent la même chose, douze ans plus tard, avec d'autres mots.",
    },

    { type: 'h2', texte: 'Ce que ça dit, et ce que ça ne dit pas' },
    {
      type: 'liste',
      items: [
        "**Ça dit** que, sur ce qui touche au désir et au pouvoir au travail, les hommes et les femmes qui jouent ne tracent pas la ligne au même endroit.",
        "**Ça ne dit pas** que les hommes approuvent la drague insistante, ni que les femmes approuvent les relations avec un supérieur : les deux sexes jugent les deux comportements plutôt graves. L'écart porte sur le degré, pas sur le principe.",
        "**Ça ne dit pas** ce que pensent les Français. Les joueurs forment un échantillon volontaire, plutôt jeune — près de huit votes sur dix viennent de personnes de moins de 27 ans : ces chiffres décrivent la communauté du site.",
        "**Ça dit**, enfin, qu'une même phrase peut désigner deux situations différentes selon qui la lit. C'est peut-être la leçon la plus utile du jeu : avant de se disputer sur un red flag, vérifier qu'on parle de la même chose.",
      ],
    },

    { type: 'h2', texte: "Si ce n'est plus un jeu" },
    {
      type: 'p',
      texte:
        "Le harcèlement sexuel au travail est un délit. Le Défenseur des droits peut être saisi gratuitement ; l'inspection du travail et la médecine du travail sont aussi des recours. En cas de violences, le 3919 répond 24 h sur 24. Les [outils d'auto-évaluation](/ressources) du site aident à mettre des mots sur une situation, sans remplacer un professionnel.",
    },
  ],
  suite: [
    { href: '/red-flags', label: 'Les pires red flags, d’après les votes' },
    { href: '/observatoire', label: "L'Observatoire : là où hommes et femmes divergent" },
    { href: '/articles/red-flags-hommes-femmes-presque-d-accord', label: 'Red flags : hommes et femmes sont (presque) d’accord' },
    { href: '/methodologie', label: 'Comment le classement est calculé' },
  ],
  sources: [
    {
      titre: 'Enquête sur le harcèlement sexuel au travail — note de synthèse',
      editeur: 'Ifop pour le Défenseur des droits',
      date: 'janvier 2014',
      url: 'https://www.defenseurdesdroits.fr/sites/default/files/2023-10/ddd_etu_20140301_harcelement_sexuel_synthese_ifop.pdf',
    },
    {
      titre: 'Les Françaises face au harcèlement sexuel au travail',
      editeur: 'Ifop pour VieHealthy.com',
      date: 'janvier 2018',
      url: 'https://www.ifopgroup.com/article/les-francaises-face-au-harcelement-sexuel-au-travail-entre-meconnaissance-et-resignation/',
    },
  ],
};

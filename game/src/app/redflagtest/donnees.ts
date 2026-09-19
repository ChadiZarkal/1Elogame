/**
 * @module redflagtest/donnees
 * Le contenu du faux quiz — cinq questions écrites à la main, rien d'autre.
 *
 * POURQUOI DES DONNÉES EN DUR
 *   Cette page ne sert qu'à juger le front-end de la partie questions. Il n'y a
 *   ni base, ni API, ni barème réel : tout ce qui s'affiche vient d'ici. Le jour
 *   où le vrai moteur arrive, ce fichier disparaît et seul le rendu reste.
 *
 * CE QUE LE CONTENU DOIT ÉPROUVER
 *   Le CSS de référence habille les réponses par leur position — fond
 *   `button-1.svg` sur les impaires, `button-2.svg` sur les paires, marge
 *   supplémentaire sur la troisième — et le bloc des highlights change de fond
 *   sur ses trois premières lignes. Un jeu de questions à quatre réponses
 *   identiques ne montrerait rien de tout ça. D'où des longueurs très inégales,
 *   d'un mot à deux lignes, et un nombre de réponses qui descend de cinq à une.
 */

export interface Reponse {
  id: string;
  texte: string;
  /**
   * De 0 (irréprochable) à 1 (rédhibitoire). Sert au score du récap et au
   * déplacement de l'aiguille — c'est un faux barème, pas une mesure.
   */
  poids: number;
  /** La pique affichée dans les highlights du récap si la réponse est choisie. */
  pique?: string;
  /** Part de joueurs ayant choisi cette réponse, en pourcentage. Inventée. */
  part?: number;
}

export interface Question {
  id: string;
  texte: string;
  /** Deuxième ligne, plus petite et grise. Toutes les questions n'en ont pas. */
  precision?: string;
  reponses: Reponse[];
}

/** Cinq questions, avec 4, 2, 5, 3 puis 1 réponse. */
export const QUESTIONS: Question[] = [
  {
    id: 'q1',
    texte: 'Ton ex t’écrit à 2 h du matin. Tu fais quoi ?',
    reponses: [
      { id: 'q1a', texte: 'Rien.', poids: 0.05, part: 41 },
      {
        id: 'q1b',
        texte: 'Je lis, je ne réponds pas, et je relis quatre fois',
        poids: 0.35,
        part: 33,
      },
      {
        id: 'q1c',
        texte: 'Je réponds tout de suite, puis je passe la fin de la nuit à regretter chaque mot que j’ai envoyé',
        poids: 0.75,
        pique: 'Tu as tapé, effacé, retapé. On a tous vu les trois petits points.',
        part: 19,
      },
      {
        id: 'q1d',
        texte: 'J’appelle.',
        poids: 0.95,
        pique: 'Appeler un ex à 2 h du matin n’a jamais amélioré une situation. Jamais.',
        part: 7,
      },
    ],
  },
  {
    id: 'q2',
    texte: 'On te demande pardon. Tu réponds « c’est rien » alors que ce n’est pas rien ?',
    precision: 'Sois honnête, personne ne lit tes réponses.',
    reponses: [
      { id: 'q2a', texte: 'Jamais', poids: 0.1, part: 22 },
      {
        id: 'q2b',
        texte: 'Tout le temps, et je le ressors trois semaines plus tard',
        poids: 0.8,
        pique: 'Le pardon accepté en apparence est la plus lente des vengeances.',
        part: 78,
      },
    ],
  },
  {
    id: 'q3',
    texte: 'Ton/ta partenaire sort sans toi. Ta première pensée ?',
    reponses: [
      { id: 'q3a', texte: 'Tant mieux.', poids: 0.05, part: 28 },
      { id: 'q3b', texte: 'Avec qui ?', poids: 0.45, part: 31 },
      {
        id: 'q3c',
        texte: 'Je demande une photo du groupe, l’air de rien, juste pour situer l’ambiance',
        poids: 0.7,
        pique: '« Juste pour situer l’ambiance » est la phrase la plus chargée de ce test.',
        part: 15,
      },
      {
        id: 'q3d',
        texte: 'Je regarde qui est en ligne pendant ce temps-là, et je note mentalement l’heure à laquelle chacun se déconnecte',
        poids: 0.9,
        pique: 'Tu as transformé une soirée en enquête. Tu es douée ou doué, mais ce n’est pas rassurant.',
        part: 9,
      },
      { id: 'q3e', texte: 'Aucune.', poids: 0.15, part: 17 },
    ],
  },
  {
    id: 'q4',
    texte: 'La dernière fois que tu as dit « je vais changer », c’était il y a combien de temps ?',
    reponses: [
      {
        id: 'q4a',
        texte: 'Je ne l’ai jamais dit, je préfère ne rien promettre',
        poids: 0.25,
        part: 24,
      },
      { id: 'q4b', texte: 'Il y a longtemps, et j’ai changé', poids: 0.1, part: 12 },
      {
        id: 'q4c',
        texte: 'La semaine dernière. Et la semaine d’avant. Et celle d’avant.',
        poids: 0.85,
        pique: 'Trois promesses en trois semaines : à ce rythme-là ce n’est plus une intention, c’est un abonnement.',
        part: 64,
      },
    ],
  },
  {
    id: 'q5',
    texte: 'Dernière question : tu penses que ce test va te donner raison ?',
    precision: 'Il n’y a qu’une seule réponse. C’est déjà une information.',
    reponses: [
      {
        id: 'q5a',
        texte: 'Oui',
        poids: 0.6,
        pique: 'Tout le monde clique sur « oui ». C’est bien ça le problème.',
        part: 100,
      },
    ],
  },
];

/** Verdicts par tranche de score, du plus clément au plus sévère. */
export const VERDICTS = [
  {
    max: 24,
    emoji: '🟢',
    titre: 'SUSPECT DE NORMALITÉ',
    soustitre: 'Soit tu vas bien, soit tu as menti avec application.',
  },
  {
    max: 49,
    emoji: '🟡',
    titre: 'QUELQUES TRAVAUX',
    soustitre: 'Rien d’irréparable. Deux ou trois choses à regarder en face.',
  },
  {
    max: 74,
    emoji: '🟠',
    titre: 'ÇA SE VOIT DE LOIN',
    soustitre: 'Tes proches le savent déjà. Toi, tu viens de l’apprendre.',
  },
  {
    max: 100,
    emoji: '🔴',
    titre: 'LE DRAPEAU EST PLANTÉ',
    soustitre: 'On ne va pas te mentir, on a relu le résultat deux fois.',
  },
] as const;

export function verdictPour(score: number) {
  return VERDICTS.find((v) => score <= v.max) ?? VERDICTS[VERDICTS.length - 1];
}

/**
 * Les axes du radar. Faux eux aussi : chacun pioche dans deux questions pour
 * que la forme bouge d'une partie à l'autre au lieu d'être un décor figé.
 */
export const AXES: Array<{ id: string; label: string; source: [string, string] }> = [
  { id: 'jalousie', label: 'Jalousie', source: ['q3', 'q1'] },
  { id: 'rancune', label: 'Rancune', source: ['q2', 'q4'] },
  { id: 'impulsivite', label: 'Impulsivité', source: ['q1', 'q3'] },
  { id: 'lucidite', label: 'Lucidité', source: ['q5', 'q2'] },
  { id: 'constance', label: 'Constance', source: ['q4', 'q5'] },
];

/** Nombre de participants annoncé sous les highlights. Inventé. */
export const PARTICIPANTS_FICTIFS = 14_382;

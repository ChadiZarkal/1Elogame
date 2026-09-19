import { describe, expect, it } from 'vitest';
import {
  avancerAiguille,
  calculerAxes,
  calculerScore,
  classement,
  COHORTE_MINCE,
  indicePour,
  maximumAtteignable,
  part,
  verdictPour,
  comparaison,
  pointNoir,
  COMPARAISON_MIN,
  POINT_NOIR_ECART,
  POINT_NOIR_MINIMUM,
  type CohorteBrute,
  type NomCohorte,
  type ChoixResolu,
  type MaximumQuestion,
} from '@/lib/rft/score';
import type { Verdict } from '@/lib/rft/types';

function choix(points: number, tagIds: string[] = [], id = 'q'): ChoixResolu {
  return { questionId: id, answerId: `${id}-a`, points, tagIds };
}

describe('calculerScore', () => {
  it('additionne les points, sans plus', () => {
    expect(calculerScore([choix(5), choix(12), choix(0)])).toBe(17);
  });

  // Le plafond a été explicitement écarté : « 137 % red flag » est la chute
  // recherchée, pas un débordement à corriger.
  it('laisse le score dépasser cent', () => {
    expect(calculerScore([choix(50), choix(50), choix(37)])).toBe(137);
  });

  // Les points négatifs servent à racheter une réponse, pas à creuser : un
  // écran qui annonce « tu es −12 % red flag » ne veut rien dire.
  it('ne descend pas sous zéro', () => {
    expect(calculerScore([choix(3), choix(-20)])).toBe(0);
  });

  it('rend zéro sur une partie vide', () => {
    expect(calculerScore([])).toBe(0);
  });
});

describe('maximumAtteignable', () => {
  it('somme la pire réponse de chaque question', () => {
    const maxima: MaximumQuestion[] = [
      { questionId: 'a', maxPoints: 10, tagIds: [] },
      { questionId: 'b', maxPoints: 4, tagIds: [] },
    ];
    expect(maximumAtteignable(maxima)).toBe(14);
  });

  // Une question dont toutes les réponses sont négatives ne peut rien ajouter.
  it('ignore une question qui ne peut rien rapporter', () => {
    expect(maximumAtteignable([{ questionId: 'a', maxPoints: -3, tagIds: [] }])).toBe(0);
  });
});

describe('verdictPour', () => {
  const verdicts: Verdict[] = [
    { id: '1', minScore: 0, emoji: null, titre: 'BAS', soustitre: null },
    { id: '2', minScore: 50, emoji: null, titre: 'MOYEN', soustitre: null },
    { id: '3', minScore: 100, emoji: null, titre: 'HAUT', soustitre: null },
  ];

  it('prend le plus haut palier atteint', () => {
    expect(verdictPour(0, verdicts)?.titre).toBe('BAS');
    expect(verdictPour(49, verdicts)?.titre).toBe('BAS');
    expect(verdictPour(50, verdicts)?.titre).toBe('MOYEN');
  });

  // Les paliers sont ouverts vers le haut : c'est ce qui permet au score de
  // dépasser cent sans tomber dans un trou.
  it('attrape les scores hors barème avec le dernier palier', () => {
    expect(verdictPour(240, verdicts)?.titre).toBe('HAUT');
  });

  it('ne rend rien quand aucun palier n’est configuré', () => {
    expect(verdictPour(30, [])).toBeNull();
  });

  it('se passe d’un tri préalable', () => {
    const melange = [verdicts[2], verdicts[0], verdicts[1]];
    expect(verdictPour(60, melange)?.titre).toBe('MOYEN');
  });
});

describe('calculerAxes', () => {
  const tags = [
    { id: 'controle', label: 'Contrôle', color: '#f00' },
    { id: 'confiance', label: 'Confiance', color: '#0f0' },
  ];

  it('rend chaque axe en part de ce qu’il était possible d’y prendre', () => {
    const maxima: MaximumQuestion[] = [
      { questionId: 'q1', maxPoints: 10, tagIds: ['controle'] },
      { questionId: 'q2', maxPoints: 10, tagIds: ['confiance'] },
    ];
    const axes = calculerAxes(
      [choix(5, ['controle'], 'q1'), choix(10, ['confiance'], 'q2')],
      maxima,
      tags,
    );

    expect(axes.find((a) => a.tagId === 'controle')?.valeur).toBe(50);
    expect(axes.find((a) => a.tagId === 'confiance')?.valeur).toBe(100);
  });

  // Une question portant deux tags compte EN ENTIER dans chacun : ses points ne
  // sont pas partagés. Le score global, lui, ne les compte qu'une fois.
  it('verse les points entiers dans chacun des tags de la question', () => {
    const maxima: MaximumQuestion[] = [
      { questionId: 'q1', maxPoints: 8, tagIds: ['controle', 'confiance'] },
    ];
    const axes = calculerAxes([choix(8, ['controle', 'confiance'], 'q1')], maxima, tags);

    expect(axes.map((a) => a.points)).toEqual([8, 8]);
    expect(calculerScore([choix(8, ['controle', 'confiance'], 'q1')])).toBe(8);
  });

  // Sans cette normalisation, un axe de vingt questions écraserait un axe de
  // trois et la forme du radar parlerait du nombre de questions.
  it('met sur un pied d’égalité deux axes de tailles très différentes', () => {
    const maxima: MaximumQuestion[] = [
      { questionId: 'gros1', maxPoints: 50, tagIds: ['controle'] },
      { questionId: 'gros2', maxPoints: 50, tagIds: ['controle'] },
      { questionId: 'petit', maxPoints: 4, tagIds: ['confiance'] },
    ];
    const axes = calculerAxes(
      [
        choix(25, ['controle'], 'gros1'),
        choix(25, ['controle'], 'gros2'),
        choix(2, ['confiance'], 'petit'),
      ],
      maxima,
      tags,
    );

    expect(axes.find((a) => a.tagId === 'controle')?.valeur).toBe(50);
    expect(axes.find((a) => a.tagId === 'confiance')?.valeur).toBe(50);
  });

  it('écarte un axe dont il n’y a rien à prendre', () => {
    const axes = calculerAxes([], [{ questionId: 'q', maxPoints: 0, tagIds: ['controle'] }], tags);
    expect(axes).toEqual([]);
  });

  it('borne un axe à cent même si les points débordent', () => {
    const maxima: MaximumQuestion[] = [{ questionId: 'q1', maxPoints: 5, tagIds: ['controle'] }];
    // Ne peut pas arriver par le jeu, mais une saisie admin incohérente le peut.
    const axes = calculerAxes([choix(50, ['controle'], 'q1')], maxima, tags);
    expect(axes[0].valeur).toBe(100);
  });
});

describe('classement', () => {
  // La partie qui vient d'être jouée est déjà comptée dans l'effectif : le rang
  // du joueur est donc exactement `plusHauts + 1`.
  it('traduit un rang en pourcentage', () => {
    expect(classement(100, 7)?.top).toBe(8);
  });

  it('donne le sommet au meilleur d’une large cohorte', () => {
    expect(classement(200, 0)?.top).toBe(1);
  });

  // Arrondir au plus proche donnerait « top 33 % » : annoncer un rang meilleur
  // que le rang réel est le seul mensonge que cet écran ne peut pas se
  // permettre.
  it('arrondit vers le haut, jamais au plus proche', () => {
    expect(classement(3, 0)?.top).toBe(34);
  });

  it('place le dernier à cent pour cent', () => {
    expect(classement(50, 49)?.top).toBe(100);
  });

  it('déclare une cohorte trop mince plutôt que de la cacher', () => {
    const mince = classement(4, 1);
    expect(mince?.top).toBe(50);
    expect(mince?.avertissement).toBe('seulement 4 participants');

    expect(classement(1, 0)?.avertissement).toBe('seulement 1 participant');
    expect(classement(COHORTE_MINCE, 5)?.avertissement).toBeNull();
  });

  it('ne rend rien sur une cohorte vide', () => {
    expect(classement(0, 0)).toBeNull();
  });
});

describe('indicePour', () => {
  it('distingue la plus chargée, la moins chargée et le reste', () => {
    expect(indicePour(10, [0, 5, 10])).toBe(2);
    expect(indicePour(0, [0, 5, 10])).toBe(0);
    expect(indicePour(5, [0, 5, 10])).toBe(1);
  });

  // Une question à réponse unique, ou dont les réponses se valent : l'aiguille
  // ne doit pas bouger, et c'est la vérité.
  it('reste neutre quand toutes les réponses se valent', () => {
    expect(indicePour(7, [7])).toBe(1);
    expect(indicePour(3, [3, 3, 3])).toBe(1);
  });

  it('gère les points négatifs comme le bas de l’échelle', () => {
    expect(indicePour(-5, [-5, 0, 2])).toBe(0);
    expect(indicePour(2, [-5, 0, 2])).toBe(2);
  });
});

describe('avancerAiguille', () => {
  // Avec un pas fixe, l'aiguille se collait en butée au bout de cinq réponses
  // et restait morte pour les trente suivantes.
  it('traverse tout le cadran sur une partie entièrement chargée', () => {
    let position = 50;
    for (let i = 0; i < 5; i++) position = avancerAiguille(position, 2, 5);
    expect(position).toBe(100);

    let longue = 50;
    for (let i = 0; i < 37; i++) longue = avancerAiguille(longue, 2, 37);
    expect(Math.round(longue)).toBe(100);
  });

  it('recule sur un indice bas et ne bouge pas sur un indice neutre', () => {
    expect(avancerAiguille(50, 0, 5)).toBe(40);
    expect(avancerAiguille(50, 1, 5)).toBe(50);
  });

  it('ne sort jamais du cadran', () => {
    expect(avancerAiguille(2, 0, 5)).toBe(0);
    expect(avancerAiguille(98, 2, 5)).toBe(100);
  });
});

describe('part', () => {
  it('arrondit et se tait sur un dénominateur nul', () => {
    expect(part(1, 8)).toBe(13);
    expect(part(0, 0)).toBe(0);
  });
});

describe('pointNoir', () => {
  const axe = (tagId: string, valeur: number) => ({
    tagId, label: tagId, color: null, valeur, points: valeur, maximum: 100,
  });

  it('désigne l’axe qui domine nettement', () => {
    const axes = [axe('loyaute', 78), axe('emprise', 40), axe('soi', 22)];
    expect(pointNoir(axes)?.tagId).toBe('loyaute');
  });

  // Un radar presque rond n'a pas de point noir. Le désigner par un point
  // d'écart, c'est nommer le hasard des arrondis.
  it('se tait sur un profil uniforme', () => {
    const axes = [axe('a', 52), axe('b', 51), axe('c', 50), axe('d', 49)];
    expect(pointNoir(axes)).toBeNull();
  });

  // Le plus haut d'un profil sain n'est pas un point noir, il est le moins bas.
  it('se tait quand même le sommet est bas', () => {
    expect(pointNoir([axe('a', 30), axe('b', 4)])).toBeNull();
    expect(POINT_NOIR_MINIMUM).toBe(40);
  });

  it('exige l’écart en plus du niveau', () => {
    expect(pointNoir([axe('a', 60), axe('b', 60 - POINT_NOIR_ECART + 1)])).toBeNull();
    expect(pointNoir([axe('a', 60), axe('b', 60 - POINT_NOIR_ECART)])?.tagId).toBe('a');
  });

  it('ne désigne rien avec moins de deux axes', () => {
    expect(pointNoir([axe('seul', 95)])).toBeNull();
    expect(pointNoir([])).toBeNull();
  });
});

describe('comparaison', () => {
  const co = (cohorte: NomCohorte, effectif: number, moyenne: number | null): CohorteBrute =>
    ({ cohorte, effectif, plusHauts: 0, moyenne });

  it('préfère la cohorte la plus précise', () => {
    const c = comparaison(50, [
      co('tous', 900, 30),
      co('sexe', 400, 33),
      co('age', 200, 35),
      co('sexe_age', 120, 38),
    ]);
    expect(c?.cohorte).toBe('sexe_age');
    expect(c?.ecart).toBe(12);
    expect(c?.moyenne).toBe(38);
  });

  // On descend d'un cran plutôt que de renoncer à comparer.
  it('recule vers une cohorte plus large quand la précise est trop mince', () => {
    const c = comparaison(50, [
      co('tous', 900, 30),
      co('sexe', 400, 33),
      co('sexe_age', 3, 38),
    ]);
    expect(c?.cohorte).toBe('sexe');
  });

  it('annonce aussi un score sous la moyenne', () => {
    expect(comparaison(20, [co('tous', 50, 35)])?.ecart).toBe(-15);
  });

  // « Un point au-dessus de la moyenne » n'est pas une information, c'est du
  // bruit d'arrondi présenté comme un verdict.
  it('tait un écart négligeable', () => {
    expect(comparaison(36, [co('tous', 50, 35)])?.ecart).toBe(0);
    expect(comparaison(34, [co('tous', 50, 35)])?.ecart).toBe(0);
  });

  it('ne compare pas sans population', () => {
    expect(comparaison(50, [])).toBeNull();
    expect(comparaison(50, [co('tous', 0, null)])).toBeNull();
    expect(comparaison(50, [co('tous', COMPARAISON_MIN - 1, 30)])).toBeNull();
  });

  it('transporte l’effectif, pour que l’écran puisse le citer', () => {
    expect(comparaison(50, [co('tous', 431, 30)])?.effectif).toBe(431);
  });
});

/**
 * @module classement/ClassementEditorial
 * Lecture du classement, servie sous le tableau.
 *
 * La page livrait bien ses lignes dans le HTML, mais aucune phrase permettant
 * de les interpréter : un score Elo ne veut rien dire sans son échelle. Les
 * chiffres cités sont ceux du rendu en cours, pas des valeurs écrites en dur.
 */

import { PageNotes } from '@/components/content/PageNotes';
import type { PageNotes as PageNotesData } from '@/content/page-notes';
import type { RankEntry } from '@/lib/leaderboard';

interface Props {
  totalElements: number;
  /** Somme des participations des lignes affichées. */
  totalVotes: number;
  top: RankEntry[];
}

function buildNotes({ totalElements, totalVotes, top }: Props): PageNotesData {
  const corpus =
    totalElements > 0
      ? `Le corpus compte ${totalElements} comportements en lice.`
      : 'Le corpus est alimenté en continu.';

  const volume =
    totalVotes > 0
      ? `Les comportements affichés en tête de ce classement totalisent à eux seuls ${totalVotes.toLocaleString('fr-FR')} participations à un duel.`
      : '';

  const leader = top[0]
    ? `En tête aujourd'hui : « ${top[0].texte} », à ${top[0].elo_global} points pour ${top[0].nb_participations} participations.`
    : '';

  return {
    title: 'Comment lire ce classement',
    lede:
      "Ce tableau n'est pas une liste rédigée par une rédaction : il est produit par les arbitrages des joueurs, comportement contre comportement. Voici ce que le score signifie, et ce qu'il ne signifie pas.",
    blocks: [
      {
        heading: "D'où viennent ces chiffres",
        body: [
          [
            'Chaque ligne provient de duels : deux comportements sont proposés à un joueur, qui désigne le pire.',
            corpus,
            volume,
          ]
            .filter(Boolean)
            .join(' '),
          [
            "Le score n'est pas un décompte de victoires. Il pondère chaque duel par la difficulté de l'adversaire : l'emporter sur un comportement déjà haut placé rapporte beaucoup, l'emporter sur un comportement anodin rapporte peu.",
            leader,
          ]
            .filter(Boolean)
            .join(' '),
        ],
      },
      {
        heading: "L'échelle",
        body: [
          "Tout comportement entre au classement à 1000 points. Au-dessus, il est jugé plus problématique que la moyenne du corpus ; en dessous, moins. Un écart de quelques dizaines de points entre deux lignes voisines n'est pas significatif — c'est le rang général qui compte, pas la place exacte.",
          "La colonne des participations indique combien de fois le comportement a été soumis à un duel. Un score reposant sur peu de participations est provisoire : il bougera encore.",
        ],
      },
      {
        heading: 'Pourquoi filtrer par groupe',
        body: [
          "Un score distinct est tenu pour chaque groupe déclaré — par sexe, et par tranche d'âge. Basculer d'un filtre à l'autre fait apparaître des écarts parfois considérables sur un même comportement : c'est la partie la plus instructive du classement, et elle est détaillée sur la page Observatoire.",
          "Ces sous-classements reposent mécaniquement sur moins de votes que le classement général. Plus le groupe est étroit, plus l'écart doit être marqué pour signifier quelque chose.",
        ],
      },
      {
        heading: "Ce que ce classement n'est pas",
        bullets: [
          "Une enquête représentative : l'échantillon est auto-sélectionné, il décrit les joueurs de ce site.",
          "Une échelle de gravité : la position mesure un jugement partagé, pas un préjudice mesuré.",
          "Un diagnostic : aucune ligne ne dit quoi que ce soit d'une personne ou d'une relation réelle.",
        ],
      },
    ],
    faq: [
      {
        question: 'À quelle fréquence le classement est-il mis à jour ?',
        answer:
          'Il est régénéré au plus toutes les cinq minutes à partir des votes reçus. Les positions bougent donc en continu.',
      },
      {
        question: 'Pourquoi un comportement peut-il perdre des places sans perdre de votes ?',
        answer:
          "Parce que le classement est relatif. Si les comportements voisins gagnent des points, une ligne recule sans que son propre score baisse.",
      },
      {
        question: 'Que veut dire un score en dessous de 1000 ?',
        answer:
          "Que le comportement perd plus souvent qu'il ne gagne ses duels : les joueurs le jugent moins problématique que la moyenne du corpus. Cela ne veut pas dire qu'il est anodin.",
      },
      {
        question: 'Puis-je consulter le classement pour un groupe précis ?',
        answer:
          "Oui. Les filtres au-dessus du tableau permettent de basculer entre le classement global, celui des hommes, celui des femmes, et chacune des quatre tranches d'âge.",
      },
    ],
    related: [
      { href: '/methodologie', label: 'Méthodologie détaillée' },
      { href: '/observatoire', label: "L'Observatoire des désaccords" },
      { href: '/guide', label: 'Guide des flags' },
      { href: '/jeu', label: 'Voter à ton tour' },
    ],
  };
}

export function ClassementEditorial(props: Props) {
  return <PageNotes notes={buildNotes(props)} />;
}

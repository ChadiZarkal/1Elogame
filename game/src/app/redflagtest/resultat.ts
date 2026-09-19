/**
 * @module redflagtest/resultat
 * Le faux calcul du récap.
 *
 * Il n'y a pas de serveur derrière cette page : tout ce que le récap affiche est
 * fabriqué ici, dans le navigateur, à partir des réponses cliquées.
 *
 * POURQUOI CALCULER PLUTÔT QUE FIGER
 *   Un récap écrit en dur afficherait le même « 62 % » à chaque partie, et on ne
 *   verrait jamais ce que devient la mise en page avec un 4 % ou un 97 % : ni la
 *   pastille rouge sur un nombre à un chiffre, ni le radar écrasé, ni les
 *   drapeaux verts. Les chiffres bougent donc avec les réponses — ce qui ne les
 *   rend pas vrais pour autant. Aucun d'eux ne mesure quoi que ce soit.
 */

import { AXES, PARTICIPANTS_FICTIFS, QUESTIONS, verdictPour, type Reponse } from './donnees';

export type Couleur = 'red' | 'orange' | 'green';

export interface Rang {
  /** « Top X % » — plus c'est bas, plus le joueur est extrême. */
  top: number;
  couleur: Couleur;
  legende: string;
}

export interface Highlight {
  question: string;
  reponse: string;
  pique: string;
  part: number;
  couleur: Couleur;
}

export interface Resultat {
  score: number;
  verdict: ReturnType<typeof verdictPour>;
  rangs: { genre: Rang; age: Rang; region: Rang };
  axes: Array<{ id: string; label: string; valeur: number }>;
  highlights: Highlight[];
  participants: number;
}

/** Une couleur de drapeau à partir d'un score : au-delà des deux tiers, c'est rouge. */
function couleurPour(valeur: number): Couleur {
  if (valeur >= 67) return 'red';
  if (valeur >= 34) return 'orange';
  return 'green';
}

/** Borne un nombre dans [min, max]. */
function borne(valeur: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, valeur));
}

/**
 * Bruit déterministe tiré d'une chaîne, dans [-1, 1].
 *
 * Déterministe pour que le radar ne frétille pas à chaque rendu de React : la
 * même partie doit toujours donner la même forme.
 */
function bruit(graine: string): number {
  let h = 0;
  for (let i = 0; i < graine.length; i += 1) h = (h * 31 + graine.charCodeAt(i)) | 0;
  return ((Math.abs(h) % 1000) / 1000) * 2 - 1;
}

/** Le poids retenu pour une question, ou une valeur neutre si elle n'a pas été jouée. */
function poidsDe(choix: Map<string, Reponse>, questionId: string): number {
  return choix.get(questionId)?.poids ?? 0.4;
}

export function calculer(choix: Map<string, Reponse>): Resultat {
  const poids = [...choix.values()].map((r) => r.poids);
  const moyenne = poids.length > 0 ? poids.reduce((a, b) => a + b, 0) / poids.length : 0;
  const score = Math.round(moyenne * 100);

  return {
    score,
    verdict: verdictPour(score),
    rangs: {
      // Un score élevé place le joueur haut dans le classement, donc dans un
      // « top » étroit. Les trois cohortes s'écartent légèrement pour que les
      // trois drapeaux ne soient pas systématiquement de la même couleur.
      genre: rang(score, 0, 'des hommes'),
      age: rang(score, -9, 'des 25-34 ans'),
      region: rang(score, 7, 'de ta région'),
    },
    axes: AXES.map((axe) => {
      const brut = (poidsDe(choix, axe.source[0]) * 2 + poidsDe(choix, axe.source[1])) / 3;
      return {
        id: axe.id,
        label: axe.label,
        valeur: Math.round(borne(brut * 100 + bruit(axe.id) * 12, 4, 100)),
      };
    }),
    highlights: [...choix.values()]
      .filter((r): r is Reponse & { pique: string } => Boolean(r.pique))
      // La plus rare en premier : c'est celle qui distingue vraiment.
      .sort((a, b) => (a.part ?? 100) - (b.part ?? 100))
      .slice(0, 3)
      .map((reponse) => ({
        question: QUESTIONS.find((q) => q.reponses.includes(reponse))?.texte ?? '',
        reponse: reponse.texte,
        pique: reponse.pique,
        part: reponse.part ?? 0,
        couleur: couleurPour(reponse.poids * 100),
      })),
    participants: PARTICIPANTS_FICTIFS,
  };
}

function rang(score: number, ecart: number, legende: string): Rang {
  const valeur = borne(score + ecart, 0, 100);
  return {
    // 100 % de red flag ⇒ top 1 %. Un score nul ⇒ top 96 %.
    top: borne(Math.round(100 - valeur * 0.95), 1, 99),
    couleur: couleurPour(valeur),
    legende,
  };
}

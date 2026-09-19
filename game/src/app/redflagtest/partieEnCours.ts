/**
 * @module redflagtest/partieEnCours
 * Garder une partie entamée, pour ne pas la perdre à la moindre interruption.
 *
 * POURQUOI
 *   Le test fait trente-sept questions. Quelqu'un qui reçoit un appel à la
 *   vingtième recommence de zéro — ou plutôt, ne recommence pas. C'est
 *   exactement le moment où l'on perd la partie la plus engagée, celle de
 *   quelqu'un qui avait déjà répondu vingt fois.
 *
 * CE QUI EST GARDÉ, ET CE QUI NE L'EST PAS
 *   Les réponses choisies, et rien d'autre. Ni le score — le navigateur ne le
 *   connaît pas et ne doit pas le connaître —, ni la position de l'aiguille,
 *   qui se recalcule depuis les réponses. Moins il y a d'état dupliqué, moins
 *   il y a d'état à contredire.
 *
 * LA REPRISE EST TOUJOURS VÉRIFIÉE
 *   Les questions changent : vous en modifiez, vous en supprimez. Une sauvegarde
 *   qui cite une réponse disparue ne doit pas faire reprendre une partie dans un
 *   état impossible. Tout ce qui ne correspond plus au questionnaire actuel est
 *   écarté avant la reprise, silencieusement.
 */

import type { QuestionPublique } from '@/lib/rft/types';

const CLE = 'rft_partie_en_cours';

/**
 * Au-delà, on ne propose plus de reprendre.
 *
 * Une partie d'il y a trois semaines n'est plus la partie de personne : les
 * réponses ont été données dans un état d'esprit qu'on ne retrouve pas, et le
 * questionnaire a pu changer entre-temps. Sept jours couvrent le cas réel —
 * l'interruption, le retour le lendemain.
 */
export const DUREE_DE_VIE_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * En dessous de ce nombre de réponses, on ne propose rien.
 *
 * Reprendre une partie de deux questions coûte un écran de plus pour économiser
 * quatre secondes : le joueur perd au change.
 */
export const REPRISE_MINIMUM = 3;

export interface Choix {
  questionId: string;
  answerId: string;
}

export interface PartieEnCours {
  choix: Choix[];
  /** Horodatage du premier clic, pour que la durée enregistrée reste juste. */
  debut: number;
  /** Horodatage du dernier clic, pour la péremption. */
  maj: number;
}

/* --------------------------------------------------------------------------
 * Le stockage peut échouer — navigation privée, données bloquées, quota plein.
 * Aucune de ces situations ne doit interrompre une partie : la reprise est un
 * confort, jamais une dépendance.
 * ------------------------------------------------------------------------ */

export function enregistrer(partie: PartieEnCours): void {
  try {
    window.localStorage.setItem(CLE, JSON.stringify(partie));
  } catch {
    /* Un stockage indisponible ne doit jamais arrêter une partie. */
  }
}

export function oublier(): void {
  try {
    window.localStorage.removeItem(CLE);
  } catch {
    /* idem */
  }
}

function lireBrut(): PartieEnCours | null {
  try {
    const brut = window.localStorage.getItem(CLE);
    if (!brut) return null;
    const partie = JSON.parse(brut) as PartieEnCours;
    // Un contenu écrit par une version antérieure, ou trafiqué à la main.
    if (!Array.isArray(partie.choix) || typeof partie.maj !== 'number') return null;
    return partie;
  } catch {
    return null;
  }
}

/**
 * La partie reprise, nettoyée de tout ce qui ne correspond plus au
 * questionnaire — ou `null` s'il n'y a rien à reprendre.
 *
 * `maintenant` est un paramètre plutôt qu'un appel à `Date.now()` pour que la
 * péremption soit vérifiable sans manipuler l'horloge.
 */
export function reprendre(
  questions: QuestionPublique[],
  maintenant: number = Date.now(),
): PartieEnCours | null {
  const partie = lireBrut();
  if (!partie) return null;

  if (maintenant - partie.maj > DUREE_DE_VIE_MS) {
    oublier();
    return null;
  }

  const valides = new Map(
    questions.map((q) => [q.id, new Set(q.reponses.map((r) => r.id))]),
  );
  const choix = partie.choix.filter((c) => valides.get(c.questionId)?.has(c.answerId));

  if (choix.length < REPRISE_MINIMUM) {
    // Trop peu pour valoir un écran : on efface plutôt que de garder une
    // sauvegarde qui ne servira jamais.
    oublier();
    return null;
  }

  return { ...partie, choix };
}

/**
 * L'index de la première question sans réponse.
 *
 * Et non « le nombre de réponses » : une question supprimée depuis la
 * sauvegarde décale tout, et reprendre au rang du nombre de réponses ferait
 * sauter une question au joueur sans que personne ne s'en aperçoive.
 */
export function reprendreA(questions: QuestionPublique[], choix: Choix[]): number {
  const repondues = new Set(choix.map((c) => c.questionId));
  const index = questions.findIndex((q) => !repondues.has(q.id));
  return index === -1 ? questions.length : index;
}

/**
 * @module lib/prerenderTimeout
 * Borne une requête faite pendant la génération statique.
 *
 * Quatre pages — `/classement`, `/observatoire`, `/methodologie`,
 * `/dixmais/leaderboard` — interrogent la base au moment du build, parce
 * qu'elles sont pré-rendues avec `revalidate`. Ces appels n'avaient aucune
 * limite de temps.
 *
 * Le défaut que ça ouvre n'est pas une erreur mais une *attente* : une base
 * lente ou en train de sortir de veille ne renvoie pas d'erreur, elle ne
 * répond pas. Les quatre pages savent déjà encaisser un échec — chacune a son
 * `try/catch` et son état vide — mais aucune ne peut rien contre un appel qui
 * ne rend jamais la main. Le build attend, et sa durée devient celle du
 * réseau, sans plafond. C'est le seul mécanisme de ce projet capable de faire
 * passer un build de quarante secondes à plusieurs minutes, et il est
 * invisible en développement : sans variables d'environnement, ces appels
 * échouent immédiatement.
 *
 * Le délai est délibérément large. Ces requêtes répondent en moins d'une
 * seconde quand tout va bien : à dix secondes, le plafond ne peut pas se
 * déclencher sur une base en bon état, et il ne change donc rien au cas normal.
 * S'il se déclenche, c'est que la base est réellement hors service — la page
 * part alors avec son état vide, que la revalidation suivante remplira, ce qui
 * vaut mieux qu'un build suspendu.
 */

/** Dix secondes : dix fois la marge d'une requête saine. */
const DEFAULT_MS = 10_000;

export async function withPrerenderTimeout<T>(
  work: Promise<T>,
  ms: number = DEFAULT_MS,
): Promise<T> {
  /* Le minuteur est annulé dans tous les cas, y compris quand la requête
     gagne la course : un `setTimeout` encore armé garderait le processus de
     build en vie après la fin du pré-rendu. */
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      work,
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`Requête de pré-rendu abandonnée après ${ms} ms`)),
          ms,
        );
      }),
    ]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

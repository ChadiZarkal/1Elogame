/**
 * @module lib/rft/memoire
 * Un cache en mémoire, à durée fixe, pour ce que le Red Flag Test relit sans
 * cesse : le questionnaire et les agrégats.
 *
 * POURQUOI PAS LE CACHE DE NEXT
 *   Ce qui est gardé ici contient le barème. Un cache en mémoire ne quitte pas
 *   le processus, et sa durée de vie se lit dans ce fichier plutôt que dans la
 *   configuration de l'hébergeur. Chaque instance du serveur relit au plus une
 *   fois par période : sous un pic, cinquante instances font cinquante lectures
 *   par minute, au lieu d'une par joueur.
 *
 * CE QUI EST GARANTI
 *   - Les appels simultanés partagent une seule lecture : la promesse est gardée,
 *     pas seulement le résultat.
 *   - Une lecture qui échoue n'est pas gardée comme une valeur. S'il existe une
 *     valeur précédente, elle est resservie quelques secondes ; sinon l'erreur
 *     remonte, et le prochain appel retentera après le même délai — une base en
 *     panne ne reçoit pas une tentative par joueur.
 */

/** Combien de temps resservir l'ancienne valeur, ou l'erreur, après un échec. */
export const DELAI_APRES_ECHEC_MS = 5_000;

export interface Memoire<T> {
  (): Promise<T>;
  /** Oublie la valeur : la prochaine lecture repartira de la source. */
  oublier(): void;
}

export function memoriser<T>(dureeMs: number, charger: () => Promise<T>): Memoire<T> {
  let enCours: { promesse: Promise<T>; expire: number } | null = null;
  let derniere: { valeur: T } | null = null;
  // Incrémenté par `oublier` : une lecture lancée avant l'oubli ne doit pas
  // réinstaller, en se terminant, une valeur que l'on vient de déclarer périmée.
  let generation = 0;

  const lire = (() => {
    const maintenant = Date.now();
    if (enCours && maintenant < enCours.expire) return enCours.promesse;

    const sienne = generation;
    const promesse = charger().then(
      (valeur) => {
        if (sienne === generation) derniere = { valeur };
        return valeur;
      },
      (erreur: unknown) => {
        if (sienne === generation && enCours?.promesse === promesse) {
          enCours = { promesse, expire: Date.now() + DELAI_APRES_ECHEC_MS };
        }
        if (derniere) return derniere.valeur;
        throw erreur;
      },
    );
    enCours = { promesse, expire: maintenant + dureeMs };
    return promesse;
  }) as Memoire<T>;

  lire.oublier = () => {
    generation += 1;
    enCours = null;
    derniere = null;
  };

  return lire;
}

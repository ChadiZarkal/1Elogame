/**
 * @module barometre
 * Le baromètre des red flags : le classement des joueurs, mis en page pour
 * être lu plutôt que filtré.
 *
 * `/classement` est l'outil — filtres, recherche, pagination. `/red-flags` est
 * la page qu'on lit : les pires, les moins graves, ce que chaque thème donne,
 * ce que les femmes et les hommes placent en tête, avec les phrases qui
 * disent ce que les chiffres montrent. Les deux lisent la même table.
 *
 * Tout est calculé ici, à partir des scores réels : aucune phrase de la page
 * n'affirme quelque chose que les données ne portent pas. La fonction de
 * calcul est pure, pour être éprouvée sans base.
 */

import { getLeaderboard, getPublicStats } from '@/lib/repositories';
import { CATEGORIES_HORS_VITRINE, TAGS_CONFIG } from '@/config/categories';

/**
 * En dessous de 40 duels, un score dit surtout le hasard des premiers votes.
 * C'est le seuil déjà retenu par l'Observatoire.
 */
export const DUELS_MINIMUM = 40;

/** Un thème n'a sa section qu'à partir de ce nombre de comportements fiables. */
const THEME_MINIMUM = 8;

export interface ElementBarometre {
  texte: string;
  tags: string[];
  elo_global: number;
  elo_homme: number;
  elo_femme: number;
  nb_participations: number;
}

export interface EntreeBarometre {
  /** Rang dans le classement général (1 = jugé le plus grave). */
  rang: number;
  texte: string;
  /** Part des comportements classés jugés moins graves, en pour cent. */
  gravite: number;
  duels: number;
  rangFemmes: number;
  rangHommes: number;
}

export interface ThemeBarometre {
  id: string;
  label: string;
  emoji: string;
  /** Comportements fiables du thème. */
  total: number;
  entrees: EntreeBarometre[];
}

export interface Barometre {
  /** Comportements classés (au-dessus du seuil de duels). */
  classes: number;
  /** Duels tranchés sur tout le site, lus dans la table des votes. */
  duels: number | null;
  pires: EntreeBarometre[];
  moinsGraves: EntreeBarometre[];
  selonFemmes: EntreeBarometre[];
  selonHommes: EntreeBarometre[];
  themes: ThemeBarometre[];
  /** L'écart hommes / femmes le plus marqué, parmi les comportements classés. */
  plusGrandEcart: { texte: string; ecart: number; plusSeveres: 'femmes' | 'hommes' } | null;
}

export const BAROMETRE_VIDE: Barometre = {
  classes: 0,
  duels: null,
  pires: [],
  moinsGraves: [],
  selonFemmes: [],
  selonHommes: [],
  themes: [],
  plusGrandEcart: null,
};

/** Rangs 1…n selon un score, du plus élevé au plus bas. */
function rangsPar(elements: ElementBarometre[], score: (e: ElementBarometre) => number) {
  const tries = [...elements].sort((a, b) => score(b) - score(a));
  return new Map(tries.map((e, i) => [e.texte, i + 1]));
}

export function construireBarometre(
  tous: ElementBarometre[],
  duels: number | null,
  { pires = 20, moinsGraves = 10, parSexe = 5, parTheme = 5 } = {},
): Barometre {
  const fiables = tous
    .filter((e) => e.nb_participations >= DUELS_MINIMUM)
    .sort((a, b) => b.elo_global - a.elo_global);
  const n = fiables.length;
  if (n === 0) return { ...BAROMETRE_VIDE, duels };

  const rangFemmes = rangsPar(fiables, (e) => e.elo_femme);
  const rangHommes = rangsPar(fiables, (e) => e.elo_homme);
  const entree = (e: ElementBarometre, i: number): EntreeBarometre => ({
    rang: i + 1,
    texte: e.texte,
    gravite: n > 1 ? Math.round(((n - 1 - i) / (n - 1)) * 100) : 100,
    duels: e.nb_participations,
    rangFemmes: rangFemmes.get(e.texte) ?? 0,
    rangHommes: rangHommes.get(e.texte) ?? 0,
  });
  const entrees = fiables.map(entree);
  const parTexte = new Map(entrees.map((e) => [e.texte, e]));

  const themes: ThemeBarometre[] = Object.values(TAGS_CONFIG)
    .map((tag) => {
      const membres = entrees.filter((e) =>
        fiables[e.rang - 1].tags.includes(tag.id),
      );
      return { id: tag.id, label: tag.label, emoji: tag.emoji, total: membres.length, entrees: membres.slice(0, parTheme) };
    })
    .filter((t) => t.total >= THEME_MINIMUM)
    .sort((a, b) => b.total - a.total);

  const ecarts = fiables
    .map((e) => ({ texte: e.texte, ecart: Math.round(e.elo_femme - e.elo_homme) }))
    .sort((a, b) => Math.abs(b.ecart) - Math.abs(a.ecart));
  const max = ecarts[0];

  return {
    classes: n,
    duels,
    pires: entrees.slice(0, pires),
    // Du moins grave au moins grave encore : lu depuis le bas du classement.
    moinsGraves: entrees.slice(-moinsGraves).reverse(),
    selonFemmes: [...fiables]
      .sort((a, b) => b.elo_femme - a.elo_femme)
      .slice(0, parSexe)
      .map((e) => parTexte.get(e.texte)!),
    selonHommes: [...fiables]
      .sort((a, b) => b.elo_homme - a.elo_homme)
      .slice(0, parSexe)
      .map((e) => parTexte.get(e.texte)!),
    themes,
    plusGrandEcart: max && max.ecart !== 0
      ? { texte: max.texte, ecart: Math.abs(max.ecart), plusSeveres: max.ecart > 0 ? 'femmes' : 'hommes' }
      : null,
  };
}

/** Lit la base et construit le baromètre. Lève en cas d'échec : l'appelant replie. */
export async function getBarometre(): Promise<Barometre> {
  const [{ elements }, stats] = await Promise.all([
    getLeaderboard({ sort: 'desc', limit: 1000, offset: 0, excludeCategories: CATEGORIES_HORS_VITRINE }),
    // Le compteur de duels vient de la table des votes : la somme des
    // participations compterait chaque duel deux fois, un par comportement.
    getPublicStats().catch(() => null),
  ]);
  return construireBarometre(
    elements.map((e) => ({
      texte: e.texte,
      tags: e.tags || [],
      elo_global: e.elo_global,
      elo_homme: e.elo_homme ?? e.elo_global,
      elo_femme: e.elo_femme ?? e.elo_global,
      nb_participations: e.nb_participations || 0,
    })),
    stats?.totalVotes ?? null,
  );
}

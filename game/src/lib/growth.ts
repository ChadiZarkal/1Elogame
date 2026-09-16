/**
 * @module lib/growth
 * Lecture de la croissance : lissage, périodes, variations.
 *
 * POURQUOI DU LISSÉ ET PAS DES TOTAUX
 *   Un total cumulé ne peut que monter : il monte même quand l'activité
 *   s'effondre, et il ne dit donc rien. Un compte journalier brut, lui, varie
 *   du simple au triple entre un mardi et un samedi — on y lit le jour de la
 *   semaine, pas la tendance. Tout ce module sert à séparer les deux : la
 *   moyenne glissante sur sept jours absorbe exactement un cycle
 *   hebdomadaire, et les variations comparent toujours une période à la
 *   période immédiatement précédente de même longueur.
 *
 * Fonctions pures, sans accès réseau : c'est ce qui les rend vérifiables.
 */

/** Une journée d'activité, toutes sources confondues. */
export interface DailyPoint {
  /** Jour au format `AAAA-MM-JJ`, découpé sur l'heure de Paris. */
  jour: string;
  votes: number;
  oracle: number;
  sessions: number;
  dixmais: number;
}

export type SourceKey = 'votes' | 'oracle' | 'sessions' | 'dixmais';

export const SOURCE_LABELS: Record<SourceKey, string> = {
  votes: 'Votes — Le pire des deux',
  dixmais: 'Votes — C’est un 10 mais…',
  oracle: 'Demandes — L’Oracle',
  sessions: 'Sessions',
};

/**
 * Sept jours, et pas dix ni trente : la fenêtre doit couvrir un nombre entier
 * de semaines, sinon la moyenne se met à osciller au rythme des week-ends
 * qu'elle contient ou non.
 */
export const SMOOTHING_WINDOW = 7;

// ---------------------------------------------------------------------------
// Outils de série
// ---------------------------------------------------------------------------

export function valuesOf(points: DailyPoint[], source: SourceKey): number[] {
  return points.map((p) => p[source]);
}

/**
 * Moyenne glissante, alignée sur la fin de la fenêtre.
 *
 * Les premiers jours n'ont pas d'historique complet : ils valent `null` plutôt
 * qu'une moyenne calculée sur trois jours, qui serait plus nerveuse que le
 * reste de la courbe et se lirait comme une vraie variation.
 */
export function movingAverage(values: number[], window = SMOOTHING_WINDOW): (number | null)[] {
  if (window <= 1) return values.slice();

  const out: (number | null)[] = [];
  let somme = 0;

  for (let i = 0; i < values.length; i++) {
    somme += values[i];
    if (i >= window) somme -= values[i - window];
    out.push(i >= window - 1 ? somme / window : null);
  }
  return out;
}

/**
 * Moyenne glissante de la courbe, journée en cours exclue.
 *
 * La dernière valeur d'une moyenne glissante contient la journée du jour, qui
 * n'est pas finie : la ligne plonge donc systématiquement sur sa droite, et ce
 * décrochage se lit comme un effondrement alors qu'il est l'heure qu'il est.
 */
export function trendLine(values: number[], window = SMOOTHING_WINDOW): (number | null)[] {
  const lisse = movingAverage(values, window);
  if (lisse.length === 0) return lisse;
  return [...lisse.slice(0, -1), null];
}

/** Somme des `n` dernières valeurs, en s'arrêtant `decalage` jours plus tôt. */
export function tailSum(values: number[], n: number, decalage = 0): number {
  const fin = values.length - decalage;
  const debut = Math.max(0, fin - n);
  if (fin <= 0) return 0;
  return values.slice(debut, fin).reduce((a, b) => a + b, 0);
}

/**
 * Variation en pourcentage d'une période à l'autre.
 *
 * `null` quand la période précédente est vide : passer de zéro à trois n'est
 * pas « +300 % », c'est un démarrage, et afficher un pourcentage là-dessus
 * donnerait au premier jour d'un jeu la plus belle croissance du tableau.
 */
export function variation(actuel: number, precedent: number): number | null {
  if (precedent <= 0) return null;
  return ((actuel - precedent) / precedent) * 100;
}

// ---------------------------------------------------------------------------
// Résumé par source
// ---------------------------------------------------------------------------

export interface SourceSummary {
  source: SourceKey;
  /** Moyenne par jour sur les sept derniers jours. */
  parJour7: number;
  /** Variation des sept derniers jours contre les sept précédents. */
  variation7: number | null;
  /** Moyenne par jour sur les trente derniers jours. */
  parJour30: number;
  /** Variation des trente derniers jours contre les trente précédents. */
  variation30: number | null;
  /** Total sur toute la fenêtre observée. */
  total: number;
}

/**
 * La journée en cours est toujours écartée des moyennes.
 *
 * Elle n'est pas finie : au milieu de l'après-midi elle vaut la moitié d'une
 * journée normale. Comptée dans les sept derniers jours, elle tire la moyenne
 * vers le bas et invente un recul qui n'existe pas — d'autant plus visible que
 * le trafic est irrégulier, et il l'est : d'un jour à l'autre, les votes vont
 * ici de zéro à cent trente-six.
 */
export const IGNORE_TODAY = 1;

export function summarize(points: DailyPoint[], source: SourceKey): SourceSummary {
  const v = valuesOf(points, source);

  const sept = tailSum(v, 7, IGNORE_TODAY);
  const septPrecedents = tailSum(v, 7, 7 + IGNORE_TODAY);
  const trente = tailSum(v, 30, IGNORE_TODAY);
  const trentePrecedents = tailSum(v, 30, 30 + IGNORE_TODAY);

  return {
    source,
    parJour7: sept / 7,
    variation7: variation(sept, septPrecedents),
    parJour30: trente / 30,
    variation30: variation(trente, trentePrecedents),
    total: v.reduce((a, b) => a + b, 0),
  };
}

// ---------------------------------------------------------------------------
// Regroupements
// ---------------------------------------------------------------------------

export interface Bucket {
  /** Libellé lisible : « 8 sept. » pour une semaine, « septembre » pour un mois. */
  label: string;
  /** Premier jour de la période, format `AAAA-MM-JJ`. */
  debut: string;
  total: number;
  /** Variation contre la période précédente de même longueur. */
  variation: number | null;
  /** La période est encore en cours : sa valeur n'est pas comparable. */
  enCours: boolean;
}

const MOIS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

function jourDeLaSemaineLundiZero(d: Date): number {
  return (d.getUTCDay() + 6) % 7;
}

/**
 * Regroupe en semaines calendaires, du lundi au dimanche.
 *
 * Des tranches de sept jours à partir d'aujourd'hui seraient plus simples,
 * mais chaque tranche contiendrait un week-end coupé en deux : la comparaison
 * d'une semaine à l'autre mesurerait le découpage autant que l'activité.
 */
export function byWeek(points: DailyPoint[], source: SourceKey): Bucket[] {
  const groupes = new Map<string, number>();

  for (const p of points) {
    const d = new Date(`${p.jour}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() - jourDeLaSemaineLundiZero(d));
    const lundi = d.toISOString().slice(0, 10);
    groupes.set(lundi, (groupes.get(lundi) ?? 0) + p[source]);
  }

  const dernierJour = points.at(-1)?.jour ?? '';
  const semaineEnCours = (() => {
    if (!dernierJour) return '';
    const d = new Date(`${dernierJour}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() - jourDeLaSemaineLundiZero(d));
    return d.toISOString().slice(0, 10);
  })();

  return [...groupes.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([debut, total], i, tout) => ({
      label: formatJourCourt(debut),
      debut,
      total,
      variation: i > 0 ? variation(total, tout[i - 1][1]) : null,
      enCours: debut === semaineEnCours,
    }));
}

/** Regroupe en mois calendaires. */
export function byMonth(points: DailyPoint[], source: SourceKey): Bucket[] {
  const groupes = new Map<string, number>();

  for (const p of points) {
    const mois = p.jour.slice(0, 7);
    groupes.set(mois, (groupes.get(mois) ?? 0) + p[source]);
  }

  const moisEnCours = (points.at(-1)?.jour ?? '').slice(0, 7);

  return [...groupes.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([debut, total], i, tout) => ({
      label: MOIS[Number(debut.slice(5, 7)) - 1] ?? debut,
      debut: `${debut}-01`,
      total,
      variation: i > 0 ? variation(total, tout[i - 1][1]) : null,
      enCours: debut === moisEnCours,
    }));
}

function formatJourCourt(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  const mois = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  return `${d.getUTCDate()} ${mois[d.getUTCMonth()]}`;
}

// ---------------------------------------------------------------------------
// Mise en mots
// ---------------------------------------------------------------------------

/** `+12 %`, `−4 %`, ou `—` quand la comparaison n'a pas de sens. */
export function formatVariation(v: number | null): string {
  if (v === null) return '—';
  const arrondi = Math.round(v);
  if (arrondi === 0) return 'stable';
  return `${arrondi > 0 ? '+' : '−'}${Math.abs(arrondi)} %`;
}

/** Une décimale, virgule française. */
export function formatMoyenne(n: number): string {
  return n.toFixed(1).replace('.', ',');
}

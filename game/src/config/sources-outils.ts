/**
 * @module config/sources-outils
 * D'où viennent les outils d'auto-évaluation, et vers qui se tourner.
 *
 * Partagé par la page `/sources` et l'article qui présente les outils : une
 * seule liste, pour que les deux disent toujours la même chose.
 */

export interface SourceEntry {
  slug: string;
  origin: string;
  detail: string;
}

/**
 * Références des barèmes repris par nos outils.
 * Ces sources figuraient jusqu'ici en commentaire dans le code : les publier
 * est autant une question d'honnêteté que de crédibilité.
 */
export const SOURCES: SourceEntry[] = [
  {
    slug: 'violentometre',
    origin: 'Observatoires des violences envers les femmes de Seine-Saint-Denis et de Paris, En Avant Toute(s), Ville de Paris',
    detail:
      "Le violentomètre a été conçu en 2018 par les Observatoires des violences envers les femmes de Seine-Saint-Denis et de Paris, l'association En Avant Toute(s) et la Ville de Paris, puis adapté et diffusé en Île-de-France par le Centre Hubertine Auclert.",
  },
  {
    slug: 'consentometre',
    origin: 'Université de Poitiers — mission égalité-diversité (CC BY-NC-ND)',
    detail:
      "Le consentomètre a été conçu par la mission égalité-diversité de l'Université de Poitiers et diffusé sous licence Creative Commons (attribution, pas d'utilisation commerciale, pas de modification).",
  },
  {
    slug: 'incestometre',
    origin: "Association Face à l'inceste / Mémoire Traumatique et Victimologie",
    detail:
      "Les repères utilisés s'appuient sur les travaux de sensibilisation de l'association Face à l'inceste et de l'association Mémoire Traumatique et Victimologie.",
  },
];

export const EMERGENCY_LINES = [
  { number: '3919', label: 'Violences Femmes Info — écoute nationale, 24h/24 et 7j/7' },
  { number: '119', label: 'Enfance en danger — 24h/24 et 7j/7' },
  { number: '17', label: 'Police et gendarmerie — urgences' },
  { number: '114', label: 'Urgences pour personnes sourdes ou malentendantes — par SMS' },
];

/**
 * @module classement/textes
 * Les textes du classement (`LeaderboardClient`), en français et en anglais.
 *
 * Le français est recopié à l'identique depuis le composant : la page
 * française ne doit pas bouger d'une virgule. L'anglais a le même type.
 * Les comportements arrivent du serveur déjà dans la langue de la page
 * (`lib/jeu/traduction`).
 */

import type { Langue } from '@/lib/i18n/langue';
import { useLangue } from '@/lib/i18n/LangueContexte';
import { CATEGORY_LABELS_EN, TAG_LABELS_EN } from '@/config/categories';

type Vue = 'global' | 'homme' | 'femme' | '16-18' | '19-22' | '23-26' | '27+';

const fr = {
  locale: 'fr-FR',
  redflagHeadline: 'Ce que personne\nne supporte.',
  redflagSub: (n: number) =>
    `Le verdict de la communauté. ${n} comportements jugés, classés par score collectif — sans filtre, sans diplomatie.`,
  greenflagHeadline: 'Ce que tout\nle monde valide.',
  greenflagSub: (n: number) =>
    `Pour une fois, quelque chose d'unanime. ${n} comportements que la communauté a approuvés.`,
  vues: {
    global: 'Tous', homme: 'Hommes', femme: 'Femmes',
    '16-18': '16-18', '19-22': '19-22', '23-26': '23-26', '27+': '27+',
  } as Record<Vue, string>,
  categories: { sexe: 'Amour & Sexe', quotidien: 'Quotidien' } as Record<string, string>,
  tags: {
    metier: 'Travail', couple: 'Couple', hygiene: 'Hygiène', argent: 'Argent',
    numerique: 'Numérique', sport: 'Sport', nourriture: 'Nourriture', emotionnel: 'Émotionnel',
    social: 'Social', transport: 'Transport', politique: 'Politique',
  } as Record<string, string>,
  autre: 'Autre',
  erreur: 'Impossible de charger le classement',
  /** Partage d'une ligne. `chemin` : l'adresse du classement, sans le domaine. */
  partageLigne: (emoji: string, rang: number, texte: string, score: number, votes: number, chemin: string) =>
    `${emoji} #${rang} — "${texte}"\nScore : ${score} · ${votes} votes\nredorgreen.fr${chemin}`,
  partageTop: (emoji: string, label: string, lignes: string, chemin: string) =>
    `${emoji} Top 5 ${label} :\n${lignes}\nredorgreen.fr${chemin}`,
  chargementVerdict: 'Chargement du verdict...',
  votes: (n: string | number) => `${n} votes`,
  partager: '📤 Partager',
  chercheMobile: '🔍  Cherche un comportement...',
  ok: 'OK',
  filtrerTheme: '🏷️ Filtrer par thème',
  reinitialiserFiltres: '↺ Réinitialiser les filtres',
  filtres: 'Filtres',
  resetCourt: '↺ Reset',
  recherche: 'Recherche',
  chercheBureau: 'haleine, cryptobro...',
  rechercher: 'Rechercher',
  type: 'Type',
  profil: 'Profil',
  unSeulProfil: 'Un seul profil à la fois',
  categorie: 'Catégorie',
  theme: '🏷️ Thème',
  ariaPartagerEntree: 'Partager cette entrée',
  ariaPartager: 'Partager',
  /** « 3 résultats pour », après le nombre en gras. */
  resultatsPour: (n: number) => ` résultat${n !== 1 ? 's' : ''} pour`,
  rienTrouve: 'Rien trouvé',
  essaieAutre: 'Essaie un autre mot ou change les filtres.',
  toutReinitialiser: 'Tout réinitialiser',
  chargement: 'Chargement...',
  voirPlus: (n: number) => `Voir ${n} de plus`,
  toutAffiche: (n: number) => `Tout est affiché — ${n} comportements`,
  donnerVote: 'Donner mon vote',
};

export type TextesClassement = typeof fr;

const en: TextesClassement = {
  locale: 'en-US',
  redflagHeadline: 'What nobody\ncan stand.',
  redflagSub: (n) =>
    `The community has spoken. ${n} behaviors judged and ranked by collective score — no filter, no diplomacy.`,
  greenflagHeadline: 'What everyone\nsigns off on.',
  greenflagSub: (n) =>
    `For once, something everyone agrees on. ${n} behaviors the community approves of.`,
  vues: {
    global: 'Everyone', homme: 'Men', femme: 'Women',
    '16-18': '16-18', '19-22': '19-22', '23-26': '23-26', '27+': '27+',
  },
  categories: CATEGORY_LABELS_EN,
  tags: TAG_LABELS_EN,
  autre: 'Other',
  erreur: 'Couldn’t load the rankings',
  partageLigne: (emoji, rang, texte, score, votes, chemin) =>
    `${emoji} #${rang} — “${texte}”\nScore: ${score} · ${votes} votes\nredorgreen.fr${chemin}`,
  partageTop: (emoji, label, lignes, chemin) =>
    `${emoji} Top 5 ${label}:\n${lignes}\nredorgreen.fr${chemin}`,
  chargementVerdict: 'Loading the verdict...',
  votes: (n) => `${n} votes`,
  partager: '📤 Share',
  chercheMobile: '🔍  Search a behavior...',
  ok: 'OK',
  filtrerTheme: '🏷️ Filter by topic',
  reinitialiserFiltres: '↺ Reset filters',
  filtres: 'Filters',
  resetCourt: '↺ Reset',
  recherche: 'Search',
  chercheBureau: 'breath, crypto bro...',
  rechercher: 'Search',
  type: 'Type',
  profil: 'Profile',
  unSeulProfil: 'One profile at a time',
  categorie: 'Category',
  theme: '🏷️ Topic',
  ariaPartagerEntree: 'Share this entry',
  ariaPartager: 'Share',
  resultatsPour: (n) => ` result${n !== 1 ? 's' : ''} for`,
  rienTrouve: 'Nothing found',
  essaieAutre: 'Try another word or change the filters.',
  toutReinitialiser: 'Reset everything',
  chargement: 'Loading...',
  voirPlus: (n) => `See ${n} more`,
  toutAffiche: (n) => `That’s everything — ${n} behaviors`,
  donnerVote: 'Cast my vote',
};

export const TEXTES_CLASSEMENT: Record<Langue, TextesClassement> = { fr, en };

export function useTextesClassement(): TextesClassement {
  return TEXTES_CLASSEMENT[useLangue()];
}

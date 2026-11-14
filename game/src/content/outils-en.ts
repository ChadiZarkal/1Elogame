/**
 * @module content/outils-en
 * Ce que les pages éditoriales anglaises disent des outils d'auto-évaluation :
 * noms, accroches, paliers, origine des barèmes, numéros d'aide.
 *
 * Les données des outils (`config/meters-data.ts`, `config/sources-outils.ts`)
 * sont en français et appartiennent à `/ressources`. Ce module ne les modifie
 * pas : il en donne l'anglais, indexé par l'identifiant de l'outil (ou par le
 * numéro, pour les lignes d'urgence). Le nombre de questions, les adresses et
 * les emojis restent lus dans les données françaises : un outil qui change de
 * taille change dans les deux langues.
 *
 * Les organismes et associations gardent leur nom français : ce sont des
 * structures françaises, qu'on cherche sous ce nom. Une courte glose dit ce
 * qu'elles font.
 */

import type { SeverityLevel } from '@/config/meters-data';

export interface OutilEn {
  /** « Violence meter » ; le nom français est rappelé à part. */
  nom: string;
  accroche: string;
  description: string;
  paliers: Record<SeverityLevel, { label: string; titre: string }>;
}

export const OUTILS_EN: Record<string, OutilEn> = {
  violentometre: {
    nom: 'Violence meter',
    accroche: 'Check on your relationship',
    description: 'A tool to gauge whether your romantic relationship is healthy or shows signs of violence.',
    paliers: {
      green: { label: 'Healthy', titre: 'Your relationship seems healthy' },
      yellow: { label: 'Watch out', titre: 'Say stop, stay alert' },
      orange: { label: 'Violence', titre: 'This is violence — act on it' },
      red: { label: 'Danger', titre: 'Protect yourself, call for help' },
    },
  },
  consentometre: {
    nom: 'Consent meter',
    accroche: 'Check whether your consent is respected',
    description:
      'A tool to assess whether your consent is respected in your relationships — friendships, romantic relationships, at school or university, or at work.',
    paliers: {
      green: { label: 'Healthy', titre: 'Your situation seems healthy' },
      yellow: { label: 'Watch out', titre: 'Careful, stay alert' },
      orange: { label: 'Warning', titre: 'Protect yourself, talk about it' },
      red: { label: 'Danger', titre: 'Say STOP, find support' },
    },
  },
  incestometre: {
    nom: 'Incest meter',
    accroche: 'Spot inappropriate behavior',
    description: 'A tool to tell normal from abnormal behavior within your family or close circle.',
    paliers: {
      green: { label: 'Healthy', titre: 'Relationships seem healthy' },
      yellow: { label: 'Watch out', titre: 'Careful, stay alert' },
      orange: { label: 'Warning', titre: 'This isn’t normal — talk about it' },
      red: { label: 'Danger', titre: 'This is against the law — call for help' },
    },
  },
  harcelometre: {
    nom: 'Harassment meter',
    accroche: 'Are you being harassed?',
    description: 'A tool to assess whether you are being harassed at school, online or in everyday life.',
    paliers: {
      green: { label: 'Healthy', titre: 'No problem, keep it up' },
      yellow: { label: 'Caution', titre: 'Be careful, say stop' },
      orange: { label: 'Cyberbullying', titre: 'This is harassment — act on it' },
      red: { label: 'Danger', titre: 'You’re being harassed — ask for help' },
    },
  },
  discriminometre: {
    nom: 'Discrimination meter',
    accroche: 'Measure the discrimination you face',
    description:
      'A tool to identify the discriminatory behavior you may face in everyday life, from microaggressions to violence.',
    paliers: {
      green: { label: 'Healthy', titre: 'All good, carry on' },
      yellow: { label: 'Watch out', titre: 'Stay alert, don’t let it slide' },
      orange: { label: 'Discrimination', titre: 'Say stop — this is discrimination' },
      red: { label: 'Danger', titre: 'You’re in danger — ask for help' },
    },
  },
};

/** L'origine des barèmes repris (`SOURCES`), par outil. */
export const SOURCES_EN: Record<string, { origine: string; detail: string }> = {
  violentometre: {
    origine:
      'Observatories on violence against women of Seine-Saint-Denis and Paris, En Avant Toute(s), City of Paris',
    detail:
      'The violentomètre was created in 2018 by the observatories on violence against women of Seine-Saint-Denis and Paris, the nonprofit En Avant Toute(s) and the City of Paris, then adapted and distributed across the Île-de-France region by the Centre Hubertine Auclert.',
  },
  consentometre: {
    origine: 'University of Poitiers — equality and diversity office (CC BY-NC-ND)',
    detail:
      'The consentomètre was created by the University of Poitiers’ equality and diversity office and released under a Creative Commons license (attribution, non-commercial, no derivatives).',
  },
  incestometre: {
    origine: 'Face à l’inceste / Mémoire Traumatique et Victimologie (French nonprofits)',
    detail:
      'The guidelines used draw on the awareness work of two French nonprofits, Face à l’inceste and Mémoire Traumatique et Victimologie.',
  },
};

/** Les lignes d'urgence (`EMERGENCY_LINES`), par numéro. Toutes françaises. */
export const LIGNES_URGENCE_EN: Record<string, string> = {
  '3919': 'Violences Femmes Info — national helpline for women facing violence, 24/7',
  '119': 'Children at risk (Allô Enfance en Danger) — 24/7',
  '17': 'Police and gendarmerie — emergencies',
  '114': 'Emergency number for deaf and hard-of-hearing people — by text message',
};

/** Les ressources propres à un outil (`Meter.resources`), par nom français. */
export const RESSOURCES_EN: Record<string, string> = {
  'CNAE — Écoute étudiants': 'CNAE — listening line for students',
  '119 — Allô Enfance en Danger': '119 — Allô Enfance en Danger (children at risk)',
  '0 800 05 95 95 — Viols Femmes Informations': '0 800 05 95 95 — Viols Femmes Informations (rape and sexual violence helpline)',
  'Face à l\'inceste': 'Face à l’inceste (nonprofit supporting incest survivors)',
  'Mémoire Traumatique': 'Mémoire Traumatique (resources on psychological trauma and violence)',
  '3020 — Non au harcèlement': '3020 — Non au harcèlement (school bullying helpline)',
  '3018 — Net Écoute': '3018 — Net Écoute (cyberbullying helpline)',
  'e-Enfance': 'e-Enfance (protecting children online)',
  'Défenseur des droits': 'Défenseur des droits (independent rights ombudsman)',
  'SOS Racisme': 'SOS Racisme (anti-racism nonprofit)',
  LICRA: 'LICRA (international league against racism and antisemitism)',
  'SOS Homophobie': 'SOS Homophobie (helpline against anti-LGBT hate)',
  DILCRAH: 'DILCRAH (government office against racism, antisemitism and anti-LGBT hate)',
};

/** Le nom anglais d'un outil, ou son nom français s'il n'est pas (encore) traduit. */
export function nomOutilEn(slug: string, nomFrancais: string): string {
  return OUTILS_EN[slug]?.nom ?? nomFrancais;
}

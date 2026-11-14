/**
 * @module dixmais/textes
 * Les textes de l'interface de « C'est un 10 mais… », en français et en
 * anglais (« It's a 10 but… »).
 *
 * Le français est celui qui était écrit dans les composants, recopié à
 * l'identique : la version française ne doit pas bouger d'une virgule. L'anglais
 * a le même type, donc la même liste de clés — en oublier une ne compile pas.
 *
 * Les énoncés tirés de la base ne sont pas ici : ils arrivent traduits du
 * serveur (`lib/dixmais/traduction`). Ce que le jeu compose lui-même — fins,
 * portraits, phrases de sévérité et de cohorte — passe par les fonctions
 * ci-dessous : en français celles de `moyenne`, `cohort` et `scale`, telles
 * quelles ; en anglais celles de `finsEn`.
 */

import type { Langue } from '@/lib/i18n/langue';
import { useLangue } from '@/lib/i18n/LangueContexte';
import type { PlayerProfile } from '@/types/game';
import { formatNote, libelleCategorie, phraseSeverite, type Archetype, type ContexteFin, type Fin, type Severite } from './moyenne';
import { cohortSentence, type CohortComparison } from './cohort';
import { scoreLabel } from './scale';
import {
  archetypeEn,
  cohortSentenceEn,
  finEn,
  formatNoteEn,
  libelleCategorieEn,
  phraseSeveriteEn,
  pointsEn,
  scoreLabelEn,
} from './finsEn';

const fr = {
  locale: 'fr-FR',
  /** « 6,4 » en français, « 6.4 » en anglais. */
  note: formatNote as (n: number) => string,
  /** « 1,1 point », « 2 points » (pluriel français à partir de 2). */
  points: (n: number) => `${formatNote(n)} point${n >= 2 ? 's' : ''}`,
  /** « 48 % » : l'espace à la française ; « 48% » en anglais. */
  pct: (n: number | string) => `${n} %`,
  cite: (t: string) => `« ${t} »`,
  label: scoreLabel as (n: number) => string,
  categorie: libelleCategorie as (c: string) => string,
  severite: phraseSeverite as (s: Severite | null) => string | null,
  cohorte: cohortSentence as (c: CohortComparison, p: PlayerProfile) => string,
  /** La fin retenue par `choisirFin`, dans la langue de la page. */
  fin: (fin: Fin, contexte: ContexteFin): Fin => { void contexte; return fin; },
  archetype: (a: Archetype): Archetype => a,

  /** Le jeu, pour le partage. */
  nomJeu: "C'est un 10 mais…",
  urlPartage: 'https://redorgreen.fr/dixmais',

  // Châssis
  recommencer: 'Recommencer',
  coachLigne1: 'Note chaque info seule, en partant de 10.',
  coachAvant: 'Une qualité peut ',
  coachVert: 'dépasser 10',
  coachApres: '.',
  chargement: "On te trouve quelqu'un…",

  // Accueil
  titreHaut: "C'est un",
  titreBas: 'mais…',
  demo: [
    { text: 'Il est jaloux maladif', score: 3, vert: false },
    { text: 'Il cuisine comme un chef', score: 14, vert: true },
    { text: 'Il parle de son ex non-stop', score: 7, vert: false },
  ] as readonly { text: string; score: number; vert: boolean }[],
  demoEtEnPlus: 'Et en plus…',
  demoMais: 'Mais…',
  demoMoyenne: 'Sa note : la moyenne',
  accroche: "Sept infos sur quelqu'un, notées une par une de 0 à 15.",
  accrocheFort: "Sa note, c'est ta moyenne.",
  connexionImpossible: 'Connexion impossible. Réessaie.',
  reessayer: 'Réessayer',
  jouer: 'Jouer',
  classement: 'Classement',
  commentCaMarche: 'Comment ça marche ↓',

  // Profil du joueur
  sexes: { homme: 'Homme', femme: 'Femme', autre: 'Autre' } as Record<'homme' | 'femme' | 'autre', string>,
  tuEsQui: 'Tu es qui ?',
  profilIntro: 'Deux réponses, et on pourra te dire si tu notes plus dur que les gens comme toi.',
  tuEs: 'Tu es…',
  tuAs: 'Tu as…',
  cEstParti: "C'est parti →",
  choisisLesDeux: 'Choisis les deux',

  // Carte du profil
  pasDeMoyenne: 'Pas encore de moyenne',
  moyenneSur10: (m: string) => `Moyenne ${m} sur 10`,
  moyenne: 'Moyenne',
  etEnPlus: '🟢 C’est un 10, et en plus…',
  mais: '🚩 C’est un 10, mais…',

  // Jauge
  jaugeAria: 'Note de cette révélation, de 0 à 15',
  jaugeValeur: (v: number, label: string) => `${v} sur 10, ${label}`,
  redhibitoire: '0 · Rédhibitoire',
  toujoursUn10: 'Toujours un 10',
  valider: (v: number) => `Valider ${v}`,

  // Verdict
  partageVerdict: (nom: string, age: number, n: number, moyenne: string, titre: string) =>
    `${nom}, ${age} : ${n} révélations, ${moyenne}/10 de moyenne — « ${titre} ». Et toi, tu lui mets combien ?`,
  lesAutresLuiMettent: 'Les autres lui mettent',
  commeToi: 'comme toi.',
  plusDur: (pts: string, nom: string) => `tu es ${pts} plus dur que les autres avec ${nom}.`,
  plusIndulgent: (pts: string, nom: string) => `tu es ${pts} plus indulgent que les autres avec ${nom}.`,
  tesNotes: (n: number) => `Tes ${n} notes`,
  lesAutres: (n: string) => `Les autres : ${n}`,
  rapporte: (pts: string) => `lui rapporte ${pts} de moyenne`,
  coute: (pts: string) => `lui coûte ${pts} de moyenne`,
  echecSuivant: 'Impossible de charger le profil suivant. Réessaie.',
  profilSuivant: 'Profil suivant →',
  /** Autour du nombre de profils : « Mon bilan · 3 profils ». */
  monBilan: [' Mon bilan · ', ' profils'] as readonly [string, string],
  copie: 'Copié',
  partager: 'Partager',

  // Bilan
  pluriel: (n: number, mot: string) => `${n} ${mot}${n >= 2 ? 's' : ''}`,
  motProfil: 'profil',
  motRevelation: 'révélation',
  taSoiree: 'Ta soirée · ',
  /** Autour d'un énoncé cité. */
  guillemets: ['« ', ' »'] as readonly [string, string],
  partageBilanTop: (nom: string, moyenne: string) => ` Mon préféré : ${nom}, ${moyenne}/10.`,
  partageBilan: (profils: number, moyenne: string, titre: string, emoji: string, top: string) =>
    `${profils} profils jugés, ${moyenne}/10 en moyenne par révélation. Verdict : ${titre} ${emoji}.${top} Et toi, tu vaux quoi comme juré ?`,
  chiffreProfils: 'Profils',
  chiffreNoteMoyenne: 'Note moyenne',
  chiffreZeros: 'De zéros',
  tonClassement: 'Ton classement',
  faceAuxAutres: 'Face aux autres',
  toi: 'Toi',
  toutLeMonde: 'Tout le monde',
  taCohorte: 'Ta cohorte',
  rougeContreVert: 'Red flags contre green flags',
  qualiteMinimum: 'Une qualité ne rapporte presque rien : chez toi, être bien, c’est le minimum.',
  qualiteRapporte: (vert: string, rouge: string) => `Une qualité rapporte ${vert} au-dessus du 10 ; un défaut coûte ${rouge}.`,
  coupsDeCoeur: 'Tes coups de cœur',
  redhibitoires: 'Tes rédhibitoires',
  decrocher: 'Ce qui te fait décrocher',
  demarques: 'Là où tu te démarques',
  intransigeance: 'Ton intransigeance',
  intransigeanceDetail: (moi: number, autres: string) => `Tu mets ${moi}, les autres ${autres}.`,
  angleMort: 'Ton angle mort',
  angleMortDetail: (moi: number, autres: string) => `Les autres mettent ${autres}, toi ${moi}.`,
  cafeTitre: '☕ Ça t’a plu ?',
  cafeTexte: 'Le jeu est gratuit. Un café aide à payer le site et à écrire de nouveaux profils.',
  cafeBouton: 'Offrir un café',
  verdict: 'Verdict',

  // Pause publicitaire
  /** Après le nombre : « 5 profils jugés ». */
  profilsJuges: ' profils jugés',
  petitePause: 'Petite pause',
  prochainProfil: 'Le prochain profil arrive juste après.',
  publicite: 'Publicité',
  profilSuivantDans: (s: number) => `Profil suivant dans ${s}…`,

  // Classement
  ongletRouge: '🚩 Red flags',
  ongletRougeSous: 'Ce qui fait le plus chuter la note',
  ongletVert: '🟢 Green flags',
  ongletVertSous: 'Ce qui la fait le plus monter',
  classementErreur: 'Le classement ne répond pas. Réessaie dans un instant.',
  jeu: 'Jeu',
  actualiser: 'Actualiser le classement',
  leClassement: 'Le classement',
  classementIntro: 'La note moyenne que les joueurs donnent à chaque info, notée seule, en partant de 10.',
  pasAssez: 'Pas encore assez de notes.',
  /** Autour du seuil de notes. */
  seuil: ['Une info entre au classement à ', ' notes. Joue quelques profils pour le remplir.'] as readonly [string, string],
  /** Après le nombre de notes d'une ligne. */
  nbNotes: ' notes',
  seuilPied: ["Une info apparaît ici dès qu'elle a reçu ", ' notes.'] as readonly [string, string],
};

export type TextesDixmais = typeof fr;

const en: TextesDixmais = {
  locale: 'en-US',
  note: formatNoteEn,
  points: pointsEn,
  pct: (n: number | string) => `${n}%`,
  cite: (t: string) => `“${t}”`,
  label: scoreLabelEn,
  categorie: libelleCategorieEn,
  severite: phraseSeveriteEn,
  cohorte: cohortSentenceEn,
  fin: finEn,
  archetype: archetypeEn,

  nomJeu: 'It’s a 10 but…',
  urlPartage: 'https://redorgreen.fr/en/dixmais',

  recommencer: 'Start over',
  coachLigne1: 'Rate each reveal on its own, starting from 10.',
  coachAvant: 'A good quality can ',
  coachVert: 'go above 10',
  coachApres: '.',
  chargement: 'Finding you someone…',

  titreHaut: 'It’s a',
  titreBas: 'but…',
  demo: [
    { text: 'He’s pathologically jealous', score: 3, vert: false },
    { text: 'He cooks like a chef', score: 14, vert: true },
    { text: 'He talks about his ex nonstop', score: 7, vert: false },
  ],
  demoEtEnPlus: 'And on top of that…',
  demoMais: 'But…',
  demoMoyenne: 'Final score: the average',
  accroche: 'Seven reveals about someone, rated one by one from 0 to 15.',
  accrocheFort: 'Their score is your average.',
  connexionImpossible: 'Couldn’t connect. Try again.',
  reessayer: 'Try again',
  jouer: 'Play',
  classement: 'Leaderboard',
  commentCaMarche: 'How it works ↓',

  sexes: { homme: 'Man', femme: 'Woman', autre: 'Other' },
  tuEsQui: 'Who are you?',
  profilIntro: 'Two answers, and we can tell you whether you rate harsher than people like you.',
  tuEs: 'You are…',
  tuAs: 'Your age…',
  cEstParti: 'Let’s go →',
  choisisLesDeux: 'Pick both',

  pasDeMoyenne: 'No average yet',
  moyenneSur10: (m: string) => `Average ${m} out of 10`,
  moyenne: 'Average',
  etEnPlus: '🟢 It’s a 10, and on top of that…',
  mais: '🚩 It’s a 10, but…',

  jaugeAria: 'Score for this reveal, from 0 to 15',
  jaugeValeur: (v: number, label: string) => `${v} out of 10, ${label}`,
  redhibitoire: '0 · Deal-breaker',
  toujoursUn10: 'Still a 10',
  valider: (v: number) => `Lock in ${v}`,

  partageVerdict: (nom: string, age: number, n: number, moyenne: string, titre: string) =>
    `${nom}, ${age}: ${n} reveals, ${moyenne}/10 average — “${titre}”. How would you rate them?`,
  lesAutresLuiMettent: 'Everyone else:',
  commeToi: 'same as you.',
  plusDur: (pts: string, nom: string) => `you’re ${pts} harsher than everyone else on ${nom}.`,
  plusIndulgent: (pts: string, nom: string) => `you’re ${pts} softer than everyone else on ${nom}.`,
  tesNotes: (n: number) => `Your ${n} scores`,
  lesAutres: (n: string) => `Everyone else: ${n}`,
  rapporte: (pts: string) => `adds ${pts} to the average`,
  coute: (pts: string) => `knocks ${pts} off the average`,
  echecSuivant: 'Couldn’t load the next profile. Try again.',
  profilSuivant: 'Next profile →',
  monBilan: [' My recap · ', ' profiles'],
  copie: 'Copied',
  partager: 'Share',

  pluriel: (n: number, mot: string) => `${n} ${mot}${n === 1 ? '' : 's'}`,
  motProfil: 'profile',
  motRevelation: 'reveal',
  taSoiree: 'Your night · ',
  guillemets: ['“', '”'],
  partageBilanTop: (nom: string, moyenne: string) => ` My favorite: ${nom}, ${moyenne}/10.`,
  partageBilan: (profils: number, moyenne: string, titre: string, emoji: string, top: string) =>
    `${profils} profiles judged, ${moyenne}/10 average per reveal. Verdict: ${titre} ${emoji}.${top} What kind of juror are you?`,
  chiffreProfils: 'Profiles',
  chiffreNoteMoyenne: 'Avg. score',
  chiffreZeros: 'Zeros',
  tonClassement: 'Your ranking',
  faceAuxAutres: 'You vs. everyone else',
  toi: 'You',
  toutLeMonde: 'Everyone',
  taCohorte: 'Your group',
  rougeContreVert: 'Red flags vs. green flags',
  qualiteMinimum: 'A good quality earns almost nothing: to you, being decent is the bare minimum.',
  qualiteRapporte: (vert: string, rouge: string) => `A good quality earns ${vert} above 10; a flaw costs ${rouge}.`,
  coupsDeCoeur: 'Your soft spots',
  redhibitoires: 'Your deal-breakers',
  decrocher: 'What turns you off',
  demarques: 'Where you stand out',
  intransigeance: 'Where you won’t budge',
  intransigeanceDetail: (moi: number, autres: string) => `You give ${moi}, everyone else gives ${autres}.`,
  angleMort: 'Your blind spot',
  angleMortDetail: (moi: number, autres: string) => `Everyone else gives ${autres}, you give ${moi}.`,
  cafeTitre: '☕ Enjoying it?',
  cafeTexte: 'The game is free. A coffee helps pay for the site and for writing new profiles.',
  cafeBouton: 'Buy me a coffee',
  verdict: 'Verdict',

  profilsJuges: ' profiles judged',
  petitePause: 'Quick break',
  prochainProfil: 'Your next profile is coming right up.',
  publicite: 'Advertisement',
  profilSuivantDans: (s: number) => `Next profile in ${s}…`,

  ongletRouge: '🚩 Red flags',
  ongletRougeSous: 'What tanks the score the most',
  ongletVert: '🟢 Green flags',
  ongletVertSous: 'What boosts it the most',
  classementErreur: 'The leaderboard isn’t responding. Try again in a moment.',
  jeu: 'Game',
  actualiser: 'Refresh the leaderboard',
  leClassement: 'The leaderboard',
  classementIntro: 'The average score players give each reveal, rated on its own, starting from 10.',
  pasAssez: 'Not enough ratings yet.',
  seuil: ['A reveal makes the leaderboard at ', ' ratings. Play a few profiles to fill it up.'],
  nbNotes: ' ratings',
  seuilPied: ['A reveal shows up here once it has ', ' ratings.'],
};

export const TEXTES_DIXMAIS: Record<Langue, TextesDixmais> = { fr, en };

/** Les textes de la langue de la page. */
export function useTextesDixmais(): TextesDixmais {
  return TEXTES_DIXMAIS[useLangue()];
}

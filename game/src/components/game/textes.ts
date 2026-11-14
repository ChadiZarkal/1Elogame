/**
 * @module components/game/textes
 * Les textes de l'interface de « Le pire des deux », en français et en anglais.
 *
 * Le français est celui qui était écrit dans les composants, recopié à
 * l'identique : la version française ne doit pas bouger d'une virgule (jusqu'aux
 * fautes d'accent des messages de connexion, laissées telles quelles). L'anglais
 * a le même type, donc la même liste de clés — en oublier une ne compile pas.
 *
 * Les comportements eux-mêmes ne sont pas ici : le serveur les renvoie déjà
 * traduits (voir `lib/jeu/traduction`).
 */

import type { Langue } from '@/lib/i18n/langue';
import { useLangue } from '@/lib/i18n/LangueContexte';

interface Archetype {
  title: string;
  emoji: string;
  tagline: string;
}

const fr = {
  locale: 'fr-FR',

  // --- Profil (ProfileForm) ------------------------------------------------
  sexes: { homme: 'Homme', femme: 'Femme', autre: 'Autre' } as Record<'homme' | 'femme' | 'autre', string>,
  erreurSexe: 'Sélectionne ton sexe',
  erreurAge: 'Sélectionne ton âge',
  profilTitre: '🚩 Le pire des deux — votez pour le plus red flag',
  profilSousTitre: '2 infos rapides avant de commencer',
  labelSexe: 'Sexe',
  ariaSexe: 'Sélection du sexe',
  labelAge: 'Âge',
  ariaAge: "Sélection de l'âge",
  ariaAgeOption: (a: string) => `${a} ans`,
  profilGo: "🚩 C'EST PARTI",
  profilIncomplet: 'Sélectionne sexe + âge',
  profilAnonyme: 'Données 100% anonymes — juste pour les stats',
  etapes: ['Choisis le pire', 'Compare', 'Enchaîne'],

  // --- Choix des catégories (CategorySelector) -----------------------------
  tailles: { 10: '⚡ Rapide', 15: '🎯 Classique', 20: '🏆 Expert' } as Record<10 | 15 | 20, string>,
  modeTitre: '🎮 Choisis ton mode',
  modeSousTitre: 'Sélectionne une ou plusieurs catégories',
  ariaRetourProfil: 'Retour au profil',
  retour: '← Retour',
  tout: 'Tout',
  reset: 'Reset',
  descriptionsCategories: {
    sexe: 'Relations, flirt, intimité, kinks',
    quotidien: 'Comportements, habitudes, travail, argent...',
  } as Record<string, string>,
  nombreDuels: 'Nombre de duels',
  commentCaMarche: 'Comment ça marche ?',
  regles: [
    { e: '🆚', t: '2 situations apparaissent : choisis le pire Red Flag' },
    { e: '📊', t: 'Découvre si la communauté est d\'accord avec toi' },
    { e: '🏆', t: 'Obtiens ton profil personnalisé en fin de partie' },
  ],
  reglesClassementAvant: '🔬 Tes votes mettent à jour les ',
  reglesClassementFort: 'classements communautaires',
  reglesClassementApres: ' par sexe et âge.',
  voir: 'Voir →',
  alternance: 'Les challenges alterneront entre les catégories sélectionnées',
  lancer: (n: number) => `🚩 LANCER · ${n} duels`,
  auMoinsUne: 'Sélectionne au moins une catégorie',

  // --- Écran de partie (jeu/jouer) -----------------------------------------
  connexionPerdue: 'Connexion perdue',
  connexionPerdueDetail: 'Le vote est suspendu tant que vous etes hors ligne.',
  connexionRetablie: 'Connexion retablie',
  connexionRetablieDetail: 'Le jeu reprend normalement.',
  serie3: '🔥 3 de suite !',
  serie3Detail: 'Tu es chaud·e ce soir !',
  serie5: '⚡ Streak x5 !',
  serie5Detail: 'Continue, tu es en feu.',
  serie10: '🏆 Streak x10 !',
  serie10Detail: 'Incroyable regularite.',
  serieN: (n: number) => `🎯 Streak x${n}`,
  serieNDetail: 'Niveau legendaire.',
  duelsJouesToast: (n: number) => `🎮 ${n} duels joués !`,
  duelsJouesToastDetail: 'Tu tiens le rythme, continue.',
  connexionRequise: 'Connexion requise',
  connexionRequiseDetail: 'Reconnecte-toi pour charger un nouveau duel.',
  chargement: 'Chargement...',
  preparation: 'Préparation du duel...',
  chargementDuel: 'Chargement du duel...',
  oups: 'Oups !',
  /** `null` : le message d'erreur du serveur s'affiche tel quel. */
  erreurDuel: null as string | null,
  reessayer: 'Réessayer',
  changerCategories: 'Changer de catégories',
  ariaRafraichir: 'Rafraichir le duel',
  duelsPrecedents: (n: number) => `${n} duel${n > 1 ? 's' : ''} précédent${n > 1 ? 's' : ''}`,
  horsLigne: '📡 Hors ligne: vote desactive',
  astuce: '🚩 Votez pour le plus red flag',
  duelEnCours: '↓ Duel en cours',
  reconnexion: '📡 Reconnexion necessaire pour voter',

  // --- Résultat (ResultDisplay, ResultCard, CompactResult) ------------------
  bienVu: '✓ Bien vu !',
  rate: '✗ Raté !',
  suivant: 'Suivant',
  toucherPourContinuer: 'Touchez pour continuer',
  calculVotes: 'Calcul des votes...',
  plusRedFlag: 'PLUS RED FLAG',
  pensentPlusRedFlag: 'pensent que c\'est le plus red flag',
  ontVote: 'ont voté pour ça',
  votes: (n: string) => `${n} votes`,
  moinsPire: 'Moins pire',
  bienDevine: '🎯 Bien deviné !',
  rateCompact: '❌ Raté !',

  // --- Pause publicitaire (PausePubDuel) -----------------------------------
  pauseDuelsJoues: (n: number) => `${n} duels joués`,
  pauseTitre: 'Petite pause',
  pauseSousTitre: 'Le duel suivant arrive juste après.',
  publicite: 'Publicité',
  duelSuivant: 'Duel suivant',

  // --- Tous les duels vus (AllDuelsExhausted) ------------------------------
  partageEpuise: (n: number) => `🚩 J'ai participé à ${n} duels sur Red or Green !\nEt toi, tu as combien de Red Flags ? 👀`,
  urlPartage: 'https://redorgreen.fr/jeu',
  incroyable: 'Incroyable !',
  tousVusAvant: 'Tu as vu tous les duels possibles ! Tu as participé à ',
  tousVusDuels: (n: number) => `${n} duels`,
  tousVusApres: '.',
  merci: 'Merci d\'avoir joué ! Reviens plus tard pour découvrir de nouveaux éléments.',
  recommencer: '🔄 Recommencer',
  voirClassement: '🏆 Voir le classement',
  partagerScore: '📤 Partager mon score',
  offrirCafe: '☕ Offrir un café',

  // --- Récapitulatif (GameRecap) -------------------------------------------
  archetype: (pct: number, fast: boolean, hotStreak: boolean): Archetype => {
    if (pct >= 90) {
      if (fast) return { title: 'Sniper Absolu', emoji: '🎯', tagline: 'Je vois les red flags avant qu\'ils n\'existent.' };
      return { title: 'Radar Absolu', emoji: '🛸', tagline: 'Personne ne peut mentir devant moi.' };
    }
    if (pct >= 75) {
      if (fast && hotStreak) return { title: 'Instinct de Chasseur·se', emoji: '🦊', tagline: 'Mon intuition ne me trompe jamais.' };
      if (hotStreak) return { title: 'Machine à Streak', emoji: '🔥', tagline: 'Rien ne m\'arrête.' };
      return { title: 'Détecteur·rice Pro', emoji: '🔍', tagline: 'Mon instinct est redoutable.' };
    }
    if (pct >= 60) {
      if (fast) return { title: 'Réflexe Instinctif', emoji: '⚡', tagline: 'Je tire d\'abord, je réfléchis après.' };
      return { title: 'Sentinelle', emoji: '🛡️', tagline: 'Vigilant·e mais pas infaillible.' };
    }
    if (pct >= 45) return { title: 'Électron Libre', emoji: '🎲', tagline: 'Mes opinions divisent.' };
    if (pct >= 30) return { title: 'Optimiste Invétéré·e', emoji: '🌈', tagline: 'Je vois du green flag partout.' };
    return { title: 'Anti-conformiste', emoji: '🎭', tagline: 'En désaccord avec tout le monde.' };
  },
  vitesse: (avgMs: number): { label: string; emoji: string } => {
    if (avgMs < 2000) return { label: 'Instinctif·ve', emoji: '⚡' };
    if (avgMs < 4000) return { label: 'Décidé·e', emoji: '🎯' };
    if (avgMs < 7000) return { label: 'Réfléchi·e', emoji: '🤔' };
    return { label: 'Philosophe', emoji: '🧠' };
  },
  dAccordAvec: (pct: number) => `💡 D'accord avec ${pct}% des joueurs`,
  seulement: (pct: number) => `😈 Seulement ${pct}% pensent comme toi`,
  indecis: (a: number, b: number) => `⚖️ Le plus indécis : ${a}% – ${b}%`,
  toutes: 'Toutes',
  citation: (t: string) => `« ${t} »`,
  etToi: 'Et toi ? 👀 → redorgreen.fr/jeu',
  urlRecap: 'https://redorgreen.fr/jeu?ref=recap',
  precision: 'Précision',
  serie: 'Streak 🔥',
  copie: '✅ Copié !',
  partagerResultat: '📤 PARTAGER MON RÉSULTAT',
  momentsCles: 'Tes moments clés',
  vs: (t: string) => `vs ${t}`,
  masquerDuels: 'Masquer les duels',
  voirDuels: (n: number) => `Voir les ${n} duels`,
  rejouer: '🎯 Rejouer',
  plusDuels: (n: number) => `🔄 +${n} duels`,
  classements: '🏆 Classements',
  accueil: '🏠 Accueil',
};

export type TextesJeu = typeof fr;

const en: TextesJeu = {
  locale: 'en-US',

  sexes: { homme: 'Man', femme: 'Woman', autre: 'Other' },
  erreurSexe: 'Pick your gender',
  erreurAge: 'Pick your age',
  profilTitre: '🚩 The Worse of Two — vote for the bigger red flag',
  profilSousTitre: '2 quick questions before we start',
  labelSexe: 'Gender',
  ariaSexe: 'Pick your gender',
  labelAge: 'Age',
  ariaAge: 'Pick your age',
  ariaAgeOption: (a) => `${a} years old`,
  profilGo: '🚩 LET’S GO',
  profilIncomplet: 'Pick gender + age',
  profilAnonyme: '100% anonymous — just for the stats',
  etapes: ['Pick the worse', 'Compare', 'Keep going'],

  tailles: { 10: '⚡ Quick', 15: '🎯 Classic', 20: '🏆 Expert' },
  modeTitre: '🎮 Pick your mode',
  modeSousTitre: 'Choose one or more categories',
  ariaRetourProfil: 'Back to profile',
  retour: '← Back',
  tout: 'All',
  reset: 'Reset',
  descriptionsCategories: {
    sexe: 'Dating, flirting, sex, kinks',
    quotidien: 'Habits, behaviors, work, money...',
  },
  nombreDuels: 'Number of duels',
  commentCaMarche: 'How does it work?',
  regles: [
    { e: '🆚', t: '2 situations pop up: pick the bigger red flag' },
    { e: '📊', t: 'Find out if everyone else agrees with you' },
    { e: '🏆', t: 'Get your own player profile at the end' },
  ],
  reglesClassementAvant: '🔬 Your votes update the ',
  reglesClassementFort: 'community rankings',
  reglesClassementApres: ' by gender and age.',
  voir: 'See →',
  alternance: 'Duels will rotate between the categories you picked',
  lancer: (n) => `🚩 START · ${n} duels`,
  auMoinsUne: 'Pick at least one category',

  connexionPerdue: 'Connection lost',
  connexionPerdueDetail: 'Voting is paused while you’re offline.',
  connexionRetablie: 'Back online',
  connexionRetablieDetail: 'The game picks up where you left off.',
  serie3: '🔥 3 in a row!',
  serie3Detail: 'You’re on fire tonight!',
  serie5: '⚡ Streak x5!',
  serie5Detail: 'Keep going, you’re on a roll.',
  serie10: '🏆 Streak x10!',
  serie10Detail: 'Unreal consistency.',
  serieN: (n) => `🎯 Streak x${n}`,
  serieNDetail: 'Legendary level.',
  duelsJouesToast: (n) => `🎮 ${n} duels played!`,
  duelsJouesToastDetail: 'You’re keeping the pace, keep it up.',
  connexionRequise: 'Connection needed',
  connexionRequiseDetail: 'Reconnect to load a new duel.',
  chargement: 'Loading...',
  preparation: 'Setting up the duel...',
  chargementDuel: 'Loading the duel...',
  oups: 'Oops!',
  erreurDuel: 'We couldn’t load a duel. Try again in a moment.',
  reessayer: 'Try again',
  changerCategories: 'Change categories',
  ariaRafraichir: 'Refresh the duel',
  duelsPrecedents: (n) => `${n} previous duel${n > 1 ? 's' : ''}`,
  horsLigne: '📡 Offline: voting disabled',
  astuce: '🚩 Vote for the bigger red flag',
  duelEnCours: '↓ Current duel',
  reconnexion: '📡 Reconnect to vote',

  bienVu: '✓ Nailed it!',
  rate: '✗ Nope!',
  suivant: 'Next',
  toucherPourContinuer: 'Tap to continue',
  calculVotes: 'Counting votes...',
  plusRedFlag: 'BIGGER RED FLAG',
  pensentPlusRedFlag: 'think it’s the bigger red flag',
  ontVote: 'voted for this',
  votes: (n) => `${n} votes`,
  moinsPire: 'Less bad',
  bienDevine: '🎯 Called it!',
  rateCompact: '❌ Nope!',

  pauseDuelsJoues: (n) => `${n} duels played`,
  pauseTitre: 'Quick break',
  pauseSousTitre: 'Your next duel is coming right up.',
  publicite: 'Ad',
  duelSuivant: 'Next duel',

  partageEpuise: (n) => `🚩 I played ${n} duels on Red or Green!\nHow many red flags do you have? 👀`,
  urlPartage: 'https://redorgreen.fr/en/jeu',
  incroyable: 'Unbelievable!',
  tousVusAvant: 'You’ve seen every possible duel! You played ',
  tousVusDuels: (n) => `${n} duels`,
  tousVusApres: '.',
  merci: 'Thanks for playing! Come back later for new behaviors.',
  recommencer: '🔄 Start over',
  voirClassement: '🏆 See the rankings',
  partagerScore: '📤 Share my score',
  offrirCafe: '☕ Buy me a coffee',

  archetype: (pct, fast, hotStreak) => {
    if (pct >= 90) {
      if (fast) return { title: 'Total Sniper', emoji: '🎯', tagline: 'I spot red flags before they even exist.' };
      return { title: 'Human Radar', emoji: '🛸', tagline: 'Nobody can lie to my face.' };
    }
    if (pct >= 75) {
      if (fast && hotStreak) return { title: 'Hunter’s Instinct', emoji: '🦊', tagline: 'My gut is never wrong.' };
      if (hotStreak) return { title: 'Streak Machine', emoji: '🔥', tagline: 'Nothing can stop me.' };
      return { title: 'Pro Detector', emoji: '🔍', tagline: 'My instincts are scary good.' };
    }
    if (pct >= 60) {
      if (fast) return { title: 'Quick Draw', emoji: '⚡', tagline: 'Shoot first, think later.' };
      return { title: 'Sentinel', emoji: '🛡️', tagline: 'Alert, but not infallible.' };
    }
    if (pct >= 45) return { title: 'Free Spirit', emoji: '🎲', tagline: 'My opinions split the room.' };
    if (pct >= 30) return { title: 'Hopeless Optimist', emoji: '🌈', tagline: 'I see green flags everywhere.' };
    return { title: 'Contrarian', emoji: '🎭', tagline: 'I disagree with everyone.' };
  },
  vitesse: (avgMs) => {
    if (avgMs < 2000) return { label: 'Instinctive', emoji: '⚡' };
    if (avgMs < 4000) return { label: 'Decisive', emoji: '🎯' };
    if (avgMs < 7000) return { label: 'Thoughtful', emoji: '🤔' };
    return { label: 'Philosopher', emoji: '🧠' };
  },
  dAccordAvec: (pct) => `💡 You agreed with ${pct}% of players`,
  seulement: (pct) => `😈 Only ${pct}% think like you`,
  indecis: (a, b) => `⚖️ The closest call: ${a}% – ${b}%`,
  toutes: 'All',
  citation: (t) => `“${t}”`,
  etToi: 'Your turn? 👀 → redorgreen.fr/en/jeu',
  urlRecap: 'https://redorgreen.fr/en/jeu?ref=recap',
  precision: 'Accuracy',
  serie: 'Streak 🔥',
  copie: '✅ Copied!',
  partagerResultat: '📤 SHARE MY RESULT',
  momentsCles: 'Your key moments',
  vs: (t) => `vs ${t}`,
  masquerDuels: 'Hide the duels',
  voirDuels: (n) => `See all ${n} duels`,
  rejouer: '🎯 Play again',
  plusDuels: (n) => `🔄 +${n} duels`,
  classements: '🏆 Rankings',
  accueil: '🏠 Home',
};

export const TEXTES_JEU: Record<Langue, TextesJeu> = { fr, en };

/** Les textes du jeu dans la langue de la page. */
export function useTextesJeu(): TextesJeu {
  return TEXTES_JEU[useLangue()];
}

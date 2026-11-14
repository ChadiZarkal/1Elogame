/**
 * @module redflagtest/textes
 * Les textes de l'interface du Red Flag Test, en français et en anglais.
 *
 * Le français est celui qui était écrit dans les composants, recopié à
 * l'identique : la version française ne doit pas bouger d'une virgule. L'anglais
 * a le même type, donc la même liste de clés — en oublier une ne compile pas.
 *
 * Le contenu de la base (questions, réponses, verdicts, profils, catégories)
 * n'est pas ici : il est traduit côté serveur (voir `lib/rft/traduction`).
 *
 * Les légendes de cohorte arrivent du serveur déjà dans la langue de la page :
 * « hommes », « 23-26 ans » en français ; « men », « 23-26 » en anglais.
 */

import type { Langue } from '@/lib/i18n/langue';
import { useLangue } from '@/lib/i18n/LangueContexte';

type CleCohorte = 'tous' | 'sexe' | 'age';

const fr = {
  locale: 'fr-FR',
  /** « 48 % » : l'espace à la française ; « 48% » en anglais. */
  pct: (n: number | string) => `${n} %`,
  /** Une réponse citée : « Oui » en français, “Yes” en anglais. */
  cite: (t: string) => `« ${t} »`,

  // Chargement et erreurs
  chargement: 'Chargement…',
  erreurChargement: 'Le test n’a pas pu être chargé.',
  erreurVide: 'Le test n’a pas encore de questions.',
  erreurConnexion: 'Connexion perdue.',
  erreurCalcul: 'Ton résultat n’a pas pu être calculé.',
  erreurConnexionCalcul: 'Connexion perdue. Ton résultat n’a pas pu être calculé.',
  retourAccueil: 'Revenir à l’accueil',

  // Profil
  profilTitre: 'Avant de commencer',
  profilTuEs: 'Tu es…',
  profilTuAs: 'Tu as…',
  profilSelectionne: 'Sélectionne',
  sexes: { homme: 'Homme', femme: 'Femme', autre: 'Autre' } as Record<'homme' | 'femme' | 'autre', string>,
  age: (a: string) => (a === '27+' ? '27 ans et plus' : `${a} ans`),
  commencer: 'Commencer',
  profilNote: 'Deux réponses, anonymes. Elles servent à te comparer aux autres à la fin.',

  // Pari
  pariTitre: 'Devine ton score',
  pariQuestion: 'À combien de pourcents de red flag tu t’estimes ?',
  pariCurseur: 'Ton estimation de ton score de red flag',
  jeParie: (p: number) => `Je parie ${p} %`,
  passer: 'Passer',
  pariNote: 'Réponse à la fin du test.',

  // Reprise
  repriseTitre: 'Tu avais commencé',
  repriseAvant: 'Tu en étais à ',
  repriseApres: '. On reprend où tu t’es arrêté ?',
  reprendre: 'Reprendre',
  recommencerDebut: 'Recommencer depuis le début',

  // Questions
  questionAvant: 'Question ',
  questionSur: ' sur ',
  retour: '← Retour',
  retourAria: 'Revenir à la question précédente',
  publicite: 'Publicité',

  // Pause avant le résultat
  pauseTitre: 'Ton résultat arrive',
  pauseTexte: 'On compte les dégâts…',
  pauseDans: (s: number) => `Ton résultat dans ${s}…`,
  pauseVoir: 'Voir mon résultat',
  pauseEncore: 'Encore un instant…',

  // Récap
  revoirStories: 'Revoir le résultat en stories',
  detail: 'Le détail',
  highlightsSousTitre: 'Les réponses qui te distinguent le plus de la masse',
  basePartiesAvant: 'Basé sur ',
  partie: (n: number): string => (n > 1 ? ' parties' : ' partie'),
  voirRessource: 'Voir la ressource →',
  voirAutres: 'Voir ce que les autres ont répondu',
  cafe: '☕ Offrir un café',

  // Stories : cadre
  storiesAria: 'Ton résultat',
  ecranAria: (i: number, total: number, titre: string) => `Écran ${i} sur ${total} : ${titre}`,
  ecranGroupeAria: (i: number, total: number, titre: string) => `${i} sur ${total} : ${titre}`,
  ecranRole: 'écran',
  fermerAria: 'Fermer et voir le détail',
  revoirDebut: '‹ Revoir depuis le début',
  continuer: 'Touche pour continuer ›',

  // Stories : titres des écrans
  tVerdict: 'Ton verdict',
  tPari: 'Ton pari',
  tMoyennes: 'Toi face aux autres',
  tClassement: 'Ton classement',
  tPointNoir: 'Ton point noir',
  tCategories: 'Catégorie par catégorie',
  tReponseChere: 'La réponse qui t’a coûté le plus',
  tReponseRare: 'Ta réponse la plus rare',
  tRessource: 'Plus sérieusement',
  tFin: 'À toi de jouer',

  // Verdict
  tonResultat: 'Ton résultat',

  // Pari, à l'arrivée
  commentairePari: (score: number, pari: number, reussiA: number): string => {
    const ecart = score - pari;
    if (Math.abs(ecart) <= reussiA) return 'Dans le mille. Tu te connais par cœur — c’est presque inquiétant.';
    if (ecart > 20) return 'Tu t’es largement sous-estimé·e. Les autres, eux, s’en doutaient.';
    if (ecart > 0) return 'Un peu plus red flag que tu ne le pensais. Rien qu’un peu.';
    if (ecart < -20) return 'Tu t’es beaucoup trop accablé·e. Tu es bien plus fréquentable que tu ne le crois.';
    return 'Plus green flag que tu ne le croyais. Bonne nouvelle, non ?';
  },
  tuPensais: 'Tu pensais être à ',
  bingo: 'Bingo',
  pts: ' pts',
  tuEsA: (score: number) => `Tu es à ${score} %.`,
  tuEsAEcart: (score: number, dessus: boolean) =>
    `Tu es à ${score} %, ${dessus ? 'au-dessus' : 'en dessous'} de ton pari.`,
  tonScoreMarque: (s: number) => `Ton score · ${s} %`,
  tonPariMarque: (p: number) => `Ton pari · ${p} %`,
  parisTitre: 'Ce que les autres parient',
  parisHommes: 'Les hommes',
  parisFemmes: 'Les femmes',
  parient: (nom: string) => `${nom} parient`,
  finissent: (s: number) => `et finissent à ${s} %`,

  // Cohortes
  cohorteNom: (cle: CleCohorte, legende: string) =>
    cle === 'tous' ? 'joueurs'
      : cle === 'sexe' ? (legende === 'autre' ? 'joueurs « autre »' : legende)
        : `joueurs de ${legende}`,
  cohorteCourt: (cle: CleCohorte, legende: string) =>
    cle === 'tous' ? 'Tous' : legende.charAt(0).toUpperCase() + legende.slice(1),

  // Moyennes
  toi: 'Toi',
  moyenneDe: (cle: CleCohorte, nom: string, court: string) =>
    cle === 'tous' ? 'Moyenne de tous' : `Moyenne des ${cle === 'sexe' ? nom : court}`,
  ecartPoints: (n: number) => `${n} points`,
  ecartSens: (dessus: boolean, legende: string) =>
    ` ${dessus ? 'au-dessus' : 'en dessous'} de la moyenne ${legende}`,
  pileMoyenne: (legende: string) => `Pile dans la moyenne ${legende}`,
  scoreMoyennes: 'Ton score, à côté des moyennes',

  // Classement
  ordinal: (n: number) => (n === 1 ? '1er' : `${n}e`),
  surEffectif: (effectif: string, nom: string) => `sur ${effectif} ${nom}`,
  premierPlusRed: 'Le 1er est le plus red flag de tous',
  ongletsAria: 'Se comparer aux',
  surCentAucun: (nom: string) => ({ avant: `Sur 100 ${nom}, `, fort: 'aucun', apres: ' ne fait plus red flag que toi' }),
  surCent: (nom: string, devant: number) => ({
    avant: `Sur 100 ${nom}, `,
    fort: String(devant),
    apres: ` ${devant === 1 ? 'fait' : 'font'} plus red flag que toi`,
  }),
  plusRed: 'Plus red flag',
  autantOuMoins: 'Autant ou moins',
  peuDeParties: (avertissement: string) => `* Encore peu de parties dans ce groupe : ${avertissement}`,

  // Catégories
  pointNoirTexte: 'des points red flag possibles dans cette catégorie',
  tonProfil: 'Ton profil',
  categoriesTexte: 'De la plus red flag à la plus green flag',

  // Réponse
  taReponse: (t: string) => `Ta réponse : « ${t} »`,
  pointsSurTes: (score: number) => `points sur tes ${score}`,
  ontReponduCommeToi: 'des joueurs ont répondu comme toi',
  seulsAvant: 'Seuls ',
  seulsApres: ' des joueurs ont répondu ça.',
  rareCitation: (t: string) => `« ${t} » : `,
  desJoueurs: ' des joueurs',

  // Fin
  defieTesPotes: 'Défie tes potes',
  etToi: 'Et toi, tu ferais mieux ?',
  refaire: 'Refaire le test',
  faireLeTest: 'Faire le test',
  voirToutDetail: 'Voir tout le détail',
  autresOntRepondu: 'Ce que les autres ont répondu',

  // Partage
  defieUnPote: 'Défie un pote',
  lienCopie: '✓ Lien copié',
  copierLien: 'Copier le lien',
  partageNote1: 'Celui qui l’ouvre devra deviner ton score avant de le voir.',
  partageNote2: 'Ou fais une capture d’un écran, chacun porte l’adresse.',
  partageConstat: (score: number, pari: number | null) =>
    pari !== null ? `J’avais parié ${pari} %, je suis à ${score} % red flag` : `Je suis ${score} % red flag`,
  partageInvite: 'Devine ton score.',

  // Résultat partagé
  partageTitrePage: 'Quelqu’un t’a envoyé son résultat.',
  devineSonScore: 'Devine son score',
  devineCurseur: 'Ton estimation de son score',
  devineNote: 'À combien de pourcents de red flag tu l’estimes ? Le curseur va au-delà de 100 — le test aussi.',
  jeParieSeul: 'Je parie',
  montreMoi: 'Montre-moi directement',
  tuAsDit: 'Tu as dit ',
  ilEstA: '. Il est à ',
  voirSonProfil: 'Voir son profil',
  devineVerdict: (ecart: number, tresProche: number, proche: number): string => {
    if (ecart <= tresProche) return 'Tu le connais bien. Trop bien, peut-être.';
    if (ecart <= proche) return 'Pas loin. Tu as des soupçons fondés.';
    return 'Complètement à côté. Ça en dit long sur l’un de vous deux.';
  },

  // Statistiques publiques
  statsErreur: 'Chargement impossible.',
  revenirAuTest: 'Revenir au test',
  statsPasAssez: (min: number) => `Pas encore assez de parties pour dire quoi que ce soit. Il en faut au moins ${min} par question.`,
  statsDivise: 'Ce qui divise le plus',
  statsOrdre: 'Dans l’ordre du test',
  statsNote: (min: number, minSexe: number) =>
    `Seules les questions ayant reçu au moins ${min} réponses sont affichées. La répartition hommes / femmes n’apparaît qu’à partir de ${minSexe} de chaque côté — en dessous, un pourcentage ne dirait rien.`,
  statsReponses: (n: number) => `${n} réponse${n > 1 ? 's' : ''}`,
  statsHF: (h: number, f: number) => ` · ${h} hommes, ${f} femmes`,
  statsEcart: (n: number) => ` · ${n} points d’écart`,
  statsHommes: (p: number) => `${p} % des hommes`,
  statsFemmes: (p: number) => `${p} % des femmes`,
};

export type TextesRft = typeof fr;

const en: TextesRft = {
  locale: 'en-US',
  pct: (n: number | string) => `${n}%`,
  cite: (t: string) => `“${t}”`,

  chargement: 'Loading…',
  erreurChargement: 'The test couldn’t be loaded.',
  erreurVide: 'The test has no questions yet.',
  erreurConnexion: 'Connection lost.',
  erreurCalcul: 'Your result couldn’t be calculated.',
  erreurConnexionCalcul: 'Connection lost. Your result couldn’t be calculated.',
  retourAccueil: 'Back to the home page',

  profilTitre: 'Before you start',
  profilTuEs: 'You are…',
  profilTuAs: 'Your age…',
  profilSelectionne: 'Select',
  sexes: { homme: 'Male', femme: 'Female', autre: 'Other' },
  age: (a: string) => (a === '27+' ? '27 and over' : a),
  commencer: 'Start',
  profilNote: 'Two anonymous answers. They’re only used to compare you with others at the end.',

  pariTitre: 'Guess your score',
  pariQuestion: 'How much of a red flag do you think you are?',
  pariCurseur: 'Your guess of your red flag score',
  jeParie: (p: number) => `I bet ${p}%`,
  passer: 'Skip',
  pariNote: 'The answer comes at the end of the test.',

  repriseTitre: 'You’d already started',
  repriseAvant: 'You were at ',
  repriseApres: '. Pick up where you left off?',
  reprendre: 'Resume',
  recommencerDebut: 'Start over from the beginning',

  questionAvant: 'Question ',
  questionSur: ' of ',
  retour: '← Back',
  retourAria: 'Go back to the previous question',
  publicite: 'Advertisement',

  pauseTitre: 'Your result is coming',
  pauseTexte: 'Counting the damage…',
  pauseDans: (s: number) => `Your result in ${s}…`,
  pauseVoir: 'See my result',
  pauseEncore: 'Just a moment…',

  revoirStories: 'Watch the result as stories again',
  detail: 'The details',
  highlightsSousTitre: 'The answers that set you apart from the crowd the most',
  basePartiesAvant: 'Based on ',
  partie: (n: number) => (n > 1 ? ' games' : ' game'),
  voirRessource: 'See the resource →',
  voirAutres: 'See what everyone else answered',
  cafe: '☕ Buy us a coffee',

  storiesAria: 'Your result',
  ecranAria: (i: number, total: number, titre: string) => `Screen ${i} of ${total}: ${titre}`,
  ecranGroupeAria: (i: number, total: number, titre: string) => `${i} of ${total}: ${titre}`,
  ecranRole: 'screen',
  fermerAria: 'Close and see the details',
  revoirDebut: '‹ Watch again from the start',
  continuer: 'Tap to continue ›',

  tVerdict: 'Your verdict',
  tPari: 'Your bet',
  tMoyennes: 'You vs. everyone else',
  tClassement: 'Your ranking',
  tPointNoir: 'Your weak spot',
  tCategories: 'Category by category',
  tReponseChere: 'The answer that cost you the most',
  tReponseRare: 'Your rarest answer',
  tRessource: 'On a serious note',
  tFin: 'Your turn',

  tonResultat: 'Your result',

  commentairePari: (score: number, pari: number, reussiA: number) => {
    const ecart = score - pari;
    if (Math.abs(ecart) <= reussiA) return 'Spot on. You know yourself inside out — it’s almost worrying.';
    if (ecart > 20) return 'You seriously underestimated yourself. Everyone else saw it coming.';
    if (ecart > 0) return 'A bit more of a red flag than you thought. Just a bit.';
    if (ecart < -20) return 'You were way too hard on yourself. You’re much better company than you think.';
    return 'More of a green flag than you thought. Good news, right?';
  },
  tuPensais: 'You thought you were at ',
  bingo: 'Bingo',
  pts: ' pts',
  tuEsA: (score: number) => `You’re at ${score}%.`,
  tuEsAEcart: (score: number, dessus: boolean) =>
    `You’re at ${score}%, ${dessus ? 'above' : 'below'} your bet.`,
  tonScoreMarque: (s: number) => `Your score · ${s}%`,
  tonPariMarque: (p: number) => `Your bet · ${p}%`,
  parisTitre: 'What others bet',
  parisHommes: 'Men',
  parisFemmes: 'Women',
  parient: (nom: string) => `${nom} bet`,
  finissent: (s: number) => `and end up at ${s}%`,

  cohorteNom: (cle: CleCohorte, legende: string) =>
    cle === 'tous' ? 'players'
      : cle === 'sexe' ? (legende === 'other' ? '“other” players' : legende)
        : `players aged ${legende}`,
  cohorteCourt: (cle: CleCohorte, legende: string) =>
    cle === 'tous' ? 'All' : legende.charAt(0).toUpperCase() + legende.slice(1),

  toi: 'You',
  moyenneDe: (cle: CleCohorte, nom: string, court: string) =>
    cle === 'tous' ? 'Overall average' : `Average for ${cle === 'sexe' ? nom : court}`,
  ecartPoints: (n: number) => `${n} points`,
  ecartSens: (dessus: boolean, legende: string) =>
    ` ${dessus ? 'above' : 'below'} the average for ${legende}`,
  pileMoyenne: (legende: string) => `Right on the average for ${legende}`,
  scoreMoyennes: 'Your score, next to the averages',

  ordinal: (n: number) => {
    const d = n % 100;
    if (d >= 11 && d <= 13) return `${n}th`;
    return `${n}${n % 10 === 1 ? 'st' : n % 10 === 2 ? 'nd' : n % 10 === 3 ? 'rd' : 'th'}`;
  },
  surEffectif: (effectif: string, nom: string) => `out of ${effectif} ${nom}`,
  premierPlusRed: '1st is the biggest red flag of all',
  ongletsAria: 'Compare yourself with',
  surCentAucun: (nom: string) => ({ avant: `Out of 100 ${nom}, `, fort: 'none', apres: ' are more of a red flag than you' }),
  surCent: (nom: string, devant: number) => ({
    avant: `Out of 100 ${nom}, `,
    fort: String(devant),
    apres: ` ${devant === 1 ? 'is' : 'are'} more of a red flag than you`,
  }),
  plusRed: 'Bigger red flag',
  autantOuMoins: 'Same or less',
  peuDeParties: (avertissement: string) => `* Not many games in this group yet: ${avertissement}`,

  pointNoirTexte: 'of the possible red flag points in this category',
  tonProfil: 'Your profile',
  categoriesTexte: 'From most red flag to most green flag',

  taReponse: (t: string) => `Your answer: “${t}”`,
  pointsSurTes: (score: number) => `points out of your ${score}`,
  ontReponduCommeToi: 'of players answered like you',
  seulsAvant: 'Only ',
  seulsApres: ' of players answered that.',
  rareCitation: (t: string) => `“${t}”: `,
  desJoueurs: ' of players',

  defieTesPotes: 'Challenge your friends',
  etToi: 'Think you’d do better?',
  refaire: 'Take the test again',
  faireLeTest: 'Take the test',
  voirToutDetail: 'See all the details',
  autresOntRepondu: 'What everyone else answered',

  defieUnPote: 'Challenge a friend',
  lienCopie: '✓ Link copied',
  copierLien: 'Copy the link',
  partageNote1: 'Whoever opens it will have to guess your score before seeing it.',
  partageNote2: 'Or screenshot any screen — each one shows the address.',
  partageConstat: (score: number, pari: number | null) =>
    pari !== null ? `I bet ${pari}%, I’m ${score}% red flag` : `I’m ${score}% red flag`,
  partageInvite: 'Guess your score.',

  partageTitrePage: 'Someone sent you their result.',
  devineSonScore: 'Guess their score',
  devineCurseur: 'Your guess of their score',
  devineNote: 'How much of a red flag do you think they are? The slider goes past 100 — so does the test.',
  jeParieSeul: 'Lock it in',
  montreMoi: 'Just show me',
  tuAsDit: 'You said ',
  ilEstA: '. They’re at ',
  voirSonProfil: 'See their profile',
  devineVerdict: (ecart: number, tresProche: number, proche: number) => {
    if (ecart <= tresProche) return 'You know them well. Maybe too well.';
    if (ecart <= proche) return 'Not far off. Your suspicions were justified.';
    return 'Way off. That says a lot about one of you.';
  },

  statsErreur: 'Couldn’t load the data.',
  revenirAuTest: 'Back to the test',
  statsPasAssez: (min: number) => `Not enough games yet to say anything. Each question needs at least ${min}.`,
  statsDivise: 'Most divisive first',
  statsOrdre: 'In test order',
  statsNote: (min: number, minSexe: number) =>
    `Only questions with at least ${min} answers are shown. The men / women split only appears from ${minSexe} on each side — below that, a percentage wouldn’t mean anything.`,
  statsReponses: (n: number) => `${n} answer${n > 1 ? 's' : ''}`,
  statsHF: (h: number, f: number) => ` · ${h} men, ${f} women`,
  statsEcart: (n: number) => ` · ${n}-point gap`,
  statsHommes: (p: number) => `${p}% of men`,
  statsFemmes: (p: number) => `${p}% of women`,
};

export const TEXTES_RFT: Record<Langue, TextesRft> = { fr, en };

/** Les textes de la langue de la page. */
export function useTextesRft(): TextesRft {
  return TEXTES_RFT[useLangue()];
}

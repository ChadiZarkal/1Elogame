/**
 * @module lib/rft/traduction
 * Le contenu du Red Flag Test en anglais : questions, réponses, piques,
 * verdicts, profils, catégories, et les phrases que le serveur écrit lui-même
 * (légendes des cohortes, avertissements).
 *
 * UN DICTIONNAIRE INDEXÉ PAR LE TEXTE FRANÇAIS
 *   Plutôt qu'une colonne anglaise en base : rien ne change en production, et
 *   la maquette locale (`mock`), dont les identifiants ne sont pas ceux de la
 *   base, se traduit avec la même table. Surtout, une question réécrite dans
 *   l'admin perd sa traduction — elle s'affiche alors en français plutôt que
 *   dans un anglais qui ne lui correspond plus. Une question ajoutée fait de
 *   même jusqu'à ce qu'on l'ajoute ici.
 *
 *   Les apostrophes droites et typographiques sont confondues : la base écrit
 *   « l'alcool », la maquette « l’alcool ».
 *
 * La traduction est faite à la sortie du serveur, sur ce qu'il renvoie déjà en
 * français : le calcul du score, les classements et les écritures en base ne
 * savent rien de la langue.
 */

import type { Langue } from '@/lib/i18n/langue';
import type { Classement, QuestionPublique, Resultat, StatQuestion, Verdict } from './types';


const CONTENU_EN: Record<string, string> = {
  // --- Réponses courantes --------------------------------------------------
  'Oui': 'Yes',
  'Non': 'No',

  // --- Questions de la base ------------------------------------------------
  'Es-tu un homme ?': 'Are you a man?',
  "Oui (C'est redflag)": 'Yes (that’s a red flag)',
  'Trois points avant même la première vraie question. Les chiffres sont les chiffres.':
    'Three points before the first real question. Numbers are numbers.',

  'Tu te considères féministe ?': 'Do you consider yourself a feminist?',
  "Ce n'est pas une opinion qui coûte cher. C'est une opinion qui en dit long.":
    'It’s not an opinion that costs much. It’s an opinion that says a lot.',

  "Tu t'intéresses à la politique ?": 'Are you interested in politics?',
  "Ne pas s'y intéresser reste une position. Simplement, ce sont les autres qui la choisissent pour toi.":
    'Not caring is still a position. It’s just that other people pick it for you.',

  "Tu as un problème avec l'alcool ?": 'Do you have a problem with alcohol?',
  "Le dire est déjà plus rare que l'avoir.": 'Admitting it is already rarer than having it.',

  'Tu es jaloux ou jalouse ?': 'Are you the jealous type?',

  'Tu as déjà fouillé le téléphone de ton ou ta partenaire à son insu ?':
    'Have you ever gone through your partner’s phone behind their back?',
  "Personne n'a jamais trouvé ce qu'il cherchait et s'en est senti mieux.":
    'Nobody has ever found what they were looking for and felt better for it.',

  'Tu détestes au moins un ou une de tes ex ?': 'Do you hate at least one of your exes?',

  'Au moins un ou une de tes ex te déteste ?': 'Does at least one of your exes hate you?',
  'Celle-là se répond moins facilement que la précédente.': 'This one’s harder to answer than the last one.',
  "Détester son ex est courant. Être détesté par le sien demande d'avoir fait quelque chose.":
    'Hating your ex is common. Being hated by yours means you did something.',

  'Tu es un rat ?': 'Are you a cheapskate?',
  'Tu sais très bien de quoi on parle.': 'You know exactly what we mean.',

  'Tu bois des boissons énergisantes ?': 'Do you drink energy drinks?',

  'Tu es maniaque ?': 'Are you a neat freak?',
  "Le problème n'a jamais été ton rangement. C'est ce que tu attends de celui des autres.":
    'The problem was never how tidy you are. It’s what you expect from everyone else.',

  'Tu as déjà été violent·e physiquement sous le coup de la colère ?':
    'Have you ever been physically violent in a fit of anger?',
  "Dix points. C'est la réponse la plus lourde du test, et de loin.":
    'Ten points. The heaviest answer in the test, by far.',

  'Tu as déjà conduit après avoir bu ?': 'Have you ever driven after drinking?',
  'Même un peu. Même une seule fois.': 'Even a little. Even just once.',
  'Ce jour-là, tu as mis ta soirée au-dessus de la vie de gens que tu ne connaissais pas.':
    'That night, you put your evening above the lives of people you’d never met.',

  'Tu as déjà trompé ton ou ta partenaire ?': 'Have you ever cheated on your partner?',
  "Il n'y a pas de version de cette réponse qui se raconte bien.":
    'There’s no version of this answer that sounds good out loud.',

  'Tu as déjà volé un proche ?': 'Have you ever stolen from someone close to you?',

  'Tu as déjà été violent·e verbalement en vers ton ou ta partenaire ?':
    'Have you ever been verbally abusive toward your partner?',

  'Tu penses que le féminisme va trop loin ?': 'Do you think feminism goes too far?',
  "Sept points. C'est la deuxième réponse la plus lourde du test, juste derrière la violence.":
    'Seven points. The second-heaviest answer in the test, right behind violence.',

  "Tu as déjà stalké quelqu'un avec un faux compte ?": 'Have you ever stalked someone with a fake account?',
  'Créer le compte demande cinq minutes. Décider de le créer, beaucoup plus.':
    'Making the account takes five minutes. Deciding to make it takes a lot longer.',

  "Tu as déjà dragué quelqu'un qui était en couple ?": 'Have you ever hit on someone who was in a relationship?',

  'Tu as déjà menti sur ton statut amoureux ?': 'Have you ever lied about your relationship status?',
  "Si c'est pour éviter les hommes ca compte pas": 'Doesn’t count if it was to get rid of men',
  "Le mensonge par omission compte. Tu le sais, sinon tu n'aurais pas hésité.":
    'Lying by omission counts. You know it, or you wouldn’t have hesitated.',

  "Tu as déjà répété un secret lourd qu'on t'avait confié ?":
    'Have you ever passed on a heavy secret someone trusted you with?',
  "Quelqu'un t'a choisi pour porter ça. Tu as choisi quelqu'un d'autre.":
    'Someone chose you to carry that. You chose someone else.',

  'Tu juge les gens ?': 'Do you judge people?',

  "Tu as déjà fait du chantage à quelqu'un ?": 'Have you ever blackmailed someone?',
  "Le chantage est la seule façon d'obtenir quelque chose en étant certain que l'autre ne voulait pas le donner.":
    'Blackmail is the only way to get something while knowing for sure the other person didn’t want to give it.',

  'Les poils de ton ou ta partenaire ?': 'Your partner’s body hair?',
  "Je m'en fous": 'I don’t care',
  "C'est rasé ou rien": 'Shaved or nothing',
  "Miam les poils ! (c'est green flag)": 'Yum, body hair! (that’s a green flag)',
  'Avoir une préférence est une chose. En faire une condition en est une autre.':
    'Having a preference is one thing. Making it a condition is another.',

  "Tu sépares l'œuvre de l'artiste ?": 'Do you separate the art from the artist?',

  'Tu as des mommy issues ou des daddy issues ?': 'Do you have mommy issues or daddy issues?',

  'Tu es un go muscu ?': 'Are you a gym bro?',

  "Tu as déjà poussé quelqu'un à boire ?": 'Have you ever pressured someone into drinking?',
  "Insister pour qu'on boive, c'est décider à la place de quelqu'un de ce qu'il tient.":
    'Pushing someone to drink is deciding for them how much they can handle.',

  'Tu as un hobby ?': 'Do you have a hobby?',
  "Quelqu'un qui n'a rien à lui finit toujours par prendre la place de quelqu'un d'autre.":
    'Someone with nothing of their own always ends up taking over someone else’s life.',

  'Tu as déjà suivi une thérapie ?': 'Have you ever been to therapy?',
  'Deux points en moins. Tu es un des rares à avoir fait baisser ton score.':
    'Two points off. You’re one of the few who managed to lower their score.',

  'Tu peux être en bons termes avec un ou une ex ?': 'Can you stay on good terms with an ex?',

  'Tu cuisines ?': 'Do you cook?',
  "Quelqu'un cuisine. La question est de savoir qui.": 'Someone’s cooking. The question is who.',

  'Tu as souvent raison ?': 'Are you usually right?',
  "Répondre oui à cette question est exactement la démonstration qu'elle cherchait.":
    'Answering yes to this question is exactly the proof it was looking for.',

  "Est-ce que tu t'écrases pour faire plaisir aux gens ?": 'Do you let people walk all over you to keep them happy?',

  "Tu as déjà ghosté quelqu'un après plusieurs mois ?": 'Have you ever ghosted someone after several months?',
  "Plusieurs mois, puis plus rien. L'autre cherche encore ce qu'il a fait.":
    'Months together, then nothing. They’re still wondering what they did.',

  "Tu as déjà dit du mal d'un ami proche dans son dos ?": 'Have you ever trash-talked a close friend behind their back?',

  'Est-ce que tu as déjà été bloqué sur les réseaux sociaux': 'Have you ever been blocked on social media?',

  'Tu parles beaucoup de toi ?': 'Do you talk about yourself a lot?',

  'Est-ce que tu as menti pendant ce test ?': 'Did you lie during this test?',

  "Est-ce que c'est jamais de ta faute ?": 'Is it never your fault?',

  // --- Verdicts ------------------------------------------------------------
  'Trop net pour être net·te': 'Too clean to be true',
  'Ce résultat cache des hurlements.': 'This result is hiding some screaming.',
  'Dossier Incomplet': 'Incomplete File',
  "Reviens quand t'auras décidé d'être honnête…": 'Come back when you’ve decided to be honest…',
  'SUSPECT DE NORMALITÉ': 'SUSPICIOUSLY NORMAL',
  'Soit tu vas bien, soit tu as menti avec application.': 'Either you’re fine, or you lied very carefully.',
  'Vice de qualité': 'Quality vice',
  'Raffiné·e, rare, baisable sans remords.': 'Refined, rare, fuckable with no regrets.',
  "T'ES ENTRE LA HONTE ET L'ENNUI": 'SOMEWHERE BETWEEN SHAMEFUL AND BORING',
  'Même ton pervers intérieur hésite à sortir.': 'Even your inner pervert isn’t sure about coming out.',
  'QUELQUES TRAVAUX': 'SOME WORK NEEDED',
  "Rien d'irréparable. Deux ou trois choses à regarder en face.":
    'Nothing that can’t be fixed. Two or three things to face up to.',
  'ÇA SE VOIT DE LOIN': 'VISIBLE FROM A MILE AWAY',
  "Tes proches le savent déjà. Toi, tu viens de l'apprendre.": 'The people around you already knew. You just found out.',
  'Prédateur': 'Predator',
  "Tu ne fais pas l'amour, tu fais des dégâts.": 'You don’t make love, you make damage.',
  'HORS BARÈME': 'OFF THE CHARTS',
  "Tu as dépassé le maximum prévu. Personne n'avait anticipé ça.":
    'You went past the maximum. Nobody saw that coming.',

  // --- Profils -------------------------------------------------------------
  'LE STRATÈGE': 'THE STRATEGIST',
  'Tu ne mens pas tout le temps. Juste quand ça sert.': 'You don’t lie all the time. Just when it helps.',
  'LA COCOTTE-MINUTE': 'THE PRESSURE COOKER',
  'Tu contrôles absolument tout. Sauf toi.': 'You control absolutely everything. Except yourself.',
  'LE PROPRIÉTAIRE': 'THE OWNER',
  "Tu appelles ça de l'attention. Personne d'autre ne l'appelle comme ça.":
    'You call it attention. Nobody else calls it that.',
  'LE METTEUR EN SCÈNE': 'THE DIRECTOR',
  'Tout est réglé au millimètre, surtout le rôle des autres.':
    'Everything is planned down to the inch, especially everyone else’s part.',
  'LE REDRESSEUR': 'THE CORRECTOR',
  'Tu as raison, et tu comptes bien que ça se sache.': 'You’re right, and you make sure everyone knows it.',
  'LE COUP DE SANG': 'THE HOTHEAD',
  "Tu fais des dégâts vite, et tu t'excuses lentement.": 'You do damage fast and apologize slowly.',
  'LE CHARMEUR TOXIQUE': 'THE TOXIC CHARMER',
  "Ça marche à chaque fois. C'est bien ça, le problème.": 'It works every time. That’s exactly the problem.',
  'LE NARRATEUR': 'THE NARRATOR',
  "Dans chacune de tes histoires, tu es celui qu'on a mal compris.":
    'In every one of your stories, you’re the one who was misunderstood.',
  'LE DOUBLE DISCOURS': 'THE DOUBLE STANDARD',
  'Tes principes sont solides. Tes exceptions aussi.': 'Your principles are solid. So are your exceptions.',
  'LE VIEUX MONDE': 'THE OLD WORLD',
  "Tu dis que c'était mieux avant. Pas pour tout le monde.": 'You say things were better before. Not for everyone.',
  "L'ORAGE PERMANENT": 'THE PERMANENT STORM',
  'Tes proches regardent la météo avant de te parler.': 'The people close to you check the forecast before talking to you.',
  'LE CROISÉ': 'THE CRUSADER',
  "Tu ne t'énerves jamais pour rien. C'est bien ce qui inquiète.":
    'You never get angry over nothing. That’s what’s worrying.',
  'LE MALENTENDU': 'THE MISUNDERSTANDING',
  'Tu ne comprends pas pourquoi ça se termine toujours pareil.': 'You don’t get why it always ends the same way.',
  'LE THÉORICIEN': 'THE THEORIST',
  'Tu as un avis très construit sur la vie des autres.': 'You have very well-built opinions about other people’s lives.',
  'LE DONNEUR DE LEÇONS': 'THE LECTURER',
  'Tu as réfléchi à tout. Sauf à toi.': 'You’ve thought about everything. Except yourself.',
  'LE SURVEILLANT': 'THE WATCHER',
  "Tu sais toujours où est tout le monde. On ne t'a rien demandé.":
    'You always know where everyone is. Nobody asked you to.',
  "LE COURANT D'AIR": 'THE DISAPPEARING ACT',
  'On te trouve rarement au moment où il faudrait.': 'You’re rarely around when it matters.',
  'LA MÈCHE COURTE': 'THE SHORT FUSE',
  "Le problème n'est pas que tu t'énerves. C'est la vitesse.": 'The problem isn’t that you get angry. It’s how fast.',
  'LE CLASSIQUE': 'THE CLASSIC',
  'Tes idées sur les femmes datent. Toi, tu trouves qu\'elles tiennent.':
    'Your ideas about women are dated. You think they hold up.',
  'LE CENTRE DU MONDE': 'THE CENTER OF THE UNIVERSE',
  'La conversation revient toujours au même endroit.': 'The conversation always comes back to the same place.',
  'LE CONVAINCU': 'THE TRUE BELIEVER',
  'Tu as des certitudes. Beaucoup. Sur tout.': 'You have certainties. Lots of them. About everything.',

  // --- Catégories ----------------------------------------------------------
  'Emprise': 'Control',
  "Jalousie, surveillance, besoin de décider pour l'autre": 'Jealousy, monitoring, needing to decide for the other person',
  "Surveiller, fouiller, décider pour l'autre : ce sont des comportements qui ont un nom, et une échelle. Le violentomètre la donne.":
    'Monitoring, snooping, deciding for the other person: these behaviors have a name, and a scale. The violence meter (in French) lays it out.',
  'Loyauté': 'Loyalty',
  "Trahisons, mensonges, ce qu'on fait dans le dos des gens": 'Betrayals, lies, what you do behind people’s backs',
  'Colère & excès': 'Anger & excess',
  "Violence, alcool, ce qu'on fait subir aux autres": 'Violence, alcohol, what you put others through',
  "Certaines de tes réponses décrivent des situations qui font du mal, même quand elles paraissent banales de l'intérieur. Le violentomètre situe précisément où passe la limite.":
    'Some of your answers describe situations that hurt people, even when they feel ordinary from the inside. The violence meter (in French) shows exactly where the line is.',
  'Rapport aux femmes': 'Attitude toward women',
  'Positionnement, exigences, sexisme ordinaire': 'Stance, demands, everyday sexism',
  'Rapport à soi': 'Relationship with yourself',
  "Introspection, équilibre, place laissée à l'ego": 'Self-reflection, balance, how much room your ego gets',
  'Convictions': 'Beliefs',
  "Politique, croyance, ce qu'on est prêt à séparer": 'Politics, faith, what you’re willing to separate',

  // --- Maquette locale (mock) ----------------------------------------------
  'Communication': 'Communication',
  'Dire les choses, écouter, gérer un désaccord': 'Speaking up, listening, handling disagreement',
  'Respect': 'Respect',
  "Limites, consentement, considération de l'autre": 'Boundaries, consent, consideration for the other person',
  'Confiance': 'Trust',
  'Jalousie, transparence, fiabilité': 'Jealousy, transparency, reliability',
  'Contrôle': 'Control',
  "Emprise, surveillance, besoin de décider pour l'autre": 'Domination, monitoring, needing to decide for the other person',
  "Surveiller, fouiller, décider pour l'autre : ce sont des comportements qui ont un nom, et une échelle.":
    'Monitoring, snooping, deciding for the other person: these behaviors have a name, and a scale.',
  'Égoïsme': 'Selfishness',
  "Place laissée à l'autre, réciprocité, effort": 'Room left for the other person, give and take, effort',
  'LE DRAPEAU EST PLANTÉ': 'THE FLAG IS PLANTED',
  "On ne va pas te mentir, on a relu le résultat deux fois.": 'We won’t lie to you, we checked the result twice.',
  "Ton ex t'écrit à 2 h du matin. Tu fais quoi ?": 'Your ex texts you at 2 a.m. What do you do?',
  'Rien.': 'Nothing.',
  'Je lis, je ne réponds pas, et je relis quatre fois': 'I read it, don’t reply, and reread it four times',
  "Je réponds tout de suite, puis je passe la fin de la nuit à regretter chaque mot que j'ai envoyé":
    'I reply right away, then spend the rest of the night regretting every word I sent',
  "J'appelle.": 'I call.',
  'Tu as tapé, effacé, retapé. On a tous vu les trois petits points.':
    'You typed, deleted, retyped. We all saw the three little dots.',
  "Appeler un ex à 2 h du matin n'a jamais amélioré une situation. Jamais.":
    'Calling an ex at 2 a.m. has never made anything better. Ever.',
  'On te demande pardon. Tu réponds « c\'est rien » alors que ce n\'est pas rien ?':
    'Someone apologizes. You say “it’s nothing” when it isn’t nothing?',
  'Sois honnête, personne ne lit tes réponses.': 'Be honest, nobody reads your answers.',
  'Jamais': 'Never',
  'Tout le temps, et je le ressors trois semaines plus tard': 'All the time, and I bring it up again three weeks later',
  'Le pardon accepté en apparence est la plus lente des vengeances.': 'Forgiveness accepted on the surface is the slowest kind of revenge.',
  'Ton/ta partenaire sort sans toi. Ta première pensée ?': 'Your partner goes out without you. Your first thought?',
  'Tant mieux.': 'Good for them.',
  'Avec qui ?': 'With who?',
  "Je demande une photo du groupe, l'air de rien, juste pour situer l'ambiance":
    'I casually ask for a group photo, just to get a feel for the vibe',
  "« Juste pour situer l'ambiance » est la phrase la plus chargée de ce test.":
    '“Just to get a feel for the vibe” is the most loaded phrase in this test.',
  "Je regarde qui est en ligne pendant ce temps-là, et je note mentalement l'heure à laquelle chacun se déconnecte":
    'I check who’s online in the meantime and make a mental note of when each of them logs off',
  "Tu as transformé une soirée en enquête. Tu es douée ou doué, mais ce n'est pas rassurant.":
    'You turned a night out into an investigation. You’re good at it, but it’s not reassuring.',
  'Aucune.': 'None.',
  "La dernière fois que tu as dit « je vais changer », c'était il y a combien de temps ?":
    'The last time you said “I’m going to change” — how long ago was it?',
  "Je ne l'ai jamais dit, je préfère ne rien promettre": 'I’ve never said it, I’d rather not promise anything',
  "Il y a longtemps, et j'ai changé": 'A long time ago, and I did change',
  "La semaine dernière. Et la semaine d'avant. Et celle d'avant.": 'Last week. And the week before. And the one before that.',
  "Trois promesses en trois semaines : à ce rythme-là ce n'est plus une intention, c'est un abonnement.":
    'Three promises in three weeks: at that rate it’s not an intention anymore, it’s a subscription.',
  'Dernière question : tu penses que ce test va te donner raison ?': 'Last question: do you think this test will prove you right?',
  "Il n'y a qu'une seule réponse. C'est déjà une information.": 'There’s only one answer. That already tells you something.',
  "Tout le monde clique sur « oui ». C'est bien ça le problème.": 'Everyone clicks “yes.” That’s exactly the problem.',
};

/** Apostrophes, espaces insécables : la base et la maquette n'écrivent pas pareil. */
function cle(texte: string): string {
  return texte.replace(/[’‘]/g, "'").replace(/[  ]/g, ' ').replace(/\s+/g, ' ').trim();
}

const TABLE = new Map(Object.entries(CONTENU_EN).map(([fr, en]) => [cle(fr), en]));

/** Le texte dans la langue voulue ; le français tel quel s'il n'a pas de traduction. */
export function traduire(texte: string, langue: Langue): string;
export function traduire(texte: string | null, langue: Langue): string | null;
export function traduire(texte: string | null, langue: Langue): string | null {
  if (texte === null || langue === 'fr') return texte;
  return TABLE.get(cle(texte)) ?? texte;
}

/** Les textes qui n'ont pas de traduction : pour le test, et pour l'admin plus tard. */
export function nonTraduits(textes: Array<string | null>): string[] {
  return textes.filter((t): t is string => t !== null && !TABLE.has(cle(t)));
}

// ---------------------------------------------------------------------------
// Les phrases du serveur
// ---------------------------------------------------------------------------

/*
 * Les légendes des cohortes viennent de `score.ts`, qui ne les écrit qu'en
 * français. Leur liste est fermée — trois sexes, quatre tranches d'âge, quatre
 * cohortes — et le test passe chacune en revue : une forme nouvelle qui ne se
 * traduirait pas serait vue là.
 */

const SEXE_COURT_EN: Record<string, string> = {
  tous: 'everyone',
  hommes: 'men',
  femmes: 'women',
  autre: 'other',
  joueurs: 'players',
};

/** Les légendes courtes des classements : « hommes », « 23-26 ans », « 27 ans + ». */
export function legendeCourteEn(fr: string): string {
  if (fr in SEXE_COURT_EN) return SEXE_COURT_EN[fr];
  if (fr === 'ton âge') return 'your age';
  if (fr === '27 ans +') return '27+';
  const age = /^(\d+-\d+) ans$/.exec(fr);
  if (age) return age[1];
  return fr;
}

const SEXE_LONG_EN: Record<string, string> = {
  'des hommes': 'men',
  'des femmes': 'women',
  'des joueurs « autre »': '“other” players',
  'des joueurs': 'players',
};

function ageLongEn(fr: string): { seul: string; apres: string } | null {
  if (fr === 'ton âge') return { seul: 'players your age', apres: 'your age' };
  if (fr === '27 ans et plus') return { seul: 'players 27 and over', apres: '27 and over' };
  const m = /^(\d+-\d+) ans$/.exec(fr);
  return m ? { seul: `${m[1]} year-olds`, apres: `aged ${m[1]}` } : null;
}

/**
 * Les légendes longues de la comparaison, faites pour « la moyenne {légende} » :
 * « de tout le monde », « des hommes », « des 23-26 ans », « des hommes de
 * 23-26 ans ». En anglais, faites pour « the average for {légende} ».
 */
export function legendeLongueEn(fr: string): string {
  if (fr === 'de tout le monde') return 'everyone';
  if (fr in SEXE_LONG_EN) return SEXE_LONG_EN[fr];
  if (fr === 'de ton âge') return 'players your age';
  const seulAge = /^des (\d+-\d+ ans|27 ans et plus)$/.exec(fr);
  if (seulAge) return ageLongEn(seulAge[1])?.seul ?? fr;
  for (const [sexe, en] of Object.entries(SEXE_LONG_EN)) {
    if (fr.startsWith(`${sexe} de `)) {
      const age = ageLongEn(fr.slice(sexe.length + 4));
      if (age) return age.apres === 'your age' ? `${en} your age` : `${en} ${age.apres}`;
    }
  }
  return fr;
}

/** « seulement 3 participants » → « only 3 players ». */
export function avertissementEn(fr: string): string {
  const m = /^seulement (\d+) participants?$/.exec(fr);
  if (!m) return fr;
  const n = Number(m[1]);
  return `only ${n} player${n > 1 ? 's' : ''}`;
}

// ---------------------------------------------------------------------------
// Ce que les routes renvoient
// ---------------------------------------------------------------------------

export function traduireVerdict<V extends Pick<Verdict, 'titre' | 'soustitre'>>(v: V, langue: Langue): V {
  if (langue === 'fr') return v;
  return { ...v, titre: traduire(v.titre, langue), soustitre: traduire(v.soustitre, langue) };
}

export function traduireQuestions(questions: QuestionPublique[], langue: Langue): QuestionPublique[] {
  if (langue === 'fr') return questions;
  return questions.map((q) => ({
    ...q,
    texte: traduire(q.texte, langue),
    precision: traduire(q.precision, langue),
    reponses: q.reponses.map((r) => ({ ...r, texte: traduire(r.texte, langue) })),
  }));
}

function traduireClassement(c: Classement | null): Classement | null {
  if (!c) return c;
  return {
    ...c,
    legende: legendeCourteEn(c.legende),
    avertissement: c.avertissement && avertissementEn(c.avertissement),
  };
}

export function traduireResultat(r: Resultat, langue: Langue): Resultat {
  if (langue === 'fr') return r;
  const axe = <A extends { label: string }>(a: A): A => ({ ...a, label: traduire(a.label, langue) });
  return {
    ...r,
    verdict: r.verdict && traduireVerdict(r.verdict, langue),
    classements: {
      tous: traduireClassement(r.classements.tous),
      sexe: traduireClassement(r.classements.sexe),
      age: traduireClassement(r.classements.age),
    },
    axes: r.axes.map(axe),
    pointNoir: r.pointNoir && axe(r.pointNoir),
    comparaison: r.comparaison && { ...r.comparaison, legende: legendeLongueEn(r.comparaison.legende) },
    archetype: r.archetype && traduireVerdict(r.archetype, langue),
    reponseDecisive: r.reponseDecisive && {
      ...r.reponseDecisive,
      question: traduire(r.reponseDecisive.question, langue),
      reponse: traduire(r.reponseDecisive.reponse, langue),
    },
    ressources: r.ressources.map((x) => ({ ...x, label: traduire(x.label, langue), texte: traduire(x.texte, langue) })),
    highlights: r.highlights.map((h) => ({
      ...h,
      question: traduire(h.question, langue),
      reponse: traduire(h.reponse, langue),
      pique: traduire(h.pique, langue),
    })),
  };
}

export function traduireStats(stats: StatQuestion[], langue: Langue): StatQuestion[] {
  if (langue === 'fr') return stats;
  return stats.map((q) => ({
    ...q,
    texte: traduire(q.texte, langue),
    reponses: q.reponses.map((r) => ({ ...r, texte: traduire(r.texte, langue) })),
  }));
}

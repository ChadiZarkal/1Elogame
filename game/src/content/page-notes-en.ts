/**
 * @module content/page-notes-en
 * Les notes éditoriales de `content/page-notes.ts`, en anglais, pour les pages
 * sous `/en` (traduction du 2026-11-14).
 *
 * Une constante `*_EN` par constante française, de même type.
 * `DIXMAIS_NOTES_EN` a suivi le 2026-11-14, avec la traduction du jeu.
 *
 * BRANCHER UNE PAGE ANGLAISE
 *   <PageNotes notes={notesPour('en', JEU_NOTES)} langue="en" />
 *   ou directement `notes={JEU_NOTES_EN}`. `notesPour` rend le français tel
 *   quel pour `'fr'`, et aussi pour des notes sans version anglaise (celles
 *   que `/classement` assemble à la volée).
 *   Le `langue="en"` de `PageNotes` traduit ses libellés fixes (« Frequently
 *   asked questions », « Related pages »).
 *
 * Les liens « related » pointent déjà vers les adresses anglaises
 * (`cheminLocalise`). Les numéros d'aide sont ceux de la France, et le texte
 * le dit.
 */

import { CONTACT_EMAIL, INSTAGRAM_HANDLE } from '@/config/contact';
import { cheminLocalise, type Langue } from '@/lib/i18n/langue';
import {
  DIXMAIS_NOTES,
  HOME_NOTES,
  JEU_NOTES,
  ORACLE_NOTES,
  RESSOURCES_NOTES,
  type PageNotes,
} from './page-notes';

const EMERGENCY_EN =
  'If you are in immediate danger in France: 17 (police emergency), 3919 (helpline for women facing violence, free and anonymous), 119 (children at risk). Anywhere in the EU, 112 also works.';

const en = (chemin: string) => cheminLocalise('en', chemin);

// ---------------------------------------------------------------------------
// Accueil
// ---------------------------------------------------------------------------

export const HOME_NOTES_EN: PageNotes = {
  title: 'What this site is for',
  lede:
    '“Red flag” now gets used for everything from a mildly annoying habit to genuinely dangerous behavior. Red or Green tries to put that scale back in order, by letting people vote instead of deciding for them.',
  blocks: [
    {
      heading: 'The problem this site tackles',
      body: [
        'The term has been slapped on everything until it lost its meaning. When “uses semicolons in texts” and “reads my messages” get the same label, two things happen at once: serious behavior starts to look normal, and ordinary disagreements start to look like emergencies.',
        'No editorial team can decide on its own where the line is: that is exactly what people disagree about. Hence the site’s approach: measure the disagreement instead of denying it, by asking thousands of people to choose between two behaviors, then publishing the gaps.',
      ],
    },
    {
      heading: 'Which game does what',
      bullets: [
        'The Worse of Two — two behaviors, you pick the worse one. This is the game that feeds the rankings.',
        'It’s a 10, but… — one profile, seven facts rated one at a time: red flags push the score below 10, green flags can lift it as high as 15. The final score is the average of the seven.',
        'The Oracle — you describe a situation, a generative AI model gives a blunt verdict. Take it for what it is: a conversation starter, not expert advice.',
      ],
    },
    {
      heading: 'What the votes have produced',
      body: [
        'The votes feed an Elo-based ranking, kept separately for each group players declare: men, women, and four age brackets. That split is what makes the site useful beyond the game: on some behaviors, the gap in judgment between two groups is more than 200 points — wider than the gap between a harmless behavior and a serious one.',
        'The Observatory breaks those divides down: where men and women disagree most, what separates the generations, and, at the other end, the behaviors everyone agrees on. The methodology page explains the math and the biases we own up to.',
      ],
    },
    {
      heading: 'The flag vocabulary',
      bullets: [
        'Green flag — a reassuring sign that the person can do something hard.',
        'White flag — a harmless quirk, something you notice that doesn’t commit you to anything.',
        'Orange flag — a point of friction. It calls for a conversation, not a decision.',
        'Red flag — behavior that does damage, usually repeatedly. It calls for a decision.',
        'Black flag — a non-negotiable line: violence, coercion, putting someone in danger.',
      ],
    },
    {
      heading: 'What this site doesn’t do',
      body: [
        'Nothing here is a diagnosis, psychological advice or legal advice. The rankings describe the opinions of the people who play — a self-selected sample, not the French population — and a behavior’s rank says nothing about any particular relationship.',
        'To take stock of a real situation, the self-assessment tools use scales published by public institutions and nonprofits. ' +
          EMERGENCY_EN,
      ],
    },
    {
      heading: 'Privacy',
      body: [
        'The site works without an account or an email address. The age bracket and gender asked before a game are used only for the group rankings and are not tied to any identity. The self-assessment questionnaires run entirely in your browser, and your answers are never sent anywhere.',
      ],
    },
  ],
  faq: [
    {
      question: 'Is the site free?',
      answer:
        'Yes, completely, and with no account. No game or tool is locked, and no email address is ever asked for.',
    },
    {
      question: 'Who decides what counts as a red flag?',
      answer:
        'Nobody — that’s the whole point. The ranking comes from players’ choices: every duel won or lost moves a behavior’s score. The editorial team chooses which behaviors are put to the vote, not where they end up.',
    },
    {
      question: 'Where do the self-assessment tools come from?',
      answer:
        'The violence meter, the consent meter and the incest meter are based on scales published by French public institutions and nonprofits, credited on the sources page. The harassment meter and the discrimination meter are adaptations we wrote ourselves.',
    },
    {
      question: 'Is the content suitable for minors?',
      answer:
        'The “Love & Sex” category is not shown to players who select the 16–18 age bracket. The rest of the site is suitable for all audiences, but it deals with serious topics — violence, coercive control, consent — sometimes in a light tone.',
    },
    {
      question: 'How can I contact you?',
      answer:
        `By email at ${CONTACT_EMAIL}, for any question, correction, behavior suggestion or removal request. The site is also on Instagram at @${INSTAGRAM_HANDLE}.`,
    },
  ],
  related: [
    { href: en('/guide'), label: 'Flag guide' },
    { href: en('/classement'), label: 'Red flag rankings' },
    { href: en('/observatoire'), label: 'The Observatory' },
    { href: en('/methodologie'), label: 'Methodology' },
    { href: en('/ressources'), label: 'Self-assessment tools' },
    { href: en('/a-propos'), label: 'About' },
  ],
};

// ---------------------------------------------------------------------------
// Red or Green — le duel
// ---------------------------------------------------------------------------

export const JEU_NOTES_EN: PageNotes = {
  title: 'How this game works',
  lede:
    'Red or Green puts two behaviors side by side and asks you to pick the worse one. Here’s what the game actually measures, how the votes build the ranking, and what the numbers don’t tell you.',
  blocks: [
    {
      heading: 'What the game asks you',
      body: [
        'Two behaviors appear. You pick the one that seems more problematic to you. There’s no right answer: the question is about your judgment, not an established truth.',
        'Once you’ve chosen, the game shows the share of players who made the same call on that exact duel. It measures how much you agree with the community — it’s not a score for getting it right.',
      ],
    },
    {
      heading: 'Why compare instead of rate',
      body: [
        'Asking people to “rate this behavior from 1 to 10” produces answers that are hard to use. Everyone sets their own scale, two people who answer 7 don’t necessarily mean the same thing, and ratings tend to bunch up in the middle.',
        'A comparison doesn’t have that problem. Choosing between two options forces a decision, and the result reads the same way from one player to the next. It’s the same principle used to rank chess players: you don’t measure a level in the abstract, you look at who beats whom.',
      ],
    },
    {
      heading: 'How a vote becomes a ranking',
      body: [
        'Every behavior starts with a score of 1,000 points. After a duel, the winner takes points from the loser. How many depends on the gap between them: beating a behavior already judged very problematic earns a lot, beating a harmless one earns little.',
        'A newly added behavior moves fast, then settles as votes pile up — past about a hundred duels, it only moves with many consistent votes. The methodology page explains the math in detail.',
      ],
    },
    {
      heading: 'What this game doesn’t measure',
      bullets: [
        'It’s not a representative survey. The voters are people who chose to play, not a designed panel: the results describe this community, not the French population.',
        'It’s not a diagnosis. A behavior near the top reflects a widely shared judgment, not a verdict on a person or a real relationship.',
        'Context is missing. A single sentence says nothing about how often something happens, the intent behind it, or its real effect on the person affected — three things that change everything.',
        'The game’s tone affects the answers. Some prompts are deliberately lighthearted, and all of them are voted on in a playful setting.',
      ],
    },
    {
      heading: 'If a behavior describes what you’re going through',
      body: [
        'The ranking is something to talk about, not a personal assessment tool. To take stock of a real situation, the self-assessment tools in our resources — the violence meter, the consent meter — are built for that and rely on scales published by public institutions.',
        EMERGENCY_EN,
      ],
    },
  ],
  faq: [
    {
      question: 'Do I need an account to play?',
      answer:
        'No. No account is needed and no email address is asked for. The game runs in your browser.',
    },
    {
      question: 'Why does the game ask for my age and gender?',
      answer:
        'Only to feed the group rankings, which measure the gaps in judgment between men and women or between age brackets. These two answers aren’t tied to any identity and aren’t used for anything else.',
    },
    {
      question: 'Is everyone shown the same duels?',
      answer:
        'No. Pairs are drawn each round using several strategies: matching two behaviors with similar scores for a close duel, mixing two categories, or picking at random so that rarely seen prompts get votes. A duel you’ve already played in a session won’t come back.',
    },
    {
      question: 'Can I suggest a behavior?',
      answer:
        `Prompts are written and reviewed before they go into the game: they aren’t generated automatically. Suggestions can be sent to ${CONTACT_EMAIL}.`,
    },
    {
      question: 'Is the game suitable for minors?',
      answer:
        'The “Love & Sex” category is not shown to players who select the 16–18 age bracket, and they can’t choose it either. The rest of the content is suitable for all audiences.',
    },
  ],
  related: [
    { href: en('/classement'), label: 'The full ranking' },
    { href: en('/methodologie'), label: 'How the score works' },
    { href: en('/guide'), label: 'Flag guide' },
    { href: en('/observatoire'), label: 'The Disagreement Observatory' },
  ],
};

// ---------------------------------------------------------------------------
// Oracle
// ---------------------------------------------------------------------------

export const ORACLE_NOTES_EN: PageNotes = {
  title: 'About the Oracle',
  lede:
    'You describe a behavior, a situation or a thing, and the Oracle gives a verdict: red flag or green flag. Here’s how that verdict is made, and how much weight it deserves.',
  blocks: [
    {
      heading: 'How the verdict is made',
      body: [
        'The Oracle runs on a generative language model. What you submit is sent to it along with instructions about tone, and the model returns a verdict with a short explanation. No hand-written rule decides the outcome, and no human reviews it before it’s shown.',
        'The tone is deliberately blunt and sarcastic: that’s a game choice, not a claim to expertise. Two very similar submissions can get different verdicts, and the same text may not get the same answer twice.',
      ],
    },
    {
      heading: 'Why “is this a red flag?” is the wrong question',
      body: [
        'Almost no behavior is a problem in itself. What makes it one is everything the question leaves out: how often it happens, the power dynamic, what it does to the person on the receiving end, and whether they could say so without it being used against them.',
        'The same gesture can be harmless between two people and part of a pattern of control between two others. That’s why a one-line verdict — ours or anyone’s — can’t settle a real situation.',
      ],
    },
    {
      heading: 'How to read a verdict',
      bullets: [
        'As a fun hot take meant to start a conversation — not as expert advice.',
        'A “red” verdict doesn’t mean the situation is serious, and a “green” verdict doesn’t mean it’s healthy.',
        'The model has blind spots and biases. It knows nothing about your context or your story.',
        'Nothing the Oracle produces is psychological, legal or medical advice.',
      ],
    },
    {
      heading: 'Going beyond the verdict',
      body: [
        'The flag guide offers a more useful grid than a yes-or-no verdict: five levels, from green flag to black flag, with what separates a disagreement from a warning sign. For a personal situation, the self-assessment tools rely on scales published by public institutions and ask the right questions in the right order.',
        EMERGENCY_EN,
      ],
    },
  ],
  faq: [
    {
      question: 'Is the Oracle’s verdict generated by AI?',
      answer:
        'Yes. The verdict and its explanation are produced by a generative language model, with no human review before they’re shown. The sarcastic tone is part of the game.',
    },
    {
      question: 'Why doesn’t the same text always get the same answer?',
      answer:
        'Because a generative model isn’t deterministic: it produces a plausible answer, not a single one. One more reason not to treat the verdict as an authority.',
    },
    {
      question: 'Are my submissions public?',
      answer:
        'Submissions may appear in the community feed shown on the page. A private mode lets you submit a text without it showing up there.',
    },
    {
      question: 'Can the Oracle be wrong?',
      answer:
        'All the time, by design. It knows nothing about the context, the frequency or the power dynamics — the three things that actually decide whether a behavior is a problem.',
    },
  ],
  related: [
    { href: en('/guide'), label: 'Flag guide' },
    { href: en('/classement'), label: 'Red flag rankings' },
    { href: en('/ressources'), label: 'Self-assessment tools' },
    { href: en('/a-propos'), label: 'About this site' },
  ],
};

// ---------------------------------------------------------------------------
// Ressources
// ---------------------------------------------------------------------------

export const RESSOURCES_NOTES_EN: PageNotes = {
  title: 'How to use these tools',
  lede:
    'These five questionnaires are not games. They reproduce, or adapt, scales published by French public institutions and nonprofits to help you name a situation that’s hard to put into words.',
  blocks: [
    {
      heading: 'Why a “meter”',
      body: [
        'The format comes from the violentomètre (violence meter), a graded ruler handed out in France by local governments and anti-violence organizations. Its value rests on a simple idea: behaviors sit on a spectrum, not in two boxes. Between a healthy relationship and outright violence there’s a gray zone where many people find themselves without being able to name it.',
        'Going through a list of concrete situations works better than asking yourself “is everything OK?” The big question invites a big answer, often a reassuring one; the list makes you look at the facts one at a time.',
      ],
    },
    {
      heading: 'Choosing the right tool',
      bullets: [
        'The violence meter is about romantic relationships: control, pressure, isolation, violence.',
        'The consent meter is about whether consent is respected, in romantic relationships as well as friendships, at school or at work.',
        'The incest meter is about boundaries being crossed within the family.',
        'The harassment meter is about harassment, online, at school or at work.',
        'The discrimination meter is about discrimination experienced in everyday life.',
      ],
    },
    {
      heading: 'How to read a result',
      body: [
        'The result places you on a level; it doesn’t hand down a verdict. A low score doesn’t prove everything is fine: these scales don’t cover every form a difficult situation can take, and a single answer can be reason enough to talk to someone.',
        'Likewise, a high score is not a legal finding. It means a set of warning signs is present and that the situation is worth bringing to a trained professional.',
      ],
    },
    {
      heading: 'Anonymity',
      body: [
        'The questionnaires run entirely in your browser. Your answers are not sent, not stored and not linked to any identity: nothing leaves your device, and closing the page erases everything.',
      ],
    },
    {
      heading: 'These tools don’t replace real support',
      body: [
        'No questionnaire makes a diagnosis and none replaces a professional — a doctor, psychologist, social worker, lawyer or specialized organization. They help you put words to things, which is often the missing step before reaching out for help.',
        EMERGENCY_EN,
      ],
    },
  ],
  faq: [
    {
      question: 'Are my answers saved?',
      answer:
        'No. The questionnaires run entirely in your browser: no answer is sent to a server, stored or tied to an identity.',
    },
    {
      question: 'Where do these questionnaires come from?',
      answer:
        'The violence meter, the consent meter and the incest meter are based on scales published by French public institutions and nonprofits, credited on our sources page. The harassment meter and the discrimination meter are adaptations we wrote ourselves and aren’t based on any official scale.',
    },
    {
      question: 'Does a reassuring result mean everything is fine?',
      answer:
        'No. These scales don’t cover every possible situation. If something worries you without showing up in the questions, it’s still worth talking about.',
    },
    {
      question: 'Do these tests make a diagnosis?',
      answer:
        'No, and none of them claims to. They help you name a situation; assessing it is a job for trained professionals.',
    },
  ],
  related: [
    { href: en('/sources'), label: 'Sources and credits' },
    { href: en('/guide'), label: 'Flag guide' },
    { href: en('/a-propos'), label: 'About this site' },
    { href: en('/methodologie'), label: 'Methodology' },
  ],
};

// ---------------------------------------------------------------------------
// C'est un 10 mais… — « It's a 10 but… »
// ---------------------------------------------------------------------------

export const DIXMAIS_NOTES_EN: PageNotes = {
  title: 'How the “He’s a 10 but…” game works',
  lede:
    'It’s the “He’s a 10 but…” trend, also played as “She’s a 10 but…”: someone is a perfect 10, but there’s a catch. One profile, seven reveals: red flags and green flags. You rate each one on its own, from 0 to 15, and the person gets the average of all seven. The game doesn’t ask whether a behavior is serious in the abstract — it asks what it costs them in your eyes, or what it earns them.',
  blocks: [
    {
      heading: 'The rule',
      body: [
        'Each reveal comes as a sentence: “It’s a 10, but…” for a red flag, “It’s a 10, and on top of that…” for a green flag. You say what the person is worth based on that alone, starting from 10. Then the next reveal arrives, and the slider resets to 10.',
        'A red flag pulls the score down. A green flag can push it above 10, all the way to 15: a 14/10 is a quality that truly won you over. After the seventh reveal, the seven scores merge into one: the average, which becomes the person’s score. A 0 weighs heavily, but it doesn’t end the round.',
      ],
    },
    {
      heading: 'Why rate each reveal on its own',
      body: [
        'Judging a single flaw is simpler and more honest: you’re not asking what the other six are worth, you’re asking what this one is worth. Every score becomes comparable from one player to the next.',
        'The average does the rest. It shows what a single sentence can do to a profile — and how many good qualities it takes to make up for it. That’s why the score can go above 10: on a scale that stops at 10, a quality rated on its own could never earn anything.',
      ],
    },
    {
      heading: 'What your final score says',
      body: [
        'Two players can land on the same average by opposite routes: one gave 6 across the board, the other gave six 7s and a 0. The number doesn’t tell them apart — the seven scores do.',
        'That’s why the game shows the math rather than just the result, and points out the reveal that cost the average the most — and the one that added the most.',
      ],
    },
    {
      heading: 'What this game isn’t',
      bullets: [
        'It’s not a compatibility test: the profiles are fictional, pieced together at random from a catalog of statements.',
        'It’s not an opinion about a real person. The reveals are deliberately over the top; that’s what makes the trade-offs playable.',
        'The aggregate scores describe the players on this site, not public opinion at large. The sample is self-selected.',
      ],
    },
    {
      heading: 'When the game touches on serious subjects',
      body: [
        'Some reveals describe behaviors that, outside the game, amount to violence or coercive control. The playful format doesn’t make them any less serious. If one of them echoes what you’re going through, the self-assessment tools in our resources section are designed to help you see things more clearly.',
        EMERGENCY_EN,
      ],
    },
  ],
  faq: [
    {
      question: 'How many reveals per profile?',
      answer:
        'Seven: five red flags and two green flags. Enough for the average to mean something, few enough to move quickly from one profile to the next.',
    },
    {
      question: 'Why can you go above 10?',
      answer:
        'Because green flags need to be able to earn something. Every profile starts at 10: a flaw pulls it down, a good quality can push it up to 15. So a profile can end up at 12/10.',
    },
    {
      question: 'What happens if I give a 0?',
      answer:
        'Nothing stops: the 0 counts toward the average like any other score. It just weighs a lot — next to a 10, it takes nearly a point and a half off an average of seven scores.',
    },
    {
      question: 'Are the profiles real people?',
      answer:
        'No. The first name, the age and the reveals are pieced together at random from a catalog of statements written in advance. No profile matches anyone.',
    },
    {
      question: 'Will I see the same reveals again?',
      answer:
        'Not within the same session: reveals you’ve already rated are left out of the next draws until the catalog runs out.',
    },
    {
      question: 'Do I need an account?',
      answer:
        'No. The game asks for no account and no email address. Scores are sent anonymously to feed the leaderboard of reveals.',
    },
  ],
  related: [
    { href: en('/dixmais/leaderboard'), label: 'Leaderboard of reveals' },
    { href: en('/guide'), label: 'Flag guide' },
    { href: en('/jeu'), label: 'The Worse of Two — the duel' },
    { href: en('/ressources'), label: 'Self-assessment tools' },
  ],
};

// ---------------------------------------------------------------------------
// Correspondance
// ---------------------------------------------------------------------------

/** Chaque note française et sa version anglaise. */
export const NOTES_TRADUITES: ReadonlyMap<PageNotes, PageNotes> = new Map<PageNotes, PageNotes>([
  [HOME_NOTES, HOME_NOTES_EN],
  [JEU_NOTES, JEU_NOTES_EN],
  [ORACLE_NOTES, ORACLE_NOTES_EN],
  [RESSOURCES_NOTES, RESSOURCES_NOTES_EN],
  [DIXMAIS_NOTES, DIXMAIS_NOTES_EN],
]);

/**
 * Les notes d'une page dans la langue voulue. `notes` est la constante
 * française ; sans version anglaise, elle est rendue telle quelle.
 */
export function notesPour(langue: Langue, notes: PageNotes): PageNotes {
  return langue === 'en' ? (NOTES_TRADUITES.get(notes) ?? notes) : notes;
}

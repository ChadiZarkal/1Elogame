/**
 * Version anglaise de `../boss-collegues.ts` (2026-11-14). Mêmes chiffres,
 * même adresse ; les liens internes restent écrits en français, le rendu les
 * localise. Les sources sont des publications françaises : titres d'origine.
 */

import type { Article } from '../types';
import { bossCollegues } from '../boss-collegues';

export const bossColleguesEn: Article = {
  slug: bossCollegues.slug,
  titre: 'Sleeping with your boss, hitting on coworkers: men and women don’t see the same red flag',
  chapo:
    'Two office behaviors, two mirror-image verdicts. Men rank “sleeping with your boss” as the 2nd worst red flag; women put it 33rd. For “hitting on coworkers,” it’s the other way around: 10th for women, 39th for men. What that gap says — and what it doesn’t.',
  description:
    'Sleeping with your boss: 2nd-worst red flag for men, 33rd for women. Hitting on coworkers: the reverse. An analysis of thousands of votes, and what the gap reveals.',
  emoji: bossCollegues.emoji,
  auteur: 'The Red or Green team',
  publie: bossCollegues.publie,
  misAJour: bossCollegues.misAJour,
  chiffresAu: 'September 29, 2026',
  blocs: [
    { type: 'h2', texte: 'What the votes say' },
    {
      type: 'p',
      texte:
        'In [The Worse of Two](/jeu), each player sees two behaviors and picks the worse one. Players state their gender before they start, so for each behavior we can count how often men and women picked it as the worse of the two.',
    },
    {
      type: 'tableau',
      legende:
        'Share of duels in which each behavior was picked as the worse one, and its rank among the game’s 266 behaviors, by the gender of the person voting.',
      entetes: ['', 'Men', 'Women'],
      lignes: [
        ['Sleeping with your boss', '75% of duels · 2nd', '59% of duels · 33rd'],
        ['Hitting on coworkers', '54% of duels · 39th', '69% of duels · 10th'],
      ],
    },
    {
      type: 'p',
      texte:
        'The two gaps run in opposite directions. On “sleeping with your boss,” men are the harsher judges; on “hitting on coworkers,” it’s women. And these aren’t two random behaviors: both are about the workplace, about desire, and about who has the power to say no.',
    },

    { type: 'h2', texte: 'A real gap, to be read with caution' },
    {
      type: 'p',
      texte:
        'These percentages are based on **79 duels voted by men** and **more than 110 duels voted by women** for each of the two behaviors. That’s enough for a fifteen-point gap not to be a fluke: for each of them, the probability that a gap that size comes from chance alone is less than one in twenty.',
    },
    {
      type: 'p',
      texte:
        'That’s a threshold, not proof. Among the 146 behaviors with enough votes from both genders to be compared, chance alone would produce about seven gaps this size; we count fifteen. In other words, some of the gaps on the list are noise. What sets these two apart is that they form a pair: two similar situations, two reversed verdicts. A statistical accident doesn’t draw a mirror image.',
    },
    {
      type: 'encadre',
      titre: 'Why these two behaviors don’t appear in the rankings',
      paragraphes: [
        'The game files them under its “Love & Sex” category. That category is played between adults but isn’t published in the site’s rankings, because it includes explicit prompts. These two aren’t explicit: they’re about work, and that’s why they’re analyzed here.',
      ],
    },

    { type: 'h2', texte: '“Sleeping with your boss”: two readings' },
    {
      type: 'p',
      texte:
        'The phrase is neutral: it doesn’t say who is sleeping with whom. The whole gap comes down to what each person reads into it.',
    },
    {
      type: 'p',
      texte:
        '**The reading we argue for** is that the phrase doesn’t call up the same person depending on who reads it. For many men, “sleeping with your boss” revives the old suspicion of sleeping your way to the top: someone — usually imagined as a woman — getting through bed what they couldn’t get through work. The red flag then targets less a behavior than a person suspected of cheating. And that suspicion has a gender: in that sense, the gap can be read as a trace of everyday misogyny in the vote.',
    },
    {
      type: 'p',
      texte:
        '**Another reading doesn’t rule it out.** For many women, a relationship with a superior first raises the question of the power imbalance: can you really say no to the person who decides your job? Whoever gives in is then less a cheater than a person who has been put at risk. Judging less harshly would mean refusing to blame the most vulnerable person in the situation.',
    },
    {
      type: 'p',
      texte:
        'The votes don’t say which of these readings is right: they don’t say who the voter has in mind. They say that men and women don’t put the same thing behind the same words.',
    },

    { type: 'h2', texte: '“Hitting on coworkers”: women know what they’re talking about' },
    {
      type: 'p',
      texte:
        'The second gap is easier to understand, because surveys shed direct light on it. In 2014, an Ifop study for the Défenseur des droits (France’s independent rights ombudsman) found that **one working woman in five** said she had faced sexual harassment at work — a share unchanged since 1991. And in **41% of cases**, the perpetrator was **a coworker** with no authority over the victim: more often than the boss or a manager. In 2018, another Ifop survey, using the legal definition of harassment, put the share at **nearly one woman in three**.',
    },
    {
      type: 'p',
      texte:
        'When a woman reads “hitting on coworkers,” she isn’t thinking of an abstraction. She’s thinking of something one in five women has lived through, which most often comes from the next desk over. The severity of the vote has a history.',
    },
    {
      type: 'p',
      texte:
        'Hitting on someone isn’t harassment, and the game doesn’t say “harassing.” But French law draws the line at a specific point: **repeated** comments or behavior with a sexual connotation that humiliate or intimidate. That’s exactly where the disagreement lives. What is still flirting to one person may be, to the other, the third comment of the week.',
    },
    {
      type: 'p',
      texte:
        'The same survey measured this gap in perception. **59% of men** felt that a workplace full of sexual jokes doesn’t amount to harassment, compared with 48% of women. For displaying sexual images, the gap was 41% versus 26%. The site’s votes tell the same story, twelve years later, in different words.',
    },

    { type: 'h2', texte: 'What it says, and what it doesn’t' },
    {
      type: 'liste',
      items: [
        '**It says** that when it comes to desire and power at work, the men and women who play don’t draw the line in the same place.',
        '**It doesn’t say** that men approve of persistent advances, or that women approve of relationships with a superior: both genders rate both behaviors as fairly serious. The gap is about degree, not principle.',
        '**It doesn’t say** what people in France think. Players are a self-selected, fairly young sample — nearly eight votes in ten come from people under 27: these numbers describe the site’s community.',
        '**Finally, it says** that the same sentence can describe two different situations depending on who reads it. That may be the game’s most useful lesson: before arguing over a red flag, check that you’re talking about the same thing.',
      ],
    },

    { type: 'h2', texte: 'When it’s no longer a game' },
    {
      type: 'p',
      texte:
        'In France, sexual harassment at work is a criminal offense. You can refer a case to the Défenseur des droits free of charge; the labor inspectorate and occupational health services are other options. In cases of violence, the 3919 helpline answers 24/7. The site’s [self-assessment tools](/ressources) help put words to a situation, without replacing a professional.',
    },
  ],
  suite: [
    { href: '/red-flags', label: 'The worst red flags, according to the votes' },
    { href: '/observatoire', label: 'The Observatory: where men and women disagree' },
    { href: '/articles/red-flags-hommes-femmes-presque-d-accord', label: 'Red flags: men and women (almost) agree' },
    { href: '/methodologie', label: 'How the ranking is calculated' },
  ],
  // Publications françaises : titres d'origine, éditeur et date traduits.
  sources: [
    {
      titre: 'Enquête sur le harcèlement sexuel au travail — note de synthèse',
      editeur: 'Ifop for the Défenseur des droits (in French)',
      date: 'January 2014',
      url: 'https://www.defenseurdesdroits.fr/sites/default/files/2023-10/ddd_etu_20140301_harcelement_sexuel_synthese_ifop.pdf',
    },
    {
      titre: 'Les Françaises face au harcèlement sexuel au travail',
      editeur: 'Ifop for VieHealthy.com (in French)',
      date: 'January 2018',
      url: 'https://www.ifopgroup.com/article/les-francaises-face-au-harcelement-sexuel-au-travail-entre-meconnaissance-et-resignation/',
    },
  ],
};

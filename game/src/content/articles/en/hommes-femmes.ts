/**
 * Version anglaise de `../hommes-femmes.ts` (2026-11-14). Mêmes chiffres,
 * même adresse. Les comportements cités sont traduits : dans le jeu, ils sont
 * votés dans leur formulation française.
 */

import type { Article } from '../types';
import { hommesFemmes } from '../hommes-femmes';

export const hommesFemmesEn: Article = {
  slug: hommesFemmes.slug,
  titre: 'Red flags: men and women (almost) agree',
  chapo:
    'We expected a battle of the sexes. On everyday behaviors, the votes say the opposite: men and women pick the same worst red flags, and the same harmless behaviors. The few disagreements that remain fit in a handful — and they’re not where you’d expect.',
  description:
    'The top red flags and most harmless behaviors for men and for women, based on thousands of votes: what everyone agrees on, and the rare clear gaps.',
  emoji: hommesFemmes.emoji,
  auteur: 'The Red or Green team',
  publie: hommesFemmes.publie,
  misAJour: hommesFemmes.misAJour,
  chiffresAu: 'September 29, 2026',
  blocs: [
    { type: 'h2', texte: 'The worst red flags: the same podium, almost' },
    {
      type: 'p',
      texte:
        'In [The Worse of Two](/jeu), you pick the worse of two behaviors. So for each behavior we can measure the share of its duels in which it was picked as the worse one, by the gender of the person voting. At the top of both rankings sits the same family: **hygiene**.',
    },
    {
      type: 'tableau',
      legende:
        'The behaviors most often picked as the worse one, by men and by women: share of duels in which they were picked.',
      entetes: ['', 'Men', 'Women'],
      lignes: [
        ['Having dragon breath', '76%', '84%'],
        ['Eating your boogers', '74%', '79%'],
        ['Showering once a week', '78%', '66%'],
        ['Never brushing your teeth in the morning', '78%', '66%'],
        ['Wearing the same underwear three days in a row', '75%', '69%'],
        ['Never flushing the toilet', '65%', '79%'],
      ],
    },
    {
      type: 'p',
      texte:
        'The numbers shift by a few points from one gender to the other, but none of these gaps is clear-cut: with a few dozen duels per behavior, they stay within the margin of chance. What dominates is agreement. Women add “selling bogus online courses” (77%) and “constantly interrupting people” (74%) near the top of their list; men add “talking loudly on public transit” (82%). Again, with no significant gap with the other gender.',
    },

    { type: 'h2', texte: 'At the other end: what nobody finds serious' },
    {
      type: 'p',
      texte:
        'The bottom of the ranking is just as much a consensus. For men and women alike, it’s full of victimless pleasures: **reading manga** (picked in 19% of duels by men, 33% by women), **singing in the shower** (22% and 32%), **doing yoga every day** (24% and 34%). Among women, the least picked are **liking wine** (22%), **running marathons** (22%) and **crying in public** (24%).',
    },
    {
      type: 'p',
      texte:
        'A behavior that loses almost all its duels isn’t a green flag for all that — nobody voted to say that liking wine is a virtue. For players, it’s simply harmless. What green flags really are is explained in the [flag guide](/guide).',
    },

    { type: 'h2', texte: 'The rare clear disagreements' },
    {
      type: 'p',
      texte:
        'Of the 111 everyday behaviors with enough votes on both sides to be compared, only **seven** show a clear gap between men and women. Six of them point the same way: men are the harsher judges.',
    },
    {
      type: 'tableau',
      legende:
        'The everyday behaviors where the gap between men and women is statistically clear: share of duels in which they were picked as the worse one.',
      entetes: ['', 'Men', 'Women'],
      lignes: [
        ['Working in HR', '68%', '44%'],
        ['Being a DJ', '59%', '35%'],
        ['Dodging transit fares', '59%', '35%'],
        ['Coding in your free time', '58%', '34%'],
        ['Crying in public', '45%', '24%'],
        ['Running marathons', '43%', '22%'],
        ['Collecting figurines', '28%', '50%'],
      ],
    },
    {
      type: 'p',
      texte:
        'The most telling may be **“crying in public”**: picked as the worse one almost twice as often by men as by women. A lead, not a proof: it’s something boys are often taught not to do, and it wouldn’t be surprising if those who learned not to cry judge it more harshly in others. Conversely, women are clearly harsher than men about **figurines** — the only clear gap in that direction.',
    },
    {
      type: 'encadre',
      titre: 'Why caution is in order',
      paragraphes: [
        'Across 111 comparisons, chance alone would produce about six gaps this size. We count seven. In other words, several lines in the table are probably coincidences, though we can’t say which. These gaps are clues, not conclusions.',
        'Players are also a self-selected and fairly young sample — nearly eight votes in ten come from people under 27. These numbers describe the site’s community, not people in France as a whole.',
      ],
    },

    { type: 'h2', texte: 'The real disagreement is elsewhere' },
    {
      type: 'p',
      texte:
        'Men and women may agree on bad breath, boogers and the weekly shower, but they split clearly as soon as desire and power at work come up. “Sleeping with your boss” and “hitting on coworkers” are the most striking example: two exactly reversed verdicts, analyzed in [our dedicated article](/articles/coucher-avec-son-boss-draguer-ses-collegues).',
    },
    {
      type: 'p',
      texte:
        'The gaps by age bracket, and the behaviors that divide all groups the most, are tracked continuously in the [Observatory](/observatoire). And the full ranking, updated every hour, is on the [worst red flags](/red-flags) page.',
    },
  ],
  suite: [
    { href: '/articles/coucher-avec-son-boss-draguer-ses-collegues', label: 'Sleeping with your boss, hitting on coworkers: the real disagreement' },
    { href: '/red-flags', label: 'The worst red flags, according to the votes' },
    { href: '/observatoire', label: 'The Observatory' },
    { href: '/jeu', label: 'Vote in The Worse of Two' },
  ],
  sources: [],
};

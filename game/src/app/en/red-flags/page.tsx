import type { Metadata } from 'next';
import { PageRedFlags } from '@/app/red-flags/PageRedFlags';
import { traduireElement } from '@/lib/jeu/traduction';
import { alternances } from '@/lib/i18n/alternances';
import { chargerTraductions } from '@/lib/i18n/traductionsBase';

/**
 * Les pires red flags en anglais. Voir `app/red-flags/page.tsx`.
 *
 * Les comportements viennent de la base, en français : ils sont traduits par
 * le dictionnaire du « pire des deux » (`lib/jeu/traduction`). Un
 * comportement ajouté depuis s'affiche en français jusqu'à ce qu'on l'y
 * ajoute.
 */

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Red Flags List: the Worst Red Flags, Ranked by Votes',
  description:
    'A list of red flags in relationships and everyday life, ranked by thousands of votes: the worst, the least serious, by theme, and what women and men rank highest. Updated every hour.',
  keywords: ['red flags list', 'list of red flags', 'red flags in a relationship', 'red flag examples', 'worst red flags', 'dating red flags', 'red flag ranking'],
  alternates: alternances('en', '/red-flags'),
  openGraph: {
    title: 'The worst red flags, according to the votes',
    description: 'The red flag list ranked by thousands of duels, updated every hour.',
    url: '/en/red-flags',
    locale: 'en_US',
  },
};

export default async function RedFlagsEnPage() {
  await chargerTraductions('jeu');
  return PageRedFlags({ langue: 'en', traduire: (texte) => traduireElement(texte, 'en') });
}

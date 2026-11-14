import type { Metadata } from 'next';
import Link from '@/components/ui/LienIntention';
import { cheminLocalise } from '@/lib/i18n/langue';
import {
  chargerObservatoire,
  formatNumber,
  GapTable,
  SpreadList,
} from '@/app/observatoire/tableaux';

/**
 * L'Observatoire en anglais (traduction du 2026-11-14). Même données et mêmes
 * tableaux que `app/observatoire/page.tsx` ; les comportements sont traduits
 * par le serveur (`lib/jeu/traduction`). Fermé aux moteurs comme tout `/en`.
 */
export const metadata: Metadata = {
  title: 'The Red Flag Observatory — where nobody agrees',
  description:
    'What the Red or Green community’s votes reveal: the behaviors where men and women disagree the most, and the ones that split the generations.',
  openGraph: { locale: 'en_US', url: '/en/observatoire' },
  alternates: { canonical: '/en/observatoire' },
  robots: { index: false, follow: true },
};

export const revalidate = 3600;

const en = (chemin: string) => cheminLocalise('en', chemin);

export default async function ObservatoireEnPage() {
  const { data, votes } = await chargerObservatoire('en');

  const hasData = data.genderGaps.length > 0 || data.ageGaps.length > 0;

  return (
    <main id="main-content" className="legal-page">
      <div className="legal-page__container">
        <h1 className="legal-page__title">The Red Flag Observatory</h1>
        <p className="legal-page__updated">
          What the votes say — and above all, what nobody agrees on
        </p>

        <section className="legal-page__section">
          <h2>Why this page exists</h2>
          <p>
            Most red flag lists you find online are one person&apos;s opinion. This one is
            different: it doesn&apos;t tell you what you <em>should</em> think, it measures what
            people actually judge, by making them pick between two behaviors, thousands of times
            over.
          </p>
          {votes !== null && votes > 0 && data.totalElements > 0 && (
            <p>
              So far, <strong>{formatNumber(votes, 'en')} votes</strong> have been cast, and{' '}
              <strong>{formatNumber(data.totalElements, 'en')} everyday behaviors</strong> are
              analyzed here. Behaviors from the “Love &amp; Sex” category, played between adults,
              are not published.
            </p>
          )}
          <p>
            The most interesting finding isn&apos;t the ranking itself. It&apos;s how big the
            disagreements are: on some behaviors, the gap in judgment between two groups tops 200
            points — more than what separates a harmless behavior from a problematic one in the
            overall ranking.
          </p>
        </section>

        {hasData ? (
          <>
            <section className="legal-page__section">
              <h2>Men vs. women: the behaviors that divide the most</h2>
              <p>
                A higher score means the group sees the behavior as more problematic. The gaps
                below are the widest in the whole set.
              </p>
              <GapTable entries={data.genderGaps} labelA="Men" labelB="Women" langue="en" />
            </section>

            <section className="legal-page__section">
              <h2>16-18 vs. 27 and over: the generation gap</h2>
              <p>
                Same reading, this time between the youngest and the oldest age groups.
              </p>
              <GapTable
                entries={data.ageGaps}
                labelA="Ages 16-18"
                labelB="Ages 27+"
                langue="en"
                parA="16-18 year olds"
                parB="the 27-and-over crowd"
              />
            </section>

            <section className="legal-page__section">
              <h2>The most divisive behaviors</h2>
              <p>
                Here we stop comparing two groups and look at all six: gender and age groups. The
                spread is the gap between the harshest group and the most lenient one. The wider it
                is, the less shared norm there is around that behavior — these are, quite
                literally, the topics where a conversation can go south because nobody&apos;s on
                the same page.
              </p>
              <SpreadList entries={data.mostContested} kind="contested" langue="en" />
            </section>

            <section className="legal-page__section">
              <h2>The ones everyone agrees on</h2>
              <p>
                On the flip side, these behaviors are judged the same way by every group. Broad
                agreement doesn&apos;t mean “serious”: it means the verdict doesn&apos;t depend on
                age or gender. The overall score next to it tells you whether that consensus is
                about something harmless or something serious.
              </p>
              <SpreadList entries={data.mostConsensual} kind="consensual" langue="en" />
            </section>
          </>
        ) : (
          <section className="legal-page__section">
            <h2>Data temporarily unavailable</h2>
            <p>
              We couldn&apos;t load the numbers. The{' '}
              <Link href={en('/classement')}>full rankings</Link> are still available.
            </p>
          </section>
        )}

        <section className="legal-page__section">
          <h2>How to read these numbers</h2>
          <p>
            Every behavior has a score that goes up when it&apos;s picked as the worse one in a
            duel, and down otherwise. A separate score is kept for each declared group, which is
            what makes these comparisons possible.
          </p>
          <p>
            Two caveats. First, scores by subgroup rest on a fraction of the votes: we only show
            behaviors that have passed a participation threshold, but a gap is still a trend, not a
            precise measurement. Second, our sample is self-selected — it&apos;s the people who
            chose to play. These numbers describe our community, not the general population.
          </p>
          <p>
            The full calculation is explained in the{' '}
            <Link href={en('/methodologie')}>methodology</Link>.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>Explore it yourself</h2>
          <p>
            The <Link href={en('/classement')}>full rankings</Link> can be filtered by category,
            gender and age group. Two <Link href={en('/articles')}>articles</Link> dig into the
            gaps between men and women:{' '}
            <Link href={en('/articles/coucher-avec-son-boss-draguer-ses-collegues')}>at
            work</Link>, and{' '}
            <Link href={en('/articles/red-flags-hommes-femmes-presque-d-accord')}>in everyday
            life</Link>. You can also <Link href={en('/jeu')}>add your own votes</Link> — every
            duel you settle moves the scores.
          </p>
        </section>

      </div>
    </main>
  );
}

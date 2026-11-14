import type { Metadata } from 'next';
import Link from '@/components/ui/LienIntention';
import { chargerObservatoire, formatNumber, GapTable, SpreadList } from './tableaux';

export const metadata: Metadata = {
  title: "L'Observatoire des red flags — ce sur quoi on n'est pas d'accord",
  description:
    "Ce que révèlent les votes de la communauté Red or Green : les comportements où hommes et femmes divergent le plus, et ceux qui séparent les générations.",
  alternates: { canonical: '/observatoire' },
};

export const revalidate = 3600;

// Les tableaux (`GapTable`, `SpreadList`) et le chargement des données sont
// dans `tableaux.tsx`, partagés avec `/en/observatoire`.

export default async function ObservatoirePage() {
  const { data, votes } = await chargerObservatoire('fr');

  const hasData = data.genderGaps.length > 0 || data.ageGaps.length > 0;

  return (
    <main id="main-content" className="legal-page">
      <div className="legal-page__container">
        <h1 className="legal-page__title">L&apos;Observatoire des red flags</h1>
        <p className="legal-page__updated">
          Ce que disent les votes — et surtout, ce sur quoi personne n&apos;est d&apos;accord
        </p>

        <section className="legal-page__section">
          <h2>Pourquoi cette page</h2>
          <p>
            La plupart des listes de red flags qu&apos;on trouve en ligne sont l&apos;opinion
            d&apos;une seule personne. Celle-ci est différente : elle ne dit pas ce qu&apos;il
            <em> faudrait </em> penser, elle mesure ce que les gens jugent réellement, en les
            faisant arbitrer entre deux comportements, des milliers de fois.
          </p>
          {votes !== null && votes > 0 && data.totalElements > 0 && (
            <p>
              À ce jour, <strong>{formatNumber(votes)} votes</strong> ont été exprimés ;{' '}
              <strong>{formatNumber(data.totalElements)} comportements du quotidien</strong>{' '}
              sont analysés ici. Les propositions de la catégorie « Amour &amp; Sexe »,
              jouées entre adultes, ne sont pas publiées.
            </p>
          )}
          <p>
            Le résultat le plus intéressant n&apos;est pas le classement lui-même. C&apos;est
            l&apos;ampleur des désaccords : sur certains comportements, l&apos;écart de jugement
            entre deux groupes dépasse 200 points de score — soit davantage que ce qui sépare, dans
            le classement général, un comportement anodin d&apos;un comportement problématique.
          </p>
        </section>

        {hasData ? (
          <>
            <section className="legal-page__section">
              <h2>Hommes et femmes : les comportements qui divisent le plus</h2>
              <p>
                Un score plus élevé signifie que le groupe juge le comportement plus problématique.
                Les écarts ci-dessous sont les plus marqués du corpus.
              </p>
              <GapTable entries={data.genderGaps} labelA="Hommes" labelB="Femmes" />
            </section>

            <section className="legal-page__section">
              <h2>16-18 ans contre 27 ans et plus : la fracture générationnelle</h2>
              <p>
                Même lecture, cette fois entre la tranche la plus jeune et la plus âgée.
              </p>
              <GapTable entries={data.ageGaps} labelA="16-18 ans" labelB="27 ans et plus" />
            </section>

            <section className="legal-page__section">
              <h2>Les comportements les plus clivants</h2>
              <p>
                Ici, on ne compare plus deux groupes mais les six : sexe et tranches d&apos;âge.
                L&apos;amplitude est l&apos;écart entre le groupe le plus sévère et le plus
                indulgent. Plus elle est large, moins il existe de norme partagée sur ce
                comportement — ce sont, littéralement, les sujets sur lesquels une conversation
                risque de mal tourner faute d&apos;accord implicite.
              </p>
              <SpreadList entries={data.mostContested} kind="contested" />
            </section>

            <section className="legal-page__section">
              <h2>Ceux qui font consensus</h2>
              <p>
                À l&apos;inverse, ces comportements sont jugés de la même façon par tous les
                groupes. Un consensus large ne veut pas dire « grave » : il veut dire que le
                jugement ne dépend ni de l&apos;âge ni du sexe. Le score général, indiqué à côté,
                dit si ce consensus porte sur quelque chose d&apos;anodin ou de sérieux.
              </p>
              <SpreadList entries={data.mostConsensual} kind="consensual" />
            </section>
          </>
        ) : (
          <section className="legal-page__section">
            <h2>Données momentanément indisponibles</h2>
            <p>
              Les agrégats n&apos;ont pas pu être chargés. Le{' '}
              <Link href="/classement">classement complet</Link> reste consultable.
            </p>
          </section>
        )}

        <section className="legal-page__section">
          <h2>Comment lire ces chiffres</h2>
          <p>
            Chaque comportement porte un score qui monte quand il est désigné comme le pire
            d&apos;un duel, et descend sinon. Un score distinct est tenu pour chaque groupe déclaré,
            ce qui permet ces comparaisons.
          </p>
          <p>
            Deux précautions. D&apos;abord, les scores par sous-groupe reposent sur une fraction des
            votes : nous n&apos;affichons ici que des comportements ayant dépassé un seuil de
            participation, mais un écart reste une tendance, pas une mesure de précision. Ensuite,
            notre échantillon est auto-sélectionné — ce sont les personnes qui ont choisi de jouer.
            Ces chiffres décrivent notre communauté, pas la population française.
          </p>
          <p>
            Le détail du calcul est publié dans la{' '}
            <Link href="/methodologie">méthodologie</Link>.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>Explorer par vous-même</h2>
          <p>
            Le <Link href="/classement">classement complet</Link> est filtrable par catégorie, par
            sexe et par tranche d&apos;âge. Deux{' '}
            <Link href="/articles">articles</Link> analysent les écarts entre hommes et
            femmes : <Link href="/articles/coucher-avec-son-boss-draguer-ses-collegues">au
            travail</Link>, et{' '}
            <Link href="/articles/red-flags-hommes-femmes-presque-d-accord">au
            quotidien</Link>. Vous pouvez aussi{' '}
            <Link href="/jeu">contribuer aux votes</Link> — chaque duel tranché déplace les scores.
          </p>
        </section>

      </div>
    </main>
  );
}

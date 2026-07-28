import type { Metadata } from 'next';
import Link from 'next/link';
import { getLeaderboardPage } from '@/lib/leaderboard';

export const metadata: Metadata = {
  title: 'Méthodologie — comment on classe les red flags',
  description:
    "Le classement Red or Green repose sur un système de score Elo alimenté par les votes de la communauté. Fonctionnement, taille d'échantillon, biais assumés et limites.",
  alternates: { canonical: '/methodologie' },
};

export const revalidate = 3600;

export default async function MethodologiePage() {
  let totalElements = 0;

  try {
    const data = await getLeaderboardPage({ limit: 1 });
    totalElements = data.totalElements;
  } catch {
    // Base indisponible : la page reste lisible sans les chiffres.
  }

  return (
    <main id="main-content" className="legal-page">
      <div className="legal-page__container">
        <h1 className="legal-page__title">Méthodologie</h1>
        <p className="legal-page__updated">
          Comment le classement des red flags est construit
        </p>

        <section className="legal-page__section">
          <h2>1. D&apos;où viennent les données</h2>
          <p>
            Le classement n&apos;est pas établi par une rédaction : il est produit par les votes des
            personnes qui jouent. À chaque duel, deux comportements sont proposés et le joueur
            désigne celui qu&apos;il juge le plus problématique. Ce sont ces arbitrages, répétés,
            qui font monter ou descendre un comportement dans le classement.
          </p>
          {totalElements > 0 && (
            <p>
              Le corpus compte actuellement <strong>{totalElements} comportements</strong> en lice.
            </p>
          )}
          <p>
            Aucun compte n&apos;est nécessaire pour voter. Deux informations facultatives sont
            demandées avant de jouer — tranche d&apos;âge et sexe — uniquement pour permettre les
            comparaisons décrites plus bas. Elles ne sont rattachées à aucune identité.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>2. Le score Elo</h2>
          <p>
            Nous utilisons le système Elo, conçu à l&apos;origine pour classer les joueurs
            d&apos;échecs. Son intérêt ici : il ne compte pas les victoires, il pondère chaque duel
            par la difficulté de l&apos;adversaire. Battre un comportement déjà jugé très
            problématique rapporte davantage que d&apos;en battre un anodin.
          </p>
          <p>
            Chaque comportement démarre à <strong>1000 points</strong>. Après un duel, la
            probabilité attendue de victoire se calcule ainsi :
          </p>
          <p>
            <code>E = 1 / (1 + 10^((score adverse − score) / 400))</code>
          </p>
          <p>
            Le score est ensuite ajusté de <code>K × (résultat − E)</code>. Le facteur K décroît à
            mesure qu&apos;un comportement accumule des votes : <strong>40</strong> en dessous de 30
            participations, <strong>32</strong> jusqu&apos;à 100, puis <strong>24</strong> au-delà.
            Autrement dit, un comportement récent bouge vite, un comportement bien établi ne bouge
            plus qu&apos;avec des votes nombreux et cohérents. Un plancher à 100 points empêche un
            score de s&apos;effondrer indéfiniment.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>3. Les comparaisons par groupe</h2>
          <p>
            Un score Elo distinct est tenu pour chaque groupe déclaré : par sexe, et par tranche
            d&apos;âge (16-18, 19-22, 23-26, 27 et plus). C&apos;est ce qui permet de mesurer les
            désaccords — un même comportement peut être jugé sévèrement par un groupe et bien moins
            par un autre.
          </p>
          <p>
            Ces sous-classements reposent mécaniquement sur moins de votes que le classement
            général. Plus le groupe est étroit, plus l&apos;écart doit être important pour être
            significatif.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>4. Ce que ce classement n&apos;est pas</h2>
          <p>
            Il faut être clair sur la portée de ces chiffres.
          </p>
          <ul>
            <li>
              <strong>Ce n&apos;est pas une enquête représentative.</strong> L&apos;échantillon est
              auto-sélectionné : ce sont les personnes qui ont choisi de jouer, pas un panel
              construit. Les résultats décrivent notre communauté, pas la population française.
            </li>
            <li>
              <strong>Ce n&apos;est pas un diagnostic.</strong> Un score élevé signale un consensus
              sur le caractère problématique d&apos;un comportement, pas un verdict sur une personne
              ou une relation réelle.
            </li>
            <li>
              <strong>Le ton du jeu influence les réponses.</strong> Certaines propositions sont
              volontairement légères ou provocatrices. Elles sont votées dans un contexte ludique,
              ce qui pèse sur les arbitrages.
            </li>
            <li>
              <strong>Les déclarations ne sont pas vérifiées.</strong> Âge et sexe sont déclaratifs.
            </li>
          </ul>
        </section>

        <section className="legal-page__section">
          <h2>5. Modération du corpus</h2>
          <p>
            Les comportements soumis au vote sont rédigés et validés en amont, pas générés
            automatiquement. Les propositions relevant de la catégorie « Amour &amp; Sexe » ne sont
            pas servies aux joueurs déclarant la tranche 16-18 ans.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>6. Aller voir les données</h2>
          <p>
            Le classement complet est consultable et filtrable par catégorie, par sexe et par
            tranche d&apos;âge sur la page{' '}
            <Link href="/classement">classement des red flags</Link>. Les outils
            d&apos;auto-évaluation, qui reposent sur des barèmes institutionnels et non sur nos
            votes, sont décrits dans nos <Link href="/sources">sources</Link>.
          </p>
        </section>
      </div>
    </main>
  );
}

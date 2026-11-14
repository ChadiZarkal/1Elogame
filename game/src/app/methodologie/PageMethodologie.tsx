/**
 * @module app/methodologie/PageMethodologie
 * La méthodologie, dans les deux langues : `/methodologie` et
 * `/en/methodologie` appellent ce composant (traduction du 2026-11-14).
 * Le corps français est celui qui était écrit dans la page, tel quel.
 */

import Link from '@/components/ui/LienIntention';
import { getLeaderboardPage } from '@/lib/leaderboard';
import { withPrerenderTimeout } from '@/lib/prerenderTimeout';
import { cheminLocalise, type Langue } from '@/lib/i18n/langue';

function CorpsFr({ totalElements }: { totalElements: number }) {
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

function CorpsEn({ totalElements }: { totalElements: number }) {
  return (
    <main id="main-content" className="legal-page">
      <div className="legal-page__container">
        <h1 className="legal-page__title">Methodology</h1>
        <p className="legal-page__updated">
          How the red flag ranking is built
        </p>

        <section className="legal-page__section">
          <h2>1. Where the data comes from</h2>
          <p>
            The ranking isn’t set by an editorial team: it comes from the votes of
            the people who play. In each duel, two behaviors are shown and the player
            picks the one they find more problematic. Those choices, repeated over and
            over, are what move a behavior up or down the ranking.
          </p>
          {totalElements > 0 && (
            <p>
              There are currently <strong>{totalElements} behaviors</strong> in the running.
            </p>
          )}
          <p>
            No account is needed to vote. Two optional pieces of information are asked
            before playing — age bracket and gender — only to make the comparisons
            described below possible. They aren’t tied to any identity.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>2. The Elo score</h2>
          <p>
            We use the Elo system, originally designed to rank chess players. What
            makes it useful here: it doesn’t just count wins, it weighs each duel by
            how strong the opponent is. Beating a behavior already judged very
            problematic is worth more than beating a harmless one.
          </p>
          <p>
            Every behavior starts at <strong>1,000 points</strong>. After a duel, the
            expected probability of winning is calculated like this:
          </p>
          <p>
            <code>E = 1 / (1 + 10^((opponent score − score) / 400))</code>
          </p>
          <p>
            The score is then adjusted by <code>K × (result − E)</code>. The K factor
            shrinks as a behavior collects votes: <strong>40</strong> under 30 duels,
            {' '}<strong>32</strong> up to 100, then <strong>24</strong> beyond that. In
            other words, a new behavior moves fast, while a well-established one only
            moves with many consistent votes. A floor of 100 points keeps a score from
            sinking indefinitely.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>3. Comparisons by group</h2>
          <p>
            A separate Elo score is kept for each group players declare: by gender,
            and by age bracket (16–18, 19–22, 23–26, 27 and over). That’s what lets us
            measure disagreements — the same behavior can be judged harshly by one
            group and much less so by another.
          </p>
          <p>
            These sub-rankings necessarily rest on fewer votes than the overall
            ranking. The narrower the group, the bigger a gap has to be to mean
            anything.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>4. What this ranking is not</h2>
          <p>
            It’s worth being clear about what these numbers can and can’t tell you.
          </p>
          <ul>
            <li>
              <strong>It’s not a representative survey.</strong> The sample is
              self-selected: these are people who chose to play, not a designed panel.
              The results describe our community, not the French population.
            </li>
            <li>
              <strong>It’s not a diagnosis.</strong> A high score reflects a consensus
              that a behavior is problematic, not a verdict on a person or a real
              relationship.
            </li>
            <li>
              <strong>The game’s tone shapes the answers.</strong> Some prompts are
              deliberately lighthearted or provocative. They’re voted on in a playful
              setting, which affects the choices people make.
            </li>
            <li>
              <strong>What players declare isn’t verified.</strong> Age and gender are
              self-reported.
            </li>
          </ul>
        </section>

        <section className="legal-page__section">
          <h2>5. Moderating the prompts</h2>
          <p>
            The behaviors put to the vote are written and reviewed in advance, not
            generated automatically. Prompts in the “Love &amp; Sex” category are not
            shown to players who select the 16–18 age bracket.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>6. See the data for yourself</h2>
          <p>
            The full ranking can be browsed and filtered by category, gender and age
            bracket on the{' '}
            <Link href={cheminLocalise('en', '/classement')}>red flag rankings</Link> page. The
            self-assessment tools, which rely on official scales rather than our
            votes, are described in our <Link href={cheminLocalise('en', '/sources')}>sources</Link>.
          </p>
        </section>
      </div>
    </main>
  );
}

export async function PageMethodologie({ langue }: { langue: Langue }) {
  let totalElements = 0;

  try {
    const data = await withPrerenderTimeout(getLeaderboardPage({ limit: 1 }));
    totalElements = data.totalElements;
  } catch {
    // Base indisponible : la page reste lisible sans les chiffres.
  }

  return langue === 'en'
    ? <CorpsEn totalElements={totalElements} />
    : <CorpsFr totalElements={totalElements} />;
}

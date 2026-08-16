import type { Metadata } from 'next';
import Link from 'next/link';
import { CONTACT_EMAIL, INSTAGRAM_HANDLE, INSTAGRAM_URL } from '@/config/contact';

export const metadata: Metadata = {
  title: 'À propos — qui édite Red or Green et pourquoi',
  description:
    "Red or Green est un site de jeux sur les comportements relationnels, doublé d'outils d'auto-évaluation issus de sources institutionnelles. Notre démarche, nos limites, nos partis pris.",
  alternates: { canonical: '/a-propos' },
};

export default function AProposPage() {
  return (
    <main id="main-content" className="legal-page">
      <div className="legal-page__container">
        <h1 className="legal-page__title">À propos</h1>
        <p className="legal-page__updated">Ce qu&apos;est ce site, et ce qu&apos;il n&apos;est pas</p>

        <section className="legal-page__section">
          <h2>L&apos;idée</h2>
          <p>
            Red or Green part d&apos;un constat simple : on parle beaucoup de « red flags », et
            presque jamais de la même chose. Le terme sert à désigner aussi bien une manie agaçante
            qu&apos;un comportement réellement dangereux. Cette confusion a un coût : elle banalise
            ce qui est grave et dramatise ce qui ne l&apos;est pas.
          </p>
          <p>
            Le site prend le problème par un angle inhabituel : plutôt que d&apos;asséner une liste
            de comportements à fuir, il fait voter. Des milliers d&apos;arbitrages entre deux
            situations finissent par dessiner où se situe réellement le curseur collectif — et,
            surtout, où les gens ne sont pas d&apos;accord entre eux.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>Ce qu&apos;on y trouve</h2>
          <p>
            <strong>Des jeux.</strong> Le <Link href="/jeu">duel Red or Green</Link> oppose deux
            comportements et demande de trancher.{' '}
            <Link href="/dixmais">« C&apos;est un 10 mais... »</Link> fait chuter une note au fil
            des révélations. L&apos;<Link href="/flagornot">Oracle</Link> rend un avis sur une
            situation décrite librement. Tous se jouent sans compte, gratuitement.
          </p>
          <p>
            <strong>Un classement.</strong> Le{' '}
            <Link href="/classement">classement des red flags</Link> agrège les votes et permet de
            comparer les jugements par sexe et par tranche d&apos;âge. C&apos;est la partie la plus
            intéressante du site : elle montre des désaccords que personne ne soupçonne.
          </p>
          <p>
            <strong>Des repères.</strong> Le <Link href="/guide">guide des flags</Link> distingue
            green, white, orange, red et black flag, avec des exemples concrets.
          </p>
          <p>
            <strong>Des outils d&apos;auto-évaluation.</strong> Violentomètre, consentomètre et
            autres questionnaires reprennent des barèmes produits par des institutions publiques et
            des associations spécialisées. Ils sont d&apos;une nature différente du reste du site,
            et leurs <Link href="/sources">sources sont publiées</Link>.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>Nos partis pris</h2>
          <ul>
            <li>
              <strong>Pas de compte, pas de collecte.</strong> Aucune inscription n&apos;est requise
              pour jouer. Les outils d&apos;auto-évaluation s&apos;exécutent dans le navigateur et
              ne transmettent aucune réponse.
            </li>
            <li>
              <strong>Le ludique ne dispense pas du sérieux.</strong> Le ton des jeux est léger,
              mais dès qu&apos;un sujet touche à la violence ou au consentement, on bascule sur des
              sources identifiées et des numéros d&apos;urgence.
            </li>
            <li>
              <strong>Les chiffres viennent avec leurs limites.</strong> Notre échantillon est
              auto-sélectionné et ne représente pas la population générale. C&apos;est écrit noir
              sur blanc dans la <Link href="/methodologie">méthodologie</Link>.
            </li>
            <li>
              <strong>Le contenu réservé aux majeurs l&apos;est vraiment.</strong> Les propositions
              de la catégorie « Amour &amp; Sexe » ne sont pas servies aux joueurs déclarant la
              tranche 16-18 ans.
            </li>
          </ul>
        </section>

        <section className="legal-page__section">
          <h2>Ce que ce site n&apos;est pas</h2>
          <p>
            Ce n&apos;est ni un service d&apos;accompagnement, ni un outil de diagnostic, ni un avis
            professionnel. Un questionnaire ne connaît ni le contexte d&apos;une relation, ni son
            histoire, ni les rapports de force qui la traversent.
          </p>
          <p>
            En cas de danger : <strong>3919</strong> (violences faites aux femmes, 24h/24),{' '}
            <strong>119</strong> (enfance en danger), <strong>17</strong> (urgences).
          </p>
        </section>

        <section className="legal-page__section">
          <h2>Nous écrire</h2>
          <p>
            Une erreur à signaler, une source à corriger, une proposition à retirer du corpus, une
            demande liée à vos données : écrivez à{' '}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Toutes les demandes sont lues.
          </p>
          <p>
            Le site est aussi présent sur Instagram, à{' '}
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
              @{INSTAGRAM_HANDLE}
            </a>.
          </p>
          <p>
            Les informations relatives à l&apos;éditeur et à l&apos;hébergeur figurent dans les{' '}
            <Link href="/mentions-legales">mentions légales</Link>. Le traitement des données est
            détaillé dans la <Link href="/confidentialite">politique de confidentialité</Link>.
          </p>
        </section>
      </div>
    </main>
  );
}

/**
 * @module app/a-propos/PageAPropos
 * La page « À propos », dans les deux langues : `/a-propos` et
 * `/en/a-propos` rendent ce composant (traduction du 2026-11-14).
 * Le corps français est celui qui était écrit dans la page, tel quel ; le
 * lien vers « C'est un 10 mais… » reste français dans les deux langues.
 */

import Link from '@/components/ui/LienIntention';
import { CONTACT_EMAIL, DON_URL, INSTAGRAM_HANDLE, INSTAGRAM_URL } from '@/config/contact';
import { cheminLocalise, type Langue } from '@/lib/i18n/langue';

const en = (chemin: string) => cheminLocalise('en', chemin);

function CorpsFr() {
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
            <Link href="/dixmais">« C&apos;est un 10 mais... »</Link> fait noter red flags et green
            flags un par un, jusqu&apos;à 15/10, et donne au profil la moyenne. L&apos;<Link href="/flagornot">Oracle</Link> rend un avis sur une
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
          <h2>Soutenir le site</h2>
          <p>
            Les jeux sont gratuits. Si l&apos;un d&apos;eux vous a fait rire ou
            réfléchir, vous pouvez{' '}
            <a href={DON_URL} target="_blank" rel="noopener noreferrer">
              offrir un café
            </a>{' '}
            : cela aide à payer l&apos;hébergement et le temps passé à l&apos;écrire. Le paiement
            se fait sur la plateforme de don ; le site n&apos;en voit rien.
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

function CorpsEn() {
  return (
    <main id="main-content" className="legal-page">
      <div className="legal-page__container">
        <h1 className="legal-page__title">About</h1>
        <p className="legal-page__updated">What this site is, and what it isn’t</p>

        <section className="legal-page__section">
          <h2>The idea</h2>
          <p>
            Red or Green starts from a simple observation: people talk about “red
            flags” all the time, and almost never mean the same thing. The term is
            used for anything from an annoying habit to genuinely dangerous behavior.
            That confusion has a cost: it makes serious things look ordinary and
            turns minor things into drama.
          </p>
          <p>
            The site comes at the problem from an unusual angle: instead of handing
            down a list of behaviors to run from, it puts them to a vote. Thousands of
            choices between two situations end up showing where people collectively
            draw the line — and, above all, where they disagree with each other.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>What you’ll find here</h2>
          <p>
            <strong>Games.</strong> The <Link href={en('/jeu')}>Red or Green duel</Link> puts
            two behaviors side by side and asks you to pick.{' '}
            <Link href="/dixmais">“It’s a 10, but…”</Link> (in French) has you rate red
            flags and green flags one at a time, up to 15/10, and gives the profile the
            average. The <Link href={en('/flagornot')}>Oracle</Link> weighs in on a
            situation you describe in your own words. All of them are free and need no
            account.
          </p>
          <p>
            <strong>A ranking.</strong> The{' '}
            <Link href={en('/classement')}>red flag rankings</Link> pull the votes
            together and let you compare judgments by gender and age bracket. It’s the
            most interesting part of the site: it reveals disagreements nobody
            suspected.
          </p>
          <p>
            <strong>Guideposts.</strong> The <Link href={en('/guide')}>flag guide</Link> explains
            the difference between green, white, orange, red and black flags, with
            real-life examples.
          </p>
          <p>
            <strong>Self-assessment tools.</strong> The violence meter, the consent
            meter and the other questionnaires are based on scales produced by French
            public institutions and specialized nonprofits. They’re a different kind of
            content from the rest of the site, and their{' '}
            <Link href={en('/sources')}>sources are published</Link>.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>Our principles</h2>
          <ul>
            <li>
              <strong>No account, no data harvesting.</strong> You don’t need to sign
              up to play. The self-assessment tools run in your browser and don’t send
              any answers.
            </li>
            <li>
              <strong>Playful doesn’t mean careless.</strong> The games have a light
              tone, but as soon as a topic touches on violence or consent, we switch
              to named sources and emergency numbers.
            </li>
            <li>
              <strong>The numbers come with their limits.</strong> Our sample is
              self-selected and doesn’t represent the general population. It says so
              in black and white in the <Link href={en('/methodologie')}>methodology</Link>.
            </li>
            <li>
              <strong>Adults-only content really is adults-only.</strong> Prompts in the
              “Love &amp; Sex” category aren’t shown to players who select the 16–18
              age bracket.
            </li>
          </ul>
        </section>

        <section className="legal-page__section">
          <h2>What this site is not</h2>
          <p>
            It isn’t a support service, a diagnostic tool or professional advice. A
            questionnaire knows nothing about a relationship’s context, its history or
            the power dynamics running through it.
          </p>
          <p>
            If you’re in danger in France: <strong>3919</strong> (helpline for women
            facing violence, 24/7), <strong>119</strong> (children at risk),{' '}
            <strong>17</strong> (police emergency). Anywhere in the EU,{' '}
            <strong>112</strong> also works.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>Support the site</h2>
          <p>
            The games are free. If one of them made you laugh or think, you can{' '}
            <a href={DON_URL} target="_blank" rel="noopener noreferrer">
              buy us a coffee
            </a>
            : it helps pay for hosting and the time spent writing them. Payment goes
            through the donation platform; the site never sees any of it.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>Contact us</h2>
          <p>
            A mistake to report, a source to correct, a prompt to remove, a request
            about your data: write to{' '}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Every message is
            read.
          </p>
          <p>
            The site is also on Instagram at{' '}
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
              @{INSTAGRAM_HANDLE}
            </a>.
          </p>
          <p>
            Information about the publisher and the host is in the{' '}
            <Link href={en('/mentions-legales')}>legal notice</Link>. How data is
            handled is explained in the{' '}
            <Link href={en('/confidentialite')}>privacy policy</Link>.
          </p>
        </section>
      </div>
    </main>
  );
}

export function PageAPropos({ langue }: { langue: Langue }) {
  return langue === 'en' ? <CorpsEn /> : <CorpsFr />;
}

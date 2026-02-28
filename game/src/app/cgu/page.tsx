import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation",
  robots: { index: false, follow: false },
};

export default function CGUPage() {
  return (
    <main id="main-content" className="legal-page">
      <div className="legal-page__container">
        <h1 className="legal-page__title">Conditions Générales d&apos;Utilisation</h1>
        <p className="legal-page__updated">Dernière mise à jour : 28 février 2026</p>

        <section className="legal-page__section">
          <h2>1. Objet</h2>
          <p>
            Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;accès et
            l&apos;utilisation du site <strong>redorgreen.fr</strong> et de l&apos;ensemble de ses
            services (ci-après « le Service »).
          </p>
          <p>
            En accédant au Service, vous acceptez sans réserve les présentes CGU. Si vous ne les
            acceptez pas, veuillez ne pas utiliser le Service.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>2. Description du Service</h2>
          <p>Red or Green est une plateforme de jeux en ligne gratuite proposant :</p>
          <ul>
            <li><strong>Red or Green (Duels)</strong> — un jeu de vote où les joueurs choisissent le pire comportement entre deux propositions.</li>
            <li><strong>Oracle</strong> — un outil d&apos;analyse par intelligence artificielle permettant de soumettre une situation et d&apos;obtenir un avis « Red Flag » ou « Green Flag ».</li>
            <li><strong>Outils d&apos;auto-évaluation</strong> — des questionnaires informatifs (violentomètre, consentomètre, etc.) sur des sujets de société.</li>
            <li><strong>Classement</strong> — un tableau des propositions les plus votées.</li>
          </ul>
        </section>

        <section className="legal-page__section">
          <h2>3. Accès au Service</h2>
          <p>
            Le Service est accessible gratuitement, sans inscription ni création de compte.
            L&apos;éditeur se réserve le droit de suspendre ou d&apos;interrompre l&apos;accès
            au Service à tout moment, sans préavis, pour des raisons de maintenance ou de mise à jour.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>4. Public visé</h2>
          <p>
            Le Service est destiné aux personnes de <strong>16 ans et plus</strong>. Certains
            contenus, notamment les outils d&apos;auto-évaluation, abordent des sujets sensibles
            (violence, consentement, harcèlement) qui ne sont pas adaptés à un public mineur sans
            accompagnement parental.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>5. Comportement des utilisateurs</h2>
          <p>En utilisant le Service, vous vous engagez à :</p>
          <ul>
            <li>Ne pas soumettre de contenu illégal, diffamatoire, discriminatoire, haineux ou à caractère pornographique.</li>
            <li>Ne pas tenter de perturber le fonctionnement du Service (spam, bot, attaque DDoS, etc.).</li>
            <li>Ne pas utiliser de systèmes automatisés pour interagir avec le Service sans autorisation.</li>
            <li>Respecter les droits de propriété intellectuelle de l&apos;éditeur.</li>
          </ul>
          <p>
            L&apos;éditeur se réserve le droit de supprimer tout contenu contraire aux présentes
            CGU et de bloquer l&apos;accès aux utilisateurs en infraction.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>6. Outils d&apos;auto-évaluation — Avertissement</h2>
          <p>
            Les outils d&apos;auto-évaluation (violentomètre, consentomètre, incestomètre,
            harcèlomètre, discriminomètre) sont fournis à <strong>titre informatif uniquement</strong>.
          </p>
          <p>
            <strong>Ils ne constituent en aucun cas un diagnostic médical, psychologique ou
            juridique.</strong> Ils ne remplacent pas l&apos;avis d&apos;un professionnel qualifié.
          </p>
          <p>
            Si vous êtes en situation de danger ou si vous avez besoin d&apos;aide, contactez
            immédiatement les services d&apos;urgence :
          </p>
          <ul>
            <li><strong>17</strong> — Police / Gendarmerie</li>
            <li><strong>3919</strong> — Violences Femmes Info</li>
            <li><strong>112</strong> — Numéro d&apos;urgence européen</li>
            <li><strong>114</strong> — Numéro d&apos;urgence par SMS</li>
          </ul>
        </section>

        <section className="legal-page__section">
          <h2>7. Oracle — Intelligence Artificielle</h2>
          <p>
            L&apos;Oracle utilise un modèle d&apos;intelligence artificielle (Google Gemini) pour
            analyser les situations soumises. Les résultats de l&apos;Oracle sont générés
            automatiquement et doivent être interprétés avec recul.
          </p>
          <p>
            L&apos;éditeur ne garantit pas l&apos;exactitude, la pertinence ou l&apos;exhaustivité
            des réponses fournies par l&apos;Oracle.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>8. Données personnelles</h2>
          <p>
            L&apos;utilisation du Service implique le traitement de certaines données personnelles.
            Pour plus d&apos;informations, consultez notre{' '}
            <a href="/confidentialite">Politique de Confidentialité</a>.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>9. Propriété intellectuelle</h2>
          <p>
            L&apos;ensemble du Service (code, design, textes, graphismes, mécaniques de jeu) est
            protégé par le droit de la propriété intellectuelle. Toute reproduction non autorisée
            est interdite.
          </p>
          <p>
            Les contenus soumis par les utilisateurs (situations Oracle, votes) peuvent être
            utilisés de manière anonyme pour améliorer le Service.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>10. Limitation de responsabilité</h2>
          <p>
            Le Service est fourni « en l&apos;état ». L&apos;éditeur ne garantit pas la
            disponibilité permanente du Service ni l&apos;absence d&apos;erreurs.
          </p>
          <p>
            L&apos;éditeur ne pourra être tenu responsable des dommages directs ou indirects
            résultant de l&apos;utilisation ou de l&apos;impossibilité d&apos;utilisation du Service.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>11. Modification des CGU</h2>
          <p>
            L&apos;éditeur se réserve le droit de modifier les présentes CGU à tout moment.
            Les utilisateurs seront informés des modifications par la mise à jour de la date
            en haut de cette page. La poursuite de l&apos;utilisation du Service vaut acceptation
            des CGU modifiées.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>12. Droit applicable et juridiction</h2>
          <p>
            Les présentes CGU sont régies par le droit français. Tout litige relatif à
            l&apos;interprétation ou à l&apos;exécution des présentes sera soumis aux
            tribunaux français compétents.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>13. Contact</h2>
          <p>
            Pour toute question concernant les présentes CGU, vous pouvez nous contacter à :{' '}
            <a href="mailto:contact@redorgreen.fr">contact@redorgreen.fr</a>
          </p>
        </section>

        <a href="/" className="legal-page__back">← Retour à l&apos;accueil</a>
      </div>
    </main>
  );
}

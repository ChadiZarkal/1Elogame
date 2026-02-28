import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mentions Légales',
  robots: { index: false, follow: false },
};

export default function MentionsLegalesPage() {
  return (
    <main id="main-content" className="legal-page">
      <div className="legal-page__container">
        <h1 className="legal-page__title">Mentions Légales</h1>
        <p className="legal-page__updated">Dernière mise à jour : 28 février 2026</p>

        <section className="legal-page__section">
          <h2>1. Éditeur du site</h2>
          <p>
            Le site <strong>redorgreen.fr</strong> est édité par :<br />
            {/* TODO: Remplacer par les informations réelles */}
            <strong>[Nom / Prénom ou Raison sociale]</strong><br />
            [Adresse postale]<br />
            Email : <a href="mailto:contact@redorgreen.fr">contact@redorgreen.fr</a><br />
            Directeur de la publication : <strong>[Nom du directeur de la publication]</strong>
          </p>
        </section>

        <section className="legal-page__section">
          <h2>2. Hébergeur</h2>
          <p>
            Le site est hébergé par :<br />
            <strong>Vercel Inc.</strong><br />
            440 N Barranca Ave #4133, Covina, CA 91723, États-Unis<br />
            Site web : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">vercel.com</a>
          </p>
        </section>

        <section className="legal-page__section">
          <h2>3. Propriété intellectuelle</h2>
          <p>
            L&apos;ensemble du contenu du site redorgreen.fr (textes, graphismes, images, logos, icônes,
            sons, logiciels, etc.) est la propriété exclusive de l&apos;éditeur, sauf mention contraire.
            Toute reproduction, représentation, modification ou distribution, même partielle, est interdite
            sans autorisation écrite préalable.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>4. Responsabilité</h2>
          <p>
            L&apos;éditeur s&apos;efforce de fournir des informations aussi précises que possible.
            Toutefois, il ne pourra être tenu responsable des omissions, des inexactitudes et des
            carences dans la mise à jour.
          </p>
          <p>
            Les outils d&apos;auto-évaluation proposés sur ce site (violentomètre, consentomètre, etc.)
            sont fournis à titre informatif uniquement. <strong>Ils ne constituent en aucun cas un
            diagnostic professionnel</strong> et ne remplacent pas l&apos;avis d&apos;un professionnel
            de santé ou d&apos;un spécialiste. En cas de situation de danger, contactez les services
            d&apos;urgence (17, 3919, 112).
          </p>
        </section>

        <section className="legal-page__section">
          <h2>5. Liens hypertextes</h2>
          <p>
            Le site peut contenir des liens vers d&apos;autres sites. L&apos;éditeur n&apos;exerce
            aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>6. Droit applicable</h2>
          <p>
            Les présentes mentions légales sont soumises au droit français. En cas de litige, les
            tribunaux français seront seuls compétents.
          </p>
        </section>

        <a href="/" className="legal-page__back">← Retour à l&apos;accueil</a>
      </div>
    </main>
  );
}

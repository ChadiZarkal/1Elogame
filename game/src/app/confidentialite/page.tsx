import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Politique de Confidentialité',
  robots: { index: false, follow: true },
};

export default function ConfidentialitePage() {
  return (
    <main id="main-content" className="legal-page">
      <div className="legal-page__container">
        <h1 className="legal-page__title">Politique de Confidentialité</h1>
        <p className="legal-page__updated">Dernière mise à jour : 28 février 2026</p>

        <section className="legal-page__section">
          <h2>1. Introduction</h2>
          <p>
            La présente politique de confidentialité décrit la manière dont <strong>Red or Green</strong>{' '}
            (<a href="https://redorgreen.fr">redorgreen.fr</a>) collecte, utilise et protège les
            informations des utilisateurs, conformément au Règlement Général sur la Protection des
            Données (RGPD) et à la loi Informatique et Libertés.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>2. Responsable du traitement</h2>
          <p>
            <strong>Red or Green</strong> (éditeur du site redorgreen.fr)<br />
            Email : <a href="mailto:contact@redorgreen.fr">contact@redorgreen.fr</a>
          </p>
          <p>
            Pour toute demande relative au traitement des données personnelles, vous pouvez nous
            contacter à cette adresse.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>3. Données collectées</h2>

          <h3>3.1 Données fournies volontairement</h3>
          <ul>
            <li><strong>Genre et tranche d&apos;âge</strong> — sélectionnés avant de jouer aux duels. Ces données sont utilisées uniquement pour afficher des statistiques segmentées (classements par genre/âge).</li>
            <li><strong>Texte libre</strong> — situations soumises à l&apos;Oracle. Ces textes sont envoyés à un service d&apos;IA (Google Gemini) pour analyse.</li>
          </ul>

          <h3>3.2 Données collectées automatiquement</h3>
          <ul>
            <li><strong>Données de session</strong> — durée de visite, pages consultées, événements d&apos;interaction (analytics internes).</li>
            <li><strong>Adresse IP</strong> — utilisée uniquement pour la limitation de débit (rate limiting) afin de protéger le service contre les abus. Non stockée en base de données.</li>
            <li><strong>Données techniques</strong> — type de navigateur, système d&apos;exploitation, taille d&apos;écran (via Vercel Analytics et Speed Insights).</li>
            <li><strong>Données de consentement publicitaire</strong> — choix de consentement (accepter, refuser, personnaliser) nécessaires pour appliquer vos préférences de publicité.</li>
          </ul>

          <h3>3.3 Stockage local (localStorage)</h3>
          <ul>
            <li>Préférences de profil (genre, âge)</li>
            <li>Historique de session de jeu</li>
            <li>Résultats des tests d&apos;auto-évaluation</li>
          </ul>
          <p>Ces données restent sur votre appareil et ne sont jamais transmises à nos serveurs.</p>
        </section>

        <section className="legal-page__section">
          <h2>4. Finalités du traitement</h2>
          <table className="legal-page__table">
            <thead>
              <tr><th>Finalité</th><th>Base légale</th></tr>
            </thead>
            <tbody>
              <tr><td>Fonctionnement du jeu (votes, classements)</td><td>Intérêt légitime</td></tr>
              <tr><td>Statistiques segmentées (genre/âge)</td><td>Consentement (profil volontaire)</td></tr>
              <tr><td>Analyse de l&apos;Oracle par IA</td><td>Consentement (soumission volontaire)</td></tr>
              <tr><td>Analytics et amélioration du service</td><td>Intérêt légitime</td></tr>
              <tr><td>Protection contre les abus (rate limiting)</td><td>Intérêt légitime</td></tr>
              <tr><td>Diffusion de publicités (Google AdSense)</td><td>Consentement (lorsqu&apos;exigé) / Intérêt légitime selon zone géographique et paramétrage</td></tr>
            </tbody>
          </table>
        </section>

        <section className="legal-page__section">
          <h2>5. Durée de conservation</h2>
          <ul>
            <li><strong>Votes</strong> — conservés tant que le service est actif.</li>
            <li><strong>Sessions analytics</strong> — 12 mois maximum.</li>
            <li><strong>Situations soumises à l&apos;Oracle</strong> — 6 mois maximum.</li>
            <li><strong>Adresses IP</strong> — non stockées (utilisées en mémoire uniquement).</li>
          </ul>
        </section>

        <section className="legal-page__section">
          <h2>6. Transferts de données hors UE</h2>
          <p>
            Certaines données peuvent être transférées vers des pays hors de l&apos;Union Européenne :
          </p>
          <ul>
            <li><strong>Vercel Inc.</strong> (États-Unis) — hébergement. Vercel est signataire du Data Processing Addendum (DPA) et utilise les Clauses Contractuelles Types.</li>
            <li><strong>Google Cloud / Gemini AI</strong> (États-Unis) — analyse des situations Oracle. Couvert par les Clauses Contractuelles Types de Google.</li>
            <li><strong>Supabase Inc.</strong> — base de données. Le projet peut être hébergé en région EU.</li>
          </ul>
        </section>

        <section className="legal-page__section">
          <h2>7. Vos droits (RGPD)</h2>
          <p>Conformément au RGPD, vous disposez des droits suivants :</p>
          <ul>
            <li><strong>Droit d&apos;accès</strong> — obtenir une copie de vos données personnelles.</li>
            <li><strong>Droit de rectification</strong> — corriger des données inexactes.</li>
            <li><strong>Droit à l&apos;effacement</strong> — demander la suppression de vos données.</li>
            <li><strong>Droit à la portabilité</strong> — recevoir vos données dans un format structuré.</li>
            <li><strong>Droit d&apos;opposition</strong> — vous opposer au traitement de vos données.</li>
            <li><strong>Droit de retrait du consentement</strong> — à tout moment, sans affecter la licéité du traitement antérieur.</li>
          </ul>
          <p>
            Pour exercer ces droits, contactez-nous à{' '}
            <a href="mailto:contact@redorgreen.fr">contact@redorgreen.fr</a>.
          </p>
          <p>
            Vous pouvez également introduire une réclamation auprès de la{' '}
            <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">CNIL</a>{' '}
            (Commission Nationale de l&apos;Informatique et des Libertés).
          </p>
        </section>

        <section className="legal-page__section">
          <h2>8. Cookies et stockage local</h2>
          <p>
            Le site utilise des cookies et technologies similaires :
          </p>
          <ul>
            <li><strong>Cookies essentiels</strong> — nécessaires au fonctionnement du site (session, préférences).</li>
            <li><strong>Analytics</strong> — Vercel Analytics et Speed Insights pour mesurer la performance du site.</li>
            <li><strong>Publicité</strong> — Google AdSense peut utiliser des cookies/identifiants pour afficher des annonces et limiter la répétition publicitaire.</li>
          </ul>
          <p>
            Lorsque la réglementation locale l&apos;exige (notamment EEE, Royaume-Uni et Suisse),
            l&apos;affichage d&apos;annonces personnalisées est conditionné à votre consentement via
            une interface de gestion conforme au cadre de transparence et de consentement (TCF).
          </p>
          <p>
            Vous pouvez retirer ou modifier vos choix de consentement à tout moment depuis les
            paramètres de confidentialité affichés sur le site. Vous pouvez aussi configurer votre
            navigateur pour limiter les cookies.
          </p>
          <p>
            Plus d&apos;informations sur la gestion des données publicitaires par Google :{' '}
            <a href="https://policies.google.com/technologies/ads?hl=fr" target="_blank" rel="noopener noreferrer">
              policies.google.com/technologies/ads
            </a>.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>9. Partage avec des partenaires et sous-traitants</h2>
          <p>
            Nous partageons certaines données uniquement avec des prestataires techniques nécessaires
            au fonctionnement du service (hébergement, analytique, diffusion publicitaire, base de
            données), dans la limite de leurs besoins opérationnels.
          </p>
          <ul>
            <li><strong>Google AdSense</strong> — diffusion et mesure publicitaire.</li>
            <li><strong>Vercel</strong> — hébergement, logs techniques et mesures de performance.</li>
            <li><strong>Supabase</strong> — stockage des données applicatives.</li>
          </ul>
        </section>

        <section className="legal-page__section">
          <h2>10. Sécurité</h2>
          <p>
            Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour
            protéger vos données, notamment :
          </p>
          <ul>
            <li>Chiffrement des communications (HTTPS/TLS)</li>
            <li>Authentification sécurisée de l&apos;administration (HMAC-SHA256)</li>
            <li>Limitation de débit sur les API</li>
            <li>Validation et sanitization de toutes les entrées utilisateur</li>
          </ul>
        </section>

        <section className="legal-page__section">
          <h2>11. Mineurs</h2>
          <p>
            Ce site est destiné aux personnes de <strong>16 ans et plus</strong>.
            Les outils d&apos;auto-évaluation abordent des sujets sensibles (violence, consentement)
            qui ne sont pas adaptés à un public mineur sans accompagnement.
          </p>
        </section>

        <Link href="/" className="legal-page__back">← Retour à l&apos;accueil</Link>
      </div>
    </main>
  );
}

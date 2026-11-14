import type { Metadata } from 'next';
import Link from '@/components/ui/LienIntention';
import { AvisVersionFrancaise } from '@/components/legal/AvisVersionFrancaise';
import { CONTACT_EMAIL } from '@/config/contact';
import { cheminLocalise } from '@/lib/i18n/langue';
import { alternances } from '@/lib/i18n/alternances';

/**
 * Les conditions générales d'utilisation en anglais (traduction du
 * 2026-11-14). Traduction fidèle de `app/cgu/page.tsx`, pour information :
 * seule la version française fait foi, et la page le dit en tête. Toute
 * modification de la version française doit être reportée ici.
 */
export const metadata: Metadata = {
  title: 'Terms of Use',
  description:
    'The terms of use of Red or Green: access to the service, rules of conduct, advertising, intellectual property and liability.',
  alternates: alternances('en', '/cgu'),
};

export default function CGUEnPage() {
  return (
    <main id="main-content" className="legal-page">
      <div className="legal-page__container">
        <h1 className="legal-page__title">Terms of Use</h1>
        <p className="legal-page__updated">Last updated: February 28, 2026</p>

        <AvisVersionFrancaise cheminFrancais="/cgu" />

        <section className="legal-page__section">
          <h2>1. Purpose</h2>
          <p>
            These Terms of Use (in French, Conditions Générales d’Utilisation or CGU) govern access
            to and use of the website <strong>redorgreen.fr</strong> and all of its services
            (hereinafter “the Service”).
          </p>
          <p>
            By accessing the Service, you accept these Terms of Use without reservation. If you do
            not accept them, please do not use the Service.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>2. Description of the Service</h2>
          <p>Red or Green is a free online games platform offering:</p>
          <ul>
            <li><strong>Red or Green (Duels)</strong> — a voting game in which players choose the worse behavior between two options.</li>
            <li><strong>Oracle</strong> — an artificial intelligence analysis tool for submitting a situation and getting a “Red Flag” or “Green Flag” opinion.</li>
            <li><strong>Self-assessment tools</strong> — informational questionnaires (Violentomètre, Consentomètre, etc.) on social issues.</li>
            <li><strong>Ranking</strong> — a table of the most-voted options.</li>
          </ul>
        </section>

        <section className="legal-page__section">
          <h2>3. Access to the Service</h2>
          <p>
            The Service is available free of charge, without registration or account creation. The
            publisher reserves the right to suspend or interrupt access to the Service at any time,
            without notice, for maintenance or updates.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>4. Intended audience</h2>
          <p>
            The Service is intended for people aged <strong>16 and over</strong>. Some content, in
            particular the self-assessment tools, deals with sensitive subjects (violence, consent,
            harassment) that are not suitable for minors without parental guidance.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>5. User conduct</h2>
          <p>By using the Service, you agree to:</p>
          <ul>
            <li>Not submit any illegal, defamatory, discriminatory, hateful or pornographic content.</li>
            <li>Not attempt to disrupt the operation of the Service (spam, bots, DDoS attacks, etc.).</li>
            <li>Not use automated systems to interact with the Service without permission.</li>
            <li>Respect the publisher’s intellectual property rights.</li>
          </ul>
          <p>
            The publisher reserves the right to remove any content that breaches these Terms of Use
            and to block access for users who break them.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>6. Self-assessment tools — Warning</h2>
          <p>
            The self-assessment tools (Violentomètre, Consentomètre, Incestomètre, Harcèlomètre,
            Discriminomètre) are provided <strong>for information only</strong>.
          </p>
          <p>
            <strong>They are in no way a medical, psychological or legal diagnosis.</strong> They do
            not replace the advice of a qualified professional.
          </p>
          <p>
            If you are in danger or need help, contact the emergency services immediately. In
            France:
          </p>
          <ul>
            <li><strong>17</strong> — Police / Gendarmerie</li>
            <li><strong>3919</strong> — Violences Femmes Info</li>
            <li><strong>112</strong> — European emergency number</li>
            <li><strong>114</strong> — Emergency number by text message (SMS)</li>
          </ul>
          <p>Outside France, call your local emergency number.</p>
        </section>

        <section className="legal-page__section">
          <h2>7. Oracle — Artificial intelligence</h2>
          <p>
            The Oracle uses an artificial intelligence model (Google Gemini) to analyze the
            situations submitted. The Oracle’s results are generated automatically and should be
            interpreted with caution.
          </p>
          <p>
            The publisher does not guarantee the accuracy, relevance or completeness of the answers
            provided by the Oracle.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>8. Personal data</h2>
          <p>
            Using the Service involves the processing of certain personal data. For more
            information, see our{' '}
            <Link href={cheminLocalise('en', '/confidentialite')}>Privacy Policy</Link>.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>9. Advertising</h2>
          <p>
            The Service is funded by advertising. <strong>Ads</strong> operated by a third-party ad
            network are displayed on the home page and in the games, between two steps (verdict,
            break, end of game), labeled “Publicité” (advertisement). They never appear while you are
            answering or voting, nor on the administration screens. At the end of the Red Flag Test,
            clicking “See my result” may also open an advertising page in the background.
          </p>
          <p>
            These ads load when the pages that carry them are opened, and the ad network’s scripts
            may set trackers. The ways to opt out — browser settings, ad blocker, ad networks’
            opt-out links — are detailed in the{' '}
            <Link href={cheminLocalise('en', '/confidentialite')}>privacy policy</Link>.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>10. Intellectual property</h2>
          <p>
            The entire Service (code, design, text, graphics, game mechanics) is protected by
            intellectual property law. Any unauthorized reproduction is prohibited.
          </p>
          <p>
            Content submitted by users (Oracle situations, votes) may be used anonymously to improve
            the Service.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>11. Limitation of liability</h2>
          <p>
            The Service is provided “as is”. The publisher does not guarantee that the Service will
            be permanently available or free of errors.
          </p>
          <p>
            The publisher cannot be held liable for any direct or indirect damage resulting from the
            use of, or inability to use, the Service.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>12. Changes to the Terms of Use</h2>
          <p>
            The publisher reserves the right to change these Terms of Use at any time. Users will be
            informed of changes by the update of the date at the top of this page. Continued use of
            the Service constitutes acceptance of the amended Terms of Use.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>13. Governing law and jurisdiction</h2>
          <p>
            These Terms of Use are governed by French law. Any dispute relating to their
            interpretation or performance shall be submitted to the competent French courts.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>14. Contact</h2>
          <p>
            For any question about these Terms of Use, you can contact us at:{' '}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </p>
        </section>

        <Link href={cheminLocalise('en', '/')} className="legal-page__back">← Back to home</Link>
      </div>
    </main>
  );
}

import type { Metadata } from 'next';
import Link from '@/components/ui/LienIntention';
import { AvisVersionFrancaise } from '@/components/legal/AvisVersionFrancaise';
import { CONTACT_EMAIL, INSTAGRAM_HANDLE, INSTAGRAM_URL } from '@/config/contact';
import { cheminLocalise } from '@/lib/i18n/langue';

/**
 * Les mentions légales en anglais (traduction du 2026-11-14). Traduction
 * fidèle de `app/mentions-legales/page.tsx`, pour information : seule la
 * version française fait foi, et la page le dit en tête. Toute modification
 * de la version française doit être reportée ici.
 */
export const metadata: Metadata = {
  title: 'Legal Notice',
  description: 'Publisher, host and legal information for the Red or Green website.',
  alternates: { canonical: '/en/mentions-legales' },
};

export default function MentionsLegalesEnPage() {
  return (
    <main id="main-content" className="legal-page">
      <div className="legal-page__container">
        <h1 className="legal-page__title">Legal Notice</h1>
        <p className="legal-page__updated">Last updated: February 28, 2026</p>

        <AvisVersionFrancaise cheminFrancais="/mentions-legales" />

        <section className="legal-page__section">
          <h2>1. Publisher</h2>
          <p>
            The website <strong>redorgreen.fr</strong> is published by:<br />
            <strong>Red or Green</strong><br />
            Editorial and app project available online<br />
            Email: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a><br />
            Instagram:{' '}
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
              @{INSTAGRAM_HANDLE}
            </a><br />
            Publication director: <strong>the Red or Green team</strong>
          </p>
        </section>

        <section className="legal-page__section">
          <h2>2. Host</h2>
          <p>
            The website is hosted by:<br />
            <strong>Vercel Inc.</strong><br />
            440 N Barranca Ave #4133, Covina, CA 91723, United States<br />
            Website: <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">vercel.com</a>
          </p>
        </section>

        <section className="legal-page__section">
          <h2>3. Intellectual property</h2>
          <p>
            All content on redorgreen.fr (text, graphics, images, logos, icons, sounds, software, etc.)
            is the exclusive property of the publisher, unless stated otherwise. Any reproduction,
            representation, modification or distribution, even partial, is prohibited without prior
            written permission.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>4. Liability</h2>
          <p>
            The publisher strives to provide information that is as accurate as possible. However, it
            cannot be held liable for omissions, inaccuracies or failures to keep information up to
            date.
          </p>
          <p>
            The self-assessment tools offered on this site (Violentomètre, Consentomètre, etc.) are
            provided for information only. <strong>They are in no way a professional
            diagnosis</strong> and do not replace the advice of a health professional or a
            specialist. If you are in danger, contact the emergency services (in France: 17, 3919,
            112; elsewhere, your local emergency number).
          </p>
        </section>

        <section className="legal-page__section">
          <h2>5. Links</h2>
          <p>
            The site may contain links to other websites. The publisher has no control over those
            sites and accepts no responsibility for their content.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>6. Advertising and transparency</h2>
          <p>
            The site displays ads operated by a third-party ad network, served from the domains{' '}
            <code>bauval.org</code> and <code>abscloud.org</code>. They are labeled “Publicité”
            (advertisement) and appear on the home page and in the games, between two steps, never
            while you are answering or voting.
          </p>
          <p>
            The publisher has no editorial control over the ads shown, which are selected by the ad
            network. A shocking or misleading ad can be reported to us at the contact address above:
            we will pass it on to the ad network.
          </p>
          <p>
            For more information about cookies and how to opt out, see the{' '}
            <Link href={cheminLocalise('en', '/confidentialite')}>Privacy Policy</Link>.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>7. Governing law</h2>
          <p>
            This legal notice is governed by French law. In the event of a dispute, the French courts
            shall have sole jurisdiction.
          </p>
        </section>

        <Link href={cheminLocalise('en', '/')} className="legal-page__back">← Back to home</Link>
      </div>
    </main>
  );
}

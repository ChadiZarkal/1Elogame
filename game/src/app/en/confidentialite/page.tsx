import type { Metadata } from 'next';
import Link from '@/components/ui/LienIntention';
import { AvisVersionFrancaise } from '@/components/legal/AvisVersionFrancaise';
import { CONTACT_EMAIL } from '@/config/contact';
import { cheminLocalise } from '@/lib/i18n/langue';

/**
 * La politique de confidentialité en anglais (traduction du 2026-11-14).
 * Traduction fidèle de `app/confidentialite/page.tsx`, pour information :
 * seule la version française fait foi, et la page le dit en tête. Toute
 * modification de la version française doit être reportée ici.
 */
export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How Red or Green handles your data: cookies, advertising, analytics, processors and how to exercise your rights.',
  alternates: { canonical: '/en/confidentialite' },
};

export default function ConfidentialiteEnPage() {
  return (
    <main id="main-content" className="legal-page">
      <div className="legal-page__container">
        <h1 className="legal-page__title">Privacy Policy</h1>
        <p className="legal-page__updated">Last updated: September 29, 2026</p>

        <AvisVersionFrancaise cheminFrancais="/confidentialite" />

        <section className="legal-page__section">
          <h2>1. Introduction</h2>
          <p>
            This privacy policy describes how <strong>Red or Green</strong>{' '}
            (<a href="https://redorgreen.fr">redorgreen.fr</a>) collects, uses and protects users’
            information, in accordance with the General Data Protection Regulation (GDPR) and the
            French Data Protection Act (loi Informatique et Libertés).
          </p>
        </section>

        <section className="legal-page__section">
          <h2>2. Data controller</h2>
          <p>
            <strong>Red or Green</strong> (publisher of the website redorgreen.fr)<br />
            Email: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </p>
          <p>
            For any request relating to the processing of personal data, you can contact us at this
            address.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>3. Data collected</h2>

          <h3>3.1 Data you provide voluntarily</h3>
          <ul>
            <li><strong>Gender and age range</strong> — selected before playing the duels. This data is used only to display segmented statistics (rankings by gender/age).</li>
            <li><strong>Red Flag Test</strong> — sex, age range and answers to the questionnaire, recorded with the score, the length of the game and a random sharing code. No name, email address or identifier is requested. A result can only be viewed by whoever has its link; the answers appear nowhere else except mixed with everyone else’s, in the test’s public statistics.</li>
            <li><strong>Free text</strong> — situations submitted to the Oracle. These texts are sent to an AI service (Google Gemini) for analysis.</li>
            <li><strong>Voice</strong> — if you use the Oracle’s dictation button. The recording is processed by your browser’s speech recognition, not by us: we only receive the resulting text. On Chrome and Edge, this speech recognition sends the audio to Google’s servers; on Safari, it may be processed on the device. We do not keep any recording. Dictation is optional: the keyboard remains available.</li>
          </ul>

          <h3>3.2 Data collected automatically</h3>
          <ul>
            <li><strong>Session data</strong> — length of visit, pages viewed, interaction events (internal analytics).</li>
            <li><strong>IP address</strong> — used only for rate limiting, to protect the service against abuse. Not stored in the database.</li>
            <li><strong>Technical data</strong> — browser type, operating system, screen size (via Vercel Analytics and Speed Insights).</li>
          </ul>

          <h3>3.3 Local storage (localStorage)</h3>
          <ul>
            <li>Profile preferences (gender, age)</li>
            <li>Game session history</li>
            <li>Self-assessment test results</li>
            <li>The Red Flag Test game in progress, so that you can resume it — deleted once it is more than seven days old</li>
          </ul>
          <p>
            This data stays on your device and is never sent to our servers. The Oracle’s voice
            dictation is the exception and is described in section 3.1: it goes through your
            browser’s speech recognition.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>4. Purposes of processing</h2>
          <div className="legal-page__table-wrap">
          <table className="legal-page__table">
            <thead>
              <tr><th>Purpose</th><th>Legal basis</th></tr>
            </thead>
            <tbody>
              <tr><td>Running the game (votes, rankings)</td><td>Legitimate interest</td></tr>
              <tr><td>Segmented statistics (gender/age)</td><td>Consent (voluntary profile)</td></tr>
              <tr><td>AI analysis by the Oracle</td><td>Consent (voluntary submission)</td></tr>
              <tr><td>Analytics and service improvement</td><td>Legitimate interest</td></tr>
              <tr><td>Protection against abuse (rate limiting)</td><td>Legitimate interest</td></tr>
            </tbody>
          </table>
          </div>
        </section>

        <section className="legal-page__section">
          <h2>5. Retention period</h2>
          <ul>
            <li><strong>Votes</strong> — kept as long as the service is active.</li>
            <li><strong>Red Flag Test games</strong> — kept as long as the service is active.</li>
            <li><strong>Analytics sessions</strong> — 12 months maximum.</li>
            <li><strong>Situations submitted to the Oracle</strong> — 6 months maximum.</li>
            <li><strong>IP addresses</strong> — not stored (used in memory only).</li>
          </ul>
        </section>

        <section className="legal-page__section">
          <h2>6. Transfers of data outside the EU</h2>
          <p>
            Some data may be transferred to countries outside the European Union:
          </p>
          <ul>
            <li><strong>Vercel Inc.</strong> (United States) — hosting. Vercel has signed the Data Processing Addendum (DPA) and uses the Standard Contractual Clauses.</li>
            <li><strong>Google Cloud / Gemini AI</strong> (United States) — analysis of Oracle situations. Covered by Google’s Standard Contractual Clauses.</li>
            <li><strong>Browser speech recognition</strong> — on Chrome and Edge, the dictation audio is sent to Google’s servers by the browser itself. This transfer is governed by your browser’s terms, not ours: we have no access to either the audio or the metadata.</li>
            <li><strong>Supabase Inc.</strong> — database. The project may be hosted in an EU region.</li>
            <li><strong>Ad network</strong> — the advertising scripts are served from the domains <code>bauval.org</code> and <code>abscloud.org</code>, outside the European Union. Loading these scripts sends the ad network your IP address, your browser and the page viewed. This happens when pages that carry an ad are loaded, listed below.</li>
          </ul>
        </section>

        <section className="legal-page__section">
          <h2>7. Your rights (GDPR)</h2>
          <p>Under the GDPR, you have the following rights:</p>
          <ul>
            <li><strong>Right of access</strong> — obtain a copy of your personal data.</li>
            <li><strong>Right to rectification</strong> — correct inaccurate data.</li>
            <li><strong>Right to erasure</strong> — request the deletion of your data.</li>
            <li><strong>Right to data portability</strong> — receive your data in a structured format.</li>
            <li><strong>Right to object</strong> — object to the processing of your data.</li>
            <li><strong>Right to withdraw consent</strong> — at any time, without affecting the lawfulness of processing carried out before.</li>
          </ul>
          <p>
            To exercise these rights, contact us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
          <p>
            You may also lodge a complaint with the{' '}
            <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">CNIL</a>{' '}
            (Commission Nationale de l’Informatique et des Libertés, the French data protection
            authority).
          </p>
        </section>

        <section className="legal-page__section">
          <h2>8. Cookies and local storage</h2>
          <p>
            The site uses cookies and similar technologies:
          </p>
          <ul>
            <li><strong>Essential cookies</strong> — needed for the site to work (session, preferences).</li>
            <li><strong>Analytics</strong> — Vercel Analytics and Speed Insights to measure the site’s performance.</li>
          </ul>
          <p>
            The site displays <strong>ads</strong> operated by a third-party ad network, whose scripts
            are served from the domains <code>bauval.org</code> and <code>abscloud.org</code>. These
            ads are labeled “Publicité” (advertisement).
          </p>
          <p>
            These scripts load when the pages concerned are opened. The ad network and its partners
            may set cookies and use technical identifiers to measure how ads are displayed and to
            tailor them to your previous visits to this site or to other sites.
          </p>
          <p>
            Ads appear on the home page and in the games, between two steps: verdicts, breaks, start
            and end-of-game screens. They are never loaded while you are answering or voting, nor on
            the administration screens. At the end of the Red Flag Test, clicking “See my result” may
            also open an advertising page in the background (a “pop-under”).
          </p>
          <p>
            <strong>To opt out</strong>, several options are available to you: set your browser to
            block third-party cookies, install an ad blocker, or use the opt-out links below. You can
            also write to us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> to exercise
            your right to object.
          </p>
          <p>
            You can opt out of advertising cookies via{' '}
            <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">
              aboutads.info/choices
            </a>, or configure your browser to limit cookies.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>9. Sharing with partners and processors</h2>
          <p>
            We share certain data only with technical service providers needed to run the service
            (hosting, analytics, database), to the extent of their operational needs.
          </p>
          <ul>
            <li><strong>Vercel</strong> — hosting, technical logs and performance measurements.</li>
            <li><strong>Supabase</strong> — storage of application data.</li>
            <li><strong>Google (Gemini)</strong> — analysis of texts submitted to the Oracle.</li>
            <li>
              <strong>Ad network</strong> (<code>bauval.org</code>, <code>abscloud.org</code>)
              — display of ads.
            </li>
          </ul>
        </section>

        <section className="legal-page__section">
          <h2>10. Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your data,
            including:
          </p>
          <ul>
            <li>Encrypted communications (HTTPS/TLS)</li>
            <li>Secure authentication for administration (HMAC-SHA256)</li>
            <li>Rate limiting on the APIs</li>
            <li>Validation and sanitization of all user input</li>
          </ul>
        </section>

        <section className="legal-page__section">
          <h2>11. Minors</h2>
          <p>
            This site is intended for people aged <strong>16 and over</strong>. The self-assessment
            tools deal with sensitive subjects (violence, consent) that are not suitable for minors
            without support.
          </p>
        </section>

        <Link href={cheminLocalise('en', '/')} className="legal-page__back">← Back to home</Link>
      </div>
    </main>
  );
}

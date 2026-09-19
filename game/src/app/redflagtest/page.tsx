/**
 * @module redflagtest/page
 * Maquette du Red Flag Test — le front-end seul.
 *
 * CE QUE CETTE PAGE EST
 *   Le front-end de `ChadiZarkal/redorgreenorigin`, repris tel quel pour la
 *   partie questions et le récap, posé sur cinq questions écrites en dur. Elle
 *   existe pour qu'on puisse juger le rendu, rien d'autre.
 *
 * CE QU'ELLE N'EST PAS
 *   Il n'y a ni base de données, ni API, ni barème, ni enregistrement, ni
 *   branchement entre questions, ni écran d'entrée — le clic depuis l'accueil
 *   tombe directement sur la première question. Le score et les classements du
 *   récap sont fabriqués dans le navigateur à partir des réponses cliquées.
 *
 * Le cadre reproduit le markup d'origine : `main.main-container` >
 * `div.client-container` > `header.site-header`. Ces noms sont ce que
 * `flac.css` stylise ; les renommer supprimerait le design en silence.
 */

import Link from 'next/link';
import { Quiz } from './Quiz';

export default function RedflagtestPage() {
  return (
    <main className="main-container redflagtest" id="main-content">
      <div className="client-container">
        <header className="site-header">
          <Link href="/" className="logo-link">
            {/* eslint-disable-next-line @next/next/no-img-element -- markup de
                référence : `flac.css` dimensionne l'image via .logo-image, et
                next/image réécrirait l'URL. */}
            <img className="logo-image" src="/rft/img/logo-rog.svg" alt="Red or Green" />
          </Link>
          <h1 className="site-tagline">Le test qui montre tes vraies couleurs...</h1>
          {/* Le récap annonce « Top 8 % des hommes » et « 14 382 participant·es ».
              Ces nombres ont l'air vrais, et ils ne le sont pas : le dire une
              fois, en permanence, coûte une ligne. */}
          <p className="mockup-notice">
            Maquette — questions, score et statistiques sont inventés
          </p>
        </header>
        <Quiz />
      </div>
    </main>
  );
}

/**
 * @module redflagtest/page
 * Le Red Flag Test.
 *
 * Le front-end vient de `ChadiZarkal/redorgreenorigin`, repris tel quel. Le
 * contenu — questions, réponses, points, tags, verdicts — se saisit dans
 * `/admin/redflagtest` et vit en base. Rien n'est écrit en dur ici.
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
          {/* L'accroche de la référence restait affichée du début à la fin de
              la partie, juste sous le logo. Elle n'apporte rien après le premier
              écran et mange de la hauteur à chaque question. Le titre reste dans
              le document — une page a besoin d'un h1, et un lecteur d'écran
              aussi — mais il quitte l'écran. */}
          <h1 className="visually-hidden">Red Flag Test</h1>
        </header>
        <Quiz />
      </div>
    </main>
  );
}

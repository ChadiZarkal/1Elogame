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

import { PageTest } from './PageTest';

export default function RedflagtestPage() {
  return <PageTest langue="fr" />;
}

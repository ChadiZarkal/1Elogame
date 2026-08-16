/**
 * Composant serveur. Les notes sont rendues ici plutôt que dans le
 * `layout.tsx`, qui est aussi le parent des cinq pages d'outil — chacune a sa
 * propre FAQ, et le balisage de deux FAQPage sur la même page serait fautif.
 */

import RessourcesClient from './RessourcesClient';
import { PageNotes } from '@/components/content/PageNotes';
import { RESSOURCES_NOTES } from '@/content/page-notes';

export default function RessourcesPage() {
  return (
    <>
      <RessourcesClient />
      <PageNotes notes={RESSOURCES_NOTES} />
    </>
  );
}

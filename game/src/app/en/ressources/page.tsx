import RessourcesClient from '@/app/ressources/RessourcesClient';
import { PageNotes } from '@/components/content/PageNotes';
import { RESSOURCES_NOTES_EN } from '@/content/page-notes-en';

/**
 * Les outils d'auto-évaluation en anglais. Même composant que la version
 * française (`app/ressources/page.tsx`), dans la langue que pose le gabarit
 * `/en`, suivi des notes éditoriales en anglais.
 */
export default function RessourcesEnPage() {
  return (
    <>
      <RessourcesClient />
      <PageNotes notes={RESSOURCES_NOTES_EN} langue="en" />
    </>
  );
}

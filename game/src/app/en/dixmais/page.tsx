/**
 * « It's a 10 but… » : le jeu, comme `app/dixmais/page.tsx`, suivi des notes
 * éditoriales en anglais. Les textes du jeu suivent la langue que pose
 * `app/en/layout.tsx`.
 */

import DixmaisClient from '@/app/dixmais/DixmaisClient';
import { PageNotes } from '@/components/content/PageNotes';
import { DIXMAIS_NOTES_EN } from '@/content/page-notes-en';

export default function DixMaisEnPage() {
  return (
    <>
      <DixmaisClient />
      <PageNotes notes={DIXMAIS_NOTES_EN} langue="en" />
    </>
  );
}

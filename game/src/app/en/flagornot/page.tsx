/**
 * L'Oracle en anglais. Voir `app/flagornot/page.tsx`, dont il reprend la
 * composition : le jeu, puis ses notes éditoriales (en anglais).
 */

import FlagornotClient from '@/app/flagornot/FlagornotClient';
import { PageNotes } from '@/components/content/PageNotes';
import { ORACLE_NOTES_EN } from '@/content/page-notes-en';

export default function FlagOrNotEnPage() {
  return (
    <>
      <FlagornotClient />
      <PageNotes notes={ORACLE_NOTES_EN} langue="en" />
    </>
  );
}

/**
 * « The Worse of Two » : le formulaire de profil, comme `app/jeu/page.tsx`,
 * suivi des notes éditoriales en anglais.
 */

import JeuClient from '@/app/jeu/JeuClient';
import { PageNotes } from '@/components/content/PageNotes';
import { JEU_NOTES_EN } from '@/content/page-notes-en';

export default function JeuEnPage() {
  return (
    <>
      <JeuClient />
      <PageNotes notes={JEU_NOTES_EN} langue="en" />
    </>
  );
}

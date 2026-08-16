/**
 * Composant serveur. Les notes sont rendues ici plutôt que dans le
 * `layout.tsx`, qui est aussi le parent de `/dixmais/leaderboard` et de la
 * console d'administration.
 */

import DixmaisClient from './DixmaisClient';
import { PageNotes } from '@/components/content/PageNotes';
import { DIXMAIS_NOTES } from '@/content/page-notes';

export default function DixMaisPage() {
  return (
    <>
      <DixmaisClient />
      <PageNotes notes={DIXMAIS_NOTES} />
    </>
  );
}

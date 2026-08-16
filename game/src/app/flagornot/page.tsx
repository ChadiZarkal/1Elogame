/**
 * Composant serveur. Les notes sont rendues ici plutôt que dans le
 * `layout.tsx`, qui est aussi le parent de `/flagornot/stats`.
 */

import FlagornotClient from './FlagornotClient';
import { PageNotes } from '@/components/content/PageNotes';
import { ORACLE_NOTES } from '@/content/page-notes';

export default function FlagOrNotPage() {
  return (
    <>
      <FlagornotClient />
      <PageNotes notes={ORACLE_NOTES} />
    </>
  );
}

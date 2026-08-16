/**
 * Composant serveur. Les notes sont rendues ici plutôt que dans le
 * `layout.tsx`, qui est aussi le parent de `/flashflag/session/[code]`.
 */

import FlashflagClient from './FlashflagClient';
import { PageNotes } from '@/components/content/PageNotes';
import { FLASHFLAG_NOTES } from '@/content/page-notes';

export default function FlashFlagPage() {
  return (
    <>
      <FlashflagClient />
      <PageNotes notes={FLASHFLAG_NOTES} />
    </>
  );
}

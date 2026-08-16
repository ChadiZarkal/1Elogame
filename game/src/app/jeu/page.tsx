/**
 * Composant serveur : l'écran de jeu est un composant client dont le HTML se
 * réduit à un formulaire. Le contenu éditorial est rendu ici, et non dans le
 * `layout.tsx` — celui-ci est aussi le parent de `/jeu/jouer` et `/jeu/recap`,
 * où ces notes n'ont rien à faire et feraient doublon.
 */

import JeuClient from './JeuClient';
import { PageNotes } from '@/components/content/PageNotes';
import { JEU_NOTES } from '@/content/page-notes';

export default function JeuPage() {
  return (
    <>
      <JeuClient />
      <PageNotes notes={JEU_NOTES} />
    </>
  );
}

/**
 * @module app/page
 * Accueil.
 *
 * Composant serveur volontairement mince : le sélecteur de jeu est un carrousel
 * à état, qui ne rend qu'une carte sur quatre au premier passage et garde ses
 * deux tiroirs démontés tant qu'on ne les ouvre pas. Le HTML initial de la page
 * la plus importante du site se réduisait donc à quelques dizaines de mots.
 *
 * La présentation du site est servie ici, sous le sélecteur : rendue côté
 * serveur, sans état, donc présente pour un visiteur sans JavaScript comme pour
 * un robot d'indexation.
 */

import { HubClient } from './HubClient';
import { PageNotes } from '@/components/content/PageNotes';
import { HOME_NOTES } from '@/content/page-notes';

export default function HomePage() {
  return (
    <>
      <HubClient />
      <PageNotes notes={HOME_NOTES} />
    </>
  );
}

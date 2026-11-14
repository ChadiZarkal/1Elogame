import { PageClassement } from './PageClassement';

// Le classement évolue en continu : on le régénère côté serveur au plus toutes
// les 5 minutes. Le HTML servi contient ainsi toujours de vraies données.
export const revalidate = 300;

/** Le classement. Le rendu est partagé avec `/en/classement` (`PageClassement`). */
export default function ClassementPage() {
  return <PageClassement langue="fr" />;
}

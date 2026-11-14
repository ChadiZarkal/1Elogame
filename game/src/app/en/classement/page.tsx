import { PageClassement } from '@/app/classement/PageClassement';

// Même cadence que la version française.
export const revalidate = 300;

/** Le classement en anglais. Voir `app/classement/PageClassement.tsx`. */
export default function ClassementEnPage() {
  return <PageClassement langue="en" />;
}

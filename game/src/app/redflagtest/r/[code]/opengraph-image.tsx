import { imageResultat } from './imageResultat';

// Node et non edge : le gabarit lit le logo et la police sur le disque.
export const runtime = 'nodejs';
export const alt = 'Résultat du Red Flag Test';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return imageResultat(code, 'fr');
}

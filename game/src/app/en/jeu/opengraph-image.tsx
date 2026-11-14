import { carteOg, TAILLE_OG } from '@/lib/carteOg';

// Node et non edge : le gabarit lit le logo et la police sur le disque.
export const runtime = 'nodejs';

export const alt = 'The Worse of Two — Red or Green';
export const size = TAILLE_OG;
export const contentType = 'image/png';

export default function Image() {
  return carteOg({
    emoji: '🔥',
    titre: 'The Worse of Two',
    sous: 'Two behaviors, you pick the worse one. Then you see how everyone else voted.',
    chemin: '/en/jeu',
    teinte: '#2ECC71',
  });
}

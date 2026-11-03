import { carteOg, TAILLE_OG } from '@/lib/carteOg';

// Node et non edge : le gabarit lit le logo et la police sur le disque.
export const runtime = 'nodejs';

export const alt = 'Le pire des deux — Red or Green';
export const size = TAILLE_OG;
export const contentType = 'image/png';

export default function Image() {
  return carteOg({
    emoji: '🔥',
    titre: 'Le pire des deux',
    sous: 'Deux comportements, tu désignes le plus grave. Puis tu découvres ce qu’ont voté les autres.',
    chemin: '/jeu',
    teinte: '#2ECC71',
  });
}

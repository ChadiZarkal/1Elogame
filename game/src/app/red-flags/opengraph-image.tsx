import { carteOg, TAILLE_OG } from '@/lib/carteOg';

export const runtime = 'edge';

export const alt = 'Les pires red flags, d’après les votes — Red or Green';
export const size = TAILLE_OG;
export const contentType = 'image/png';

export default function Image() {
  return carteOg({
    emoji: '🚩',
    titre: 'Les pires red flags, d’après les votes',
    sous: 'La liste classée par des milliers de duels, mise à jour chaque heure.',
    chemin: '/red-flags',
    teinte: '#FF6B5E',
  });
}

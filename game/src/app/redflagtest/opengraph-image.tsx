import { carteOg, TAILLE_OG } from '@/lib/carteOg';

export const runtime = 'edge';

export const alt = 'Red Flag Test — es-tu un red flag ?';
export const size = TAILLE_OG;
export const contentType = 'image/png';

export default function Image() {
  return carteOg({
    emoji: '🧪',
    titre: 'Red Flag Test : es-tu un red flag ?',
    sous: 'Le test gratuit et anonyme : ton score en pourcentage, et ta place parmi les autres joueurs.',
    chemin: '/redflagtest',
    teinte: '#FFB4AA',
  });
}

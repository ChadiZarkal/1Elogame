import { ImageResponse } from 'next/og';
import { FOND_OG, LogoOg, policesOg, ressourcesOg, TAILLE_OG } from '@/lib/carteOg';

// Node et non edge : le logo et la police sont lus sur le disque.
export const runtime = 'nodejs';

export const alt = 'Red or Green — le Red Flag Test et les jeux de red flags';
export const size = TAILLE_OG;
export const contentType = 'image/png';

/**
 * L'image de partage du site : le logo, en grand, tel qu'il est sur
 * l'accueil, et les quatre jeux nommés comme à l'écran. La version précédente
 * écrivait « Red or Green » en police système à côté d'un fanion dessiné : la
 * vignette ne ressemblait pas au site.
 */

const JEUX = [
  { nom: 'Red Flag Test', couleur: '#FFB4AA' },
  { nom: 'C’est un 10 mais…', couleur: '#F59E0B' },
  { nom: 'L’Oracle', couleur: '#88CEFF' },
  { nom: 'Le pire des deux', couleur: '#2ECC71' },
];

export default async function Image() {
  const r = await ressourcesOg();

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          width: '100%',
          height: '100%',
          backgroundImage: FOND_OG,
          fontFamily: 'sans-serif',
        }}
      >
        <LogoOg r={r} hauteur={210} />

        <p style={{ color: '#D4D4D8', fontSize: '34px', marginTop: '34px', textAlign: 'center' }}>
          « Red flag » désigne tout et n’importe quoi. Ici, les joueurs tranchent.
        </p>

        <div style={{ display: 'flex', gap: '14px', marginTop: '30px' }}>
          {JEUX.map((jeu) => (
            <div
              key={jeu.nom}
              style={{
                display: 'flex',
                padding: '10px 22px',
                borderRadius: '12px',
                border: `2px solid ${jeu.couleur}66`,
                color: jeu.couleur,
                fontFamily: 'Agdasima',
                fontSize: '34px',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              {jeu.nom}
            </div>
          ))}
        </div>

        <p style={{ color: '#71717A', fontSize: '24px', marginTop: '30px' }}>redorgreen.fr · gratuit, sans compte</p>
      </div>
    ),
    { ...TAILLE_OG, fonts: policesOg(r) },
  );
}

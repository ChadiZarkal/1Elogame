import { ImageResponse } from 'next/og';

export const alt = "Red or Green — party games mobiles gratuits, sans compte";
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * La vignette précédente annonçait « Red FLAG Games » — un nom que le site ne
 * porte plus — et posait son sujet sur deux emojis. `ImageResponse` compose
 * avec satori, qui n'embarque aucune police emoji : les deux glyphes sortaient
 * vides. Le fanion est donc tracé en SVG, comme dans le jeu d'icônes, et les
 * trois jeux sont nommés tels qu'ils le sont à l'écran.
 */

const GAMES = [
  { name: 'Le pire des deux', color: '#22C55E' },
  { name: "L'Oracle", color: '#88CEFF' },
  { name: "C'est un 10 mais...", color: '#F59E0B' },
];

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: '#0A0A0B',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Deux voiles de couleur, l'une rouge l'autre verte, qui reprennent
            la diagonale de l'icône sans la répéter littéralement. */}
        <div
          style={{
            position: 'absolute',
            top: -220,
            left: -160,
            width: 620,
            height: 620,
            borderRadius: 620,
            background: '#FF2D2D',
            opacity: 0.18,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -240,
            right: -160,
            width: 620,
            height: 620,
            borderRadius: 620,
            background: '#22C55E',
            opacity: 0.18,
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <svg width="104" height="104" viewBox="0 0 100 100">
            <g fill="#FFFFFF">
              <path d="M0 3.5A3.5 3.5 0 0 1 7 3.5V96.5A3.5 3.5 0 0 1 0 96.5Z" />
              <path d="M3.5 0A5.5 5.5 0 1 1 3.5 11A5.5 5.5 0 0 1 3.5 0Z" />
              <path d="M7 8C34 12 68 20 99 33.5C99 33.5 68 43 7 61Z" />
            </g>
          </svg>
          <div style={{ display: 'flex', fontSize: 92, fontWeight: 900, letterSpacing: -3 }}>
            <span style={{ color: '#FF2D2D' }}>Red</span>
            <span style={{ color: '#F5F5F7', padding: '0 16px' }}>or</span>
            <span style={{ color: '#22C55E' }}>Green</span>
          </div>
        </div>

        <p style={{ color: '#D0D0D6', fontSize: 32, marginTop: 24, fontWeight: 600 }}>
          Party games mobiles gratuits — sans compte, sans téléchargement
        </p>

        <div style={{ display: 'flex', gap: 18, marginTop: 44 }}>
          {GAMES.map((game) => (
            <div
              key={game.name}
              style={{
                border: `2px solid ${game.color}59`,
                borderRadius: 16,
                padding: '12px 28px',
                color: game.color,
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              {game.name}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}

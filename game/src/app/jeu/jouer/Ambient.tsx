'use client';

/**
 * @module jeu/jouer/Ambient
 * Fond du jeu.
 *
 * Dégradés radiaux masqués plutôt que `filter: blur()` : même douceur, une
 * fraction du coût de composition. Le jeu se joue en soirée sur des téléphones
 * qui ne sont pas tous récents.
 */

const GRAIN =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23g)'/%3E%3C/svg%3E";

export function Ambient({ tint }: { tint: string }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: '#08080C' }} />

      <div
        className="absolute inset-0"
        style={{
          backgroundColor: tint,
          opacity: 0.26,
          maskImage: 'radial-gradient(125% 65% at 50% -8%, #000 0%, transparent 62%)',
          WebkitMaskImage: 'radial-gradient(125% 65% at 50% -8%, #000 0%, transparent 62%)',
          transition: 'background-color 600ms ease',
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          backgroundColor: tint,
          opacity: 0.13,
          maskImage: 'radial-gradient(95% 40% at 50% 106%, #000 0%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(95% 40% at 50% 106%, #000 0%, transparent 70%)',
          transition: 'background-color 600ms ease',
        }}
      />

      <div
        className="absolute inset-0 mix-blend-overlay"
        style={{ backgroundImage: `url("${GRAIN}")`, opacity: 0.045 }}
      />
    </div>
  );
}

'use client';

/**
 * @module jeu/jouer/Ambient
 * Fond du jeu.
 *
 * Deux teintes plutôt qu'une : le halo réactif au choix, et un violet froid fixe
 * en bas d'écran. Une seule couleur déclinée en opacités donne un fond plat ;
 * c'est le décalage entre deux sources lumineuses qui creuse la profondeur.
 *
 * Dégradés radiaux masqués plutôt que `filter: blur()` — même douceur, une
 * fraction du coût de composition. Le jeu se joue en soirée, sur des téléphones
 * qui ne sont pas tous récents.
 */

const GRAIN =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23g)'/%3E%3C/svg%3E";

/** Contre-jour froid, indépendant de la note : il tient le bas de l'écran. */
const COUNTER_LIGHT = '#6D28D9';

export function Ambient({ tint }: { tint: string }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: '#07070B' }} />

      {/* Halo principal, réactif au choix du joueur. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: tint,
          opacity: 0.3,
          maskImage: 'radial-gradient(135% 62% at 50% -12%, #000 0%, transparent 60%)',
          WebkitMaskImage: 'radial-gradient(135% 62% at 50% -12%, #000 0%, transparent 60%)',
          transition: 'background-color 600ms ease',
        }}
      />

      {/* Contre-jour, décalé pour éviter la symétrie. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: COUNTER_LIGHT,
          opacity: 0.2,
          maskImage: 'radial-gradient(80% 42% at 22% 104%, #000 0%, transparent 68%)',
          WebkitMaskImage: 'radial-gradient(80% 42% at 22% 104%, #000 0%, transparent 68%)',
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          backgroundColor: tint,
          opacity: 0.1,
          maskImage: 'radial-gradient(70% 34% at 88% 96%, #000 0%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(70% 34% at 88% 96%, #000 0%, transparent 70%)',
          transition: 'background-color 600ms ease',
        }}
      />

      <div
        className="absolute inset-0 mix-blend-overlay"
        style={{ backgroundImage: `url("${GRAIN}")`, opacity: 0.05 }}
      />
    </div>
  );
}

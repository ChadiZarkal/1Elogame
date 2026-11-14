import { ImageResponse } from 'next/og';

/* Pendant anglais de `app/ressources/opengraph-image.tsx` : même carte, textes
   traduits ; les noms français des outils restent ceux qu'on reconnaît. */

export const runtime = 'edge';

export const alt = 'Violence meter, consent meter & free self-assessment tools';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const badge = (couleur: string, fond: string, bord: string) => ({
  background: fond,
  border: `1px solid ${bord}`,
  borderRadius: '12px',
  padding: '8px 20px',
  color: couleur,
  fontSize: '18px',
  fontWeight: 600,
});

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
          background: 'linear-gradient(135deg, #0D0D0D 0%, #1A1A1A 50%, #0D0D0D 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', gap: '16px', fontSize: '56px', marginBottom: '20px' }}>
          <span>🛡️</span>
          <span>🤝</span>
          <span>⚖️</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ color: '#F5F5F5', fontSize: '48px', fontWeight: 900, letterSpacing: '-1px' }}>
            Self-assessment tools
          </span>
        </div>

        <p style={{ color: '#A3A3A3', fontSize: '24px', marginTop: '16px', textAlign: 'center', maxWidth: '800px' }}>
          Violentomètre · Consentomètre · Harcèlomètre · Discriminomètre · Incestomètre
        </p>

        <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
          <div style={badge('#EF4444', 'rgba(239, 68, 68, 0.15)', 'rgba(239, 68, 68, 0.4)')}>100% Free</div>
          <div style={badge('#10B981', 'rgba(16, 185, 129, 0.15)', 'rgba(16, 185, 129, 0.4)')}>100% Anonymous</div>
          <div style={badge('#3B82F6', 'rgba(59, 130, 246, 0.15)', 'rgba(59, 130, 246, 0.4)')}>Instant results</div>
        </div>

        <p style={{ color: '#525252', fontSize: '16px', marginTop: '24px' }}>
          redorgreen.fr/en/ressources
        </p>
      </div>
    ),
    { ...size }
  );
}

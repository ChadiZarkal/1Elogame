import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Violentomètre, Consentomètre & outils d\'auto-évaluation gratuits';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

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
            Outils d&apos;auto-évaluation
          </span>
        </div>

        <p style={{ color: '#A3A3A3', fontSize: '24px', marginTop: '16px', textAlign: 'center', maxWidth: '800px' }}>
          Violentomètre · Consentomètre · Harcèlomètre · Discriminomètre · Incestomètre
        </p>

        <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '12px',
            padding: '8px 20px',
            color: '#EF4444',
            fontSize: '18px',
            fontWeight: 600,
          }}>
            100% Gratuit
          </div>
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '12px',
            padding: '8px 20px',
            color: '#10B981',
            fontSize: '18px',
            fontWeight: 600,
          }}>
            100% Anonyme
          </div>
          <div style={{
            background: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            borderRadius: '12px',
            padding: '8px 20px',
            color: '#3B82F6',
            fontSize: '18px',
            fontWeight: 600,
          }}>
            Résultats immédiats
          </div>
        </div>

        <p style={{ color: '#525252', fontSize: '16px', marginTop: '24px' }}>
          redorgreen.fr/ressources
        </p>
      </div>
    ),
    { ...size }
  );
}

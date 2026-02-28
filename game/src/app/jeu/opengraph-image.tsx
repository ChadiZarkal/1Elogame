import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Red or Green — Quel est le plus gros Red Flag ?';
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
          background: 'linear-gradient(135deg, #0D0D0D 0%, #1C0808 50%, #0D0D0D 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', gap: '16px', fontSize: '72px', marginBottom: '16px' }}>
          <span>🚩</span>
          <span style={{ color: '#6B7280', fontSize: '48px', alignSelf: 'center' }}>VS</span>
          <span>🏳️</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#DC2626', fontSize: '64px', fontWeight: 900 }}>Red</span>
          <span style={{ color: '#F5F5F5', fontSize: '64px', fontWeight: 900 }}>or</span>
          <span style={{ color: '#10B981', fontSize: '64px', fontWeight: 900 }}>Green</span>
        </div>

        <p style={{ color: '#A3A3A3', fontSize: '26px', marginTop: '16px' }}>
          Quel est le plus gros Red Flag ? Vote et compare !
        </p>

        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '28px',
        }}>
          <div style={{
            background: 'rgba(220, 38, 38, 0.15)',
            border: '1px solid rgba(220, 38, 38, 0.4)',
            borderRadius: '12px',
            padding: '8px 20px',
            color: '#EF4444',
            fontSize: '18px',
            fontWeight: 600,
          }}>
            Party Game Gratuit
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
            Sans Inscription
          </div>
        </div>

        <p style={{ color: '#525252', fontSize: '16px', marginTop: '24px' }}>
          redorgreen.fr/jeu
        </p>
      </div>
    ),
    { ...size }
  );
}

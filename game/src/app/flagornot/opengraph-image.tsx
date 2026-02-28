import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Oracle — Red Flag ou Green Flag ?';
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
          background: 'linear-gradient(135deg, #0D0D0D 0%, #1A0A2E 50%, #0D0D0D 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <span style={{ fontSize: '96px', marginBottom: '16px' }}>🔮</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#F5F5F5', fontSize: '56px', fontWeight: 900 }}>Oracle</span>
        </div>

        <p style={{ color: '#A3A3A3', fontSize: '26px', marginTop: '12px', textAlign: 'center', maxWidth: '700px' }}>
          Soumets n&apos;importe quelle situation et découvre le verdict :
        </p>

        <div style={{ display: 'flex', gap: '20px', marginTop: '24px' }}>
          <div style={{
            background: 'rgba(220, 38, 38, 0.2)',
            border: '2px solid rgba(220, 38, 38, 0.5)',
            borderRadius: '16px',
            padding: '12px 32px',
            color: '#EF4444',
            fontSize: '28px',
            fontWeight: 800,
          }}>
            🚩 RED FLAG
          </div>
          <span style={{ color: '#525252', fontSize: '28px', alignSelf: 'center' }}>ou</span>
          <div style={{
            background: 'rgba(16, 185, 129, 0.2)',
            border: '2px solid rgba(16, 185, 129, 0.5)',
            borderRadius: '16px',
            padding: '12px 32px',
            color: '#10B981',
            fontSize: '28px',
            fontWeight: 800,
          }}>
            🟢 GREEN FLAG
          </div>
        </div>

        <p style={{ color: '#525252', fontSize: '16px', marginTop: '28px' }}>
          redorgreen.fr/flagornot
        </p>
      </div>
    ),
    { ...size }
  );
}

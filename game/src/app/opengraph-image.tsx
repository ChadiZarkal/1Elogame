import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Red Flag Games - Party game mobile gratuit';
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
        {/* Emojis */}
        <div style={{ display: 'flex', gap: '20px', fontSize: '80px', marginBottom: '20px' }}>
          <span>🚩</span>
          <span>🟢</span>
        </div>
        
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#F5F5F5', fontSize: '72px', fontWeight: 900, letterSpacing: '-2px' }}>
            Red
          </span>
          <span style={{ color: '#DC2626', fontSize: '72px', fontWeight: 900, letterSpacing: '-2px' }}>
            FLAG
          </span>
          <span style={{ color: '#F5F5F5', fontSize: '72px', fontWeight: 900, letterSpacing: '-2px' }}>
            Games
          </span>
        </div>

        {/* Subtitle */}
        <p style={{ color: '#A3A3A3', fontSize: '28px', marginTop: '16px', fontWeight: 500 }}>
          Party games mobiles gratuits — Joue et débats avec tes amis
        </p>

        {/* Tags */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
          <div style={{
            background: 'rgba(220, 38, 38, 0.2)',
            border: '1px solid rgba(220, 38, 38, 0.4)',
            borderRadius: '12px',
            padding: '8px 24px',
            color: '#EF4444',
            fontSize: '20px',
            fontWeight: 600,
          }}>
            🚩 Red Flag
          </div>
          <div style={{
            background: 'rgba(5, 150, 105, 0.2)',
            border: '1px solid rgba(5, 150, 105, 0.4)',
            borderRadius: '12px',
            padding: '8px 24px',
            color: '#34D399',
            fontSize: '20px',
            fontWeight: 600,
          }}>
            🤖 Flag or Not
          </div>
          <div style={{
            background: 'rgba(249, 115, 22, 0.2)',
            border: '1px solid rgba(249, 115, 22, 0.4)',
            borderRadius: '12px',
            padding: '8px 24px',
            color: '#F97316',
            fontSize: '20px',
            fontWeight: 600,
          }}>
            🧪 Red Flag Test
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

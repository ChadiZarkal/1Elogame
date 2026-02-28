import { ImageResponse } from 'next/og';
import { type NextRequest } from 'next/server';

export const runtime = 'edge';

/**
 * Dynamic OG image for Oracle (Flag or Not) results.
 * Usage: /api/og/oracle?verdict=red|green&text=...
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const verdict = searchParams.get('verdict') || 'red';
  const text = searchParams.get('text') || '';

  const isRed = verdict === 'red';
  const color = isRed ? '#EF4444' : '#10B981';
  const label = isRed ? 'RED FLAG' : 'GREEN FLAG';
  const emoji = isRed ? '🚩' : '🟢';
  const gradientBg = isRed
    ? 'linear-gradient(135deg, #0D0D0D 0%, #1C0808 40%, #0D0D0D 100%)'
    : 'linear-gradient(135deg, #0D0D0D 0%, #081C0D 40%, #0D0D0D 100%)';

  // Truncate text if too long
  const displayText = text.length > 100 ? text.slice(0, 97) + '…' : text;

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
          background: gradientBg,
          fontFamily: 'system-ui, sans-serif',
          padding: '40px',
        }}
      >
        {/* Verdict emoji */}
        <span style={{ fontSize: '72px', marginBottom: '8px' }}>{emoji}</span>

        {/* Verdict label */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          <span
            style={{
              color,
              fontSize: '64px',
              fontWeight: 900,
              letterSpacing: '-2px',
              textShadow: `0 0 80px ${color}66`,
            }}
          >
            {label}
          </span>
        </div>

        {/* Submitted text */}
        {displayText && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '16px 32px',
              maxWidth: '900px',
            }}
          >
            <p
              style={{
                color: '#D1D5DB',
                fontSize: '26px',
                textAlign: 'center',
                fontStyle: 'italic',
                lineHeight: 1.4,
              }}
            >
              &quot;{displayText}&quot;
            </p>
          </div>
        )}

        {/* CTA */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '32px',
          }}
        >
          <span style={{ color: '#525252', fontSize: '18px' }}>
            Teste toi aussi sur
          </span>
          <span
            style={{
              color,
              fontSize: '18px',
              fontWeight: 700,
            }}
          >
            redorgreen.fr/flagornot
          </span>
        </div>

        {/* Branding */}
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span style={{ color: '#333', fontSize: '14px' }}>Red or Green</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

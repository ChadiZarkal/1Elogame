import { ImageResponse } from 'next/og';
import { type NextRequest } from 'next/server';

export const runtime = 'edge';

/**
 * Dynamic share image generator for social media sharing.
 * Usage: /api/og?title=...&subtitle=...&emoji=...&theme=red|green|purple|blue|orange
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const title = searchParams.get('title') || 'Red or Green';
  const subtitle = searchParams.get('subtitle') || 'Red Flag Games';
  const emoji = searchParams.get('emoji') || '🚩';
  const theme = searchParams.get('theme') || 'red';

  const themeColors: Record<string, { primary: string; gradient: string }> = {
    red: { primary: '#EF4444', gradient: '#1C0808' },
    green: { primary: '#10B981', gradient: '#081C0D' },
    purple: { primary: '#8B5CF6', gradient: '#1A0A2E' },
    blue: { primary: '#3B82F6', gradient: '#0A1A2E' },
    orange: { primary: '#F97316', gradient: '#1C1008' },
    yellow: { primary: '#F59E0B', gradient: '#1C1808' },
  };

  const colors = themeColors[theme] || themeColors.red;

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
          background: `linear-gradient(135deg, #0D0D0D 0%, ${colors.gradient} 50%, #0D0D0D 100%)`,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <span style={{ fontSize: '80px', marginBottom: '16px' }}>{emoji}</span>
        <span style={{ color: '#F5F5F5', fontSize: '48px', fontWeight: 900, textAlign: 'center', maxWidth: '900px', lineHeight: 1.2 }}>
          {title}
        </span>
        <p style={{ color: '#A3A3A3', fontSize: '24px', marginTop: '16px', textAlign: 'center', maxWidth: '700px' }}>
          {subtitle}
        </p>
        <div style={{
          marginTop: '28px',
          background: `${colors.primary}20`,
          border: `1px solid ${colors.primary}60`,
          borderRadius: '12px',
          padding: '8px 24px',
          color: colors.primary,
          fontSize: '18px',
          fontWeight: 600,
        }}>
          redflaggames.fr
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

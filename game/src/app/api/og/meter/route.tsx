import { ImageResponse } from 'next/og';
import { type NextRequest } from 'next/server';

export const runtime = 'edge';

/**
 * Dynamic OG image for Meter (violentomètre, etc.) results.
 * Usage: /api/og/meter?slug=violentometre&level=red|orange|yellow|green&count=5&total=20
 */

const meterMeta: Record<string, { name: string; emoji: string }> = {
  violentometre: { name: 'Violentomètre', emoji: '🚨' },
  consentometre: { name: 'Consentomètre', emoji: '🤝' },
  incestometre: { name: 'Incestomètre', emoji: '🔒' },
};

const levelInfo: Record<string, { label: string; color: string; emoji: string }> = {
  green: { label: 'Zone saine', color: '#10B981', emoji: '💚' },
  yellow: { label: 'Vigilance', color: '#F59E0B', emoji: '⚠️' },
  orange: { label: 'Alerte', color: '#F97316', emoji: '🔶' },
  red: { label: 'Danger', color: '#EF4444', emoji: '🚨' },
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const slug = searchParams.get('slug') || 'violentometre';
  const level = searchParams.get('level') || 'green';
  const count = parseInt(searchParams.get('count') || '0', 10);
  const total = parseInt(searchParams.get('total') || '0', 10);

  const meter = meterMeta[slug] || { name: slug, emoji: '📊' };
  const info = levelInfo[level] || levelInfo.green;

  const gradientMap: Record<string, string> = {
    green: '#081C0D',
    yellow: '#1C1808',
    orange: '#1C1008',
    red: '#1C0808',
  };
  const gradientBg = `linear-gradient(135deg, #0D0D0D 0%, ${gradientMap[level] || '#1C0808'} 40%, #0D0D0D 100%)`;

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
        {/* Meter emoji */}
        <span style={{ fontSize: '64px', marginBottom: '12px' }}>{meter.emoji}</span>

        {/* Meter name */}
        <span
          style={{
            color: '#F5F5F5',
            fontSize: '36px',
            fontWeight: 800,
            marginBottom: '20px',
          }}
        >
          {meter.name}
        </span>

        {/* Result badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: `${info.color}20`,
            border: `2px solid ${info.color}60`,
            borderRadius: '20px',
            padding: '16px 40px',
            marginBottom: '16px',
          }}
        >
          <span style={{ fontSize: '40px' }}>{info.emoji}</span>
          <span
            style={{
              color: info.color,
              fontSize: '40px',
              fontWeight: 900,
              textShadow: `0 0 60px ${info.color}44`,
            }}
          >
            {info.label}
          </span>
        </div>

        {/* Stats */}
        {count > 0 && (
          <p
            style={{
              color: '#9CA3AF',
              fontSize: '22px',
              marginTop: '8px',
            }}
          >
            {count} situation{count > 1 ? 's' : ''} identifiée{count > 1 ? 's' : ''} sur {total} questions
          </p>
        )}

        {/* CTA */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '28px',
          }}
        >
          <span style={{ color: '#525252', fontSize: '18px' }}>Fais le test sur</span>
          <span style={{ color: info.color, fontSize: '18px', fontWeight: 700 }}>
            redorgreen.fr/ressources/{slug}
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

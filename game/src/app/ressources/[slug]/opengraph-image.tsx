import { ImageResponse } from 'next/og';
import { METERS } from '@/config/meters-data';

export const runtime = 'edge';

export const alt = 'Test en ligne gratuit et anonyme';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const COLOR_MAP: Record<string, string> = {
  violentometre: '#EF4444',
  consentometre: '#F59E0B',
  incestometre: '#8B5CF6',
  harcelometre: '#3B82F6',
  discriminometre: '#F97316',
};

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meter = METERS.find((m) => m.slug === slug);

  if (!meter) {
    return new ImageResponse(
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', background: '#0D0D0D', color: '#fff', fontSize: '48px' }}>
        Outil introuvable
      </div>,
      { ...size }
    );
  }

  const color = COLOR_MAP[slug] || '#EF4444';

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
          background: `linear-gradient(135deg, #0D0D0D 0%, ${color}10 50%, #0D0D0D 100%)`,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <span style={{ fontSize: '96px', marginBottom: '12px' }}>{meter.emoji}</span>

        <span style={{ color: '#F5F5F5', fontSize: '56px', fontWeight: 900 }}>
          {meter.name}
        </span>

        <p style={{ color: '#A3A3A3', fontSize: '24px', marginTop: '12px', textAlign: 'center', maxWidth: '700px' }}>
          {meter.tagline}
        </p>

        <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
          <div style={{
            background: `${color}20`,
            border: `1px solid ${color}60`,
            borderRadius: '12px',
            padding: '8px 20px',
            color,
            fontSize: '18px',
            fontWeight: 600,
          }}>
            {meter.questions.length} questions
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
            Gratuit & Anonyme
          </div>
        </div>

        <p style={{ color: '#525252', fontSize: '16px', marginTop: '24px' }}>
          redorgreen.fr/ressources/{slug}
        </p>
      </div>
    ),
    { ...size }
  );
}

/**
 * @module carteOg
 * Gabarit des images de partage des pages de contenu.
 *
 * Le guide, le test et le baromètre partageaient l'image générique du site :
 * un lien envoyé dans une conversation montrait « Red or Green » et rien de ce
 * que la page contient. Chaque page a désormais la sienne, sur ce gabarit —
 * la même composition que l'image de `/jeu`, pour que le site se reconnaisse.
 */

import { ImageResponse } from 'next/og';

export const TAILLE_OG = { width: 1200, height: 630 };

export function carteOg({
  emoji,
  titre,
  sous,
  chemin,
  teinte,
}: {
  emoji: string;
  titre: string;
  sous: string;
  chemin: string;
  /** Teinte d'accent : la pastille et le liseré. */
  teinte: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          padding: '72px 88px',
          background: 'linear-gradient(135deg, #0D0D0D 0%, #1C0808 55%, #0D0D0D 100%)',
          borderLeft: `14px solid ${teinte}`,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '30px', fontWeight: 900 }}>
          <span style={{ color: '#DC2626' }}>Red</span>
          <span style={{ color: '#F5F5F5' }}>or</span>
          <span style={{ color: '#10B981' }}>Green</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '28px', marginTop: '40px' }}>
          <span style={{ fontSize: '96px' }}>{emoji}</span>
          <span style={{ color: '#F5F5F5', fontSize: '68px', fontWeight: 900, lineHeight: 1.05, maxWidth: '860px' }}>
            {titre}
          </span>
        </div>

        <p style={{ color: '#B8B8C0', fontSize: '30px', marginTop: '28px', lineHeight: 1.35, maxWidth: '940px' }}>
          {sous}
        </p>

        <p style={{ color: teinte, fontSize: '22px', fontWeight: 700, marginTop: '36px' }}>
          redorgreen.fr{chemin}
        </p>
      </div>
    ),
    { ...TAILLE_OG },
  );
}

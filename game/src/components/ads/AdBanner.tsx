'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

/**
 * Valeurs acceptées par AdSense pour `data-ad-format`.
 * `auto` est la seule qui active réellement le responsive — et la seule pour
 * laquelle `data-full-width-responsive` a un effet.
 */
type AdFormat = 'auto' | 'horizontal' | 'vertical' | 'rectangle' | 'fluid';

interface AdBannerProps {
  slot: string;
  format?: AdFormat;
  className?: string;
}

export function AdBanner({
  slot,
  format = 'auto',
  className = '',
}: AdBannerProps) {
  const pushedRef = useRef(false);

  const rawAdSenseId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID?.trim() || '';
  const adSenseId = rawAdSenseId
    ? (rawAdSenseId.startsWith('ca-pub-') ? rawAdSenseId : `ca-pub-${rawAdSenseId}`)
    : '';

  useEffect(() => {
    if (!adSenseId || pushedRef.current) return;

    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
      // Un slot ne doit être poussé qu'une fois : un second push sur le même
      // <ins> déclenche une erreur AdSense (remontage, StrictMode).
      pushedRef.current = true;
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, [adSenseId, slot]);

  if (!adSenseId) {
    return null;
  }

  return (
    <div className={`ad-container ${className}`} aria-label="Publicité Google AdSense">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adSenseId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}

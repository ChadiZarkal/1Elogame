'use client';

import { useEffect } from 'react';

interface AdBannerProps {
  slot: string;
  format?: 'responsive' | 'horizontal' | 'vertical' | 'rectangle';
  className?: string;
}

export function AdBanner({ 
  slot, 
  format = 'responsive',
  className = ''
}: AdBannerProps) {
  useEffect(() => {
    try {
      // Vérifier que adsbygoogle est disponible
      if ((window as any).adsbygoogle === undefined) {
        (window as any).adsbygoogle = [];
      }
      // Pusher une nouvelle annonce à traiter
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, [slot]);

  // Ne pas afficher si pas de Publisher ID configuré
  const adSenseId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID;
  if (!adSenseId) {
    return null;
  }

  return (
    <div className={`ad-container ${className}`}>
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

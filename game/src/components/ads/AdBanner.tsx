'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

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
  const rawAdSenseId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID?.trim() || '';
  const adSenseId = rawAdSenseId
    ? (rawAdSenseId.startsWith('ca-pub-') ? rawAdSenseId : `ca-pub-${rawAdSenseId}`)
    : '';

  useEffect(() => {
    if (!adSenseId) {
      return;
    }

    try {
      if (window.adsbygoogle === undefined) {
        window.adsbygoogle = [];
      }
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, [adSenseId, slot]);

  if (!adSenseId) {
    return null;
  }

  return (
    <div className={`ad-container ${className}`} aria-label="Publicite Google AdSense">
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minHeight: 90 }}
        data-ad-client={adSenseId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}

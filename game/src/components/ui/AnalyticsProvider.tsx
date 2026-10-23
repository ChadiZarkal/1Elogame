'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView, trackGameEntry, flushSessionToAPI } from '@/lib/analytics';

/**
 * Invisible analytics provider — tracks page views, game entries, and flushes session data.
 * Place inside the root layout.
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Track page views
  useEffect(() => {
    trackPageView(pathname);
    
    // Track game entries based on path
    if (pathname === '/jeu' || pathname === '/jeu/jouer') {
      trackGameEntry('redflag');
    } else if (pathname === '/flagornot') {
      trackGameEntry('flagornot');
    }
  }, [pathname]);
  
  // Flush the session when the page is hidden or closed — not on a timer.
  // `visibilitychange` is the event mobile browsers reliably fire when the user
  // switches apps; `pagehide` covers desktop tab closes. A flush every minute
  // per open tab used to be the largest source of database writes.
  useEffect(() => {
    const handleHidden = () => {
      if (document.visibilityState === 'hidden') flushSessionToAPI();
    };

    document.addEventListener('visibilitychange', handleHidden);
    window.addEventListener('pagehide', flushSessionToAPI);

    return () => {
      document.removeEventListener('visibilitychange', handleHidden);
      window.removeEventListener('pagehide', flushSessionToAPI);
    };
  }, []);
  
  return <>{children}</>;
}

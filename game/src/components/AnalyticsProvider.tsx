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
  
  // Flush session on unload
  useEffect(() => {
    const handleUnload = () => {
      flushSessionToAPI();
    };
    
    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);
    
    // Also flush every 60 seconds while active
    const interval = setInterval(flushSessionToAPI, 60000);
    
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
      clearInterval(interval);
    };
  }, []);
  
  return <>{children}</>;
}

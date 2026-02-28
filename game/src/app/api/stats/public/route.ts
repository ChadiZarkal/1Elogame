import { withApiHandler, apiSuccess } from '@/lib/apiHelpers';
import { getPublicStats } from '@/lib/repositories';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(async () => {
  const stats = await getPublicStats();
  const response = apiSuccess(stats);
  
  // Cache for 60s on CDN, serve stale for 5 min while revalidating
  response.headers.set(
    'Cache-Control',
    'public, s-maxage=60, stale-while-revalidate=300'
  );
  
  return response;
});

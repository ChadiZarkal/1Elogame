import { NextRequest } from 'next/server';
import { withApiHandler, apiSuccess } from '@/lib/apiHelpers';
import { getLeaderboardPage, parseLeaderboardView } from '@/lib/leaderboard';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const parsedLimit = Number(searchParams.get('limit') || 30);
  const parsedOffset = Number(searchParams.get('offset') || 0);

  const data = await getLeaderboardPage({
    sort: searchParams.get('order') === 'asc' ? 'asc' : 'desc',
    limit: Number.isFinite(parsedLimit) ? parsedLimit : 30,
    offset: Number.isFinite(parsedOffset) ? parsedOffset : 0,
    category: searchParams.get('category') || null,
    tag: searchParams.get('tag') || null,
    view: parseLeaderboardView(searchParams.get('view')),
    search: searchParams.get('search')?.trim() || null,
  });

  const response = apiSuccess(data);

  // Cache for 30s on CDN, serve stale for 5 min while revalidating
  response.headers.set(
    'Cache-Control',
    'public, s-maxage=30, stale-while-revalidate=300'
  );

  return response;
}, { rateLimit: true });

import { NextRequest } from 'next/server';
import { withApiHandler, apiSuccess } from '@/lib/apiHelpers';
import { getAllSubmissions } from '@/lib/repositories/community';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(async (req: NextRequest) => {
  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 200);
  const offset = parseInt(url.searchParams.get('offset') || '0', 10);
  const verdict = url.searchParams.get('verdict') as 'red' | 'green' | null;
  const search = url.searchParams.get('search') || null;

  const result = await getAllSubmissions({ limit, offset, verdict, search });
  return apiSuccess(result);
}, { requireAdmin: true });

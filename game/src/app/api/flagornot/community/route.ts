import { NextRequest } from 'next/server';
import { withApiHandler, apiSuccess, apiError } from '@/lib/apiHelpers';
import { getRecentSubmissions, saveSubmission } from '@/lib/repositories';
import { getTimeAgo } from '@/lib/formatters';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get('limit') || 20), 50);

  const submissions = await getRecentSubmissions(limit);
  const formatted = submissions.map((s) => ({
    id: s.id,
    text: s.text,
    verdict: s.verdict,
    emoji: s.verdict === 'red' ? '🚩' : '🟢',
    timeAgo: getTimeAgo(s.timestamp),
  }));

  return apiSuccess({ submissions: formatted, total: submissions.length });
});

export const POST = withApiHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { text, verdict } = body;

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return apiError('VALIDATION_ERROR', 'Text is required', 400);
  }
  if (!['red', 'green'].includes(verdict)) {
    return apiError('VALIDATION_ERROR', 'Invalid verdict', 400);
  }

  await saveSubmission(text, verdict);
  return apiSuccess({ saved: true });
});

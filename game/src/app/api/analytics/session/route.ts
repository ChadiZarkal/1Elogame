import { NextRequest } from 'next/server';
import { withApiHandler, apiSuccess, apiError } from '@/lib/apiHelpers';
import { saveAnalyticsSession, getAnalyticsSessions } from '@/lib/repositories';
import type { AnalyticsSessionData } from '@/types/analytics';

export const dynamic = 'force-dynamic';

export const POST = withApiHandler(async (request: NextRequest) => {
  const body = await request.json();

  const session: AnalyticsSessionData = {
    sessionId: body.sessionId || 'unknown',
    startedAt: body.startedAt || Date.now(),
    duration: body.duration || 0,
    pageViews: body.pageViews || [],
    gameEntries: body.gameEntries || [],
    votes: body.votes || 0,
    aiRequests: body.aiRequests || 0,
    choicesBeforeQuit: body.choicesBeforeQuit || 0,
    category: body.category || null,
    sex: body.sex || null,
    age: body.age || null,
    flushedAt: body.flushedAt || Date.now(),
  };

  await saveAnalyticsSession(session);
  return apiSuccess({ success: true });
});

export const GET = withApiHandler(async () => {
  const sessions = await getAnalyticsSessions();
  return apiSuccess({ sessions, count: sessions.length });
});

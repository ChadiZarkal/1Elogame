import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

interface AnalyticsSessionData {
  sessionId: string;
  startedAt: number;
  duration: number;
  pageViews: string[];
  gameEntries: { game: string; at: number }[];
  votes: number;
  aiRequests: number;
  choicesBeforeQuit: number;
  category: string | null;
  sex: string | null;
  age: string | null;
  flushedAt: number;
}

// Aggregate real demographics from tracked analytics sessions
function aggregateRealDemographics(sessions: AnalyticsSessionData[]) {
  const now = Date.now();
  const dayMs = 86400000;
  
  // ── Visitor evolution: last 14 days (from real sessions) ──
  const visitorEvolution = Array.from({ length: 14 }, (_, i) => {
    const dayStart = new Date(now - (13 - i) * dayMs);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart.getTime() + dayMs);
    
    const daySessions = sessions.filter(s => s.startedAt >= dayStart.getTime() && s.startedAt < dayEnd.getTime());
    const uniqueSessionIds = new Set(daySessions.map(s => s.sessionId));
    
    return {
      date: dayStart.toISOString().split('T')[0],
      visitors: uniqueSessionIds.size,
      votes: daySessions.reduce((sum, s) => sum + s.votes, 0),
      aiRequests: daySessions.reduce((sum, s) => sum + s.aiRequests, 0),
    };
  });
  
  // ── Gender breakdown (from sessions with profile data) ──
  const genderBreakdown = { homme: 0, femme: 0, autre: 0 };
  const sessionsWithSex = sessions.filter(s => s.sex);
  sessionsWithSex.forEach(s => {
    if (s.sex === 'homme') genderBreakdown.homme++;
    else if (s.sex === 'femme') genderBreakdown.femme++;
    else genderBreakdown.autre++;
  });
  
  // ── Age breakdown ──
  const ageBreakdown: Record<string, number> = { '16-18': 0, '19-22': 0, '23-26': 0, '27+': 0 };
  const sessionsWithAge = sessions.filter(s => s.age);
  sessionsWithAge.forEach(s => {
    if (s.age && ageBreakdown[s.age] !== undefined) {
      ageBreakdown[s.age]++;
    }
  });
  
  // ── Game entries breakdown ──
  const gameEntries = { redflag: 0, flagornot: 0, redflagtest: 0 };
  sessions.forEach(s => {
    s.gameEntries.forEach(entry => {
      if (entry.game === 'redflag') gameEntries.redflag++;
      else if (entry.game === 'flagornot') gameEntries.flagornot++;
      else if (entry.game === 'redflagtest') gameEntries.redflagtest++;
    });
  });
  
  // ── Time spent per game (average seconds) ──
  // Estimate from session duration proportionally to game entries
  const timePerGame = { redflag: 0, flagornot: 0, redflagtest: 0 };
  const gameDurations: Record<string, number[]> = { redflag: [], flagornot: [], redflagtest: [] };
  sessions.forEach(s => {
    if (s.duration > 0 && s.gameEntries.length > 0) {
      const perEntry = s.duration / s.gameEntries.length;
      s.gameEntries.forEach(entry => {
        if (gameDurations[entry.game]) {
          gameDurations[entry.game].push(perEntry);
        }
      });
    }
  });
  Object.keys(timePerGame).forEach(game => {
    const durations = gameDurations[game];
    if (durations.length > 0) {
      timePerGame[game as keyof typeof timePerGame] = Math.round(
        durations.reduce((a, b) => a + b, 0) / durations.length
      );
    }
  });
  
  // ── AI requests per session ──
  const aiSessions = sessions.filter(s => s.aiRequests > 0);
  const aiRequestsPerSession = {
    average: aiSessions.length > 0
      ? parseFloat((aiSessions.reduce((sum, s) => sum + s.aiRequests, 0) / aiSessions.length).toFixed(1))
      : 0,
    median: 0,
    max: aiSessions.length > 0
      ? Math.max(...aiSessions.map(s => s.aiRequests))
      : 0,
  };
  if (aiSessions.length > 0) {
    const sorted = aiSessions.map(s => s.aiRequests).sort((a, b) => a - b);
    aiRequestsPerSession.median = sorted[Math.floor(sorted.length / 2)];
  }
  
  // ── Agreement rate: not calculable from sessions alone, leave at 0 ──
  const agreementRate = 0;
  
  // ── Average choices before quitting ──
  const sessionsWithChoices = sessions.filter(s => s.choicesBeforeQuit > 0);
  const avgChoicesBeforeQuit = sessionsWithChoices.length > 0
    ? parseFloat((sessionsWithChoices.reduce((sum, s) => sum + s.choicesBeforeQuit, 0) / sessionsWithChoices.length).toFixed(1))
    : 0;
  
  // ── Category popularity ──
  const categoryCounts: Record<string, number> = {};
  sessions.forEach(s => {
    if (s.category) {
      categoryCounts[s.category] = (categoryCounts[s.category] || 0) + s.votes;
    }
  });
  const totalCatVotes = Object.values(categoryCounts).reduce((s, v) => s + v, 0);
  const categoryPopularity = Object.entries(categoryCounts)
    .map(([category, votes]) => ({
      category,
      votes,
      percentage: totalCatVotes > 0 ? Math.round((votes / totalCatVotes) * 100) : 0,
    }))
    .sort((a, b) => b.votes - a.votes);
  
  // If no category data yet, show all categories with 0
  if (categoryPopularity.length === 0) {
    ['lifestyle', 'sexe', 'quotidien', 'bureau'].forEach(cat => {
      categoryPopularity.push({ category: cat, votes: 0, percentage: 0 });
    });
  }
  
  // ── Session metrics ──
  const durations = sessions.filter(s => s.duration > 0).map(s => s.duration);
  const sortedDurations = [...durations].sort((a, b) => a - b);
  const uniqueVisitors = new Set(sessions.map(s => s.sessionId)).size;
  
  const sessionMetrics = {
    avgDuration: durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0,
    medianDuration: sortedDurations.length > 0
      ? sortedDurations[Math.floor(sortedDurations.length / 2)]
      : 0,
    bounceRate: sessions.length > 0
      ? parseFloat(((sessions.filter(s => s.votes === 0 && s.aiRequests === 0).length / sessions.length) * 100).toFixed(1))
      : 0,
    returnRate: 0, // Cannot determine from in-memory sessions alone
    totalSessions: sessions.length,
    totalUniqueVisitors: uniqueVisitors,
  };
  
  // ── Hourly activity heatmap ──
  const hourlyActivity = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    activity: 0,
  }));
  sessions.forEach(s => {
    const hour = new Date(s.startedAt).getHours();
    hourlyActivity[hour].activity++;
  });
  
  return {
    visitorEvolution,
    genderBreakdown,
    ageBreakdown,
    gameEntries,
    timePerGame,
    aiRequestsPerSession,
    agreementRate,
    avgChoicesBeforeQuit,
    categoryPopularity,
    sessionMetrics,
    hourlyActivity,
    generatedAt: new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  // Check admin auth
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (!token) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  
  // Simple token validation (matches admin login logic)
  if (isMockMode) {
    if (token !== 'mock-admin-token') {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }
  }
  
  try {
    // Aggregate from real tracked sessions (works for both mock and production)
    const sessions = globalThis.__analyticsSessions || [];
    const data = aggregateRealDemographics(sessions);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching demographics:', error);
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}

/**
 * @module lib/demographics
 * Aggregation logic for demographics data from analytics sessions.
 * Extracted from the demographics route for testability and reuse.
 */

import type { AnalyticsSessionData } from '@/types/analytics';

const DAY_MS = 86400000;

export interface DemographicsData {
  visitorEvolution: { date: string; visitors: number; votes: number; aiRequests: number }[];
  genderBreakdown: { homme: number; femme: number; autre: number };
  ageBreakdown: Record<string, number>;
  gameEntries: { redflag: number; flagornot: number; redflagtest: number };
  timePerGame: { redflag: number; flagornot: number; redflagtest: number };
  aiRequestsPerSession: { average: number; median: number; max: number };
  agreementRate: number;
  avgChoicesBeforeQuit: number;
  categoryPopularity: { category: string; votes: number; percentage: number }[];
  sessionMetrics: {
    avgDuration: number;
    medianDuration: number;
    bounceRate: number;
    returnRate: number;
    totalSessions: number;
    totalUniqueVisitors: number;
  };
  hourlyActivity: { hour: number; activity: number }[];
  generatedAt: string;
}

/** Aggregate real demographics from tracked analytics sessions. */
export function aggregateRealDemographics(sessions: AnalyticsSessionData[]): DemographicsData {
  const now = Date.now();

  // ── Visitor evolution: last 14 days ──
  const visitorEvolution = Array.from({ length: 14 }, (_, i) => {
    const dayStart = new Date(now - (13 - i) * DAY_MS);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart.getTime() + DAY_MS);
    const daySessions = sessions.filter(
      (s) => s.startedAt >= dayStart.getTime() && s.startedAt < dayEnd.getTime(),
    );
    const uniqueIds = new Set(daySessions.map((s) => s.sessionId));
    return {
      date: dayStart.toISOString().split('T')[0],
      visitors: uniqueIds.size,
      votes: daySessions.reduce((sum, s) => sum + s.votes, 0),
      aiRequests: daySessions.reduce((sum, s) => sum + s.aiRequests, 0),
    };
  });

  // ── Gender breakdown ──
  const genderBreakdown = { homme: 0, femme: 0, autre: 0 };
  for (const s of sessions.filter((s) => s.sex)) {
    if (s.sex === 'homme') genderBreakdown.homme++;
    else if (s.sex === 'femme') genderBreakdown.femme++;
    else genderBreakdown.autre++;
  }

  // ── Age breakdown ──
  const ageBreakdown: Record<string, number> = { '16-18': 0, '19-22': 0, '23-26': 0, '27+': 0 };
  for (const s of sessions.filter((s) => s.age)) {
    if (s.age && ageBreakdown[s.age] !== undefined) ageBreakdown[s.age]++;
  }

  // ── Game entries breakdown ──
  const gameEntries = { redflag: 0, flagornot: 0, redflagtest: 0 };
  for (const s of sessions) {
    for (const entry of s.gameEntries) {
      if (entry.game in gameEntries) {
        gameEntries[entry.game as keyof typeof gameEntries]++;
      }
    }
  }

  // ── Time spent per game (average seconds) ──
  const timePerGame = { redflag: 0, flagornot: 0, redflagtest: 0 };
  const gameDurations: Record<string, number[]> = { redflag: [], flagornot: [], redflagtest: [] };
  for (const s of sessions) {
    if (s.duration > 0 && s.gameEntries.length > 0) {
      const perEntry = s.duration / s.gameEntries.length;
      for (const entry of s.gameEntries) {
        if (gameDurations[entry.game]) gameDurations[entry.game].push(perEntry);
      }
    }
  }
  for (const game of Object.keys(timePerGame) as (keyof typeof timePerGame)[]) {
    const durations = gameDurations[game];
    if (durations.length > 0) {
      timePerGame[game] = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
    }
  }

  // ── AI requests per session ──
  const aiSessions = sessions.filter((s) => s.aiRequests > 0);
  const sorted = aiSessions.map((s) => s.aiRequests).sort((a, b) => a - b);
  const aiRequestsPerSession = {
    average: aiSessions.length > 0
      ? parseFloat((aiSessions.reduce((sum, s) => sum + s.aiRequests, 0) / aiSessions.length).toFixed(1))
      : 0,
    median: sorted.length > 0 ? sorted[Math.floor(sorted.length / 2)] : 0,
    max: sorted.length > 0 ? sorted[sorted.length - 1] : 0,
  };

  // ── Average choices before quitting ──
  const sessionsWithChoices = sessions.filter((s) => s.choicesBeforeQuit > 0);
  const avgChoicesBeforeQuit = sessionsWithChoices.length > 0
    ? parseFloat(
        (sessionsWithChoices.reduce((sum, s) => sum + s.choicesBeforeQuit, 0) / sessionsWithChoices.length).toFixed(1),
      )
    : 0;

  // ── Category popularity ──
  const categoryCounts: Record<string, number> = {};
  for (const s of sessions) {
    if (s.category) {
      categoryCounts[s.category] = (categoryCounts[s.category] || 0) + s.votes;
    }
  }
  const totalCatVotes = Object.values(categoryCounts).reduce((s, v) => s + v, 0);
  const categoryPopularity = Object.entries(categoryCounts)
    .map(([category, votes]) => ({
      category,
      votes,
      percentage: totalCatVotes > 0 ? Math.round((votes / totalCatVotes) * 100) : 0,
    }))
    .sort((a, b) => b.votes - a.votes);

  if (categoryPopularity.length === 0) {
    for (const cat of ['lifestyle', 'sexe', 'quotidien', 'bureau']) {
      categoryPopularity.push({ category: cat, votes: 0, percentage: 0 });
    }
  }

  // ── Session metrics ──
  const durations = sessions.filter((s) => s.duration > 0).map((s) => s.duration);
  const sortedDurations = [...durations].sort((a, b) => a - b);
  const uniqueVisitors = new Set(sessions.map((s) => s.sessionId)).size;

  const sessionMetrics = {
    avgDuration: durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0,
    medianDuration: sortedDurations.length > 0
      ? sortedDurations[Math.floor(sortedDurations.length / 2)]
      : 0,
    bounceRate: sessions.length > 0
      ? parseFloat(
          ((sessions.filter((s) => s.votes === 0 && s.aiRequests === 0).length / sessions.length) * 100).toFixed(1),
        )
      : 0,
    returnRate: 0,
    totalSessions: sessions.length,
    totalUniqueVisitors: uniqueVisitors,
  };

  // ── Hourly activity heatmap ──
  const hourlyActivity = Array.from({ length: 24 }, (_, h) => ({ hour: h, activity: 0 }));
  for (const s of sessions) {
    const hour = new Date(s.startedAt).getHours();
    hourlyActivity[hour].activity++;
  }

  return {
    visitorEvolution,
    genderBreakdown,
    ageBreakdown,
    gameEntries,
    timePerGame,
    aiRequestsPerSession,
    agreementRate: 0,
    avgChoicesBeforeQuit,
    categoryPopularity,
    sessionMetrics,
    hourlyActivity,
    generatedAt: new Date().toISOString(),
  };
}

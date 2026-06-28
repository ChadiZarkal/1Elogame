import { describe, expect, it } from 'vitest';
import { buildShareUrl, computeFlashFlagSummary, ensureQuestionCount, getRiskLabel } from '@/lib/flashflag';

describe('flashflag helpers', () => {
  it('calcule le resume de score', () => {
    const summary = computeFlashFlagSummary([
      { questionIndex: 0, questionText: 'Q1', selectedOption: 'A', selectedScore: 2, timedOut: false, timeSpentMs: 1200 },
      { questionIndex: 1, questionText: 'Q2', selectedOption: 'B', selectedScore: 1, timedOut: false, timeSpentMs: 900 },
      { questionIndex: 2, questionText: 'Q3', selectedOption: null, selectedScore: 0, timedOut: true, timeSpentMs: 8000 },
    ], 3);

    expect(summary.totalScore).toBe(3);
    expect(summary.maxScore).toBe(6);
    expect(summary.answeredCount).toBe(2);
    expect(summary.timedOutCount).toBe(1);
    expect(summary.riskPercent).toBe(50);
    expect(summary.level).toBe('watch');
  });

  it('valide le nombre de questions', () => {
    expect(ensureQuestionCount(Array.from({ length: 10 }, () => ({ text: 'q', timeLimitSec: 7, options: [{ text: 'a', score: 0 }, { text: 'b', score: 1 }] })))).toBe(true);
    expect(ensureQuestionCount(Array.from({ length: 5 }, () => ({ text: 'q', timeLimitSec: 7, options: [{ text: 'a', score: 0 }, { text: 'b', score: 1 }] })))).toBe(true);
    expect(ensureQuestionCount(Array.from({ length: 20 }, () => ({ text: 'q', timeLimitSec: 7, options: [{ text: 'a', score: 0 }, { text: 'b', score: 1 }] })))).toBe(true);
    expect(ensureQuestionCount(Array.from({ length: 4 }, () => ({ text: 'q', timeLimitSec: 7, options: [{ text: 'a', score: 0 }, { text: 'b', score: 1 }] })))).toBe(false);
    expect(ensureQuestionCount(Array.from({ length: 21 }, () => ({ text: 'q', timeLimitSec: 7, options: [{ text: 'a', score: 0 }, { text: 'b', score: 1 }] })))).toBe(false);
  });

  it('genere un lien de partage', () => {
    expect(buildShareUrl('https://redorgreen.fr', 'ABCD1234')).toBe('https://redorgreen.fr/flashflag/session/ABCD1234');
  });

  it('donne un label de risque', () => {
    expect(getRiskLabel('safe')).toContain('rassurant');
    expect(getRiskLabel('watch')).toContain('vigilance');
    expect(getRiskLabel('alert')).toContain('eleve');
  });
});

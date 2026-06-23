export type FlashFlagSubjectSex = 'homme' | 'femme' | 'autre';

export interface FlashFlagOptionDTO {
  id?: string;
  text: string;
  score: 0 | 1 | 2;
}

export interface FlashFlagQuestionDTO {
  id?: string;
  text: string;
  timeLimitSec: number;
  options: FlashFlagOptionDTO[];
}

export interface FlashFlagTestDTO {
  id?: string;
  name: string;
  description?: string | null;
  questions: FlashFlagQuestionDTO[];
}

export interface FlashFlagAnswerInput {
  questionIndex: number;
  questionText: string;
  selectedOption: string | null;
  selectedScore: 0 | 1 | 2;
  timedOut: boolean;
  timeSpentMs: number;
}

export interface FlashFlagScoreSummary {
  totalScore: number;
  maxScore: number;
  answeredCount: number;
  timedOutCount: number;
  riskPercent: number;
  level: 'safe' | 'watch' | 'alert';
}

export function generateAccessCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 8; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

export function ensureQuestionCount(questions: FlashFlagQuestionDTO[], expected = 10): boolean {
  return questions.length === expected;
}

export function computeFlashFlagSummary(answers: FlashFlagAnswerInput[], questionCount: number): FlashFlagScoreSummary {
  const totalScore = answers.reduce((acc, item) => acc + item.selectedScore, 0);
  const maxScore = questionCount * 2;
  const answeredCount = answers.filter((item) => item.selectedOption !== null).length;
  const timedOutCount = answers.filter((item) => item.timedOut).length;
  const riskPercent = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  let level: FlashFlagScoreSummary['level'] = 'safe';
  if (riskPercent >= 70) level = 'alert';
  else if (riskPercent >= 40) level = 'watch';

  return {
    totalScore,
    maxScore,
    answeredCount,
    timedOutCount,
    riskPercent,
    level,
  };
}

export function buildShareUrl(origin: string, code: string): string {
  return `${origin}/flashflag/session/${code}`;
}

export function getRiskLabel(level: FlashFlagScoreSummary['level']): string {
  if (level === 'alert') return 'Red flag eleve';
  if (level === 'watch') return 'Zone de vigilance';
  return 'Plutot rassurant';
}

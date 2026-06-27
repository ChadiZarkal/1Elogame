import { isMockMode } from '@/lib/apiHelpers';
import {
  buildShareUrl,
  computeFlashFlagSummary,
  generateAccessCode,
  type FlashFlagAnswerInput,
  type FlashFlagQuestionDTO,
  type FlashFlagTestDTO,
} from '@/lib/flashflag';

interface SessionRecord {
  id: string;
  access_code: string;
  mode: 'local' | 'link';
  source_type: 'standard' | 'custom';
  test_id: string | null;
  custom_payload: FlashFlagTestDTO | null;
  subject_sex: 'homme' | 'femme' | 'autre';
  subject_age: number;
  status: 'pending' | 'in_progress' | 'completed';
  total_score: number;
  max_score: number;
  answered_count: number;
  timed_out_count: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

interface AnswerRecord {
  question_index: number;
  question_text: string;
  selected_option: string | null;
  selected_score: 0 | 1 | 2;
  timed_out: boolean;
  time_spent_ms: number;
}

interface CompatSessionPayload {
  mode: 'local' | 'link';
  sourceType: 'standard' | 'custom';
  subjectSex: 'homme' | 'femme' | 'autre';
  subjectAge: number;
  status: 'pending' | 'in_progress' | 'completed';
  totalScore: number;
  maxScore: number;
  answeredCount: number;
  timedOutCount: number;
  startedAt: string | null;
  completedAt: string | null;
  test: FlashFlagTestDTO;
  answers: AnswerRecord[];
}

interface CompatStandardTestRecord {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  updated_at: string;
  questions: FlashFlagQuestionDTO[];
}

interface CompatStandardCatalogPayload {
  type: 'standard-tests-catalog';
  tests: CompatStandardTestRecord[];
}

type CompatAnalyticsPayload = CompatSessionPayload | CompatStandardCatalogPayload;

interface CompatAnalyticsRow {
  session_id: string;
  started_at: number;
  created_at?: string;
  game_entries: Array<{
    game?: string;
    at?: number;
    payload?: CompatAnalyticsPayload;
  }> | null;
}

const COMPAT_SESSION_KEY_PREFIX = 'flashflag:';
const COMPAT_SESSION_ID_PREFIX = 'compat-flashflag:';
const COMPAT_GAME_ENTRY_KEY = 'flashflag_compat';
const COMPAT_STANDARD_CATALOG_SESSION_KEY = 'flashflag:standard-tests-catalog';
const COMPAT_STANDARD_CATALOG_ENTRY_KEY = 'flashflag_standard_tests_catalog';
const FLASHFLAG_TABLE_ERROR_REGEX = /(could not find the table|does not exist|schema cache|relation)/i;
const FLASHFLAG_TABLE_NAME_REGEX = /flashflag_(tests|questions|options|sessions|answers)/i;

const mockStandardTests: FlashFlagTestDTO[] = [
  {
    id: 'mock-standard-1',
    name: 'Radar Date Express',
    description: '15 questions rapides pour reperer les signaux rouges.',
    questions: [
      { text: 'Es-tu feministe ?', timeLimitSec: 7, options: [{ text: 'Oui', score: 0 }, { text: 'C est complique', score: 1 }, { text: 'Non', score: 2 }] },
      { text: 'Es-tu deja alle voir un psy ?', timeLimitSec: 7, options: [{ text: 'Oui', score: 0 }, { text: 'Non', score: 1 }, { text: 'J en ai pas besoin', score: 2 }] },
      { text: 'Ton meilleur pote trompe sa copine ?', timeLimitSec: 7, options: [{ text: 'Je le recadre', score: 0 }, { text: 'Je la previens', score: 1 }, { text: 'Je le couvre', score: 2 }] },
      { text: 'As-tu deja pleure devant un film ?', timeLimitSec: 7, options: [{ text: 'Oui', score: 0 }, { text: 'Rarement', score: 1 }, { text: 'Non jamais', score: 2 }] },
      { text: 'Les compliments dans la rue ?', timeLimitSec: 7, options: [{ text: 'C est lourd', score: 0 }, { text: 'C est normal', score: 1 }, { text: 'C est flatteur', score: 2 }] },
      { text: 'Elle dit pas ce soir ?', timeLimitSec: 7, options: [{ text: 'Ok pas de souci', score: 0 }, { text: 'Mais pourquoi ?', score: 1 }, { text: 'J insiste un peu', score: 2 }] },
      { text: 'Elle sort sans toi ?', timeLimitSec: 7, options: [{ text: 'Amuse-toi bien', score: 0 }, { text: 'Fais attention', score: 1 }, { text: 'Tu rentres quand ?', score: 2 }] },
      { text: 'Apres une grosse dispute ?', timeLimitSec: 7, options: [{ text: 'On en discute', score: 0 }, { text: 'Je fais le mort', score: 1 }, { text: 'J attends ses excuses', score: 2 }] },
      { text: 'Ton ex en un mot ?', timeLimitSec: 7, options: [{ text: 'Une histoire passee', score: 0 }, { text: 'C etait une folle', score: 1 }, { text: 'Une manipulatrice', score: 2 }] },
      { text: 'Ton bord politique ?', timeLimitSec: 7, options: [{ text: 'La gauche', score: 0 }, { text: 'Apolitique centre', score: 1 }, { text: 'La droite', score: 2 }] },
      { text: 'Face a Men are trash ?', timeLimitSec: 7, options: [{ text: 'Je comprends l idee', score: 0 }, { text: 'Not all men', score: 1 }, { text: 'C est misandre', score: 2 }] },
      { text: 'Le privilege masculin ?', timeLimitSec: 7, options: [{ text: 'J en suis conscient', score: 0 }, { text: 'J ai galere aussi', score: 1 }, { text: 'Ca n existe pas', score: 2 }] },
      { text: 'Sur la question du genre ?', timeLimitSec: 7, options: [{ text: 'C est un spectre', score: 0 }, { text: 'C est une mode internet', score: 1 }, { text: 'Il n y a que deux genres', score: 2 }] },
      { text: 'La masculinite toxique ?', timeLimitSec: 7, options: [{ text: 'Un probleme systemique', score: 0 }, { text: 'Terme exagere', score: 1 }, { text: 'Une invention', score: 2 }] },
      { text: 'Les milliardaires ?', timeLimitSec: 7, options: [{ text: 'Il faut taxer massivement', score: 0 }, { text: 'Ils ont travaille dur', score: 1 }, { text: 'Ce sont des genies', score: 2 }] },
    ],
  },
];

const mockSessions: SessionRecord[] = [];
const mockAnswers = new Map<string, AnswerRecord[]>();

function mapQuestions(questions: Array<{ id: string; position: number; question_text: string; time_limit_sec: number; flashflag_options: Array<{ id: string; position: number; option_text: string; score: 0 | 1 | 2 }> }>): FlashFlagQuestionDTO[] {
  return questions
    .sort((a, b) => a.position - b.position)
    .map((q) => ({
      id: q.id,
      text: q.question_text,
      timeLimitSec: q.time_limit_sec,
      options: q.flashflag_options
        .map((opt) => ({ id: opt.id, text: opt.option_text, score: opt.score }))
        .sort((a, b) => {
          const ai = q.flashflag_options.find((item) => item.id === a.id)?.position || 0;
          const bi = q.flashflag_options.find((item) => item.id === b.id)?.position || 0;
          return ai - bi;
        }),
    }));
}

function isFlashFlagTableMissingError(message: string): boolean {
  return FLASHFLAG_TABLE_ERROR_REGEX.test(message) && FLASHFLAG_TABLE_NAME_REGEX.test(message);
}

function isMissingFlashFlagTableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return isFlashFlagTableMissingError(error.message);
}

function buildCompatSessionKey(code: string): string {
  return `${COMPAT_SESSION_KEY_PREFIX}${code}`;
}

function isCompatSessionId(id: string): boolean {
  return id.startsWith(COMPAT_SESSION_ID_PREFIX);
}

function serializeAnswers(answers: FlashFlagAnswerInput[]): AnswerRecord[] {
  return answers.map((item) => ({
    question_index: item.questionIndex,
    question_text: item.questionText,
    selected_option: item.selectedOption,
    selected_score: item.selectedScore,
    timed_out: item.timedOut,
    time_spent_ms: item.timeSpentMs,
  }));
}

function cloneQuestions(questions: FlashFlagQuestionDTO[]): FlashFlagQuestionDTO[] {
  return questions.map((question) => ({
    id: question.id,
    text: question.text,
    timeLimitSec: question.timeLimitSec,
    options: question.options.map((option) => ({
      id: option.id,
      text: option.text,
      score: option.score,
    })),
  }));
}

function buildDefaultCompatStandardTests(): CompatStandardTestRecord[] {
  const now = new Date().toISOString();
  return mockStandardTests.map((test, index) => ({
    id: test.id || `compat-standard-default-${index + 1}`,
    name: test.name,
    description: test.description || null,
    is_active: true,
    updated_at: now,
    questions: cloneQuestions(test.questions),
  }));
}

function toStandardTestsMetadata(records: CompatStandardTestRecord[]): Array<{ id: string; name: string; description: string | null; questionCount: number }> {
  return records
    .filter((record) => record.is_active)
    .map((record) => ({
      id: record.id,
      name: record.name,
      description: record.description,
      questionCount: record.questions.length,
    }));
}

function toAdminTestsList(records: CompatStandardTestRecord[]) {
  return records.map((record) => ({
    id: record.id,
    name: record.name,
    description: record.description,
    is_active: record.is_active,
    question_count: record.questions.length,
    updated_at: record.updated_at,
  }));
}

function toFlashFlagTest(record: CompatStandardTestRecord): FlashFlagTestDTO {
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    questions: cloneQuestions(record.questions),
  };
}

function normalizeCompatStandardTests(input: unknown): CompatStandardTestRecord[] {
  if (!Array.isArray(input)) return [];

  return input
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null;
      const typed = item as Partial<CompatStandardTestRecord>;
      if (!typed.name || typeof typed.name !== 'string') return null;
      if (!Array.isArray(typed.questions) || typed.questions.length === 0) return null;

      return {
        id: typeof typed.id === 'string' && typed.id.length > 0 ? typed.id : `compat-standard-${index + 1}`,
        name: typed.name,
        description: typeof typed.description === 'string' ? typed.description : null,
        is_active: typed.is_active !== false,
        updated_at: typeof typed.updated_at === 'string' ? typed.updated_at : new Date().toISOString(),
        questions: cloneQuestions(typed.questions as FlashFlagQuestionDTO[]),
      } satisfies CompatStandardTestRecord;
    })
    .filter((item): item is CompatStandardTestRecord => item !== null);
}

function readCompatStandardCatalogPayload(entries: CompatAnalyticsRow['game_entries']): CompatStandardCatalogPayload | null {
  if (!Array.isArray(entries) || entries.length === 0) return null;

  const explicit = entries.find((entry) => entry?.game === COMPAT_STANDARD_CATALOG_ENTRY_KEY)?.payload;
  const payload = (explicit || entries[0]?.payload) as CompatStandardCatalogPayload | undefined;
  if (!payload || !Array.isArray(payload.tests)) return null;
  return payload;
}

function readCompatPayload(entries: CompatAnalyticsRow['game_entries']): CompatSessionPayload | null {
  if (!Array.isArray(entries) || entries.length === 0) return null;

  const explicit = entries.find((entry) => entry?.game === COMPAT_GAME_ENTRY_KEY)?.payload;
  const payload = (explicit || entries[0]?.payload) as CompatSessionPayload | undefined;
  if (!payload?.test?.questions || !Array.isArray(payload.test.questions)) return null;
  return payload;
}

function mapCompatToSession(
  code: string,
  payload: CompatSessionPayload,
  createdAt: string,
): {
  session: SessionRecord;
  test: FlashFlagTestDTO;
  answers: AnswerRecord[];
} {
  return {
    session: {
      id: `${COMPAT_SESSION_ID_PREFIX}${code}`,
      access_code: code,
      mode: payload.mode,
      source_type: payload.sourceType,
      test_id: payload.sourceType === 'standard' ? payload.test.id || null : null,
      custom_payload: payload.sourceType === 'custom' ? payload.test : null,
      subject_sex: payload.subjectSex,
      subject_age: payload.subjectAge,
      status: payload.status,
      total_score: payload.totalScore,
      max_score: payload.maxScore,
      answered_count: payload.answeredCount,
      timed_out_count: payload.timedOutCount,
      started_at: payload.startedAt,
      completed_at: payload.completedAt,
      created_at: createdAt,
    },
    test: payload.test,
    answers: payload.answers,
  };
}

async function getCompatSessionByCode(code: string): Promise<{
  session: SessionRecord;
  test: FlashFlagTestDTO;
  answers: AnswerRecord[];
} | null> {
  const { createServerClient } = await import('@/lib/supabase');
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('analytics_sessions')
    .select('session_id, started_at, created_at, game_entries')
    .eq('session_id', buildCompatSessionKey(code))
    .maybeSingle();

  const typedRow = (data || null) as CompatAnalyticsRow | null;
  if (error) throw new Error(`DB error fetching flashflag compatibility session: ${error.message}`);
  if (!typedRow) return null;

  const payload = readCompatPayload(typedRow.game_entries);
  if (!payload) return null;

  const createdAt = typedRow.created_at || new Date(typedRow.started_at || Date.now()).toISOString();
  return mapCompatToSession(code, payload, createdAt);
}

async function upsertCompatSessionPayload(input: {
  code: string;
  payload: CompatSessionPayload;
  startedAtMs?: number;
  createOnly?: boolean;
}) {
  const { createServerClient, typedInsert, typedUpsert } = await import('@/lib/supabase');
  const supabase = createServerClient();

  const now = Date.now();
  const sessionKey = buildCompatSessionKey(input.code);
  const startedAt = input.payload.startedAt ? new Date(input.payload.startedAt).getTime() : null;
  const startedAtMs = input.startedAtMs || startedAt || now;
  const duration = startedAt ? Math.max(0, Math.round((now - startedAt) / 1000)) : 0;

  const compatRow = {
    session_id: sessionKey,
    started_at: startedAtMs,
    flushed_at: now,
    duration,
    page_views: [COMPAT_GAME_ENTRY_KEY],
    game_entries: [{ game: COMPAT_GAME_ENTRY_KEY, at: now, payload: input.payload }],
    votes: 0,
    ai_requests: 0,
    choices_before_quit: 0,
    category: 'flashflag',
    sex: input.payload.subjectSex,
    age: null,
  };

  if (input.createOnly) {
    const { error: insertError } = await typedInsert(supabase, 'analytics_sessions', compatRow);
    if (insertError) {
      throw new Error(`DB error saving flashflag compatibility session: ${insertError.message}`);
    }
    return;
  }

  const { error: upsertError } = await typedUpsert(supabase, 'analytics_sessions', compatRow, { onConflict: 'session_id' });
  if (upsertError) {
    throw new Error(`DB error saving flashflag compatibility session: ${upsertError.message}`);
  }
}

async function getCompatStandardTestsCatalog(): Promise<CompatStandardTestRecord[]> {
  const { createServerClient } = await import('@/lib/supabase');
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('analytics_sessions')
    .select('session_id, started_at, created_at, game_entries')
    .eq('session_id', COMPAT_STANDARD_CATALOG_SESSION_KEY)
    .maybeSingle();

  if (error) throw new Error(`DB error loading flashflag compatibility catalog: ${error.message}`);

  const typedRow = (data || null) as CompatAnalyticsRow | null;
  if (!typedRow) return buildDefaultCompatStandardTests();

  const payload = readCompatStandardCatalogPayload(typedRow.game_entries);
  if (!payload) return buildDefaultCompatStandardTests();

  const normalized = normalizeCompatStandardTests(payload.tests);
  return normalized.length > 0 ? normalized : buildDefaultCompatStandardTests();
}

async function saveCompatStandardTestsCatalog(records: CompatStandardTestRecord[]): Promise<void> {
  const { createServerClient, typedUpsert } = await import('@/lib/supabase');
  const supabase = createServerClient();

  const now = Date.now();
  const payload: CompatStandardCatalogPayload = {
    type: 'standard-tests-catalog',
    tests: records,
  };

  const row = {
    session_id: COMPAT_STANDARD_CATALOG_SESSION_KEY,
    started_at: now,
    flushed_at: now,
    duration: 0,
    page_views: [COMPAT_STANDARD_CATALOG_ENTRY_KEY],
    game_entries: [{ game: COMPAT_STANDARD_CATALOG_ENTRY_KEY, at: now, payload }],
    votes: 0,
    ai_requests: 0,
    choices_before_quit: 0,
    category: 'flashflag',
    sex: null,
    age: null,
  };

  const { error } = await typedUpsert(supabase, 'analytics_sessions', row, { onConflict: 'session_id' });
  if (error) throw new Error(`DB error saving flashflag compatibility catalog: ${error.message}`);
}

async function createCompatStandardTest(input: {
  name: string;
  description?: string | null;
  isActive: boolean;
  questions: FlashFlagQuestionDTO[];
}): Promise<{ id: string }> {
  const catalog = await getCompatStandardTestsCatalog();

  let id = `compat-standard-${generateAccessCode().toLowerCase()}`;
  let attempts = 0;
  while (catalog.some((item) => item.id === id) && attempts < 10) {
    id = `compat-standard-${generateAccessCode().toLowerCase()}`;
    attempts += 1;
  }

  const next: CompatStandardTestRecord[] = [
    {
      id,
      name: input.name,
      description: input.description || null,
      is_active: input.isActive,
      updated_at: new Date().toISOString(),
      questions: cloneQuestions(input.questions),
    },
    ...catalog,
  ];

  await saveCompatStandardTestsCatalog(next);
  return { id };
}

async function getCompatStandardTestById(id: string): Promise<CompatStandardTestRecord | null> {
  const catalog = await getCompatStandardTestsCatalog();
  return catalog.find((item) => item.id === id) || null;
}

async function updateCompatStandardTest(
  id: string,
  input: { name?: string; description?: string | null; isActive?: boolean; questions?: FlashFlagQuestionDTO[] },
): Promise<boolean> {
  const catalog = await getCompatStandardTestsCatalog();
  const idx = catalog.findIndex((item) => item.id === id);
  if (idx < 0) return false;

  const current = catalog[idx];
  const updated: CompatStandardTestRecord = {
    ...current,
    updated_at: new Date().toISOString(),
    name: typeof input.name !== 'undefined' ? input.name : current.name,
    description: typeof input.description !== 'undefined' ? input.description : current.description,
    is_active: typeof input.isActive !== 'undefined' ? input.isActive : current.is_active,
    questions: input.questions ? cloneQuestions(input.questions) : cloneQuestions(current.questions),
  };

  catalog[idx] = updated;
  await saveCompatStandardTestsCatalog(catalog);
  return true;
}

async function disableCompatStandardTest(id: string): Promise<boolean> {
  return updateCompatStandardTest(id, { isActive: false });
}

async function createCompatFlashFlagSession(input: {
  mode: 'local' | 'link';
  sourceType: 'standard' | 'custom';
  test: FlashFlagTestDTO;
  subjectSex: 'homme' | 'femme' | 'autre';
  subjectAge: number;
  origin: string;
}) {
  let attempts = 0;
  while (attempts < 10) {
    const code = generateAccessCode();
    attempts += 1;

    const payload: CompatSessionPayload = {
      mode: input.mode,
      sourceType: input.sourceType,
      subjectSex: input.subjectSex,
      subjectAge: input.subjectAge,
      status: 'pending',
      totalScore: 0,
      maxScore: input.test.questions.length * 2,
      answeredCount: 0,
      timedOutCount: 0,
      startedAt: null,
      completedAt: null,
      test: input.test,
      answers: [],
    };

    try {
      await upsertCompatSessionPayload({ code, payload, createOnly: true });
      return {
        sessionCode: code,
        playUrl: buildShareUrl(input.origin, code),
      };
    } catch (err) {
      if (!(err instanceof Error) || !/duplicate key|session_id|unique/i.test(err.message)) {
        throw err;
      }
    }
  }

  throw new Error('Impossible de creer une session partagee');
}

export async function listFlashFlagStandardTests(): Promise<Array<{ id: string; name: string; description: string | null; questionCount: number }>> {
  if (isMockMode()) {
    return mockStandardTests.map((test) => ({
      id: test.id || '',
      name: test.name,
      description: test.description || null,
      questionCount: test.questions.length,
    }));
  }

  const { createServerClient } = await import('@/lib/supabase');
  const supabase = createServerClient();

  const { data: tests, error } = await supabase
    .from('flashflag_tests')
    .select('id, name, description')
    .eq('is_standard', true)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    if (isFlashFlagTableMissingError(error.message)) {
      const compatTests = await getCompatStandardTestsCatalog();
      return toStandardTestsMetadata(compatTests);
    }
    throw new Error(`DB error listing flashflag tests: ${error.message}`);
  }

  const typedTests = (tests || []) as Array<{ id: string; name: string; description: string | null }>;
  if (typedTests.length === 0) return [];

  const testIds = typedTests.map((t) => t.id);
  const { data: questions, error: questionsError } = await supabase
    .from('flashflag_questions')
    .select('id, test_id')
    .in('test_id', testIds);

  if (questionsError) {
    if (isFlashFlagTableMissingError(questionsError.message)) {
      const compatTests = await getCompatStandardTestsCatalog();
      return toStandardTestsMetadata(compatTests);
    }
    throw new Error(`DB error listing flashflag test questions: ${questionsError.message}`);
  }

  const typedQuestions = (questions || []) as Array<{ id: string; test_id: string }>;
  const counts = new Map<string, number>();
  for (const q of typedQuestions) {
    counts.set(q.test_id, (counts.get(q.test_id) || 0) + 1);
  }

  return typedTests.map((test) => ({
    id: test.id,
    name: test.name,
    description: test.description,
    questionCount: counts.get(test.id) || 0,
  }));
}

export async function getFlashFlagTestById(id: string): Promise<FlashFlagTestDTO | null> {
  if (isMockMode()) {
    return mockStandardTests.find((test) => test.id === id) || null;
  }

  const { createServerClient } = await import('@/lib/supabase');
  const supabase = createServerClient();

  const { data: test, error: testError } = await supabase
    .from('flashflag_tests')
    .select('id, name, description, is_active')
    .eq('id', id)
    .maybeSingle();

  const typedTest = (test || null) as { id: string; name: string; description: string | null; is_active: boolean } | null;
  if (testError) {
    if (isFlashFlagTableMissingError(testError.message)) {
      const compatTest = await getCompatStandardTestById(id);
      if (!compatTest || !compatTest.is_active) return null;
      return toFlashFlagTest(compatTest);
    }
    throw new Error(`DB error loading flashflag test: ${testError.message}`);
  }

  if (!typedTest) {
    const compatTest = await getCompatStandardTestById(id);
    if (!compatTest || !compatTest.is_active) return null;
    return toFlashFlagTest(compatTest);
  }

  if (!typedTest.is_active) return null;

  const { data: questions, error: questionError } = await supabase
    .from('flashflag_questions')
    .select('id, position, question_text, time_limit_sec, flashflag_options(id, position, option_text, score)')
    .eq('test_id', id)
    .order('position', { ascending: true });

  if (questionError) {
    if (isFlashFlagTableMissingError(questionError.message)) {
      const compatTest = await getCompatStandardTestById(id);
      if (!compatTest || !compatTest.is_active) return null;
      return toFlashFlagTest(compatTest);
    }
    throw new Error(`DB error loading flashflag questions: ${questionError.message}`);
  }

  const typedQuestions = (questions || []) as Array<{
    id: string;
    position: number;
    question_text: string;
    time_limit_sec: number;
    flashflag_options: Array<{ id: string; position: number; option_text: string; score: 0 | 1 | 2 }>;
  }>;

  return {
    id: typedTest.id,
    name: typedTest.name,
    description: typedTest.description,
    questions: mapQuestions(typedQuestions),
  };
}

export async function createFlashFlagSession(input: {
  mode: 'local' | 'link';
  sourceType: 'standard' | 'custom';
  standardTestId?: string;
  customTest?: FlashFlagTestDTO;
  subjectSex: 'homme' | 'femme' | 'autre';
  subjectAge: number;
  origin: string;
}) {
  if (isMockMode()) {
    const test = input.sourceType === 'standard'
      ? mockStandardTests.find((item) => item.id === input.standardTestId)
      : input.customTest;

    if (!test) throw new Error('Test introuvable');

    let code = generateAccessCode();
    let attempts = 0;
    while (mockSessions.some((item) => item.access_code === code) && attempts < 10) {
      code = generateAccessCode();
      attempts += 1;
    }
    if (mockSessions.some((item) => item.access_code === code)) {
      throw new Error('Impossible de generer un code unique');
    }

    const session: SessionRecord = {
      id: `mock-session-${Date.now()}`,
      access_code: code,
      mode: input.mode,
      source_type: input.sourceType,
      test_id: input.sourceType === 'standard' ? input.standardTestId || null : null,
      custom_payload: input.sourceType === 'custom' ? test : null,
      subject_sex: input.subjectSex,
      subject_age: input.subjectAge,
      status: 'pending',
      total_score: 0,
      max_score: test.questions.length * 2,
      answered_count: 0,
      timed_out_count: 0,
      started_at: null,
      completed_at: null,
      created_at: new Date().toISOString(),
    };

    mockSessions.push(session);

    return {
      sessionCode: code,
      playUrl: buildShareUrl(input.origin, code),
    };
  }

  const test = input.sourceType === 'standard'
    ? await getFlashFlagTestById(input.standardTestId || '')
    : input.customTest;

  if (!test) throw new Error('Test introuvable');

  const { createServerClient, typedInsert } = await import('@/lib/supabase');
  const supabase = createServerClient();

  let code = '';
  let created = false;
  let attempts = 0;
  let lastError: string | null = null;

  while (!created && attempts < 10) {
    code = generateAccessCode();
    attempts += 1;

    const { error } = await typedInsert(supabase, 'flashflag_sessions', {
      access_code: code,
      mode: input.mode,
      source_type: input.sourceType,
      test_id: input.sourceType === 'standard' ? input.standardTestId || null : null,
      custom_payload: input.sourceType === 'custom' ? input.customTest || null : null,
      subject_sex: input.subjectSex,
      subject_age: input.subjectAge,
      max_score: test.questions.length * 2,
    });

    if (!error) {
      created = true;
      break;
    }

    if (isFlashFlagTableMissingError(error.message)) {
      return createCompatFlashFlagSession({
        mode: input.mode,
        sourceType: input.sourceType,
        test,
        subjectSex: input.subjectSex,
        subjectAge: input.subjectAge,
        origin: input.origin,
      });
    }

    lastError = error.message;
    if (!/duplicate key|access_code|unique/i.test(error.message)) {
      throw new Error(`DB error creating flashflag session: ${error.message}`);
    }
  }

  if (!created) {
    throw new Error(lastError ? `DB error creating flashflag session: ${lastError}` : 'Impossible de creer une session');
  }

  return {
    sessionCode: code,
    playUrl: buildShareUrl(input.origin, code),
  };
}

export async function getFlashFlagSessionByCode(code: string): Promise<{
  session: SessionRecord;
  test: FlashFlagTestDTO;
  answers: AnswerRecord[];
} | null> {
  if (isMockMode()) {
    const session = mockSessions.find((item) => item.access_code === code);
    if (!session) return null;

    const test = session.source_type === 'standard'
      ? mockStandardTests.find((item) => item.id === session.test_id)
      : session.custom_payload;

    if (!test) return null;

    return {
      session,
      test,
      answers: mockAnswers.get(session.id) || [],
    };
  }

  const { createServerClient } = await import('@/lib/supabase');
  const supabase = createServerClient();

  const { data: session, error: sessionError } = await supabase
    .from('flashflag_sessions')
    .select('*')
    .eq('access_code', code)
    .maybeSingle();

  const typedSession = (session || null) as SessionRecord | null;
  if (sessionError) {
    if (isFlashFlagTableMissingError(sessionError.message)) {
      return getCompatSessionByCode(code);
    }
    throw new Error(`DB error fetching flashflag session: ${sessionError.message}`);
  }
  if (!typedSession) {
    return getCompatSessionByCode(code);
  }

  let test: FlashFlagTestDTO | null = null;
  if (typedSession.source_type === 'standard' && typedSession.test_id) {
    test = await getFlashFlagTestById(typedSession.test_id);
  } else if (typedSession.source_type === 'custom') {
    test = typedSession.custom_payload as FlashFlagTestDTO;
  }

  if (!test) return null;

  const { data: answersData, error: answersError } = await supabase
    .from('flashflag_answers')
    .select('question_index, question_text, selected_option, selected_score, timed_out, time_spent_ms')
    .eq('session_id', typedSession.id)
    .order('question_index', { ascending: true });

  if (answersError) {
    if (isFlashFlagTableMissingError(answersError.message)) {
      return getCompatSessionByCode(code);
    }
    throw new Error(`DB error fetching flashflag answers: ${answersError.message}`);
  }

  return {
    session: typedSession,
    test,
    answers: (answersData || []) as AnswerRecord[],
  };
}

export async function startFlashFlagSession(code: string): Promise<void> {
  if (isMockMode()) {
    const session = mockSessions.find((item) => item.access_code === code);
    if (!session) throw new Error('Session introuvable');
    if (session.status === 'completed') return;
    session.status = 'in_progress';
    if (!session.started_at) session.started_at = new Date().toISOString();
    return;
  }

  const { createServerClient, typedUpdate } = await import('@/lib/supabase');
  const supabase = createServerClient();

  const session = await getFlashFlagSessionByCode(code);
  if (!session) throw new Error('Session introuvable');

  if (isCompatSessionId(session.session.id)) {
    if (session.session.status === 'completed') return;

    const compatPayload: CompatSessionPayload = {
      mode: session.session.mode,
      sourceType: session.session.source_type,
      subjectSex: session.session.subject_sex,
      subjectAge: session.session.subject_age,
      status: 'in_progress',
      totalScore: session.session.total_score,
      maxScore: session.session.max_score,
      answeredCount: session.session.answered_count,
      timedOutCount: session.session.timed_out_count,
      startedAt: session.session.started_at || new Date().toISOString(),
      completedAt: session.session.completed_at,
      test: session.test,
      answers: session.answers,
    };

    await upsertCompatSessionPayload({ code, payload: compatPayload });
    return;
  }

  if (session.session.status === 'completed') return;

  const { error } = await typedUpdate(supabase, 'flashflag_sessions', {
    status: 'in_progress',
    started_at: session.session.started_at || new Date().toISOString(),
  }).eq('id', session.session.id);

  if (error) throw new Error(`DB error starting flashflag session: ${error.message}`);
}

export async function submitFlashFlagAnswers(code: string, answers: FlashFlagAnswerInput[]) {
  const loaded = await getFlashFlagSessionByCode(code);
  if (!loaded) throw new Error('Session introuvable');

  const summary = computeFlashFlagSummary(answers, loaded.test.questions.length);

  if (isCompatSessionId(loaded.session.id)) {
    const compatPayload: CompatSessionPayload = {
      mode: loaded.session.mode,
      sourceType: loaded.session.source_type,
      subjectSex: loaded.session.subject_sex,
      subjectAge: loaded.session.subject_age,
      status: 'completed',
      totalScore: summary.totalScore,
      maxScore: summary.maxScore,
      answeredCount: summary.answeredCount,
      timedOutCount: summary.timedOutCount,
      startedAt: loaded.session.started_at || new Date().toISOString(),
      completedAt: new Date().toISOString(),
      test: loaded.test,
      answers: serializeAnswers(answers),
    };

    await upsertCompatSessionPayload({ code, payload: compatPayload });
    return summary;
  }

  if (isMockMode()) {
    mockAnswers.set(loaded.session.id, serializeAnswers(answers));

    loaded.session.total_score = summary.totalScore;
    loaded.session.max_score = summary.maxScore;
    loaded.session.answered_count = summary.answeredCount;
    loaded.session.timed_out_count = summary.timedOutCount;
    loaded.session.status = 'completed';
    loaded.session.completed_at = new Date().toISOString();

    return summary;
  }

  const { createServerClient, typedInsert, typedUpdate } = await import('@/lib/supabase');
  const supabase = createServerClient();

  const { error: deleteError } = await supabase
    .from('flashflag_answers')
    .delete()
    .eq('session_id', loaded.session.id);
  if (deleteError) throw new Error(`DB error clearing answers: ${deleteError.message}`);

  const answerRows = answers.map((item) => ({
    session_id: loaded.session.id,
    question_index: item.questionIndex,
    question_text: item.questionText,
    selected_option: item.selectedOption,
    selected_score: item.selectedScore,
    timed_out: item.timedOut,
    time_spent_ms: item.timeSpentMs,
  }));

  if (answerRows.length > 0) {
    for (const row of answerRows) {
      const { error: insertError } = await typedInsert(supabase, 'flashflag_answers', row);
      if (insertError) throw new Error(`DB error storing answers: ${insertError.message}`);
    }
  }

  const { error: updateError } = await typedUpdate(supabase, 'flashflag_sessions', {
    status: 'completed',
    total_score: summary.totalScore,
    max_score: summary.maxScore,
    answered_count: summary.answeredCount,
    timed_out_count: summary.timedOutCount,
    completed_at: new Date().toISOString(),
    started_at: loaded.session.started_at || new Date().toISOString(),
  }).eq('id', loaded.session.id);

  if (updateError) throw new Error(`DB error finalizing session: ${updateError.message}`);

  return summary;
}

export async function listAdminFlashFlagTests() {
  if (isMockMode()) {
    return mockStandardTests.map((test) => ({
      id: test.id,
      name: test.name,
      description: test.description || null,
      is_active: true,
      question_count: test.questions.length,
      updated_at: new Date().toISOString(),
    }));
  }

  const { createServerClient } = await import('@/lib/supabase');
  const supabase = createServerClient();

  const { data: tests, error } = await supabase
    .from('flashflag_tests')
    .select('id, name, description, is_active, updated_at')
    .eq('is_standard', true)
    .order('updated_at', { ascending: false });

  if (error) {
    if (isFlashFlagTableMissingError(error.message)) {
      const compatTests = await getCompatStandardTestsCatalog();
      return toAdminTestsList(compatTests);
    }
    throw new Error(`DB error loading admin flashflag tests: ${error.message}`);
  }

  const typedTests = (tests || []) as Array<{
    id: string;
    name: string;
    description: string | null;
    is_active: boolean;
    updated_at: string;
  }>;

  const testIds = typedTests.map((test) => test.id);
  let counts = new Map<string, number>();

  if (testIds.length > 0) {
    const { data: questions, error: questionsError } = await supabase
      .from('flashflag_questions')
      .select('test_id')
      .in('test_id', testIds);

    if (questionsError) {
      if (isFlashFlagTableMissingError(questionsError.message)) {
        const compatTests = await getCompatStandardTestsCatalog();
        return toAdminTestsList(compatTests);
      }
      throw new Error(`DB error loading admin flashflag question counts: ${questionsError.message}`);
    }

    const typedQuestions = (questions || []) as Array<{ test_id: string }>;

    counts = new Map<string, number>();
    for (const q of typedQuestions) {
      counts.set(q.test_id, (counts.get(q.test_id) || 0) + 1);
    }
  }

  return typedTests.map((test) => ({
    ...test,
    question_count: counts.get(test.id) || 0,
  }));
}

export async function createAdminFlashFlagTest(input: {
  name: string;
  description?: string | null;
  isActive: boolean;
  questions: FlashFlagQuestionDTO[];
}) {
  if (isMockMode()) {
    const id = `mock-standard-${Date.now()}`;
    mockStandardTests.unshift({
      id,
      name: input.name,
      description: input.description || null,
      questions: input.questions,
    });
    return { id };
  }

  const { createServerClient, typedInsert } = await import('@/lib/supabase');
  const supabase = createServerClient();

  const { data: testRow, error: testError } = await typedInsert(supabase, 'flashflag_tests', {
    name: input.name,
    description: input.description || null,
    is_standard: true,
    is_active: input.isActive,
    created_by: 'admin',
  }).select('id').single();

  if (testError) {
    if (isFlashFlagTableMissingError(testError.message)) {
      return createCompatStandardTest(input);
    }
    throw new Error(`DB error creating flashflag test: ${testError.message}`);
  }

  const testId = (testRow as { id: string }).id;

  for (let i = 0; i < input.questions.length; i += 1) {
    const question = input.questions[i];
    const { data: questionRow, error: questionError } = await typedInsert(supabase, 'flashflag_questions', {
      test_id: testId,
      position: i,
      question_text: question.text,
      time_limit_sec: question.timeLimitSec,
    }).select('id').single();

    if (questionError) throw new Error(`DB error creating flashflag question: ${questionError.message}`);

    const questionId = (questionRow as { id: string }).id;
    const optionsRows = question.options.map((option, idx) => ({
      question_id: questionId,
      position: idx,
      option_text: option.text,
      score: option.score,
    }));

    for (const optionRow of optionsRows) {
      const { error: optionsError } = await typedInsert(supabase, 'flashflag_options', optionRow);
      if (optionsError) throw new Error(`DB error creating flashflag options: ${optionsError.message}`);
    }
  }

  return { id: testId };
}

export async function updateAdminFlashFlagTest(
  id: string,
  input: { name?: string; description?: string | null; isActive?: boolean; questions?: FlashFlagQuestionDTO[] },
) {
  if (isMockMode()) {
    const target = mockStandardTests.find((item) => item.id === id);
    if (!target) return false;

    if (typeof input.name !== 'undefined') target.name = input.name;
    if (typeof input.description !== 'undefined') target.description = input.description;
    if (input.questions) target.questions = input.questions;

    return true;
  }

  const { createServerClient, typedUpdate, typedInsert } = await import('@/lib/supabase');
  const supabase = createServerClient();

  try {
    if (typeof input.name !== 'undefined' || typeof input.description !== 'undefined' || typeof input.isActive !== 'undefined') {
      const updatePayload: Record<string, unknown> = {};
      if (typeof input.name !== 'undefined') updatePayload.name = input.name;
      if (typeof input.description !== 'undefined') updatePayload.description = input.description;
      if (typeof input.isActive !== 'undefined') updatePayload.is_active = input.isActive;

      const { error: headerError } = await typedUpdate(supabase, 'flashflag_tests', updatePayload).eq('id', id);
      if (headerError) throw new Error(`DB error updating flashflag test header: ${headerError.message}`);
    }

    if (input.questions) {
      const { data: existingQuestions, error: existingQuestionsError } = await supabase
        .from('flashflag_questions')
        .select('id')
        .eq('test_id', id);

      if (existingQuestionsError) {
        throw new Error(`DB error loading flashflag questions: ${existingQuestionsError.message}`);
      }

      const typedExistingQuestions = (existingQuestions || []) as Array<{ id: string }>;
      const questionIds = typedExistingQuestions.map((q) => q.id);
      if (questionIds.length > 0) {
        const { error: deleteOptionsError } = await supabase.from('flashflag_options').delete().in('question_id', questionIds);
        if (deleteOptionsError) throw new Error(`DB error deleting flashflag options: ${deleteOptionsError.message}`);
      }

      const { error: deleteQuestionsError } = await supabase.from('flashflag_questions').delete().eq('test_id', id);
      if (deleteQuestionsError) throw new Error(`DB error deleting flashflag questions: ${deleteQuestionsError.message}`);

      for (let i = 0; i < input.questions.length; i += 1) {
        const question = input.questions[i];
        const { data: questionRow, error: questionError } = await typedInsert(supabase, 'flashflag_questions', {
          test_id: id,
          position: i,
          question_text: question.text,
          time_limit_sec: question.timeLimitSec,
        }).select('id').single();

        if (questionError) throw new Error(`DB error re-creating flashflag question: ${questionError.message}`);

        const qid = (questionRow as { id: string }).id;
        const optionRows = question.options.map((option, idx) => ({
          question_id: qid,
          position: idx,
          option_text: option.text,
          score: option.score,
        }));

        for (const optionRow of optionRows) {
          const { error: optionsError } = await typedInsert(supabase, 'flashflag_options', optionRow);
          if (optionsError) throw new Error(`DB error re-creating flashflag options: ${optionsError.message}`);
        }
      }
    }

    return true;
  } catch (error) {
    if (isMissingFlashFlagTableError(error)) {
      return updateCompatStandardTest(id, input);
    }
    throw error;
  }
}

export async function disableAdminFlashFlagTest(id: string) {
  if (isMockMode()) {
    const target = mockStandardTests.find((item) => item.id === id);
    if (!target) return false;
    target.description = `${target.description || ''} (desactive)`;
    return true;
  }

  const { createServerClient, typedUpdate } = await import('@/lib/supabase');
  const supabase = createServerClient();
  const { error } = await typedUpdate(supabase, 'flashflag_tests', { is_active: false }).eq('id', id);

  if (error) {
    if (isFlashFlagTableMissingError(error.message)) {
      return disableCompatStandardTest(id);
    }
    throw new Error(`DB error disabling flashflag test: ${error.message}`);
  }

  return true;
}

import { z } from 'zod';

// Enum schemas - Nouvelles catégories 2026
export const categorieSchema = z.enum(['sexe', 'quotidien', 'metiers']);
export const sexeVotantSchema = z.enum(['homme', 'femme', 'autre']);
export const ageVotantSchema = z.enum(['16-18', '19-22', '23-26', '27+']);
export const feedbackTypeSchema = z.enum(['star', 'thumbs_up', 'thumbs_down']);

// Profile schema (for LocalStorage)
export const playerProfileSchema = z.object({
  sex: sexeVotantSchema,
  age: ageVotantSchema,
});

// Element schemas
export const elementCreateSchema = z.object({
  texte: z.string()
    .min(3, 'Le texte doit contenir au moins 3 caractères')
    .max(200, 'Le texte ne doit pas dépasser 200 caractères'),
  categorie: categorieSchema,
  niveau_provocation: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).default(2),
});

export const elementUpdateSchema = z.object({
  texte: z.string()
    .min(3, 'Le texte doit contenir au moins 3 caractères')
    .max(200, 'Le texte ne doit pas dépasser 200 caractères')
    .optional(),
  categorie: categorieSchema.optional(),
  niveau_provocation: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).optional(),
  actif: z.boolean().optional(),
});

// Vote schema
// Note: winnerId/loserId accept any non-empty string (UUID in prod, simple ID in mock mode)
// Actual existence is validated by the element lookup in the route handler
export const voteSchema = z.object({
  winnerId: z.string().min(1, 'winnerId est requis'),
  loserId: z.string().min(1, 'loserId est requis'),
  sexe: sexeVotantSchema,
  age: ageVotantSchema,
}).refine(data => data.winnerId !== data.loserId, {
  message: 'Le gagnant et le perdant ne peuvent pas être le même élément',
  path: ['loserId'],
});

// Feedback schema
export const feedbackSchema = z.object({
  elementAId: z.string().min(1, 'elementAId est requis'),
  elementBId: z.string().min(1, 'elementBId est requis'),
  type: feedbackTypeSchema,
}).refine(data => data.elementAId !== data.elementBId, {
  message: 'Les deux éléments doivent être différents',
  path: ['elementBId'],
});

// Admin login schema
export const adminLoginSchema = z.object({
  password: z.string().min(1, 'Le mot de passe est requis'),
});

// Query params schemas
export const duelQuerySchema = z.object({
  seenDuels: z.string().max(10000, 'seenDuels trop long').optional(),
});

export const elementsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  category: categorieSchema.optional(),
  active: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  search: z.string().optional(),
});

export const rankingsQuerySchema = z.object({
  type: z.enum(['red', 'green']),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  category: categorieSchema.optional(),
  segment: z.union([sexeVotantSchema, ageVotantSchema]).optional(),
});

// Flash Flag schemas
export const flashFlagOptionSchema = z.object({
  text: z.string().min(1).max(140),
  score: z.union([z.literal(0), z.literal(1), z.literal(2)]),
});

export const flashFlagQuestionSchema = z.object({
  text: z.string().min(3).max(220),
  timeLimitSec: z.coerce.number().int().min(3).max(30),
  options: z.array(flashFlagOptionSchema).min(2).max(3),
});

export const flashFlagCustomTestSchema = z.object({
  name: z.string().min(3).max(80),
  description: z.string().max(240).optional().nullable(),
  questions: z.array(flashFlagQuestionSchema).length(10),
});

export const flashFlagCreateSessionSchema = z.object({
  mode: z.enum(['local', 'link']),
  sourceType: z.enum(['standard', 'custom']),
  standardTestId: z.string().min(1).optional(),
  customTest: flashFlagCustomTestSchema.optional(),
  subjectSex: sexeVotantSchema,
  subjectAge: z.coerce.number().int().min(16).max(99),
}).superRefine((input, ctx) => {
  if (input.sourceType === 'standard' && !input.standardTestId) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'standardTestId requis pour un test standard', path: ['standardTestId'] });
  }
  if (input.sourceType === 'custom' && !input.customTest) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'customTest requis pour un test personnalise', path: ['customTest'] });
  }
});

export const flashFlagStartSessionSchema = z.object({
  started: z.boolean().default(true),
});

export const flashFlagAnswerSchema = z.object({
  questionIndex: z.coerce.number().int().min(0).max(99),
  questionText: z.string().min(1).max(220),
  selectedOption: z.string().max(140).nullable(),
  selectedScore: z.union([z.literal(0), z.literal(1), z.literal(2)]),
  timedOut: z.boolean(),
  timeSpentMs: z.coerce.number().int().min(0).max(120000),
});

export const flashFlagSubmitSchema = z.object({
  answers: z.array(flashFlagAnswerSchema).min(1).max(20),
});

export const flashFlagAdminTestSchema = z.object({
  name: z.string().min(3).max(80),
  description: z.string().max(240).optional().nullable(),
  isActive: z.boolean().optional().default(true),
  questions: z.array(flashFlagQuestionSchema).min(1).max(20),
});

export const flashFlagAdminUpdateSchema = z.object({
  name: z.string().min(3).max(80).optional(),
  description: z.string().max(240).nullable().optional(),
  isActive: z.boolean().optional(),
  questions: z.array(flashFlagQuestionSchema).min(1).max(20).optional(),
});

// Type exports from schemas
export type PlayerProfileInput = z.infer<typeof playerProfileSchema>;
export type ElementCreateInput = z.infer<typeof elementCreateSchema>;
export type ElementUpdateInput = z.infer<typeof elementUpdateSchema>;
export type VoteInput = z.infer<typeof voteSchema>;
export type FeedbackInput = z.infer<typeof feedbackSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type FlashFlagCreateSessionInput = z.infer<typeof flashFlagCreateSessionSchema>;
export type FlashFlagSubmitInput = z.infer<typeof flashFlagSubmitSchema>;

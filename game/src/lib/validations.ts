import { z } from 'zod';

// Enum schemas
export const categorieSchema = z.enum(['metier', 'comportement', 'trait', 'preference', 'absurde']);
export const sexeVotantSchema = z.enum(['homme', 'femme', 'nonbinaire', 'autre']);
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
  niveau_provocation: z.number().int().min(1).max(4).default(2),
});

export const elementUpdateSchema = z.object({
  texte: z.string()
    .min(3, 'Le texte doit contenir au moins 3 caractères')
    .max(200, 'Le texte ne doit pas dépasser 200 caractères')
    .optional(),
  categorie: categorieSchema.optional(),
  niveau_provocation: z.number().int().min(1).max(4).optional(),
  actif: z.boolean().optional(),
});

// Vote schema
export const voteSchema = z.object({
  winnerId: z.string().uuid('Format UUID invalide pour winnerId'),
  loserId: z.string().uuid('Format UUID invalide pour loserId'),
  sexe: sexeVotantSchema,
  age: ageVotantSchema,
}).refine(data => data.winnerId !== data.loserId, {
  message: 'Le gagnant et le perdant ne peuvent pas être le même élément',
  path: ['loserId'],
});

// Feedback schema
export const feedbackSchema = z.object({
  elementAId: z.string().uuid('Format UUID invalide'),
  elementBId: z.string().uuid('Format UUID invalide'),
  type: feedbackTypeSchema,
}).refine(data => data.elementAId !== data.elementBId, {
  message: 'Les deux éléments doivent être différents',
  path: ['elementBId'],
});

// Admin login schema
export const adminLoginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

// Query params schemas
export const duelQuerySchema = z.object({
  seenDuels: z.string().optional(),
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

// Type exports from schemas
export type PlayerProfileInput = z.infer<typeof playerProfileSchema>;
export type ElementCreateInput = z.infer<typeof elementCreateSchema>;
export type ElementUpdateInput = z.infer<typeof elementUpdateSchema>;
export type VoteInput = z.infer<typeof voteSchema>;
export type FeedbackInput = z.infer<typeof feedbackSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

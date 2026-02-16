import { z } from 'zod';

// Enum schemas - Nouvelles catégories 2026
export const categorieSchema = z.enum(['sexe', 'lifestyle', 'quotidien', 'bureau']);
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

// Type exports from schemas
export type PlayerProfileInput = z.infer<typeof playerProfileSchema>;
export type ElementCreateInput = z.infer<typeof elementCreateSchema>;
export type ElementUpdateInput = z.infer<typeof elementUpdateSchema>;
export type VoteInput = z.infer<typeof voteSchema>;
export type FeedbackInput = z.infer<typeof feedbackSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

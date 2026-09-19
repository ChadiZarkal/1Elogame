/**
 * @module lib/rft/schemas
 * Ce que l'administration a le droit d'envoyer.
 *
 * Les schémas vivent ici plutôt que dans les routes parce que deux routes les
 * partagent — la création et la modification valident exactement la même forme
 * — et parce qu'un fichier `route.ts` ne doit exporter que des gestionnaires :
 * Next refuse le reste à la compilation.
 *
 * Les bornes reprennent celles des contraintes SQL. Deux gardes valent mieux
 * qu'une : celle-ci rend un message lisible dans le formulaire, celle de
 * Postgres protège la base contre tout ce qui ne passe pas par le formulaire.
 */

import { z } from 'zod';

export const questionSchema = z.object({
  texte: z.string().trim().min(1, 'L’énoncé ne peut pas être vide').max(500),
  precision: z.string().trim().max(300).nullable().default(null),
  active: z.boolean().default(true),
  position: z.number().int().min(0).default(0),
  tagIds: z.array(z.string().min(1)).max(10).default([]),
  reponses: z
    .array(
      z.object({
        texte: z.string().trim().min(1, 'Une réponse ne peut pas être vide').max(300),
        points: z.number().int().min(-50).max(50),
        pique: z.string().trim().max(300).nullable().default(null),
      }),
    )
    // Zéro réponse est permis : on enregistre une question en cours de
    // rédaction. Le jeu, lui, l'écarte — une question sans bouton bloquerait
    // une partie.
    .max(12, 'Douze réponses, c’est déjà beaucoup trop pour un écran de téléphone')
    .default([]),
});

export const tagSchema = z.object({
  // Le slug sert d'identifiant lisible et porte une contrainte d'unicité en
  // base : on le contraint ici pour que le refus arrive avec un message plutôt
  // qu'avec une violation de contrainte.
  slug: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .regex(/^[a-z0-9-]+$/, 'Minuscules, chiffres et tirets uniquement'),
  label: z.string().trim().min(1, 'Le nom ne peut pas être vide').max(60),
  description: z.string().trim().max(200).nullable().default(null),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Une couleur hexadécimale, par exemple #38bdf8')
    .nullable()
    .default(null),
  position: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  /*
   * La ressource d'aide accrochée à la catégorie. Le seuil est un pourcentage
   * de l'AXE, pas du score total : c'est la catégorie qui sait de quoi elle
   * parle, et un seuil global afficherait un texte sur la violence à quelqu'un
   * de simplement déloyal.
   */
  ressourceSeuil: z.number().int().min(1).max(100).nullable().default(null),
  ressourceTexte: z.string().trim().max(600).nullable().default(null),
  ressourceLien: z.string().trim().max(300).nullable().default(null),
});

/**
 * Un archétype.
 *
 * La paire est normalisée avant l'écriture, pas ici : le formulaire n'a aucune
 * raison de connaître l'ordre des identifiants, et lui imposer reviendrait à
 * refuser une saisie sur deux avec un message de contrainte illisible.
 */
export const archetypeSchema = z.object({
  tagA: z.string().min(1),
  tagB: z.string().min(1).nullable().default(null),
  emoji: z.string().trim().max(8).nullable().default(null),
  titre: z.string().trim().min(1, 'Le titre ne peut pas être vide').max(80),
  soustitre: z.string().trim().max(300).nullable().default(null),
}).refine((a) => a.tagB === null || a.tagA !== a.tagB, {
  message: 'Les deux catégories doivent être différentes',
  path: ['tagB'],
});

export const verdictSchema = z.object({
  // Pas de borne haute : le score n'en a pas non plus, et un palier « à partir
  // de 150 » est parfaitement légitime.
  minScore: z.number().int().min(0).max(1000),
  emoji: z.string().trim().max(8).nullable().default(null),
  titre: z.string().trim().min(1, 'Le titre ne peut pas être vide').max(80),
  soustitre: z.string().trim().max(300).nullable().default(null),
});

export const ordreSchema = z.object({ ids: z.array(z.string().min(1)).max(500) });

export type EntreeQuestion = z.infer<typeof questionSchema>;
export type EntreeTag = z.infer<typeof tagSchema>;
export type EntreeVerdict = z.infer<typeof verdictSchema>;
export type EntreeArchetype = z.infer<typeof archetypeSchema>;

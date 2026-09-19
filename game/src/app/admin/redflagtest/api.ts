/**
 * @module admin/redflagtest/api
 * Les appels de l'administration, côté navigateur.
 *
 * POURQUOI CE FICHIER
 *   Trois panneaux écrivent, et chacun doit poser le jeton, lire l'enveloppe
 *   `{ success, data, error }`, et transformer un échec en message affichable.
 *   Écrit trois fois, ce serait trois occasions d'oublier le cas d'erreur — et
 *   un enregistrement qui échoue sans le dire est la panne la plus coûteuse
 *   d'un back-office : on croit avoir saisi, on ne l'a pas fait.
 */

import type { Archetype, QuestionAdmin, Tag, Verdict } from '@/lib/rft/types';

export interface ContenuAdmin {
  questions: QuestionAdmin[];
  tags: Tag[];
  verdicts: Verdict[];
  archetypes: Archetype[];
  /** Le score qu'obtiendrait quelqu'un cochant systématiquement la pire réponse. */
  budget: number;
}

/** Levée quand la session d'administration n'est plus valable. */
export class SessionExpiree extends Error {
  constructor() {
    super('Session expirée');
    this.name = 'SessionExpiree';
  }
}

function jeton(): string {
  return (typeof window !== 'undefined' && sessionStorage.getItem('adminToken')) || '';
}

async function appeler<T>(url: string, init?: RequestInit): Promise<T> {
  const reponse = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jeton()}`,
      ...init?.headers,
    },
  });

  if (reponse.status === 401) throw new SessionExpiree();

  const json = await reponse.json().catch(() => null);
  if (!json?.success) {
    // Les routes d'administration renvoient le message réel de Postgres : le
    // faire remonter tel quel à l'écran est tout l'intérêt.
    throw new Error(json?.error?.message ?? `Échec (HTTP ${reponse.status})`);
  }
  return json.data as T;
}

export const chargerContenu = () => appeler<ContenuAdmin>('/api/admin/redflagtest');

export const creerQuestion = (q: unknown) =>
  appeler<{ id: string }>('/api/admin/redflagtest/questions', {
    method: 'POST',
    body: JSON.stringify(q),
  });

export const modifierQuestion = (id: string, q: unknown) =>
  appeler<{ id: string }>(`/api/admin/redflagtest/questions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(q),
  });

export const effacerQuestion = (id: string) =>
  appeler<{ id: string }>(`/api/admin/redflagtest/questions/${id}`, { method: 'DELETE' });

export const reordonner = (ids: string[]) =>
  appeler<{ ordonnees: number }>('/api/admin/redflagtest/questions', {
    method: 'PUT',
    body: JSON.stringify({ ids }),
  });

export const creerTag = (t: unknown) =>
  appeler('/api/admin/redflagtest/tags', { method: 'POST', body: JSON.stringify(t) });

export const modifierTag = (id: string, t: unknown) =>
  appeler(`/api/admin/redflagtest/tags/${id}`, { method: 'PUT', body: JSON.stringify(t) });

export const effacerTag = (id: string) =>
  appeler(`/api/admin/redflagtest/tags/${id}`, { method: 'DELETE' });

export const creerVerdict = (v: unknown) =>
  appeler('/api/admin/redflagtest/verdicts', { method: 'POST', body: JSON.stringify(v) });

export const modifierVerdict = (id: string, v: unknown) =>
  appeler(`/api/admin/redflagtest/verdicts/${id}`, { method: 'PUT', body: JSON.stringify(v) });

export const effacerVerdict = (id: string) =>
  appeler(`/api/admin/redflagtest/verdicts/${id}`, { method: 'DELETE' });

export const creerArchetype = (a: unknown) =>
  appeler('/api/admin/redflagtest/archetypes', { method: 'POST', body: JSON.stringify(a) });

export const modifierArchetype = (id: string, a: unknown) =>
  appeler(`/api/admin/redflagtest/archetypes/${id}`, { method: 'PUT', body: JSON.stringify(a) });

export const effacerArchetype = (id: string) =>
  appeler(`/api/admin/redflagtest/archetypes/${id}`, { method: 'DELETE' });

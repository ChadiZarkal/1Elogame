/**
 * @module adminAuth
 * L'accès à l'administration : un mot de passe, puis un jeton signé.
 *
 * LE MOT DE PASSE VIT DANS L'ENVIRONNEMENT
 *   `ADMIN_PASSWORD`, en clair, posé dans les variables d'environnement de
 *   Vercel. Il n'est jamais dans le dépôt ni envoyé au navigateur : il ne
 *   quitte le serveur que sous forme d'empreinte, pour la comparaison.
 *
 * FERMÉ PAR DÉFAUT
 *   Sans mot de passe configuré, personne n'entre — ni par la connexion, ni par
 *   un jeton. L'administration est restée ouverte de juillet à octobre 2026
 *   parce que la vérification avait été court-circuitée « pour l'instant » :
 *   l'absence de configuration ne doit jamais redevenir une porte ouverte.
 *   Seule exception, le développement local en mode démo (hors production), où
 *   le mot de passe est « admin ».
 *
 * LE JETON
 *   `<expiration>.<signature>` : une signature HMAC de la date d'expiration,
 *   vérifiable sans rien stocker — ce qui tient sur plusieurs instances
 *   serverless. La clé de signature dérive du mot de passe : en changer
 *   déconnecte d'un coup toutes les sessions ouvertes, ce qui est exactement ce
 *   qu'on attend après une fuite. `ADMIN_TOKEN_SECRET`, s'il est posé, la
 *   remplace.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHash, createHmac, timingSafeEqual } from 'crypto';
import { createApiError } from '@/lib/utils';

/** Durée d'une session d'administration. */
const DUREE_JETON_MS = 4 * 60 * 60 * 1000;

/** Le mot de passe du développement local, en mode démo uniquement. */
export const MOT_DE_PASSE_DEMO = 'admin';

function modeDemoLocal(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_MOCK_MODE === 'true';
}

/**
 * Le mot de passe attendu, ou `null` quand l'accès est fermé faute de
 * configuration. Lu à chaque appel et non au chargement du module : une
 * variable ajoutée sur Vercel prend effet au déploiement suivant, sans dépendre
 * de l'ordre d'initialisation.
 */
function motDePasseAttendu(): string | null {
  const configure = process.env.ADMIN_PASSWORD?.trim();
  if (configure) return configure;
  return modeDemoLocal() ? MOT_DE_PASSE_DEMO : null;
}

/** L'administration est-elle ouvrable ? Faux en production sans mot de passe. */
export function adminConfigure(): boolean {
  return motDePasseAttendu() !== null;
}

function cleDeSignature(): string | null {
  const secret = process.env.ADMIN_TOKEN_SECRET?.trim();
  if (secret) return secret;
  const mdp = motDePasseAttendu();
  return mdp === null ? null : `rog-admin:${mdp}`;
}

function empreinte(texte: string): Buffer {
  return createHash('sha256').update(texte).digest();
}

/**
 * Compare en temps constant. Les deux côtés sont ramenés à une empreinte de
 * même longueur : `timingSafeEqual` refuse des tailles différentes, et un
 * refus anticipé trahirait la longueur du mot de passe.
 */
function egaux(a: string, b: string): boolean {
  return timingSafeEqual(empreinte(a), empreinte(b));
}

/** Vérifie un mot de passe saisi. Toujours faux quand l'accès est fermé. */
export function verifierMotDePasse(saisi: string): boolean {
  const attendu = motDePasseAttendu();
  if (attendu === null) return false;
  return egaux(saisi, attendu);
}

function signer(donnee: string, cle: string): string {
  return createHmac('sha256', cle).update(donnee).digest('hex');
}

/** Un jeton signé, valable quatre heures. Lève si l'accès est fermé. */
export function generateAdminToken(): { token: string; expiresIn: number } {
  const cle = cleDeSignature();
  if (cle === null) throw new Error('Administration non configurée : ADMIN_PASSWORD manquant.');
  const expiration = Date.now() + DUREE_JETON_MS;
  return {
    token: `${expiration}.${signer(String(expiration), cle)}`,
    expiresIn: DUREE_JETON_MS / 1000,
  };
}

/** Vrai pour un jeton signé avec la clé courante et non expiré. */
export function validateAdminToken(token: string): boolean {
  const cle = cleDeSignature();
  if (cle === null || !token) return false;

  const point = token.indexOf('.');
  if (point <= 0) return false;
  const expiration = token.slice(0, point);
  const signature = token.slice(point + 1);

  const echeance = Number(expiration);
  if (!Number.isFinite(echeance) || Date.now() > echeance) return false;

  return egaux(signature, signer(expiration, cle));
}

/** Sans état : se déconnecter, c'est oublier le jeton côté navigateur. */
export function revokeAdminToken(token: string): void {
  void token;
}

export function extractBearerToken(request: NextRequest): string | null {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return auth.substring(7);
}

/**
 * Laisse passer une requête d'administration (`null`) ou rend le refus.
 * Appelée par `withApiHandler` pour toute route marquée `requireAdmin`.
 */
export function authenticateAdmin(request: NextRequest): NextResponse | null {
  const token = extractBearerToken(request);
  if (!token) {
    return NextResponse.json(
      createApiError('UNAUTHORIZED', 'Connexion requise'),
      { status: 401 },
    );
  }
  if (validateAdminToken(token)) return null;
  return NextResponse.json(
    createApiError('UNAUTHORIZED', 'Session expirée ou invalide, reconnecte-toi'),
    { status: 401 },
  );
}

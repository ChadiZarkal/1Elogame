import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/adminAuth';
import { createApiSuccess, createApiError } from '@/lib/utils';
import {
  getAlgorithmConfig,
  setAlgorithmConfig,
  resetAlgorithmConfig,
  DEFAULT_ALGORITHM_CONFIG,
  AlgorithmConfig,
} from '@/lib/algorithmConfig';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/algorithm — Get current algorithm configuration.
 */
export async function GET(request: NextRequest) {
  const authError = authenticateAdmin(request);
  if (authError) return authError;

  const config = getAlgorithmConfig();
  const isDefault = !globalThis.__algorithmConfig;

  return NextResponse.json(
    createApiSuccess({
      config,
      isDefault,
      defaults: DEFAULT_ALGORITHM_CONFIG,
    })
  );
}

/**
 * POST /api/admin/algorithm — Update algorithm configuration.
 * Body: { action: 'update' | 'reset', config?: AlgorithmConfig }
 */
export async function POST(request: NextRequest) {
  const authError = authenticateAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { action, config } = body;

    if (action === 'reset') {
      resetAlgorithmConfig();
      return NextResponse.json(
        createApiSuccess({
          config: DEFAULT_ALGORITHM_CONFIG,
          isDefault: true,
          message: 'Configuration réinitialisée aux valeurs par défaut.',
        })
      );
    }

    if (action === 'update' && config) {
      // Validate the config shape
      const validated = validateConfigShape(config);
      if (!validated.valid) {
        return NextResponse.json(
          createApiError('VALIDATION_ERROR', validated.error!),
          { status: 400 }
        );
      }

      const result = setAlgorithmConfig(config as AlgorithmConfig);
      if (!result.success) {
        return NextResponse.json(
          createApiError('VALIDATION_ERROR', result.error!),
          { status: 400 }
        );
      }

      return NextResponse.json(
        createApiSuccess({
          config: getAlgorithmConfig(),
          isDefault: false,
          message: 'Configuration mise à jour avec succès.',
        })
      );
    }

    return NextResponse.json(
      createApiError('VALIDATION_ERROR', 'Action invalide. Utilisez "update" ou "reset".'),
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in POST /api/admin/algorithm:', error);
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Erreur lors de la mise à jour de la configuration.'),
      { status: 500 }
    );
  }
}

/**
 * Validate the shape of an incoming config object.
 */
function validateConfigShape(config: unknown): { valid: boolean; error?: string } {
  if (!config || typeof config !== 'object') {
    return { valid: false, error: 'La configuration doit être un objet.' };
  }

  const c = config as Record<string, unknown>;

  // Check strategies
  if (!c.strategies || typeof c.strategies !== 'object') {
    return { valid: false, error: 'Les stratégies sont requises.' };
  }

  const strategies = c.strategies as Record<string, unknown>;
  for (const key of ['elo_close', 'cross_category', 'starred', 'random']) {
    if (!strategies[key] || typeof strategies[key] !== 'object') {
      return { valid: false, error: `La stratégie "${key}" est requise.` };
    }
    const s = strategies[key] as Record<string, unknown>;
    if (typeof s.enabled !== 'boolean') {
      return { valid: false, error: `"${key}.enabled" doit être un booléen.` };
    }
    if (typeof s.weight !== 'number' || s.weight < 0 || s.weight > 100) {
      return { valid: false, error: `"${key}.weight" doit être un nombre entre 0 et 100.` };
    }
  }

  // Check ELO
  if (!c.elo || typeof c.elo !== 'object') {
    return { valid: false, error: 'La configuration ELO est requise.' };
  }

  // Check antiRepeat
  if (!c.antiRepeat || typeof c.antiRepeat !== 'object') {
    return { valid: false, error: 'La configuration anti-repeat est requise.' };
  }

  return { valid: true };
}

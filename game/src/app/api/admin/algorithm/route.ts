import { NextRequest } from 'next/server';
import { withApiHandler, apiSuccess, apiError } from '@/lib/apiHelpers';
import {
  getAlgorithmConfig,
  setAlgorithmConfig,
  resetAlgorithmConfig,
  DEFAULT_ALGORITHM_CONFIG,
  AlgorithmConfig,
} from '@/lib/algorithmConfig';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(async () => {
  const config = getAlgorithmConfig();
  const isDefault = !globalThis.__algorithmConfig;
  return apiSuccess({ config, isDefault, defaults: DEFAULT_ALGORITHM_CONFIG });
}, { requireAdmin: true });

export const POST = withApiHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { action, config } = body;

  if (action === 'reset') {
    resetAlgorithmConfig();
    return apiSuccess({
      config: DEFAULT_ALGORITHM_CONFIG,
      isDefault: true,
      message: 'Configuration réinitialisée aux valeurs par défaut.',
    });
  }

  if (action === 'update' && config) {
    const validated = validateConfigShape(config);
    if (!validated.valid) {
      return apiError('VALIDATION_ERROR', validated.error!, 400);
    }

    const result = setAlgorithmConfig(config as AlgorithmConfig);
    if (!result.success) {
      return apiError('VALIDATION_ERROR', result.error!, 400);
    }

    return apiSuccess({
      config: getAlgorithmConfig(),
      isDefault: false,
      message: 'Configuration mise à jour avec succès.',
    });
  }

  return apiError('VALIDATION_ERROR', 'Action invalide. Utilisez "update" ou "reset".', 400);
}, { requireAdmin: true });

// ---------------------------------------------------------------------------
// Config shape validation (algorithm-specific)
// ---------------------------------------------------------------------------

function validateConfigShape(config: unknown): { valid: boolean; error?: string } {
  if (!config || typeof config !== 'object') {
    return { valid: false, error: 'La configuration doit être un objet.' };
  }

  const c = config as Record<string, unknown>;

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

  if (!c.elo || typeof c.elo !== 'object') {
    return { valid: false, error: 'La configuration ELO est requise.' };
  }

  if (!c.antiRepeat || typeof c.antiRepeat !== 'object') {
    return { valid: false, error: 'La configuration anti-repeat est requise.' };
  }

  return { valid: true };
}

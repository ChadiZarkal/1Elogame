import { NextRequest } from 'next/server';
import { withApiHandler, validateBody, apiSuccess, apiError, isMockMode } from '@/lib/apiHelpers';
import { adminLoginSchema } from '@/lib/validations';
import { generateAdminToken } from '@/lib/adminAuth';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const isProduction = process.env.NODE_ENV === 'production';

export const POST = withApiHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { data, error } = validateBody(body, adminLoginSchema);
  if (error) return error;

  const { password } = data;

  // Mock mode: accept "admin" as password — NEVER in production
  if (!isProduction && isMockMode()) {
    if (password === 'admin') {
      const { token, expiresIn } = generateAdminToken();
      return apiSuccess({ token, expiresIn });
    }
    return apiError('UNAUTHORIZED', 'Mot de passe incorrect', 401);
  }

  // Production: verify against hashed password
  if (!ADMIN_PASSWORD_HASH) {
    return apiError('CONFIGURATION_ERROR', 'Authentification non configurée', 500);
  }

  const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  if (!isValid) {
    return apiError('UNAUTHORIZED', 'Mot de passe incorrect', 401);
  }

  const { token, expiresIn } = generateAdminToken();
  return apiSuccess({ token, expiresIn });
}, { rateLimit: 'auth' });

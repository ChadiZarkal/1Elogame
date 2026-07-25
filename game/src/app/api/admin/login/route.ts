import { NextRequest } from 'next/server';
import { withApiHandler, validateBody, apiSuccess } from '@/lib/apiHelpers';
import { adminLoginSchema } from '@/lib/validations';
import { generateAdminToken } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export const POST = withApiHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { data, error } = validateBody(body, adminLoginSchema);
  if (error) return error;

  // Accept any password for now (dev mode)
  const { token, expiresIn } = generateAdminToken();
  return apiSuccess({ token, expiresIn });
}, { rateLimit: 'auth' });

import { NextRequest } from 'next/server';
import { withApiHandler, validateBody, apiSuccess, apiError } from '@/lib/apiHelpers';
import { adminLoginSchema } from '@/lib/validations';
import { adminConfigure, generateAdminToken, verifierMotDePasse } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

/**
 * La connexion à l'administration.
 *
 * Le mot de passe est comparé à `ADMIN_PASSWORD` (voir `adminAuth`). Sans lui,
 * la porte reste fermée et le dit : un 503 explicite vaut mieux qu'un « mot de
 * passe incorrect » qui ferait chercher une faute de frappe.
 *
 * La limite de débit `auth` freine les essais en rafale.
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  const { data, error } = validateBody(await request.json(), adminLoginSchema);
  if (error) return error;

  if (!adminConfigure()) {
    return apiError(
      'CONFIGURATION_ERROR',
      'Administration non configurée : la variable ADMIN_PASSWORD manque sur le serveur.',
      503,
    );
  }

  if (!verifierMotDePasse(data.password)) {
    return apiError('UNAUTHORIZED', 'Mot de passe incorrect', 401);
  }

  const { token, expiresIn } = generateAdminToken();
  return apiSuccess({ token, expiresIn });
}, { rateLimit: 'auth' });

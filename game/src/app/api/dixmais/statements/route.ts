import { withApiHandler, apiSuccess, apiError } from '@/lib/apiHelpers';
import { getRandomStatements } from '@/lib/repositories/dixmais';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(async (req) => {
  const { searchParams } = new URL(req.url);
  const count = Math.min(Math.max(parseInt(searchParams.get('count') ?? '7', 10), 3), 12);
  const excludeIds = (searchParams.get('exclude') ?? '')
    .split(',')
    .map(id => id.trim())
    .filter(Boolean);

  // `types=negative` : que des red flags. `verts=N` : exactement N green
  // flags par profil (mécanique à la moyenne, où une qualité peut dépasser 10).
  const redFlagsSeulement = searchParams.get('types') === 'negative';
  const vertsBrut = searchParams.get('verts');
  const verts = vertsBrut === null ? undefined : Math.min(Math.max(parseInt(vertsBrut, 10) || 0, 0), count);

  const statements = await getRandomStatements(count, excludeIds, { redFlagsSeulement, verts });
  return apiSuccess(statements);
}, { rateLimit: 'public' });

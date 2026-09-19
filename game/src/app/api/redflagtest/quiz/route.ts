import { withApiHandler, apiSuccess } from '@/lib/apiHelpers';
import { lireQuizPublic, lireVerdicts } from '@/lib/rft/repository';

export const dynamic = 'force-dynamic';

/**
 * Le questionnaire, tel que le navigateur a le droit de le voir.
 *
 * Sans les points : `lireQuizPublic` les remplace par un indice de 0 à 2 qui
 * dit le sens du déplacement de l'aiguille. Le barème reste en base, et le
 * score se calcule à la soumission.
 *
 * Les verdicts partent avec, car ils ne révèlent rien : un joueur qui lit
 * « à partir de 75 points » n'en déduit pas ce que vaut une réponse.
 */
export const GET = withApiHandler(async () => {
  const [quiz, verdicts] = await Promise.all([lireQuizPublic(), lireVerdicts()]);
  return apiSuccess({ ...quiz, verdicts });
});

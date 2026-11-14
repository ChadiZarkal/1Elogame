import { withApiHandler, apiSuccess } from '@/lib/apiHelpers';
import { lireQuizPublic, lireVerdictsPublics } from '@/lib/rft/repository';
import { traduireQuestions, traduireVerdict } from '@/lib/rft/traduction';
import { langueDe } from '@/lib/i18n/langue';

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
export const GET = withApiHandler(async (req: Request) => {
  const langue = langueDe(new URL(req.url).searchParams.get('lang'));
  const [quiz, verdicts] = await Promise.all([lireQuizPublic(), lireVerdictsPublics()]);
  const reponse = apiSuccess({
    ...quiz,
    questions: traduireQuestions(quiz.questions, langue),
    verdicts: verdicts.map((v) => traduireVerdict(v, langue)),
  });
  /* Le même questionnaire pour tout le monde : gardé cinq minutes par le CDN
     de Vercel. Chaque partie lancée appelait la fonction et relisait la base ;
     une question modifiée dans l'admin met au plus ce temps à apparaître. */
  reponse.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  return reponse;
});

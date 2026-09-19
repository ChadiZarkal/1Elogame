import { withApiHandler, apiSuccess } from '@/lib/apiHelpers';
import { budget, lireQuestionsAdmin, lireTags, lireVerdicts } from '@/lib/rft/repository';

export const dynamic = 'force-dynamic';

/**
 * Tout le contenu du test, en une requête : questions avec leurs points, tags,
 * verdicts, et le budget.
 *
 * Une seule route plutôt que trois parce que l'écran d'administration a besoin
 * des trois ensemble — les questions portent des identifiants de tags qui ne
 * veulent rien dire sans la liste, et le budget change à chaque modification de
 * question. Trois requêtes auraient garanti trois états désynchronisés à
 * l'écran.
 *
 * LE BUDGET
 *   C'est le score qu'obtiendrait quelqu'un qui coche systématiquement la pire
 *   réponse. Il n'est pas plafonné et n'a pas à l'être : il sert à savoir ce
 *   que vaut le questionnaire tel qu'il est écrit, pas à contraindre la saisie.
 */
export const GET = withApiHandler(async () => {
  const [questions, tags, verdicts] = await Promise.all([
    lireQuestionsAdmin(),
    lireTags(),
    lireVerdicts(),
  ]);

  return apiSuccess({ questions, tags, verdicts, budget: budget(questions) });
}, { requireAdmin: true });

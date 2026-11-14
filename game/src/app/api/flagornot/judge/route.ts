import { NextRequest } from 'next/server';
import { withApiHandler, apiError } from '@/lib/apiHelpers';
import { judgeWithGemini } from '@/lib/gemini';
import { sanitizeText } from '@/lib/sanitize';
import { saveSubmission } from '@/lib/repositories';
import { MAX_FLAGORNOT_TEXT_LENGTH } from '@/config/constants';
import { consommerQuota } from '@/lib/oracleQuota';
import { NextResponse } from 'next/server';
import type { Langue } from '@/lib/i18n/langue';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// ---------------------------------------------------------------------------
// System prompt for the AI judge
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `Tu es un juge jeune, sarcastique et tranchant de Red Flags et Green Flags. Contexte: on joue dans une soirée/jeu social pour s'amuser et créer du débat amusant.

PERSONA CLÉS:
- Dirèche et marrant: Si c'est évident → "c'est Green Flag et c'est tout quoi."
- Engagé QUAND C'EST PERTINENT: patriarcat, oppression, politiques, systémique → OUI. Trucs random → dirèche, pas révolutionnaire
- Sarcastique sur tout, pas juste politique
- Nuancé: différencie bière artisanale vs industrielle, cigare vs cigarette, whisky vs vodka

RÈGLES:
- Réponds UNIQUEMENT en JSON valide : { "verdict": "red" | "green", "justification": "..." }
- RED FLAG = toxique, dommageable, oppressif, ou juste chelou/pas cool
- GREEN FLAG = sain, cool, ou simplement neutre/basique
- Sarcasme agressif quand c'est drôle, direct quand c'est simple

OBJETS/CONCEPTS - Exemples:
- "Table" → GREEN: "C'est une table quoi. T'attendais quoi? Red Flag" ✓ SIMPLE
- "Chaise" → GREEN: "Basique, t'es assis dessus" ✓ TRANCHANT
- "Fauteuil" → GREEN/NUANCÉ: "C'est cosy, t'es bien. Où est le problème?" ou "Ça crie 'vieux' mais bon, comfort is king" ✓ CONTEXTE
- "Corde" → CONTEXTE: "Dépend. BDSM? Green Flag all the way. Suicide? Red Flag." ✓ HONNÊTE
- "Cigare" → RED: "Tabac de luxe machiste. Allez, Red Flag" ✓ SIMPLE
- "Cigarette" → GREEN: "Juste une clope. Pas ouf mais acceptable" ✓ NEUTRE
- "Bière artisanale" → GREEN: "Petit producteur local, c'est sympa"
- "Bière industrielle" → RED: "Beu beu corpo bof"
- "Bière" seule → GREEN: "Par défaut, c'est cool"
- "Vodka" → RED: "Alcool fort sans saveur, c'est déprimant" 
- "Whisky" → GREEN: "Y'a du craft derrière, c'est apprécié"
- "Coca-Cola" → RED: "Corpo qui exploite, oui c'est engagé là"
- "Police" → RED: "Structure oppressive, oui c'est engagé"
- "USA" → RED: "Impérialisme, oui on peut l'être"
- "Patriarcat/sexisme" → RED: engagé à 100%
- "Féminisme" → GREEN: engagé à 100%

COMPORTEMENTS & CARACTÉRISTIQUES:
- "Être un homme cis hétéro" → RED: "Stat: 90% violences. C'est structurel, assume 📊"
- "Être une femme" → GREEN: "Tu existes sans oppression active c'est déjà ça"
- "Être féministe" → GREEN: "Tu reconnais le system. C'est un bon point"
- "Être queer" → GREEN: "T'as osé être toi, c'est respectable"
- "Écouter quelqu'un activement" → GREEN: "C'est rare, c'est cool"
- "Contrôler quelqu'un" → RED: "Emprise, c'est pas cool"

TONE FINAL:
- Sarcastique = oui toujours
- Engagé = seulement si important (oppressions, systèmes, injustices)
- Dirèche = sur les trucs évidents ou neutres
- Drôle = invente des angles amusants (BDSM pour corde par ex)
- Pas révolutionnaire à chaque coin de rue`;

/**
 * Ajoutée à la consigne quand la demande vient de la page anglaise
 * (`/en/flagornot`, champ `langue: 'en'`). Le personnage et la logique des
 * verdicts restent ceux de la consigne française ; seule la langue de la
 * justification change. Le chemin français n'envoie que `SYSTEM_PROMPT`.
 */
const CONSIGNE_ANGLAIS = `

RESPONSE LANGUAGE — ENGLISH (this overrides anything above about language):
- The player is on the English version of the site. Write the "justification" in English ONLY: casual, punchy, funny American English, like a friend roasting you in the group chat. US spelling.
- Same persona, same verdict logic, same JSON format ({ "verdict": "red" | "green", "justification": "..." }). The examples above are in French: keep their spirit and their verdicts, but never quote them in French and never mix languages.
- Whatever language the input is in, judge it and answer in English.
- Use gender-neutral wording unless the input itself says who is who.`;

/** La consigne système dans la langue de la page. */
function consigneSysteme(langue: Langue): string {
  return langue === 'en' ? SYSTEM_PROMPT + CONSIGNE_ANGLAIS : SYSTEM_PROMPT;
}

// ---------------------------------------------------------------------------
// AI provider strategies (Gemini → OpenAI → local keyword fallback)
// ---------------------------------------------------------------------------

type JudgeResult = { verdict: 'red' | 'green'; justification: string };
type PersistenceResult = { persisted: boolean; persistenceWarning?: string };

async function persistSubmissionSafely(
  text: string,
  result: JudgeResult,
  isPrivate: boolean,
  gender?: 'homme' | 'femme' | 'autre',
  age?: '16-18' | '19-22' | '23-26' | '27+',
  langue: Langue = 'fr',
): Promise<PersistenceResult> {
  if (isPrivate) return { persisted: false };

  try {
    await saveSubmission(text, result.verdict, result.justification, gender, age);
    return { persisted: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.warn('[FlagOrNot] saveSubmission failed:', message);
    return {
      persisted: false,
      persistenceWarning: langue === 'en'
        ? 'The verdict is in, but saving it to the Oracle failed.'
        : 'Le verdict a ete calcule, mais sa sauvegarde Oracle a echoue.',
    };
  }
}

async function tryGemini(text: string, langue: Langue): Promise<JudgeResult> {
  // Le français garde l'appel d'origine, à deux arguments.
  return langue === 'en'
    ? judgeWithGemini(text, consigneSysteme(langue), langue)
    : judgeWithGemini(text, SYSTEM_PROMPT);
}

async function tryOpenAI(text: string, langue: Langue): Promise<JudgeResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: consigneSysteme(langue) },
        { role: 'user', content: text },
      ],
      max_tokens: 200,
      temperature: 0.9,
    }),
  });

  if (!res.ok) throw new Error(`OpenAI API error: ${res.status}`);

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('Empty OpenAI response');

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in OpenAI response');

  const parsed = JSON.parse(jsonMatch[0]);
  if (!['red', 'green'].includes(parsed.verdict)) throw new Error('Invalid verdict');

  return {
    verdict: parsed.verdict,
    justification: parsed.justification || (langue === 'en' ? 'No justification.' : 'Pas de justification.'),
  };
}

/**
 * Le juge local de la page anglaise : mots-clés anglais, répliques anglaises.
 * Même principe que le juge français ci-dessous ; il ne sert que quand les
 * deux fournisseurs d'IA ont échoué ou que le plafond du jour est atteint.
 */
function judgeLocallyEnglish(text: string): JudgeResult {
  // Espaces autour : « ex » ne doit pas se déclencher dans « text » ou « next ».
  const lower = ` ${text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')} `;

  const redSignals = [
    ' ex ', ' ex\'s', 'cheat', ' lie', 'lying', 'jealous', 'control', 'ignore',
    'insult', 'yell', 'scream', ' hit', 'manipulat', 'ghost', 'toxic',
    'doesn\'t text', 'doesnt text', 'no reply', 'leaves you on read', 'on read',
    'your phone', 'delete', 'hide', 'hides', 'forbid', 'criticiz', 'humiliat',
    'stalk', 'track', 'block', 'threat', 'debt', 'flirt', 'tinder', 'snap', 'nudes',
    '3 days', 'never', 'late', 'forget', 'cancel', ' like', 'photo', 'story',
    'stories', 'compare', 'rate', 'pressure', 'guilt', 'blackmail', 'love bomb',
  ];

  const greenSignals = [
    'listen', 'cook', 'surprise', 'support', 'encourage', 'respect', 'trust',
    'honest', 'communicat', 'effort', 'there for', 'understand', 'love', 'cuddle',
    'hug', 'travel', 'laugh', 'together', 'future', 'family', 'compliment',
    'attention', 'massage', 'gift', 'good night', 'good morning', 'proud', 'date',
    'remember', 'favorite', 'checks in', 'checks on', 'coffee', 'breakfast',
    'call', 'sincere', 'introduce', 'friends', 'apologi', 'say sorry', 'says sorry',
  ];

  let red = 0, green = 0;
  for (const kw of redSignals) if (lower.includes(kw)) red++;
  for (const kw of greenSignals) if (lower.includes(kw)) green++;
  red += Math.random() * 0.4;
  green += Math.random() * 0.4;

  const verdict: 'red' | 'green' = red >= green ? 'red' : 'green';

  const justifications = {
    red: [
      'Red like a stop sign. No need to overthink this one 🚩',
      'You can smell this red flag from 10 miles away. Run while you still can 🏃',
      'Hello?? This is a full-on red flag parade 🚩🚩🚩',
      'If this were a country, it\'d be the Republic of Red Flags 🚩',
      'The Oracle said no. Science has spoken. Next 🚩',
      'Even your cat would judge you for this, and your cat has zero morals 🚩',
      'So red flag even your GPS would tell you to make a U-turn 🚩',
    ],
    green: [
      'Approved. Pure green flag, the kind of thing we all deserve 🟢',
      'Now that\'s beautiful. There\'s still hope for humanity 🟢',
      'Chef\'s kiss. This is what we want in life 🟢',
      'If everyone did this, the world would be a better place 🟢',
      'Green flag approved, certified, stamped and notarized 🟢',
      'Protect this person at all costs, they\'re an endangered species 🟢',
      'So green flag that nature is jealous 🟢',
    ],
  };

  return {
    verdict,
    justification: justifications[verdict][Math.floor(Math.random() * justifications[verdict].length)],
  };
}

function judgeLocally(text: string): JudgeResult {
  const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const redSignals = [
    'ex', 'trompe', 'ment', 'mensonge', 'jaloux', 'jalouse', 'controle',
    'ignore', 'insulte', 'crie', 'frappe', 'manipule', 'fantome', 'ghost',
    'toxique', 'repond pas', 'regarde ton tel', 'supprime', 'cache',
    'interdit', 'critique', 'humilie', 'surveille', 'bloque', 'menace',
    'dette', 'flirte', 'drague', 'tinder', 'snap', 'nudes',
    '3 jours', 'jamais', 'en retard', 'oublie', 'annule',
    'like', 'photo', 'story', 'stories', 'pote', 'soiree sans',
    'compare', 'note', 'pression', 'culpabilise', 'chantage',
  ];

  const greenSignals = [
    'ecoute', 'prepare', 'cuisine', 'surprise', 'soutien', 'encourage',
    'respect', 'confiance', 'honnete', 'communique', 'effort', 'present',
    'comprend', 'aime', 'calin', 'voyage', 'rire', 'ensemble', 'projet',
    'avenir', 'famille', 'compliment', 'attention', 'massage', 'cadeau',
    'texto', 'bonne nuit', 'bonjour', 'fier', 'date', 'soiree',
    'souvient', 'plat prefere', 'prend des nouvelles', 'dit je t\'aime',
    'cafe', 'petit dej', 'message le matin', 'appel', 'sincere',
  ];

  let red = 0, green = 0;
  for (const kw of redSignals) if (lower.includes(kw)) red++;
  for (const kw of greenSignals) if (lower.includes(kw)) green++;
  red += Math.random() * 0.4;
  green += Math.random() * 0.4;

  const verdict: 'red' | 'green' = red >= green ? 'red' : 'green';

  const justifications = {
    red: [
      "Bah c'est rouge comme un panneau stop, faut pas chercher plus loin 🚩",
      "Ça sent le red flag à 10 km, cours tant qu'il est encore temps 🏃",
      "Non mais allô ? C'est le festival des red flags là 🚩🚩🚩",
      "Si c'était un pays, ça serait la République des Red Flags 🚩",
      "L'Oracle a dit non. La science a parlé. Next 🚩",
      "Même ton chat te jugerait pour ça, et il a aucune morale 🚩",
      "C'est tellement red flag que même ton GPS te dirait de faire demi-tour 🚩",
    ],
    green: [
      "On valide. C'est du green flag pur, le genre de truc qu'on mérite tous 🟢",
      "Ça c'est beau. L'humanité a encore de l'espoir 🟢",
      "Chef's kiss. C'est ça qu'on veut dans la vie 🟢",
      "Si tout le monde faisait ça, on vivrait dans un monde meilleur 🟢",
      "Green flag validé, approuvé, certifié conforme, tamponné 🟢",
      "Protège cette personne à tout prix, c'est une espèce rare 🟢",
      "C'est tellement green flag que la nature est jalouse 🟢",
    ],
  };

  return {
    verdict,
    justification: justifications[verdict][Math.floor(Math.random() * justifications[verdict].length)],
  };
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export const POST = withApiHandler(async (request: NextRequest) => {
  const body = await request.json();
  const rawText = body?.text?.trim();
  const isPrivate = body?.private === true;
  const gender = ['homme', 'femme', 'autre'].includes(body?.gender) ? body.gender as 'homme' | 'femme' | 'autre' : undefined;
  const age = ['16-18', '19-22', '23-26', '27+'].includes(body?.age) ? body.age as '16-18' | '19-22' | '23-26' | '27+' : undefined;
  // La page anglaise envoie `langue: 'en'` ; absent ou autre chose, le français.
  const langue: Langue = body?.langue === 'en' ? 'en' : 'fr';
  const en = langue === 'en';

  if (!rawText || typeof rawText !== 'string') {
    return apiError('VALIDATION_ERROR', en ? 'The "text" field is required.' : 'Le champ "text" est requis.', 400);
  }

  const text = sanitizeText(rawText, MAX_FLAGORNOT_TEXT_LENGTH);
  if (text.length === 0) {
    return apiError('VALIDATION_ERROR', en ? 'The text is empty after cleanup.' : 'Le texte est vide après nettoyage.', 400);
  }
  if (rawText.length > MAX_FLAGORNOT_TEXT_LENGTH) {
    return apiError(
      'VALIDATION_ERROR',
      en
        ? `Text too long (max ${MAX_FLAGORNOT_TEXT_LENGTH} characters).`
        : `Texte trop long (max ${MAX_FLAGORNOT_TEXT_LENGTH} caracteres).`,
      400,
    );
  }

  // Les quotas, AVANT tout appel payant (voir `oracleQuota`). Une demande
  // invalide a déjà été écartée au-dessus : elle ne coûtait rien et ne
  // consomme pas de quota.
  const decision = await consommerQuota(request);
  if (decision === 'refuse') {
    return apiError(
      'RATE_LIMITED',
      en
        ? 'Easy there: the Oracle needs a breather. Try again in a minute.'
        : "Doucement : l'Oracle a besoin de souffler. Réessaie dans une minute.",
      429,
    );
  }

  // Try providers in order: Gemini → OpenAI → local fallback. Plafond du jour
  // atteint : directement le juge local, qui ne coûte rien.
  const providers: Array<{ name: string; fn: () => Promise<JudgeResult> }> = decision === 'ia'
    ? [
        { name: 'gemini', fn: () => tryGemini(text, langue) },
        { name: 'openai', fn: () => tryOpenAI(text, langue) },
      ]
    : [];

  for (const { name, fn } of providers) {
    try {
      const result = await fn();
      const persistence = await persistSubmissionSafely(text, result, isPrivate, gender, age, langue);
      return NextResponse.json({
        ...result,
        provider: name,
        ...(isPrivate
          ? {}
          : {
              persisted: persistence.persisted,
              ...(persistence.persistenceWarning ? { persistenceWarning: persistence.persistenceWarning } : {}),
            }),
      });
    } catch (err) {
      console.warn(`[FlagOrNot] ${name} failed:`, err);
    }
  }

  // Final fallback: local keyword analysis
  const result = en ? judgeLocallyEnglish(text) : judgeLocally(text);
  const persistence = await persistSubmissionSafely(text, result, isPrivate, gender, age, langue);
  return NextResponse.json({
    ...result,
    provider: 'local',
    ...(isPrivate
      ? {}
      : {
          persisted: persistence.persisted,
          ...(persistence.persistenceWarning ? { persistenceWarning: persistence.persistenceWarning } : {}),
        }),
  });
  // Premier filet, en mémoire et par instance : il écarte une rafale avant
  // même d'interroger la base.
}, { rateLimit: 'ai' });

import { NextRequest, NextResponse } from 'next/server';
import { judgeWithGemini } from '@/lib/gemini';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// ═══════════════════════════════════════
// System prompt — shared across all AI providers
// ═══════════════════════════════════════

const SYSTEM_PROMPT = `Tu es un juge humoristique de Red Flags et Green Flags dans les relations amoureuses, amicales ou sociales. Tu parles comme un jeune français de 18-24 ans.

RÈGLES STRICTES :
1. Réponds UNIQUEMENT en JSON valide : { "verdict": "red" | "green", "justification": "..." }
2. "red" = Red Flag (comportement toxique, suspect, malsain, bizarre, égoïste, manipulateur, irrespectueux, passif-agressif)
3. "green" = Green Flag (comportement sain, attentionné, respectueux, mature, bienveillant, effort sincère)
4. La justification doit être COURTE (1-2 phrases max), DRÔLE, pertinente, en français familier (tutoiement).
5. Sois DIRECT et TRANCHANT. Pas de nuance. C'est soit RED soit GREEN. Jamais les deux.
6. Si c'est ambigu, choisis quand même et justifie avec humour.
7. Si la phrase n'a rien à voir avec les relations, juge-la comme un comportement social quand même.
8. Utilise des expressions de jeunes, de l'humour internet, des références actuelles. Sois marrant.
9. N'aie pas peur d'être piquant ou provocateur (tout en restant bienveillant).

Exemples :
"Il regarde ton téléphone pendant que tu dors" → { "verdict": "red", "justification": "Frère, si tu dois checker son tel à 3h du mat c'est que la confiance a quitté le chat depuis longtemps 🚩" }
"Elle te prépare à manger quand t'as eu une mauvaise journée" → { "verdict": "green", "justification": "Quelqu'un qui nourrit ton estomac ET ton âme ? Marie-la direct, réfléchis pas 🟢" }
"Il met 3 jours à répondre" → { "verdict": "red", "justification": "3 jours c'est le temps de livraison Amazon, pas un délai de réponse acceptable entre êtres humains 🚩" }
"Elle se souvient de ton plat préféré" → { "verdict": "green", "justification": "Elle a un meilleur stockage que ton iCloud, c'est le genre de personne qu'on garde 🟢" }`;

// ═══════════════════════════════════════
// Gemini (primary) — via service account
// ═══════════════════════════════════════

async function tryGemini(text: string): Promise<{ verdict: 'red' | 'green'; justification: string }> {
  return judgeWithGemini(text, SYSTEM_PROMPT);
}

// ═══════════════════════════════════════
// OpenAI (secondary fallback)
// ═══════════════════════════════════════

async function tryOpenAI(text: string): Promise<{ verdict: 'red' | 'green'; justification: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: text },
      ],
      max_tokens: 200,
      temperature: 0.9,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('Empty OpenAI response');

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in OpenAI response');

  const parsed = JSON.parse(jsonMatch[0]);
  if (!['red', 'green'].includes(parsed.verdict)) throw new Error('Invalid verdict');

  return {
    verdict: parsed.verdict,
    justification: parsed.justification || 'Pas de justification.',
  };
}

// ═══════════════════════════════════════
// Local fallback (no AI needed)
// ═══════════════════════════════════════

function judgeLocally(text: string): { verdict: 'red' | 'green'; justification: string } {
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
      "L'IA a dit non. La science a parlé. Next 🚩",
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

// ═══════════════════════════════════════
// Route handler — Cascade: Gemini → OpenAI → Local
// ═══════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = body?.text?.trim();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Le champ "text" est requis.' }, { status: 400 });
    }

    if (text.length > 500) {
      return NextResponse.json({ error: 'Texte trop long (max 500 caractères).' }, { status: 400 });
    }

    // Try Gemini first (Google service account)
    try {
      const result = await tryGemini(text);
      return NextResponse.json({ ...result, provider: 'gemini' });
    } catch (geminiErr) {
      console.warn('[FlagOrNot] Gemini failed:', geminiErr);
    }

    // Fallback to OpenAI
    try {
      const result = await tryOpenAI(text);
      return NextResponse.json({ ...result, provider: 'openai' });
    } catch (openaiErr) {
      console.warn('[FlagOrNot] OpenAI failed:', openaiErr);
    }

    // Final fallback: local keyword analysis
    const result = judgeLocally(text);
    return NextResponse.json({ ...result, provider: 'local' });
  } catch {
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { judgeWithGemini } from '@/lib/gemini';
import { checkRateLimit } from '@/lib/rateLimit';
import { sanitizeText } from '@/lib/sanitize';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// ═══════════════════════════════════════
// System prompt — shared across all AI providers
// ═══════════════════════════════════════

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

// ═══════════════════════════════════════
// Save to community store (fire-and-forget)
// Saves directly to Supabase — no HTTP round-trip
// ═══════════════════════════════════════

async function saveToCommunity(text: string, verdict: 'red' | 'green') {
  try {
    const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';
    if (isMockMode) return; // Skip in mock mode

    const supabase = createServerClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('flagornot_submissions')
      .insert({ text: text.slice(0, 280), verdict });
  } catch {
    // Non-blocking — community storage is optional
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 10 AI requests per minute
    const rateLimited = checkRateLimit(request, 'ai');
    if (rateLimited) return rateLimited;
    
    const body = await request.json();
    const rawText = body?.text?.trim();

    if (!rawText || typeof rawText !== 'string') {
      return NextResponse.json({ error: 'Le champ "text" est requis.' }, { status: 400 });
    }

    // Sanitize input to prevent XSS and injection
    const text = sanitizeText(rawText, 500);

    if (text.length === 0) {
      return NextResponse.json({ error: 'Le texte est vide après nettoyage.' }, { status: 400 });
    }

    if (rawText.length > 500) {
      return NextResponse.json({ error: 'Texte trop long (max 500 caractères).' }, { status: 400 });
    }

    // Try Gemini first (Google service account)
    try {
      const result = await tryGemini(text);
      // Fire-and-forget: Save to community store
      saveToCommunity(text, result.verdict);
      return NextResponse.json({ ...result, provider: 'gemini' });
    } catch (geminiErr) {
      console.warn('[FlagOrNot] Gemini failed:', geminiErr);
    }

    // Fallback to OpenAI
    try {
      const result = await tryOpenAI(text);
      saveToCommunity(text, result.verdict);
      return NextResponse.json({ ...result, provider: 'openai' });
    } catch (openaiErr) {
      console.warn('[FlagOrNot] OpenAI failed:', openaiErr);
    }

    // Final fallback: local keyword analysis
    const result = judgeLocally(text);
    saveToCommunity(text, result.verdict);
    return NextResponse.json({ ...result, provider: 'local' });
  } catch {
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 });
  }
}

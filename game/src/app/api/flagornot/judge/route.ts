import { NextRequest, NextResponse } from 'next/server';
import { judgeWithGemini } from '@/lib/gemini';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// ═══════════════════════════════════════
// System prompt — shared across all AI providers
// ═══════════════════════════════════════

const SYSTEM_PROMPT = `Tu es un juge humoristique de Red Flags et Green Flags. Tu parles comme un jeune français de 18-24 ans.

⚠️ CONTEXTE CRUCIAL :
- Red Flag = comportement TOXIQUE, NÉGATIF, DANGEREUX, IRRESPECTUEUX (dans un contexte relationnel OU personnel)
- Green Flag = comportement SAIN, BON, BIENVEILLANT, POSITIF (dans un contexte relationnel OU personnel)
- Tu dois évaluer ce qui est ÉCRIT, pas imaginer un contexte qui n'existe pas

RÈGLES STRICTES :

1. Réponds UNIQUEMENT en JSON valide : { "verdict": "red" | "green", "justification": "..." }

2. CHOSES/CONCEPTS OBJECTIFS :
   - Si c'est un objet, un lieu, une notion : évalue sa QUALITÉ INTRINSÈQUE
   - "Hôpital" → GREEN FLAG (c'est bon pour la santé, c'est utile)
   - "Table" → GREEN FLAG (c'est pratique, c'est sain)
   - "Arbre" → GREEN FLAG (c'est beau, c'est bon pour l'environnement)
   - "Prison" → RED FLAG (c'est mauvais, c'est dangereux)
   - "Poison" → RED FLAG (c'est toxique, c'est mortel)
   - Ne fais PAS : "l'hôpital en relation = danger" — Non. L'hôpital c'est juste bon.

3. COMPORTEMENTS INDIVIDUELS (pas dans un contexte relationnel) :
   - Évalue le comportement pour ce qu'il EST, pas par rapport à quelqu'un d'autre
   - "Avoir des poux" → RED FLAG (c'est sale, c'est mauvais pour la santé)
   - "Se laver régulièrement" → GREEN FLAG (c'est hygiénique, c'est bon)
   - "Être en retard" → RED FLAG (c'est irresponsable, c'est irrespectueux du temps)
   - "Lire des livres" → GREEN FLAG (c'est cultiver son esprit, c'est positif)

4. COMPORTEMENTS RELATIONNELS (avec ou à cause d'une autre personne) :
   - "Il regarde ton téléphone pendant que tu dors" → RED FLAG (manipulation, manque de confiance)
   - "Elle te prépare à manger quand tu vas mal" → GREEN FLAG (attention, bienveillance)
   - "Il met 3 jours à répondre" → RED FLAG (irresponsable, manque d'intérêt)

5. SPECTRES POLITIQUES / IDÉOLOGIQUES :
   - Évalue le CONTENU OBJECTIF, pas la polarité
   - "Être de gauche" → GREEN FLAG (progressisme, égalité, bienveillance)
   - "Être de droite" → NEUTRE (conservatisme peut être sain, mais dépend du contexte)
   - "Être extrême gauche" → RED FLAG (extrémisme = toxicité, rigidité, violence idéologique)
   - "Être extrême droite" → RED FLAG (extrémisme = toxicité, intolérance, danger)
   - "Extrémisme" (en général) → RED FLAG (le mot "extrême" = manque de nuance = danger)

6. RÈGLES TONALES :
   - La justification doit être COURTE (1-2 phrases max), DRÔLE, en français familier (tutoiement)
   - Sois DIRECT et TRANCHANT. C'est soit RED soit GREEN. Pas de faux équilibre.
   - Si c'est ambigu ou NEUTRE, déclare quand même un verdict avec humour
   - Utilise des expressions de jeunes, de l'humour internet. Sois marrant.

EXEMPLES CORRECTS :

Objet/lieu:
"Hôpital" → { "verdict": "green", "justification": "C'est là qu'on te soigne, c'est bénéf pour ta santé 🏥" }
"Alcool" → { "verdict": "red", "justification": "Ça détruit ta santé et tes relations, c'est pas ouf 🍺" }
"Bibliothèque" → { "verdict": "green", "justification": "Un endroit pour apprendre, c'est big green flag 📚" }

Comportement personnel:
"Avoir des poux" → { "verdict": "red", "justification": "C'est dégueulasse et ça demande de l'hygiène, mon gars 🤢" }
"Faire du sport" → { "verdict": "green", "justification": "Tu prends soin de toi, c'est la base d'une vie saine 💪" }

Comportement relationnel:
"Il regarde ton téléphone pendant que tu dors" → { "verdict": "red", "justification": "La confiance a quitté le chat, faut parler sérieusement 🚩" }
"Elle se souvient de ton plat préféré" → { "verdict": "green", "justification": "Quelqu'un qui prête attention à toi ? Garde-la précieusement 🟢" }

Idéologie:
"Être de gauche" → { "verdict": "green", "justification": "Progressisme et égalité, c'est l'vibe 🌍" }
"Être extrémiste" → { "verdict": "red", "justification": "L'extrémisme c'est de la toxicité pure, zéro nuance 🚩" }`;

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

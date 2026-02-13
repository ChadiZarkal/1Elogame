import { NextRequest, NextResponse } from 'next/server';
import { judgeWithGemini } from '@/lib/gemini';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// ═══════════════════════════════════════
// System prompt — shared across all AI providers
// ═══════════════════════════════════════

const SYSTEM_PROMPT = `Tu es un juge ultra-sarcastique et engagé de Red Flags et Green Flags. Tu crées des débats AMUSANTS en société. Tu parles comme un jeune français woke/progressiste de 18-24 ans qui adore le sarcasme et les références.

🎯 CONTEXTE FONDAMENTAL :
- But PREMIER: créer des débats AMUSANTS via l'humour et le sarcasme, pas être neutre
- Tone: SARCASTIQUE, TROLL, PIQUANT. Provoque le rire et le débat, pas l'accord ennuyeux
- Idéologie: progressiste, féministe, anti-toxicité masculine, pro-égalité, queer-friendly
- Approche: contredit les attentes, crée des CHOCS amusants, utilise l'ironie

RED FLAG = comportement TOXIQUE, oppressif, patriarcal, système injuste
GREEN FLAG = comportement SAIN, inclusif, égalitaire, anticonformiste

⚡ FORMAT DE RÉPONSE (IMPORTANT) :
{ 
  "verdict": "red" | "green", 
  "justification": "...", 
  "hot_take": "..."  /* angle sarcastique, ce qui va crée le débat */
}

📋 RÈGLES DE JUGEMENT :

1. OBJETS/CONCEPTS → Évalue avec IMPACT SOCIOPOLITIQUE (pas juste la chose)
   - "Table" → GREEN FLAG: "Espace de partage démocratique. Les tyrans dînent seuls." / hot_take:"Versailles a peur des tables rondes"
   - "Alcool" → NUANCÉ (PAS UNIFORME):
     * "Vin naturel du languedoc" → GREEN: "Local, petit vigneron indépendant, anticapitaliste par défaut" 
     * "Bière artisanale locale" → GREEN: "Support l'économie locale, c'est presque anarchiste"
     * "Whisky écossais" → GREEN: "Indépendance écossaise anti-Westminster, c'est progressiste"
     * "Coca Cola" → RED: "Monstre corporatiste, tue les terres, exploite des enfants au Pérou"
     * "Eau": → GREEN: "C'est littéralement la vie mais attendez, vérifiez qui la distribue..."
   - "Bibliothèque" → GREEN: "Accès au savoir égalitaire. C'est de la révolution sans bruit"

2. COMPORTEMENTS INDIVIDUELS → Analyse systémique + humour
   - "Être un homme cis hétéro lambda" → RED FLAG: "Statistiquement c'est 90% des violences. C'est pas ta faute mais c'est ton contexte." / hot_take: "Les gars basés reconnaissent ça en 30 sec, les autres font du whataboutism"
   - "Être une femme" → GREEN FLAG: "T'as pas violé personne last year 🟢 C'est fou que ce soit une surprise"
   - "Être femme + militante féministe" → EXTRA GREEN: "T'as cassé les chaînes et tu les montres aux autres"
   - "Être queer" → GREEN FLAG: "T'as osé sortir des cases. L'authenticité est révolutionnaire"
   - "Avoir des poux" → RED FLAG: "C'est pas juste sale, c'est un symptôme de négligence (ou de systémique défaillant)"
   - "Faire du détox digital" → GREEN: "T'es conscient du contrôle algorithmique. Based et lucidepillé"
   - "Travailler pour une GAFAM" → RED FLAG mais NUANCÉ: "Tu finances le surveillance capitalism mais tu paies les loyers de SF, c'est une contradiction"

3. SPECTRES POLITIQUES/IDÉOLOGIQUES → TRÈS ENGAGÉ
   - "Être de gauche" → GREEN FLAG: "Égalité, solidarité, c'est l'essence de la civilisation"
   - "Être écolo-militant" → EXTRA GREEN: "T'as vu l'extinction de masse et tu dis non. Littéralement vert"
   - "Être féministe" → GREEN FLAG: "Tu reconnais le patriarcat. C'est la base"
   - "Être de droite" → RED FLAG: "Conserver QUOI? Les inégalités et la hiérarchie? Bof"
   - "Être libertaire" → JAUNE AVEC CRITIQUE: "T'as raison sur l'oppression d'État, mais le capital opprime aussi mon frère"
   - "Être apolitique" → RED FLAG: "C'est juste être complice du statu quo. T'es de droite par défaut"
   - "Être extrémiste (peu importe cotés)" → RED FLAG: "L'extrémisme = mort de la nuance = mort du débat = fascisme"

4. CONTEXTES RELATIONNELS → Relatif mais avec pîq féministe
   - "Écouter sa copine" → GREEN: "C'est RARE. Garde-la précieusement"
   - "Regarder son téléphone sans permission" → RED: "C'est du contrôle, du début d'emprise. C'est abusif"
   - "Lui interdire des vêtements" → RED: "C'est du contrôle du corps féminin, pur patriarcat"
   - "Partagez les tâches ménagères sans compter" → GREEN: "T'as compris que l'amour c'est pas une servitude"

🎭 RÈGLES TONALES CRITIQUES:
- Sois AGRESSIF dans l'humour. Pas "ouille, c'est méchant" mais "FRÈRE TU VAS ÊTRE CHOQUÉ"
- Langage de jeune: "basé", "girlboss", "ACAB", "fash", "cancel culture", "sisterhood", "patriarcat"
- Choque avec l'ironie: si un truc neutre est systémiquement oppressif, dis-le
- CRÉE DE LA SURPRISE: pas tout red ou tout green uniforme, crée des débats
- Références: sociologie critique, féminisme, antiracisme, marxisme (l'humour)

EXEMPLES OPTIMAUX DE SORTIE:

"Table"
{
  "verdict": "green",
  "justification": "C'est un meuble révolutionnaire. Les repas en commun c'est comme l'assemblée générale. Ça détruit l'isolement.",
  "hot_take": "Pourquoi les tyrans dînent-ils seuls? Parce qu'une table crée de l'égalité."
}

"Homme blanc cis hétéro standard"
{
  "verdict": "red",
  "justification": "Statistiquement vous êtes à l'origine de 90% des violences. C'est pas perso, c'est systématique.",
  "hot_take": "Démontrez-nous le contraire. Genre en écoutant les femmes, en votant bien. Des basiques quoi."
}

"Police"
{
  "verdict": "red",
  "justification": "Même le gentil flic applique un système qui écrase les pauvres et les noirs. C'est structural.",
  "hot_take": "ACAB n'est pas méchant. C'est de la sociologie. Et l'analyse elle est factuelle."
}

"Bière artisanale locale"
{
  "verdict": "green",
  "justification": "Ça supporte les petits producteurs indépendants, c'est économie locale, c'est anti-kapital par défaut.",
  "hot_take": "Un gars qui boit de la bière artisanale vote déjà à gauche, c'est une loi scientifique."
}

"Coca-Cola" 
{
  "verdict": "red",
  "justification": "Monstre corporatiste, exploite les ressources, tue les terres, sucre = épidémie. C'est toxique.",
  "hot_take": "Si tu le bois, tu sponsors l'oppression en bouteille avec du sirop."
}

⚠️ LIMITES ÉTHIQUES (Sois méchant avec les oppressions, pas les opprimés):
- Sarcasme envers toxicité masculine = ok, envers femmes = non
- Critique du patriarcat = ok, des femmes = non
- Critique du racisme systémique = ok, des races = non
- Défends les minorités même avec sarcasme agressif`;

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

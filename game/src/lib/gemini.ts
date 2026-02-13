/**
 * Gemini (Vertex AI) integration using official Google Cloud SDK.
 * Inspired by: https://cloud.google.com/vertex-ai/generative-ai/docs/learn/overview
 * 
 * Loads service account credentials from JSON file, creates a VertexAI client,
 * and calls Gemini models with structured JSON output.
 */

import { VertexAI, SchemaType } from '@google-cloud/vertexai';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { resolve, join } from 'path';

// ═══════════════════════════════════════
// Service Account loader
// ═══════════════════════════════════════

function findServiceAccountFile(): string | null {
  // Try env var first
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const p = resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    if (existsSync(p)) return p;
  }

  // Search in current working directory (game/)
  try {
    const files = readdirSync(process.cwd());
    const saFile = files.find(
      (f) => f.endsWith('.json') && f.includes('ai-agent')
    );
    if (saFile) {
      const p = join(process.cwd(), saFile);
      if (existsSync(p)) return p;
    }
  } catch {
    // ignore
  }

  // Search in parent directory
  const projectRoot = resolve(process.cwd(), '..');
  try {
    const files = readdirSync(projectRoot);
    const saFile = files.find(
      (f) => f.endsWith('.json') && f.includes('ai-agent')
    );
    if (saFile) {
      const p = join(projectRoot, saFile);
      if (existsSync(p)) return p;
    }
  } catch {
    // ignore
  }

  return null;
}

// ═══════════════════════════════════════
// VertexAI client singleton
// ═══════════════════════════════════════

let vertexaiInstance: VertexAI | null = null;

function getVertexAIClient(): VertexAI {
  if (vertexaiInstance) return vertexaiInstance;

  // Try env var with inline JSON
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    vertexaiInstance = new VertexAI({
      project: credentials.project_id,
      location: process.env.VERTEX_AI_LOCATION || 'us-central1',
    });
    return vertexaiInstance;
  }

  // Find and read service account file
  const filePath = findServiceAccountFile();
  if (!filePath) {
    throw new Error(
      'Service account JSON not found. Place it in the project root (e.g., ai-agent-cha-2y53-c855d0c34cb8.json)'
    );
  }

  const content = readFileSync(filePath, 'utf-8');
  const credentials = JSON.parse(content);

  // Set GOOGLE_APPLICATION_CREDENTIALS so @google-cloud/vertexai can auto-discover it
  process.env.GOOGLE_APPLICATION_CREDENTIALS = filePath;

  vertexaiInstance = new VertexAI({
    project: credentials.project_id,
    location: process.env.VERTEX_AI_LOCATION || 'us-central1',
  });

  return vertexaiInstance;
}

// ═══════════════════════════════════════
// Gemini API call
// ═══════════════════════════════════════

export async function judgeWithGemini(
  text: string,
  systemPrompt: string
): Promise<{ verdict: 'red' | 'green'; justification: string }> {
  const client = getVertexAIClient();
  const model = process.env.VERTEX_AI_MODEL || 'gemini-2.0-flash-001';

  const generativeModel = client.getGenerativeModel({
    model,
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: 0.9,
      maxOutputTokens: 250,
      responseMimeType: 'application/json',
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          verdict: {
            type: SchemaType.STRING,
            enum: ['red', 'green'],
          },
          justification: {
            type: SchemaType.STRING,
          },
        },
        required: ['verdict', 'justification'],
      },
    },
  });

  try {
    const result = await generativeModel.generateContent(`Juge cette phrase: "${text}"`);
    const response = result.response;

    if (!response || !response.candidates || response.candidates.length === 0) {
      throw new Error('Empty response from Gemini');
    }

    const content = response.candidates[0].content?.parts?.[0];
    if (!content || content.text === undefined) {
      throw new Error('No text content in Gemini response');
    }

    const text_content = content.text.trim();

    // Parse JSON
    const jsonMatch = text_content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Gemini response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (!['red', 'green'].includes(parsed.verdict)) {
      throw new Error(`Invalid verdict from Gemini: ${parsed.verdict}`);
    }

    return {
      verdict: parsed.verdict,
      justification: parsed.justification || 'Pas de justification.',
    };
  } catch (error) {
    throw new Error(`Gemini API error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

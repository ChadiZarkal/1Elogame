/**
 * Gemini integration for AI judge.
 * Uses @google/genai SDK (unified Google GenAI library) with Vertex AI backend
 * and service account JSON credentials.
 */

import { GoogleGenAI } from '@google/genai';
import { readFileSync, existsSync, readdirSync, writeFileSync, unlinkSync } from 'fs';
import { resolve, join } from 'path';
import { tmpdir } from 'os';

// ---------------------------------------------------------------------------
// Service Account credentials loading (unchanged — supports JSON env, file, auto-discovery)
// ---------------------------------------------------------------------------

interface ServiceAccountCredentials {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

function getServiceAccountCredentials(): ServiceAccountCredentials | null {
  // Priority 1: Env var with inline JSON (Vercel)
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    try {
      return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    } catch (e) {
      console.warn('Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON:', e);
      return null;
    }
  }

  // Priority 2: GOOGLE_APPLICATION_CREDENTIALS file
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const p = resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    if (existsSync(p)) {
      try {
        return JSON.parse(readFileSync(p, 'utf-8'));
      } catch (e) {
        console.warn('Failed to read GOOGLE_APPLICATION_CREDENTIALS file:', e);
        return null;
      }
    }
  }

  // Priority 3: Search for ai-agent JSON file in cwd only
  try {
    const files = readdirSync(process.cwd());
    const saFile = files.find((f) => f.endsWith('.json') && f.includes('ai-agent'));
    if (saFile) {
      const p = join(process.cwd(), saFile);
      if (existsSync(p)) return JSON.parse(readFileSync(p, 'utf-8'));
    }
  } catch {
    // ignore
  }

  return null;
}

// ---------------------------------------------------------------------------
// Temp credentials file (needed for ADC-based auth on Vercel)
// ---------------------------------------------------------------------------

let tempCredentialsFile: string | null = null;

function cleanupTempCredentials(): void {
  if (tempCredentialsFile && existsSync(tempCredentialsFile)) {
    try { unlinkSync(tempCredentialsFile); tempCredentialsFile = null; } catch { /* ignore */ }
  }
}

function ensureCredentialsFile(credentials: ServiceAccountCredentials): void {
  const tempFile = join(tmpdir(), 'gcp-sa-redflaggames.json');
  cleanupTempCredentials();
  writeFileSync(tempFile, JSON.stringify(credentials), { mode: 0o600 });
  process.env.GOOGLE_APPLICATION_CREDENTIALS = tempFile;
  tempCredentialsFile = tempFile;
}

if (typeof process !== 'undefined') {
  const cleanup = () => cleanupTempCredentials();
  process.on('exit', cleanup);
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

// ---------------------------------------------------------------------------
// @google/genai client (Vertex AI mode with service account)
// ---------------------------------------------------------------------------

let genaiInstance: GoogleGenAI | null = null;

function getGenAIClient(): GoogleGenAI {
  if (genaiInstance) return genaiInstance;

  const credentials = getServiceAccountCredentials();
  if (!credentials) {
    throw new Error(
      'GCP service account credentials not found. Provide GOOGLE_SERVICE_ACCOUNT_JSON env var or place ai-agent-*.json in project root.',
    );
  }

  // Write credentials to temp file so the SDK can pick them up via ADC
  ensureCredentialsFile(credentials);

  genaiInstance = new GoogleGenAI({
    vertexai: true,
    project: credentials.project_id,
    location: process.env.VERTEX_AI_LOCATION || 'us-central1',
  });

  return genaiInstance;
}

// ---------------------------------------------------------------------------
// Public API — judgeWithGemini
// ---------------------------------------------------------------------------

export async function judgeWithGemini(
  text: string,
  systemPrompt: string,
): Promise<{ verdict: 'red' | 'green'; justification: string }> {
  const client = getGenAIClient();
  const model = process.env.VERTEX_AI_MODEL || 'gemini-3-flash-preview';

  try {
    const response = await client.models.generateContent({
      model,
      contents: `Juge cette phrase: "${text}"`,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.9,
        maxOutputTokens: 250,
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT' as const,
          properties: {
            verdict: { type: 'STRING' as const, enum: ['red', 'green'] },
            justification: { type: 'STRING' as const },
          },
          required: ['verdict', 'justification'],
        },
      },
    });

    const textContent = response.text?.trim();
    if (!textContent) throw new Error('Empty response from Gemini');

    // Parse JSON from response
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in Gemini response');

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

/**
 * Gemini (Vertex AI) integration using official Google Cloud SDK.
 * Inspired by: https://cloud.google.com/vertex-ai/generative-ai/docs/learn/overview
 * 
 * Loads service account credentials from JSON file or env var, creates a VertexAI client,
 * and calls Gemini models with structured JSON output.
 * 
 * For Vercel: Pass GOOGLE_SERVICE_ACCOUNT_JSON as a JSON string in env vars.
 */

import { VertexAI, SchemaType } from '@google-cloud/vertexai';
import { readFileSync, existsSync, readdirSync, writeFileSync, unlinkSync } from 'fs';
import { resolve, join } from 'path';
import { tmpdir } from 'os';

// ═══════════════════════════════════════
// Credentials loader (Vercel + local)
// ═══════════════════════════════════════

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
        const content = readFileSync(p, 'utf-8');
        return JSON.parse(content);
      } catch (e) {
        console.warn('Failed to read GOOGLE_APPLICATION_CREDENTIALS file:', e);
        return null;
      }
    }
  }

  // Priority 3: Search for ai-agent JSON file in cwd only (not parent)
  // Security: Only check current working directory
  try {
    const files = readdirSync(process.cwd());
    const saFile = files.find((f) => f.endsWith('.json') && f.includes('ai-agent'));
    if (saFile) {
      const p = join(process.cwd(), saFile);
      if (existsSync(p)) {
        const content = readFileSync(p, 'utf-8');
        return JSON.parse(content);
      }
    }
  } catch (e) {
    // ignore
  }

  return null;
}

// ═══════════════════════════════════════
// VertexAI client singleton
// ═══════════════════════════════════════

let vertexaiInstance: VertexAI | null = null;
let tempCredentialsFile: string | null = null;

/**
 * Clean up temporary credentials file if it exists.
 * Safe to call multiple times.
 */
function cleanupTempCredentials(): void {
  if (tempCredentialsFile && existsSync(tempCredentialsFile)) {
    try {
      unlinkSync(tempCredentialsFile);
      tempCredentialsFile = null;
    } catch {
      // ignore cleanup errors
    }
  }
}

function getVertexAIClient(): VertexAI {
  if (vertexaiInstance) return vertexaiInstance;

  const credentials = getServiceAccountCredentials();
  if (!credentials) {
    throw new Error(
      'GCP service account credentials not found. Provide GOOGLE_SERVICE_ACCOUNT_JSON env var or place ai-agent-*.json in project root.'
    );
  }

  // On Vercel/serverless, we write credentials to a deterministic temp file
  // to avoid accumulating files across cold starts
  try {
    // Use a deterministic filename to avoid orphan files
    const tempFile = join(tmpdir(), 'gcp-sa-redflaggames.json');
    
    // Clean up any previous file first
    cleanupTempCredentials();
    
    writeFileSync(tempFile, JSON.stringify(credentials), { mode: 0o600 });
    process.env.GOOGLE_APPLICATION_CREDENTIALS = tempFile;
    tempCredentialsFile = tempFile;
  } catch (e) {
    console.warn('Failed to write temp credentials file, trying without:', e);
  }

  vertexaiInstance = new VertexAI({
    project: credentials.project_id,
    location: process.env.VERTEX_AI_LOCATION || 'us-central1',
  });

  return vertexaiInstance;
}

// Cleanup on exit (best-effort for non-serverless)
if (typeof process !== 'undefined') {
  const cleanup = () => cleanupTempCredentials();
  process.on('exit', cleanup);
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
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

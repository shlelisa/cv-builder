/**
 * Puter.js and Multi-AI Provider Orchestrator
 * Provides free fallback AI capabilities using Puter.js / OpenRouter / Groq / OpenAI-compatible drivers
 * when primary Gemini/OpenAI rate limits (429) or quotas are reached.
 */

export interface PuterAiOptions {
  model?: 'gpt-4o-mini' | 'gpt-4o' | 'claude-3-5-sonnet' | 'deepseek/deepseek-chat' | 'meta-llama/llama-3.1-70b-instruct' | string;
  temperature?: number;
  json?: boolean;
}

declare global {
  interface Window {
    puter?: {
      ai?: {
        chat: (prompt: string | Array<Record<string, unknown>>, options?: Record<string, unknown>) => Promise<any>;
      };
    };
  }
}

import { TemplateAnalysis } from '@/types';
import { buildAnalyzePrompt, parseAndSanitizeAnalysis } from '@/lib/template-analysis';
import { buildCvPrompt } from '@/lib/cv-writing';

/**
 * Executes an AI chat prompt via Puter.js in Browser or Node.js environment
 */
export async function callPuterAi(prompt: string, options: PuterAiOptions = {}): Promise<string> {
  const model = options.model || 'gpt-4o-mini';
  const temperature = options.temperature ?? 0.2;

  // 1. Browser runtime: Use window.puter if available
  if (typeof window !== 'undefined' && window.puter?.ai?.chat) {
    try {
      const res = await window.puter.ai.chat(prompt, {
        model,
        temperature,
      });
      if (typeof res === 'string') return res;
      if (res?.message?.content) return res.message.content;
      if (res?.text) return res.text;
      return String(res);
    } catch (err) {
      console.warn('[Puter.js Browser]', err);
    }
  }

  // 2. Server runtime (Node.js): Use Puter REST API or @heyputer/puter.js if token available
  const puterToken = typeof process !== 'undefined' ? (process.env.PUTER_AUTH_TOKEN || process.env.PUTER_API_KEY) : undefined;
  if (puterToken) {
    try {
      const res = await fetch('https://api.puter.com/drivers/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${puterToken}`,
        },
        body: JSON.stringify({
          interface: 'puter-chat-completion',
          driver: 'openai-completion',
          test_mode: false,
          method: 'complete',
          args: {
            messages: [{ role: 'user', content: prompt }],
            model,
            temperature,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data?.result?.message?.content || data?.choices?.[0]?.message?.content || data?.text;
        if (content) return content;
      }
    } catch (err) {
      console.warn('[Puter.js Node API]', err);
    }
  }

  throw new Error('Puter AI runtime is currently unavailable.');
}

/**
 * Client-Side Vision Analysis via Puter.js when Gemini backend hits free tier rate limits
 */
export async function analyzeWithPuterClient(
  imageDataUrl: string,
  palette?: string[],
): Promise<TemplateAnalysis | null> {
  if (typeof window === 'undefined' || !window.puter?.ai?.chat) {
    return null;
  }

  const prompt = buildAnalyzePrompt(palette);
  try {
    const messages = [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: imageDataUrl } },
        ],
      },
    ];

    const res = await window.puter.ai.chat(messages as any, {
      model: 'gpt-4o',
      temperature: 0.2,
    });

    const rawText =
      typeof res === 'string'
        ? res
        : res?.message?.content || res?.text || JSON.stringify(res);

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);
    return parseAndSanitizeAnalysis(parsed);
  } catch (err) {
    console.warn('[analyzeWithPuterClient]', err);
    return null;
  }
}

/**
 * Client-Side CV Content Generation via Puter.js when backend AI hits quota
 */
export async function writeCvWithPuterClient(
  analysis: TemplateAnalysis,
  singleton: Record<string, string>,
  entries: Record<string, Array<Record<string, string>>>,
  language = 'en',
): Promise<{ cv: string; refinedSingleton?: Record<string, string>; refinedEntries?: Record<string, Array<Record<string, string>>> } | null> {
  if (typeof window === 'undefined' || !window.puter?.ai?.chat) {
    return null;
  }

  const prompt = buildCvPrompt(analysis, singleton, entries, language);
  try {
    const res = await window.puter.ai.chat(prompt, {
      model: 'gpt-4o-mini',
      temperature: 0.3,
    });

    const rawText =
      typeof res === 'string'
        ? res
        : res?.message?.content || res?.text || String(res);

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed && typeof parsed.cv === 'string') {
          return {
            cv: parsed.cv,
            refinedSingleton: parsed.refined?.singleton,
            refinedEntries: parsed.refined?.entries,
          };
        }
      } catch {
        // use rawText as CV text
      }
    }

    return { cv: rawText };
  } catch (err) {
    console.warn('[writeCvWithPuterClient]', err);
    return null;
  }
}

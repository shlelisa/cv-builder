import { AiConfig } from '@/lib/ai-config';

interface ImageInput {
  dataUrl: string;
}

const GEMINI_FALLBACK_MODELS = ['gemini-3.6-flash', 'gemini-flash-latest', 'gemini-3.5-flash'];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class AiHttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'AiHttpError';
  }
}

function parseDataUrl(dataUrl: string): { mimeType: string; base64: string } {
  const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
  if (!match) return { mimeType: 'image/png', base64: dataUrl };
  return { mimeType: match[1], base64: match[2] };
}

async function openaiJsonOnce(cfg: AiConfig, prompt: string, images: ImageInput[], temperature: number): Promise<string> {
  const content: Array<Record<string, unknown>> = [{ type: 'text', text: prompt }];
  images.forEach((img) => {
    content.push({ type: 'image_url', image_url: { url: img.dataUrl } });
  });

  const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cfg.key}`,
    },
    body: JSON.stringify({
      model: cfg.model,
      messages: [{ role: 'user', content }],
      response_format: { type: 'json_object' },
      temperature,
    }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new AiHttpError(`openai ${res.status}: ${txt.slice(0, 500)}`, res.status);
  }
  const data = await res.json();
  const contentText = data.choices?.[0]?.message?.content;
  return typeof contentText === 'string' ? contentText : '';
}

async function geminiJsonOnce(
  cfg: AiConfig,
  model: string,
  prompt: string,
  images: ImageInput[],
  temperature: number,
): Promise<string> {
  const parts: Array<Record<string, unknown>> = [{ text: prompt }];
  images.forEach((img) => {
    const { mimeType, base64 } = parseDataUrl(img.dataUrl);
    parts.push({ inline_data: { mime_type: mimeType, data: base64 } });
  });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(cfg.key)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts }],
      generationConfig: { responseMimeType: 'application/json', temperature },
    }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new AiHttpError(`gemini ${res.status} (model ${model}): ${txt.slice(0, 500)}`, res.status);
  }
  const data = await res.json();
  const textParts: string[] = (data.candidates?.[0]?.content?.parts || [])
    .map((p: { text?: string }) => p.text)
    .filter(Boolean);
  return textParts.join('').trim();
}

const isRetryable = (status: number) => status === 429 || status >= 500;

export async function openaiJson(
  cfg: AiConfig,
  prompt: string,
  images: ImageInput[] = [],
  temperature = 0.2,
): Promise<string> {
  const attempts = 3;
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await openaiJsonOnce(cfg, prompt, images, temperature);
    } catch (err) {
      lastErr = err;
      const status = err instanceof AiHttpError ? err.status : -1;
      if (!isRetryable(status) || i === attempts - 1) throw err;
      await sleep(800 * (i + 1));
    }
  }
  throw lastErr;
}

export async function geminiJson(
  cfg: AiConfig,
  prompt: string,
  images: ImageInput[] = [],
  temperature = 0.2,
): Promise<string> {
  const candidates = [cfg.model, ...GEMINI_FALLBACK_MODELS.filter((m) => m !== cfg.model)];
  const lastErrors: string[] = [];

  for (const model of candidates) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await geminiJsonOnce(cfg, model, prompt, images, temperature);
      } catch (err) {
        const status = err instanceof AiHttpError ? err.status : -1;
        lastErrors.push(err instanceof Error ? err.message : String(err));
        if (status === 404) break; // model unavailable/retired — try the next one
        if (!isRetryable(status) || attempt === 2) break;
        await sleep(900 * (attempt + 1));
      }
    }
  }
  throw new Error(`Gemini models failed (tried ${candidates.length}): ${lastErrors[lastErrors.length - 1]}`);
}

export async function aiJson(cfg: AiConfig, prompt: string, images: ImageInput[] = [], temperature = 0.2): Promise<string> {
  if (cfg.provider === 'gemini') return geminiJson(cfg, prompt, images, temperature);
  return openaiJson(cfg, prompt, images, temperature);
}
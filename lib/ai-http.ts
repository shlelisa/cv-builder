import { AiConfig } from '@/lib/ai-config';

interface ImageInput {
  dataUrl: string;
}

function parseDataUrl(dataUrl: string): { mimeType: string; base64: string } {
  const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
  if (!match) return { mimeType: 'image/png', base64: dataUrl };
  return { mimeType: match[1], base64: match[2] };
}

export async function openaiJson(
  cfg: AiConfig,
  prompt: string,
  images: ImageInput[] = [],
  temperature = 0.2,
): Promise<string> {
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
    throw new Error(`openai ${res.status}: ${txt.slice(0, 500)}`);
  }
  const data = await res.json();
  const contentText = data.choices?.[0]?.message?.content;
  return typeof contentText === 'string' ? contentText : '';
}

export async function geminiJson(
  cfg: AiConfig,
  prompt: string,
  images: ImageInput[] = [],
  temperature = 0.2,
): Promise<string> {
  const parts: Array<Record<string, unknown>> = [{ text: prompt }];
  images.forEach((img) => {
    const { mimeType, base64 } = parseDataUrl(img.dataUrl);
    parts.push({ inline_data: { mime_type: mimeType, data: base64 } });
  });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(cfg.model)}:generateContent?key=${encodeURIComponent(cfg.key)}`;
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
    throw new Error(`gemini ${res.status}: ${txt.slice(0, 500)}`);
  }
  const data = await res.json();
  const textParts: string[] = (data.candidates?.[0]?.content?.parts || [])
    .map((p: { text?: string }) => p.text)
    .filter(Boolean);
  return textParts.join('').trim();
}

export async function aiJson(cfg: AiConfig, prompt: string, images: ImageInput[] = [], temperature = 0.2): Promise<string> {
  if (cfg.provider === 'gemini') return geminiJson(cfg, prompt, images, temperature);
  return openaiJson(cfg, prompt, images, temperature);
}
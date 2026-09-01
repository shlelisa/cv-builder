export interface AiConfig {
  provider: 'openai' | 'gemini';
  key: string;
  model: string;
  baseUrl: string;
  configured: boolean;
}

export function getAiConfig(): AiConfig {
  const wantsGemini =
    (process.env.AI_PROVIDER || '').toLowerCase().startsWith('gemini') ||
    (Boolean(process.env.GEMINI_API_KEY) && !process.env.OPENAI_API_KEY);
  const provider: 'openai' | 'gemini' = wantsGemini ? 'gemini' : 'openai';

  const openaiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
  const key = provider === 'gemini' ? geminiKey : openaiKey;

  const model =
    provider === 'gemini'
      ? process.env.AI_MODEL || process.env.GEMINI_MODEL || 'gemini-3.6-flash'
      : process.env.AI_MODEL || process.env.OPENAI_MODEL || 'gpt-4o';

  const baseUrl = process.env.OPENAI_BASE_URL || process.env.AI_BASE_URL || 'https://api.openai.com/v1';

  return {
    provider,
    key: key || '',
    model,
    baseUrl: baseUrl.replace(/\/$/, ''),
    configured: Boolean(key),
  };
}
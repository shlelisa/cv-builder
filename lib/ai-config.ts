export interface AiConfig {
  provider: 'openai' | 'gemini' | 'puter';
  key: string;
  model: string;
  baseUrl: string;
  configured: boolean;
  secondaryProviders?: Array<{
    provider: 'openai' | 'gemini' | 'puter';
    key: string;
    model: string;
    baseUrl: string;
  }>;
}

export function getAiConfig(): AiConfig {
  const wantsGemini =
    (process.env.AI_PROVIDER || '').toLowerCase().startsWith('gemini') ||
    (Boolean(process.env.GEMINI_API_KEY) && !process.env.OPENAI_API_KEY);
  const wantsPuter = (process.env.AI_PROVIDER || '').toLowerCase().startsWith('puter');
  
  const provider: 'openai' | 'gemini' | 'puter' = wantsPuter ? 'puter' : wantsGemini ? 'gemini' : 'openai';

  const openaiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
  const puterKey = process.env.PUTER_AUTH_TOKEN || process.env.PUTER_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  const key = provider === 'gemini' ? geminiKey : provider === 'puter' ? puterKey : openaiKey;

  const model =
    provider === 'gemini'
      ? process.env.AI_MODEL || process.env.GEMINI_MODEL || 'gemini-2.5-flash'
      : provider === 'puter'
        ? process.env.AI_MODEL || 'gpt-4o-mini'
        : process.env.AI_MODEL || process.env.OPENAI_MODEL || 'gpt-4o-mini';

  const baseUrl = process.env.OPENAI_BASE_URL || process.env.AI_BASE_URL || 'https://api.openai.com/v1';

  const secondaryProviders: AiConfig['secondaryProviders'] = [];

  // If Gemini is primary, add OpenAI/OpenRouter/Groq/Puter as fallbacks if keys exist
  if (provider === 'gemini') {
    if (openaiKey) {
      secondaryProviders.push({ provider: 'openai', key: openaiKey, model: 'gpt-4o-mini', baseUrl: 'https://api.openai.com/v1' });
    }
    if (openrouterKey) {
      secondaryProviders.push({ provider: 'openai', key: openrouterKey, model: 'meta-llama/llama-3.1-70b-instruct', baseUrl: 'https://openrouter.ai/api/v1' });
    }
    if (groqKey) {
      secondaryProviders.push({ provider: 'openai', key: groqKey, model: 'llama-3.3-70b-versatile', baseUrl: 'https://api.groq.com/openai/v1' });
    }
    if (puterKey) {
      secondaryProviders.push({ provider: 'puter', key: puterKey, model: 'gpt-4o-mini', baseUrl: 'https://api.puter.com/drivers/ai/chat' });
    }
  }

  return {
    provider,
    key: key || '',
    model,
    baseUrl: baseUrl.replace(/\/$/, ''),
    configured: Boolean(key || puterKey || openaiKey || geminiKey || openrouterKey || groqKey),
    secondaryProviders,
  };
}
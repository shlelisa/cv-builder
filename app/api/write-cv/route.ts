import { NextRequest, NextResponse } from 'next/server';
import { getAiConfig } from '@/lib/ai-config';
import { aiJson } from '@/lib/ai-http';
import { buildWritePrompt, sanitizeWriteResult } from '@/lib/template-analysis';
import { TemplateAnalysis } from '@/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface WriteCvBody {
  analysis?: TemplateAnalysis;
  singleton?: Record<string, string>;
  entries?: Record<string, Array<Record<string, string>>>;
  language?: string;
}

export async function POST(req: NextRequest) {
  const cfg = getAiConfig();
  if (!cfg.configured) {
    return NextResponse.json({ mock: true }, { status: 501 });
  }

  let body: WriteCvBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ mock: true, error: 'invalid request' }, { status: 400 });
  }

  const analysis = body.analysis;
  const singleton = body.singleton && typeof body.singleton === 'object' ? body.singleton : {};
  const entries = body.entries && typeof body.entries === 'object' ? body.entries : {};
  const language = typeof body.language === 'string' && body.language ? body.language : 'en';
  if (!analysis || typeof analysis !== 'object') {
    return NextResponse.json({ mock: true, error: 'missing analysis' }, { status: 400 });
  }

  try {
    const prompt = buildWritePrompt(analysis, singleton, entries, language);
    const raw = await aiJson(cfg, prompt, [], 0.3);
    const parsed = JSON.parse(raw);
    const result = sanitizeWriteResult(parsed, singleton, entries);
    return NextResponse.json({ mock: false, cv: result.cv, refined: result.refined });
  } catch (err) {
    console.error('[write-cv]', err);
    return NextResponse.json({ mock: true, error: 'ai call failed' }, { status: 502 });
  }
}
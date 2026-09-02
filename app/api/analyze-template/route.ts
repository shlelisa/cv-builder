import { NextRequest, NextResponse } from 'next/server';
import { getAiConfig } from '@/lib/ai-config';
import { aiJson } from '@/lib/ai-http';
import { buildAnalyzePrompt, parseAndSanitizeAnalysis } from '@/lib/template-analysis';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const cfg = getAiConfig();
  if (!cfg.configured) {
    return NextResponse.json({ mock: true }, { status: 501 });
  }

  let body: { image?: string; palette?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ mock: true, error: 'invalid request' }, { status: 400 });
  }

  const image = typeof body.image === 'string' ? body.image : '';
  const palette = Array.isArray(body.palette) ? body.palette.filter((c) => typeof c === 'string') : [];
  if (!image.startsWith('data:image/')) {
    return NextResponse.json({ mock: true, error: 'missing image' }, { status: 400 });
  }

  try {
    const raw = await aiJson(cfg, buildAnalyzePrompt(palette), [{ dataUrl: image }], 0.2);
    const parsed = JSON.parse(raw);
    const analysis = parseAndSanitizeAnalysis(parsed);
    return NextResponse.json({ mock: false, analysis });
  } catch (err) {
    console.error('[analyze-template]', err);
    return NextResponse.json({ mock: true, error: err instanceof Error ? err.message : 'ai call failed' }, { status: 200 });
  }
}
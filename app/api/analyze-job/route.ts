import { NextRequest, NextResponse } from 'next/server';
import { getAiConfig } from '@/lib/ai-config';
import { aiJson } from '@/lib/ai-http';
import { buildJobMatchPrompt, sanitizeJobMatchResult, heuristicSemanticJobMatch } from '@/lib/job-analysis';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface AnalyzeJobBody {
  position?: string;
  company?: string;
  requirements?: string | string[];
  profileText?: string;
  language?: string;
}

export async function POST(req: NextRequest) {
  let body: AnalyzeJobBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ mock: true, error: 'invalid request' }, { status: 400 });
  }

  const position = typeof body.position === 'string' ? body.position.trim() : '';
  const company = typeof body.company === 'string' ? body.company.trim() : '';
  const requirements = Array.isArray(body.requirements)
    ? body.requirements.filter(r => typeof r === 'string' && r.trim())
    : typeof body.requirements === 'string'
    ? body.requirements.split('\n').map(r => r.trim()).filter(Boolean)
    : [];
  const profileText = typeof body.profileText === 'string' ? body.profileText.trim() : '';
  const language = typeof body.language === 'string' && body.language ? body.language : 'en';

  const jobObj = { position, company, requirements };

  const cfg = getAiConfig();
  if (!cfg.configured) {
    // If backend AI key is not configured, run our high-fidelity semantic heuristic matching
    const fallback = heuristicSemanticJobMatch(jobObj, profileText);
    return NextResponse.json({ mock: true, ...fallback });
  }

  try {
    const prompt = buildJobMatchPrompt(jobObj, profileText, language);
    const raw = await aiJson(cfg, prompt, [], 0.2);
    
    // Extract JSON block if wrapped
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI returned non-JSON format');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    const result = sanitizeJobMatchResult(parsed, jobObj, profileText);
    return NextResponse.json({ mock: false, ...result });
  } catch (err) {
    console.error('[analyze-job-api]', err);
    // Fallback gracefully to semantic heuristic matching
    const fallback = heuristicSemanticJobMatch(jobObj, profileText);
    return NextResponse.json({
      mock: true,
      error: err instanceof Error ? err.message : 'AI call failed',
      ...fallback,
    });
  }
}

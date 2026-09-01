import { NextResponse } from 'next/server';
import { getAiConfig } from '@/lib/ai-config';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cfg = getAiConfig();
  return NextResponse.json({
    configured: cfg.configured,
    provider: cfg.configured ? cfg.provider : null,
    model: cfg.configured ? cfg.model : null,
  });
}
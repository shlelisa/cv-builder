import { NextRequest, NextResponse } from 'next/server';
import { parseUserAgent } from '@/lib/device-detection';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const userAgent = req.headers.get('user-agent') || '';
    const devInfo = parseUserAgent(userAgent);

    // IP Extraction from headers
    const forwardedFor = req.headers.get('x-forwarded-for');
    let clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : req.headers.get('x-real-ip') || '';

    // Vercel Geolocation headers
    let city = req.headers.get('x-vercel-ip-city') || '';
    let country = req.headers.get('x-vercel-ip-country') || '';
    let region = req.headers.get('x-vercel-ip-country-region') || '';

    // If local development or missing geo headers, try public lookup fallback
    if (!city && !country && clientIp && clientIp !== '127.0.0.1' && clientIp !== '::1') {
      try {
        const geoRes = await fetch(`https://ipapi.co/${clientIp}/json/`, { next: { revalidate: 3600 } });
        if (geoRes.ok) {
          const geo = await geoRes.json();
          city = geo.city || '';
          country = geo.country_name || geo.country || '';
          region = geo.region || '';
        }
      } catch {
        // ignore fallback errors
      }
    }

    const locationParts = [city, region, country].filter(Boolean);
    const place = locationParts.length > 0 ? locationParts.join(', ') : 'Unknown Location';

    return NextResponse.json({
      ip: clientIp || 'Unknown IP',
      place,
      city,
      country,
      device: devInfo.summary,
      rawDevice: devInfo.device,
      browser: devInfo.browser,
      os: devInfo.os,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to detect session metadata' },
      { status: 500 }
    );
  }
}

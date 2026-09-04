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

    // If local development (::1 / 127.0.0.1) or missing geo headers, resolve public IP & location
    const isLocalhost = !clientIp || clientIp === '127.0.0.1' || clientIp === '::1' || clientIp.startsWith('192.168.') || clientIp.startsWith('10.');

    if (isLocalhost || (!city && !country)) {
      try {
        const queryUrl = isLocalhost ? 'https://ipapi.co/json/' : `https://ipapi.co/${clientIp}/json/`;
        const geoRes = await fetch(queryUrl, { cache: 'no-store' });
        if (geoRes.ok) {
          const geo = await geoRes.json();
          if (geo.ip) clientIp = geo.ip;
          if (geo.city) city = geo.city;
          if (geo.country_name || geo.country) country = geo.country_name || geo.country;
          if (geo.region) region = geo.region;
        }
      } catch (e) {
        // secondary fallback for IP only if geo provider is rate limited
        if (isLocalhost) {
          try {
            const ipRes = await fetch('https://api.ipify.org?format=json', { cache: 'no-store' });
            if (ipRes.ok) {
              const ipData = await ipRes.json();
              if (ipData.ip) clientIp = ipData.ip;
            }
          } catch {}
        }
      }
    }

    const locationParts = [city, region, country].filter(Boolean);
    const place = locationParts.length > 0 ? locationParts.join(', ') : (isLocalhost ? 'Local Development' : 'Unknown Location');

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

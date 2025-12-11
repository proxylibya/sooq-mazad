import type { NextApiRequest, NextApiResponse } from 'next';

// Proxy endpoint for reverse geocoding using Nominatim (OpenStreetMap)
// This keeps browser CSP strict (connect-src 'self') while allowing server-side fetch
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { lat, lng, lon, zoom = '10', lang = 'ar' } = req.query as Record<string, string>;

    const latitude = parseFloat(lat ?? '');
    const longitude = parseFloat(lng ?? lon ?? '');

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return res.status(400).json({ error: 'Invalid or missing coordinates' });
    }

    const url = new URL('https://nominatim.openstreetmap.org/reverse');
    url.searchParams.set('format', 'json');
    url.searchParams.set('lat', String(latitude));
    url.searchParams.set('lon', String(longitude));
    url.searchParams.set('accept-language', lang || 'ar');
    url.searchParams.set('zoom', String(zoom));

    // Per Nominatim Usage Policy, include a valid User-Agent/Referer
    const upstream = await fetch(url.toString(), {
      headers: {
        'User-Agent': `sooq-mazad/1.0 (+${process.env.APP_URL || 'http://localhost:3021'})`,
        Accept: 'application/json',
        'Accept-Language': lang || 'ar',
        Referer: process.env.APP_URL || 'http://localhost:3021',
      },
    });

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => '');
      return res
        .status(upstream.status)
        .json({ error: 'Upstream error', status: upstream.status, body: text });
    }

    const data = await upstream.json();

    // Cache for a short period on the edge (if applicable)
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=3600');
    return res.status(200).json(data);
  } catch (error: unknown) {
    const message =
      typeof error === 'object' && error !== null && 'message' in error
        ? String((error as { message?: unknown }).message)
        : String(error);
    return res.status(500).json({ error: 'Internal Server Error', message });
  }
}

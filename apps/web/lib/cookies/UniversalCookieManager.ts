import type { NextApiRequest, NextApiResponse } from 'next';

export const COOKIE_NAMES = {
  ADMIN_SESSION: 'admin_session',
  USER_ACCESS: 'user_access_token',
  USER_REFRESH: 'user_refresh_token',
  CSRF: 'csrf_token',
} as const;

export const COOKIE_MAX_AGE = {
  ONE_HOUR: 3600,
  ONE_DAY: 86400,
  ONE_WEEK: 604800,
  ONE_MONTH: 2592000,
  THREE_MONTHS: 7776000,
} as const;

export type SameSite = 'lax' | 'strict' | 'none';

export interface SetCookieOptions {
  name: string;
  value: string;
  path?: string;
  domain?: string;
  maxAge?: number; // seconds
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: SameSite;
}

function serializeCookie(opts: SetCookieOptions): string {
  const parts: string[] = [];
  const name = opts.name;
  const value = opts.value ?? '';

  parts.push(`${encodeURIComponent(name)}=${encodeURIComponent(value)}`);

  if (opts.maxAge && Number.isFinite(opts.maxAge)) {
    const max = Math.floor(opts.maxAge);
    parts.push(`Max-Age=${max}`);
    const expires = new Date(Date.now() + max * 1000);
    parts.push(`Expires=${expires.toUTCString()}`);
  }

  parts.push(`Path=${opts.path || '/'}`);

  if (opts.domain) parts.push(`Domain=${opts.domain}`);

  // sameSite default 'lax'
  const sameSite: SameSite = opts.sameSite || 'lax';
  parts.push(`SameSite=${sameSite === 'none' ? 'None' : sameSite === 'strict' ? 'Strict' : 'Lax'}`);

  if (opts.httpOnly) parts.push('HttpOnly');

  // In production, secure should generally be true
  if (opts.secure === true || (opts.secure === undefined && process.env.NODE_ENV === 'production')) {
    parts.push('Secure');
  }

  return parts.join('; ');
}

function appendSetCookieHeader(res: NextApiResponse, cookie: string) {
  const prev = res.getHeader('Set-Cookie');
  if (!prev) {
    res.setHeader('Set-Cookie', cookie);
  } else if (Array.isArray(prev)) {
    res.setHeader('Set-Cookie', [...prev, cookie]);
  } else {
    res.setHeader('Set-Cookie', [prev.toString(), cookie]);
  }
}

export const UniversalCookieManager = {
  setCookie(res: NextApiResponse, options: SetCookieOptions) {
    const cookie = serializeCookie(options);
    appendSetCookieHeader(res, cookie);
  },

  setMultipleCookies(res: NextApiResponse, cookies: SetCookieOptions[]) {
    for (const opts of cookies) {
      const cookie = serializeCookie(opts);
      appendSetCookieHeader(res, cookie);
    }
  },

  deleteCookie(res: NextApiResponse, name: string, path: string = '/') {
    const cookie = serializeCookie({
      name,
      value: '',
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path,
    });
    appendSetCookieHeader(res, cookie);
  },

  clearCookie(res: NextApiResponse, name: string, path: string = '/') {
    return this.deleteCookie(res, name, path);
  },

  clearMultipleCookies(res: NextApiResponse, names: string[], path: string = '/') {
    for (const n of names) {
      this.deleteCookie(res, n, path);
    }
  },

  getCookie(req: NextApiRequest, name: string): string | null {
    try {
      const rawCookie = req.headers.cookie;
      const cookieHeader = Array.isArray(rawCookie) ? rawCookie.join('; ') : (rawCookie || '');
      if (!cookieHeader) return null;
      const parts = cookieHeader.split(/;\s*/);
      const map = parts.reduce((acc, c) => {
        const idx = c.indexOf('=');
        if (idx === -1) return acc;
        const k = c.slice(0, idx).trim();
        const v = c.slice(idx + 1);
        if (k) acc[k] = decodeURIComponent(v);
        return acc;
      }, {} as Record<string, string>);
      return map[name] ?? null;
    } catch {
      return null;
    }
  },

  getAllCookies(req: NextApiRequest): Record<string, string> {
    try {
      const rawCookie = req.headers.cookie;
      const cookieHeader = Array.isArray(rawCookie) ? rawCookie.join('; ') : (rawCookie || '');
      if (!cookieHeader) return {};
      const parts = cookieHeader.split(/;\s*/);
      return parts.reduce((acc, c) => {
        const idx = c.indexOf('=');
        if (idx === -1) return acc;
        const k = c.slice(0, idx).trim();
        const v = c.slice(idx + 1);
        if (k) acc[k] = decodeURIComponent(v);
        return acc;
      }, {} as Record<string, string>);
    } catch {
      return {};
    }
  },

  hasCookie(req: NextApiRequest, name: string): boolean {
    return this.getCookie(req, name) !== null;
  },
};

export default UniversalCookieManager;

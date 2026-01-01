import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Security Headers Middleware
 * Applies comprehensive security headers to all responses
 */
export function securityHeadersMiddleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Only apply if enabled
  if (process.env.ENABLE_SECURITY_HEADERS !== 'true') {
    return response;
  }

  // Basic Security Headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Strict Transport Security (HSTS)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }
  
  // Content Security Policy (CSP)
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' wss: https:",
    "media-src 'self'",
    "object-src 'none'",
    "frame-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ];
  
  response.headers.set(
    'Content-Security-Policy',
    cspDirectives.join('; ')
  );
  
  // Permissions Policy (formerly Feature Policy)
  const permissionsPolicy = [
    'camera=()',
    'microphone=()',
    'geolocation=(self)',
    'interest-cohort=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()'
  ];
  
  response.headers.set(
    'Permissions-Policy',
    permissionsPolicy.join(', ')
  );

  // Remove dangerous headers
  response.headers.delete('X-Powered-By');
  response.headers.delete('Server');
  
  return response;
}

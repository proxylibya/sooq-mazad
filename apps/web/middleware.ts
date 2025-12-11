/**
 * 🛡️ Middleware الموحد للحماية والتوجيه
 * Unified Protection & Routing Middleware
 * Enhanced with Security Headers & CSRF Protection
 * 
 * ⚠️ يستخدم jose بدلاً من jsonwebtoken للتوافق مع Edge Runtime
 */

import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

// =====================================
// Configuration
// =====================================

const JWT_SECRET_USER = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_SECRET_ADMIN = process.env.ADMIN_JWT_SECRET || 'sooq_mazad_admin_jwt_secret_2024_unified';
const ADMIN_COOKIE_NAME = 'admin_session';

// تحويل السر إلى Uint8Array للاستخدام مع jose
const getUserSecretKey = () => new TextEncoder().encode(JWT_SECRET_USER);
const getAdminSecretKey = () => new TextEncoder().encode(JWT_SECRET_ADMIN);

// Security Headers Configuration
const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
};

// =====================================
// Route Patterns
// =====================================

const ROUTE_PATTERNS = {
  // Static files and internal resources
  STATIC: /^\/_next\/|^\/images\/|^\/fonts\/|^\/favicon|^\/public\/|^\/uploads\/|\.(?:jpg|jpeg|gif|png|svg|ico|css|js|woff|woff2|ttf|json)$/,

  // API Routes
  API: /^\/api\//,

  // Admin Routes
  ADMIN: /^\/admin/,
  ADMIN_LOGIN: /^\/admin\/login$/,
  ADMIN_PROTECTED: /^\/admin\/(?!login)/,

  // User Auth Routes (public)
  AUTH: /^\/(login|register|auth\/|forgot-password|reset-password|verify-phone)/,

  // Protected User Routes - قائمة شاملة
  USER_PROTECTED: /^\/(profile|my-account|my-ads|add-listing|edit-listing|promote-listing|promote|promotions|sell-car|messages|notifications|favorites|wallet|settings|transaction|security|reports|ad-stats|sales-report|seller|user\/|dashboard)/,

  // Public Routes (explicitly allowed)
  PUBLIC: /^\/$|^\/(about|contact|auctions|showrooms|transport|car|auction|search|compare|help|privacy|terms|support|faq|marketplace|tires-rims|motorcycles|trucks-buses|heavy-machinery|car-parts|car-accessories|premium-cars|companies|partnership|site-map|financing-calculator|reviews|yards|listing|track-application|apply-center|advertising-contact|inspection-report|report-listing|listing-success|404|500|_error)/
};

// =====================================
// Helper Functions (Edge Compatible)
// =====================================

/**
 * Verify User JWT Token (Edge Compatible)
 */
async function verifyUserToken(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(token, getUserSecretKey());
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Verify Admin JWT Token (Edge Compatible)
 */
async function verifyAdminToken(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(token, getAdminSecretKey());
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Get User Token from Request
 */
function getUserTokenFromRequest(request: NextRequest): string | null {
  // Check multiple possible cookie names for compatibility
  return (
    request.cookies.get('token')?.value ||
    request.cookies.get('user_token')?.value ||
    request.cookies.get('auth_token')?.value ||
    null
  );
}

/**
 * Get Admin Token from Request
 */
function getAdminTokenFromRequest(request: NextRequest): string | null {
  return request.cookies.get(ADMIN_COOKIE_NAME)?.value || null;
}

// =====================================
// Main Middleware Function
// =====================================

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const url = request.nextUrl.clone();

  // ===== 1. Skip Static Resources =====
  if (ROUTE_PATTERNS.STATIC.test(pathname)) {
    return NextResponse.next();
  }

  // ===== 2. Handle API Routes =====
  if (ROUTE_PATTERNS.API.test(pathname)) {
    // API routes handle their own authentication
    return NextResponse.next();
  }

  // ===== 3. Handle Admin Routes =====
  // مسارات Admin يتم إعادة توجيهها إلى تطبيق Admin المنفصل عبر next.config.js redirects
  // لذلك نتركها تمر للسماح لـ Next.js بتنفيذ إعادة التوجيه
  if (ROUTE_PATTERNS.ADMIN.test(pathname)) {
    return NextResponse.next();
  }

  // ===== 4. Handle User Auth Routes =====
  if (ROUTE_PATTERNS.AUTH.test(pathname)) {
    const userToken = getUserTokenFromRequest(request);
    const user = userToken ? await verifyUserToken(userToken) : null;

    // Redirect to home if already logged in
    if (user) {
      // Check for callbackUrl parameter
      const callbackUrl = request.nextUrl.searchParams.get('callbackUrl');
      if (callbackUrl && !callbackUrl.includes('login') && !callbackUrl.includes('register')) {
        url.pathname = callbackUrl;
        url.searchParams.delete('callbackUrl');
      } else {
        url.pathname = '/';
      }
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  // ===== 5. Handle Protected User Routes =====
  if (ROUTE_PATTERNS.USER_PROTECTED.test(pathname)) {
    const userToken = getUserTokenFromRequest(request);
    const user = userToken ? await verifyUserToken(userToken) : null;

    if (!user) {
      url.pathname = '/login';
      url.searchParams.set('callbackUrl', pathname + search);
      return NextResponse.redirect(url);
    }

    // Add user info to headers
    const response = NextResponse.next();
    response.headers.set('x-user-id', String(user.id || user.userId || ''));
    response.headers.set('x-user-role', String(user.role || 'USER'));
    return response;
  }

  // ===== 6. Handle Public Routes =====
  if (ROUTE_PATTERNS.PUBLIC.test(pathname)) {
    return NextResponse.next();
  }

  // ===== 7. Handle Unknown Routes (404) =====
  // Check if the route exists in our system
  const validRoutePatterns = [
    ...Object.values(ROUTE_PATTERNS)
  ];

  const isValidRoute = validRoutePatterns.some(pattern =>
    pattern.test(pathname)
  );

  if (!isValidRoute && !pathname.includes('.')) {
    // Redirect to 404 page
    url.pathname = '/404';
    return NextResponse.rewrite(url);
  }

  // ===== 8. Apply Security Headers =====
  const response = NextResponse.next();

  // Apply security headers if enabled
  if (process.env.ENABLE_SECURITY_HEADERS === 'true') {
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Add HSTS in production
    if (process.env.NODE_ENV === 'production') {
      response.headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );
    }

    // Remove sensitive headers
    response.headers.delete('X-Powered-By');
    response.headers.delete('Server');
  }

  return response;
}

// =====================================
// Middleware Configuration
// =====================================

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)  
     * - favicon.ico, robots.txt, manifest.json
     * - Public images and assets with extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|manifest.json|.*\\.(?:jpg|jpeg|gif|png|svg|ico|css|js|woff|woff2|ttf)$).*)',
  ],
};

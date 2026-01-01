/**
 * @sooq-mazad/utils - Admin API Helpers
 * Helper functions for Next.js API routes
 * 
 * Provides:
 * - Request authentication middleware
 * - Response helpers
 * - Error handling
 * - Rate limiting hooks
 */

// Generic API types that work with Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface GenericApiResponse {
    status(code: number): GenericApiResponse;
    json(body: unknown): void;
    setHeader(name: string, value: string | string[]): GenericApiResponse;
}

export interface GenericApiRequest {
    method?: string;
    query: Record<string, string | string[] | undefined>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body?: any;
    cookies?: Record<string, string>;
    headers: Record<string, string | string[] | undefined>;
    socket?: { remoteAddress?: string; };
}

// Alias for backward compatibility
type NextApiResponse<T = unknown> = GenericApiResponse;
type NextApiRequest = GenericApiRequest;
import {
    createClearSessionCookie,
    createSessionCookie,
    getTokenFromRequest,
    hasPermission,
    hasRoleLevel,
    verifyAdminToken,
    type AdminRole,
    type AdminUser,
    type TokenPayload
} from './index';

// ============================================
// TYPES
// ============================================

export interface AuthenticatedRequest extends NextApiRequest {
    admin: AdminUser;
    tokenPayload: TokenPayload;
}

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    errors?: string[];
    meta?: {
        total?: number;
        page?: number;
        limit?: number;
        pages?: number;
    };
}

export type ApiHandler<T = unknown> = (
    req: AuthenticatedRequest,
    res: NextApiResponse<ApiResponse<T>>
) => Promise<void>;

export type PublicApiHandler<T = unknown> = (
    req: NextApiRequest,
    res: NextApiResponse<ApiResponse<T>>
) => Promise<void>;

// ============================================
// RESPONSE HELPERS
// ============================================

/**
 * Send success response
 */
export function sendSuccess<T>(
    res: NextApiResponse<ApiResponse<T>>,
    data?: T,
    message?: string,
    meta?: ApiResponse['meta'],
    statusCode: number = 200
): void {
    res.status(statusCode).json({
        success: true,
        data,
        message,
        meta,
    });
}

/**
 * Send error response
 */
export function sendError(
    res: NextApiResponse<ApiResponse>,
    message: string,
    statusCode: number = 400,
    errors?: string[]
): void {
    res.status(statusCode).json({
        success: false,
        error: message,
        errors,
    });
}

/**
 * Send unauthorized response
 */
export function sendUnauthorized(
    res: NextApiResponse<ApiResponse>,
    message: string = 'غير مصرح بالوصول'
): void {
    sendError(res, message, 401);
}

/**
 * Send forbidden response
 */
export function sendForbidden(
    res: NextApiResponse<ApiResponse>,
    message: string = 'ليس لديك صلاحية لهذا الإجراء'
): void {
    sendError(res, message, 403);
}

/**
 * Send not found response
 */
export function sendNotFound(
    res: NextApiResponse<ApiResponse>,
    message: string = 'العنصر غير موجود'
): void {
    sendError(res, message, 404);
}

/**
 * Send method not allowed response
 */
export function sendMethodNotAllowed(
    res: NextApiResponse<ApiResponse>,
    allowedMethods: string[]
): void {
    res.setHeader('Allow', allowedMethods.join(', '));
    sendError(res, `الطريقة غير مسموحة. الطرق المتاحة: ${allowedMethods.join(', ')}`, 405);
}

/**
 * Send validation error response
 */
export function sendValidationError(
    res: NextApiResponse<ApiResponse>,
    errors: string[]
): void {
    sendError(res, 'خطأ في التحقق من البيانات', 422, errors);
}

/**
 * Send server error response
 */
export function sendServerError(
    res: NextApiResponse<ApiResponse>,
    error?: Error,
    message: string = 'حدث خطأ في الخادم'
): void {
    console.error('Server Error:', error);
    sendError(res, message, 500);
}

// ============================================
// COOKIE HELPERS
// ============================================

/**
 * Set admin session cookie
 */
export function setSessionCookie(res: NextApiResponse, token: string): void {
    res.setHeader('Set-Cookie', createSessionCookie(token));
}

/**
 * Clear admin session cookie
 */
export function clearSessionCookie(res: NextApiResponse): void {
    res.setHeader('Set-Cookie', createClearSessionCookie());
}

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

/**
 * Authentication middleware factory
 * Creates a wrapper that verifies admin authentication
 */
export function withAdminAuth<T = unknown>(
    handler: ApiHandler<T>,
    options: {
        requiredRole?: AdminRole;
        requiredPermission?: string;
        getAdmin: (adminId: string) => Promise<AdminUser | null>;
        validateSession?: (sessionId: string, adminId: string) => Promise<boolean>;
    }
): PublicApiHandler<T> {
    return async (req, res) => {
        try {
            // Get token from request
            const token = getTokenFromRequest(req);

            if (!token) {
                return sendUnauthorized(res, 'لم يتم توفير رمز المصادقة');
            }

            // Verify token
            const payload = verifyAdminToken(token);

            if (!payload) {
                return sendUnauthorized(res, 'رمز المصادقة غير صالح أو منتهي الصلاحية');
            }

            // Validate session if validator provided
            if (options.validateSession) {
                const isValidSession = await options.validateSession(payload.sessionId, payload.adminId);
                if (!isValidSession) {
                    return sendUnauthorized(res, 'الجلسة غير صالحة أو منتهية');
                }
            }

            // Get admin from database
            const admin = await options.getAdmin(payload.adminId);

            if (!admin) {
                return sendUnauthorized(res, 'المدير غير موجود');
            }

            // Check if admin is active
            if (!admin.is_active) {
                return sendForbidden(res, 'الحساب معطل');
            }

            // Check required role
            if (options.requiredRole && !hasRoleLevel(admin.role, options.requiredRole)) {
                return sendForbidden(res, 'ليس لديك الصلاحية الكافية');
            }

            // Check required permission
            if (options.requiredPermission && !hasPermission(admin, options.requiredPermission)) {
                return sendForbidden(res, 'ليس لديك الصلاحية لهذا الإجراء');
            }

            // Attach admin to request
            const authenticatedReq = req as AuthenticatedRequest;
            authenticatedReq.admin = admin;
            authenticatedReq.tokenPayload = payload;

            // Call handler
            return handler(authenticatedReq, res);

        } catch (error) {
            console.error('Auth middleware error:', error);
            return sendServerError(res, error as Error);
        }
    };
}

/**
 * Simple authentication check without database lookup
 * Useful for lightweight endpoints
 */
export function withQuickAuth<T = unknown>(
    handler: (req: NextApiRequest & { tokenPayload: TokenPayload; }, res: NextApiResponse<ApiResponse<T>>) => Promise<void>
): PublicApiHandler<T> {
    return async (req, res) => {
        const token = getTokenFromRequest(req);

        if (!token) {
            return sendUnauthorized(res);
        }

        const payload = verifyAdminToken(token);

        if (!payload) {
            return sendUnauthorized(res, 'رمز المصادقة غير صالح');
        }

        (req as NextApiRequest & { tokenPayload: TokenPayload; }).tokenPayload = payload;

        return handler(req as NextApiRequest & { tokenPayload: TokenPayload; }, res);
    };
}

// ============================================
// METHOD VALIDATION
// ============================================

/**
 * Validate HTTP method
 */
export function validateMethod(
    req: NextApiRequest,
    res: NextApiResponse<ApiResponse>,
    allowedMethods: string[]
): boolean {
    if (!req.method || !allowedMethods.includes(req.method.toUpperCase())) {
        sendMethodNotAllowed(res, allowedMethods);
        return false;
    }
    return true;
}

// ============================================
// REQUEST UTILITIES
// ============================================

/**
 * Get client IP address from request
 */
export function getClientIP(req: NextApiRequest): string {
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
        const ips = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor.split(',')[0];
        return ips.trim();
    }

    const realIP = req.headers['x-real-ip'];
    if (realIP) {
        return Array.isArray(realIP) ? realIP[0] : realIP;
    }

    return req.socket?.remoteAddress || 'unknown';
}

/**
 * Get user agent from request
 */
export function getUserAgent(req: NextApiRequest): string {
    const ua = req.headers['user-agent'];
    if (!ua) return 'unknown';
    return Array.isArray(ua) ? ua[0] : ua;
}

/**
 * Parse pagination parameters
 */
export function parsePagination(req: NextApiRequest, defaults = { page: 1, limit: 20 }): {
    page: number;
    limit: number;
    skip: number;
} {
    const page = Math.max(1, parseInt(req.query.page as string) || defaults.page);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || defaults.limit));
    const skip = (page - 1) * limit;

    return { page, limit, skip };
}

/**
 * Parse sort parameters
 */
export function parseSort(req: NextApiRequest, allowedFields: string[], defaultField = 'createdAt'): {
    field: string;
    order: 'asc' | 'desc';
} {
    const sortBy = req.query.sortBy as string || defaultField;
    const sortOrder = (req.query.sortOrder as string || 'desc').toLowerCase();

    const field = allowedFields.includes(sortBy) ? sortBy : defaultField;
    const order = sortOrder === 'asc' ? 'asc' : 'desc';

    return { field, order };
}

/**
 * Parse search query
 */
export function parseSearch(req: NextApiRequest): string | undefined {
    const search = req.query.search || req.query.q;
    if (!search) return undefined;
    return String(search).trim();
}

// ============================================
// EXPORTS
// ============================================

export default {
    // Response helpers
    sendSuccess,
    sendError,
    sendUnauthorized,
    sendForbidden,
    sendNotFound,
    sendMethodNotAllowed,
    sendValidationError,
    sendServerError,

    // Cookie helpers
    setSessionCookie,
    clearSessionCookie,

    // Middleware
    withAdminAuth,
    withQuickAuth,

    // Validation
    validateMethod,

    // Request utilities
    getClientIP,
    getUserAgent,
    parsePagination,
    parseSort,
    parseSearch,
};

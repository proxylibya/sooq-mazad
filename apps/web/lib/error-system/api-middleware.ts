// @ts-nocheck
/**
 * ============================================
 * 🔌 API Error Middleware
 * Middleware موحد لمعالجة أخطاء API
 * ============================================
 */

import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import {
    AppError,
    ErrorCode,
    createErrorResponse,
    createSuccessResponse,
    errorHandler,
    logger
} from './index';

// ============================================
// Types
// ============================================

export interface ApiHandlerOptions {
    /** تسجيل جميع الطلبات */
    logRequests?: boolean;
    /** تفعيل CORS */
    cors?: boolean;
    /** طرق HTTP المسموحة */
    allowedMethods?: string[];
    /** التحقق من المصادقة */
    requireAuth?: boolean;
    /** الأدوار المسموحة */
    allowedRoles?: string[];
    /** Rate limiting key */
    rateLimitKey?: string;
}

export interface ExtendedNextApiRequest extends NextApiRequest {
    user?: {
        id: string;
        role: string;
        [key: string]: unknown;
    };
    requestId?: string;
}

// ============================================
// Main Wrapper
// ============================================

export function withErrorHandling(
    handler: NextApiHandler,
    options: ApiHandlerOptions = {}
): NextApiHandler {
    return async (req: ExtendedNextApiRequest, res: NextApiResponse) => {
        const startTime = Date.now();
        const requestId = generateRequestId();
        req.requestId = requestId;

        // Set logger context
        logger.setContext({ requestId });

        try {
            // Log request
            if (options.logRequests !== false) {
                logger.api(`${req.method} ${req.url}`, {
                    method: req.method,
                    url: req.url,
                    query: req.query,
                    userAgent: req.headers['user-agent'],
                    ip: getClientIP(req)
                });
            }

            // Check allowed methods
            if (options.allowedMethods && !options.allowedMethods.includes(req.method || '')) {
                const error = errorHandler.createError(
                    ErrorCode.OPERATION_NOT_ALLOWED,
                    `Method ${req.method} not allowed`
                );
                return res.status(405).json(createErrorResponse(error));
            }

            // CORS headers
            if (options.cors) {
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

                if (req.method === 'OPTIONS') {
                    return res.status(200).end();
                }
            }

            // Execute handler
            await handler(req, res);

            // Log response time
            const duration = Date.now() - startTime;
            logger.perf(`${req.method} ${req.url}`, duration, {
                status: res.statusCode
            });

        } catch (error) {
            // Handle error
            const { error: appError } = errorHandler.handle(
                error,
                `API:${req.url}`,
                { method: req.method, query: req.query }
            );

            // Send error response
            if (!res.headersSent) {
                const statusCode = appError.httpStatus || 500;
                res.status(statusCode).json(createErrorResponse(appError));
            }

            // Log duration even on error
            const duration = Date.now() - startTime;
            logger.perf(`${req.method} ${req.url} (ERROR)`, duration);

        } finally {
            logger.clearContext();
        }
    };
}

// ============================================
// Specialized Handlers
// ============================================

/**
 * Handler للعمليات CRUD
 */
export function createCrudHandler(handlers: {
    get?: NextApiHandler;
    post?: NextApiHandler;
    put?: NextApiHandler;
    patch?: NextApiHandler;
    delete?: NextApiHandler;
}): NextApiHandler {
    return withErrorHandling(async (req, res) => {
        const method = req.method?.toLowerCase() as keyof typeof handlers;
        const handler = handlers[method];

        if (!handler) {
            const error = errorHandler.createError(
                ErrorCode.OPERATION_NOT_ALLOWED,
                `Method ${req.method} not supported`
            );
            return res.status(405).json(createErrorResponse(error));
        }

        await handler(req, res);
    }, {
        allowedMethods: Object.keys(handlers).map(m => m.toUpperCase())
    });
}

/**
 * Handler مع التحقق من المصادقة
 */
export function withAuth(
    handler: NextApiHandler,
    options: { roles?: string[]; } = {}
): NextApiHandler {
    return withErrorHandling(async (req: ExtendedNextApiRequest, res) => {
        // Check authentication
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            const error = errorHandler.createError(ErrorCode.UNAUTHORIZED);
            return res.status(401).json(createErrorResponse(error));
        }

        // Verify token (simplified - use your actual auth logic)
        const token = authHeader.substring(7);
        const user = await verifyToken(token);

        if (!user) {
            const error = errorHandler.createError(ErrorCode.INVALID_CREDENTIALS);
            return res.status(401).json(createErrorResponse(error));
        }

        // Check roles
        if (options.roles && !options.roles.includes(user.role)) {
            const error = errorHandler.createError(ErrorCode.FORBIDDEN);
            return res.status(403).json(createErrorResponse(error));
        }

        // Attach user to request
        req.user = user;
        logger.setContext({ userId: user.id });

        await handler(req, res);
    }, { requireAuth: true });
}

/**
 * Handler مع التحقق من الصحة
 */
export function withValidation<T>(
    handler: (req: ExtendedNextApiRequest, res: NextApiResponse, validatedBody: T) => Promise<void>,
    validator: (body: unknown) => { success: boolean; data?: T; errors?: string[]; }
): NextApiHandler {
    return withErrorHandling(async (req, res) => {
        const result = validator(req.body);

        if (!result.success) {
            const error = errorHandler.createError(
                ErrorCode.VALIDATION_ERROR,
                result.errors?.join(', ')
            );
            return res.status(400).json(createErrorResponse(error));
        }

        await handler(req, res, result.data!);
    });
}

// ============================================
// Utility Functions
// ============================================

function generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getClientIP(req: NextApiRequest): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
        return forwarded.split(',')[0].trim();
    }
    return req.socket?.remoteAddress || 'unknown';
}

async function verifyToken(token: string): Promise<{ id: string; role: string; } | null> {
    // Simplified - replace with your actual JWT verification
    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
        return decoded as { id: string; role: string; };
    } catch {
        return null;
    }
}

// ============================================
// Response Helpers
// ============================================

export function sendSuccess<T>(res: NextApiResponse, data: T, status = 200) {
    res.status(status).json(createSuccessResponse(data));
}

export function sendError(res: NextApiResponse, error: AppError) {
    res.status(error.httpStatus || 500).json(createErrorResponse(error));
}

export function sendNotFound(res: NextApiResponse, message?: string) {
    const error = errorHandler.createError(ErrorCode.NOT_FOUND, message);
    sendError(res, error);
}

export function sendUnauthorized(res: NextApiResponse, message?: string) {
    const error = errorHandler.createError(ErrorCode.UNAUTHORIZED, message);
    sendError(res, error);
}

export function sendValidationError(res: NextApiResponse, errors: string[]) {
    const error = errorHandler.createError(ErrorCode.VALIDATION_ERROR, errors.join(', '));
    sendError(res, error);
}

// ============================================
// Export
// ============================================

export default {
    withErrorHandling,
    createCrudHandler,
    withAuth,
    withValidation,
    sendSuccess,
    sendError,
    sendNotFound,
    sendUnauthorized,
    sendValidationError
};

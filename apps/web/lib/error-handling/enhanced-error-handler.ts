/**
 * Enhanced Error Handler
 */

export interface EnhancedError extends Error {
    code?: string;
    statusCode?: number;
    details?: unknown;
}

export function enhanceError(error: Error, code?: string, statusCode?: number): EnhancedError {
    const enhanced = error as EnhancedError;
    enhanced.code = code;
    enhanced.statusCode = statusCode;
    return enhanced;
}

export function handleApiError(error: unknown): { status: number; message: string; } {
    if (error instanceof Error) {
        const enhanced = error as EnhancedError;
        return {
            status: enhanced.statusCode || 500,
            message: enhanced.message,
        };
    }
    return { status: 500, message: 'حدث خطأ غير متوقع' };
}

export default { enhanceError, handleApiError };

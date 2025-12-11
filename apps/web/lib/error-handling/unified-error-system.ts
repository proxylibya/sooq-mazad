/**
 * نظام معالجة الأخطاء الموحد
 */

export interface UnifiedError {
    code: string;
    message: string;
    details?: unknown;
    timestamp: Date;
}

export function createError(code: string, message: string, details?: unknown): UnifiedError {
    return { code, message, details, timestamp: new Date() };
}

export function handleError(error: unknown): UnifiedError {
    if (error instanceof Error) {
        return createError('ERROR', error.message, { stack: error.stack });
    }
    return createError('UNKNOWN', 'حدث خطأ غير معروف', error);
}

export function logError(error: UnifiedError): void {
    console.error(`[${error.timestamp.toISOString()}] [${error.code}] ${error.message}`);
}

export default { createError, handleError, logError };

/**
 * معالج الأخطاء المتقدم
 * Advanced Error Handler
 */

// أنواع الأخطاء
export enum ErrorType {
    NETWORK = 'NETWORK',
    VALIDATION = 'VALIDATION',
    AUTHENTICATION = 'AUTHENTICATION',
    AUTHORIZATION = 'AUTHORIZATION',
    NOT_FOUND = 'NOT_FOUND',
    DATABASE = 'DATABASE',
    TIMEOUT = 'TIMEOUT',
    EXTERNAL_SERVICE = 'EXTERNAL_SERVICE',
    RATE_LIMIT = 'RATE_LIMIT',
    SERVER = 'SERVER',
    UNKNOWN = 'UNKNOWN',
}

// مستويات خطورة الأخطاء
export enum ErrorSeverity {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL',
}

// واجهة الخطأ المخصص
export interface CustomError extends Error {
    type: ErrorType;
    severity: ErrorSeverity;
    code?: string;
    statusCode?: number;
    details?: Record<string, unknown>;
    timestamp: Date;
    retryable: boolean;
}

// إنشاء خطأ مخصص
export function createError(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    options: Partial<Omit<CustomError, 'message' | 'name' | 'type'>> = {}
): CustomError {
    const error = new Error(message) as CustomError;
    error.name = 'CustomError';
    error.type = type;
    error.severity = options.severity || ErrorSeverity.MEDIUM;
    error.code = options.code;
    error.statusCode = options.statusCode;
    error.details = options.details;
    error.timestamp = new Date();
    error.retryable = options.retryable ?? isRetryableErrorType(type);
    return error;
}

// تحديد ما إذا كان نوع الخطأ قابل لإعادة المحاولة
function isRetryableErrorType(type: ErrorType): boolean {
    const retryableTypes = [
        ErrorType.NETWORK,
        ErrorType.TIMEOUT,
        ErrorType.EXTERNAL_SERVICE,
        ErrorType.DATABASE,
        ErrorType.RATE_LIMIT,
    ];
    return retryableTypes.includes(type);
}

// معالجة الخطأ وتسجيله
export function handleError(error: unknown): CustomError {
    if (isCustomError(error)) {
        logError(error);
        return error;
    }

    const customError = convertToCustomError(error);
    logError(customError);
    return customError;
}

// تحويل أي خطأ إلى خطأ مخصص
function convertToCustomError(error: unknown): CustomError {
    if (error instanceof Error) {
        return createError(error.message, determineErrorType(error), {
            details: { originalError: error.name, stack: error.stack },
        });
    }

    if (typeof error === 'string') {
        return createError(error);
    }

    return createError('حدث خطأ غير معروف', ErrorType.UNKNOWN);
}

// تحديد نوع الخطأ من رسالته
function determineErrorType(error: Error): ErrorType {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch')) {
        return ErrorType.NETWORK;
    }
    if (message.includes('timeout') || message.includes('timed out')) {
        return ErrorType.TIMEOUT;
    }
    if (message.includes('database') || message.includes('prisma')) {
        return ErrorType.DATABASE;
    }
    if (message.includes('unauthorized') || message.includes('authentication')) {
        return ErrorType.AUTHENTICATION;
    }
    if (message.includes('forbidden') || message.includes('authorization')) {
        return ErrorType.AUTHORIZATION;
    }
    if (message.includes('not found') || message.includes('404')) {
        return ErrorType.NOT_FOUND;
    }
    if (message.includes('validation') || message.includes('invalid')) {
        return ErrorType.VALIDATION;
    }
    if (message.includes('rate limit') || message.includes('too many')) {
        return ErrorType.RATE_LIMIT;
    }

    return ErrorType.UNKNOWN;
}

// التحقق من أن الخطأ هو خطأ مخصص
function isCustomError(error: unknown): error is CustomError {
    return (
        error instanceof Error &&
        'type' in error &&
        'severity' in error &&
        'timestamp' in error
    );
}

// تسجيل الخطأ
function logError(error: CustomError): void {
    const logLevel = getLogLevel(error.severity);
    const logMessage = formatErrorLog(error);

    switch (logLevel) {
        case 'error':
            console.error(logMessage);
            break;
        case 'warn':
            console.warn(logMessage);
            break;
        default:
            console.log(logMessage);
    }
}

// تحديد مستوى التسجيل
function getLogLevel(severity: ErrorSeverity): 'error' | 'warn' | 'log' {
    switch (severity) {
        case ErrorSeverity.CRITICAL:
        case ErrorSeverity.HIGH:
            return 'error';
        case ErrorSeverity.MEDIUM:
            return 'warn';
        default:
            return 'log';
    }
}

// تنسيق رسالة التسجيل
function formatErrorLog(error: CustomError): string {
    return `[${error.timestamp.toISOString()}] [${error.severity}] [${error.type}] ${error.message}`;
}

/**
 * AppError class for structured errors
 */
export class AppError extends Error {
    type: ErrorType;
    code: string;
    internalMessage: string;
    userMessage: string;
    statusCode: number;
    severity: ErrorSeverity;
    details?: Record<string, unknown>;
    suggestions?: string[];

    constructor(
        type: ErrorType,
        code: string,
        internalMessage: string,
        userMessage: string,
        statusCode: number = 500,
        severity: ErrorSeverity = ErrorSeverity.MEDIUM,
        details?: Record<string, unknown>,
        suggestions?: string[]
    ) {
        super(userMessage);
        this.type = type;
        this.code = code;
        this.internalMessage = internalMessage;
        this.userMessage = userMessage;
        this.statusCode = statusCode;
        this.severity = severity;
        this.details = details;
        this.suggestions = suggestions;
    }
}

/**
 * AdvancedErrorHandler class
 */
export class AdvancedErrorHandler {
    private requestId: string;

    constructor(requestId?: string) {
        this.requestId = requestId || `req_${Date.now()}`;
    }

    handleError(error: unknown, source: string, res: any): void {
        const customError = error instanceof AppError ? error : handleError(error);
        const statusCode = (customError as any).statusCode || 500;
        const message = customError.message || 'حدث خطأ غير متوقع';

        console.error(`[${this.requestId}] [${source}]`, error);

        res.status(statusCode).json({
            success: false,
            error: message,
            requestId: this.requestId,
        });
    }
}

/**
 * Helper functions
 */
export function createValidationError(internalMessage: string, userMessage: string): AppError {
    return new AppError(
        ErrorType.VALIDATION,
        'VALIDATION_ERROR',
        internalMessage,
        userMessage,
        400,
        ErrorSeverity.LOW
    );
}

export function createNotFoundError(resource: string, id: string): AppError {
    return new AppError(
        ErrorType.NOT_FOUND,
        'NOT_FOUND',
        `${resource} with id ${id} not found`,
        `${resource} غير موجود`,
        404,
        ErrorSeverity.LOW
    );
}

/**
 * Middleware wrapper for API handlers
 */
export function errorHandlerMiddleware(handler: any) {
    return async (req: any, res: any) => {
        try {
            await handler(req, res);
        } catch (error) {
            const errorHandler = new AdvancedErrorHandler(req.headers?.['x-request-id']);
            errorHandler.handleError(error, 'API', res);
        }
    };
}

export default {
    ErrorType,
    ErrorSeverity,
    createError,
    handleError,
    AppError,
    AdvancedErrorHandler,
    createValidationError,
    createNotFoundError,
    errorHandlerMiddleware,
};

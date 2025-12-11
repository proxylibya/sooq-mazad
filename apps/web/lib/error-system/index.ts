// @ts-nocheck
/**
 * ============================================
 * 🔴 Enterprise Unified Error & Logging System
 * نظام الأخطاء والتسجيل الموحد العالمي
 * ============================================
 * 
 * هذا الملف هو النقطة المركزية الوحيدة لـ:
 * - Error Handling
 * - Logging  
 * - Recovery
 * - Monitoring
 * 
 * جميع الملفات الأخرى يجب أن تستورد من هنا فقط
 */

// ============================================
// 1. Types & Interfaces
// ============================================

export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    FATAL = 4
}

export enum ErrorCode {
    // Network Errors (1xxx)
    NETWORK_ERROR = 'E1001',
    TIMEOUT_ERROR = 'E1002',
    CONNECTION_REFUSED = 'E1003',

    // Auth Errors (2xxx)
    UNAUTHORIZED = 'E2001',
    FORBIDDEN = 'E2002',
    TOKEN_EXPIRED = 'E2003',
    INVALID_CREDENTIALS = 'E2004',
    SESSION_EXPIRED = 'E2005',

    // Validation Errors (3xxx)
    VALIDATION_ERROR = 'E3001',
    INVALID_INPUT = 'E3002',
    MISSING_FIELD = 'E3003',
    INVALID_FORMAT = 'E3004',

    // Resource Errors (4xxx)
    NOT_FOUND = 'E4001',
    ALREADY_EXISTS = 'E4002',
    RESOURCE_LOCKED = 'E4003',
    RESOURCE_DELETED = 'E4004',

    // Server Errors (5xxx)
    INTERNAL_ERROR = 'E5001',
    DATABASE_ERROR = 'E5002',
    SERVICE_UNAVAILABLE = 'E5003',
    RATE_LIMITED = 'E5004',

    // Business Errors (6xxx)
    INSUFFICIENT_FUNDS = 'E6001',
    AUCTION_ENDED = 'E6002',
    BID_TOO_LOW = 'E6003',
    OPERATION_NOT_ALLOWED = 'E6004',

    // Unknown
    UNKNOWN = 'E9999'
}

export interface AppError {
    code: ErrorCode;
    message: string;
    messageAr: string;
    details?: string;
    stack?: string;
    timestamp: Date;
    context?: Record<string, unknown>;
    recoverable: boolean;
    httpStatus?: number;
}

export interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: Date;
    context?: Record<string, unknown>;
    error?: AppError;
    userId?: string;
    sessionId?: string;
    requestId?: string;
    source?: string;
}

export interface RecoveryAction {
    type: 'retry' | 'redirect' | 'refresh' | 'logout' | 'notify' | 'ignore';
    delay?: number;
    maxAttempts?: number;
    targetUrl?: string;
    message?: string;
}

// ============================================
// 2. Error Messages (Arabic)
// ============================================

export const ErrorMessagesAr: Record<ErrorCode, string> = {
    // Network
    [ErrorCode.NETWORK_ERROR]: 'خطأ في الاتصال بالشبكة',
    [ErrorCode.TIMEOUT_ERROR]: 'انتهى وقت الانتظار',
    [ErrorCode.CONNECTION_REFUSED]: 'تعذر الاتصال بالخادم',

    // Auth
    [ErrorCode.UNAUTHORIZED]: 'يجب تسجيل الدخول أولاً',
    [ErrorCode.FORBIDDEN]: 'ليس لديك صلاحية للقيام بهذا الإجراء',
    [ErrorCode.TOKEN_EXPIRED]: 'انتهت صلاحية الجلسة',
    [ErrorCode.INVALID_CREDENTIALS]: 'بيانات الدخول غير صحيحة',
    [ErrorCode.SESSION_EXPIRED]: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى',

    // Validation
    [ErrorCode.VALIDATION_ERROR]: 'البيانات المدخلة غير صحيحة',
    [ErrorCode.INVALID_INPUT]: 'المدخلات غير صالحة',
    [ErrorCode.MISSING_FIELD]: 'حقل مطلوب مفقود',
    [ErrorCode.INVALID_FORMAT]: 'التنسيق غير صحيح',

    // Resource
    [ErrorCode.NOT_FOUND]: 'العنصر المطلوب غير موجود',
    [ErrorCode.ALREADY_EXISTS]: 'العنصر موجود مسبقاً',
    [ErrorCode.RESOURCE_LOCKED]: 'العنصر مقفل حالياً',
    [ErrorCode.RESOURCE_DELETED]: 'تم حذف هذا العنصر',

    // Server
    [ErrorCode.INTERNAL_ERROR]: 'خطأ داخلي في الخادم',
    [ErrorCode.DATABASE_ERROR]: 'خطأ في قاعدة البيانات',
    [ErrorCode.SERVICE_UNAVAILABLE]: 'الخدمة غير متاحة حالياً',
    [ErrorCode.RATE_LIMITED]: 'تم تجاوز الحد المسموح، حاول مرة أخرى لاحقاً',

    // Business
    [ErrorCode.INSUFFICIENT_FUNDS]: 'الرصيد غير كافي',
    [ErrorCode.AUCTION_ENDED]: 'انتهى المزاد',
    [ErrorCode.BID_TOO_LOW]: 'المزايدة أقل من الحد الأدنى',
    [ErrorCode.OPERATION_NOT_ALLOWED]: 'هذه العملية غير مسموحة',

    // Unknown
    [ErrorCode.UNKNOWN]: 'حدث خطأ غير متوقع'
};

export const ErrorMessagesEn: Record<ErrorCode, string> = {
    [ErrorCode.NETWORK_ERROR]: 'Network error',
    [ErrorCode.TIMEOUT_ERROR]: 'Request timeout',
    [ErrorCode.CONNECTION_REFUSED]: 'Connection refused',
    [ErrorCode.UNAUTHORIZED]: 'Authentication required',
    [ErrorCode.FORBIDDEN]: 'Access denied',
    [ErrorCode.TOKEN_EXPIRED]: 'Token expired',
    [ErrorCode.INVALID_CREDENTIALS]: 'Invalid credentials',
    [ErrorCode.SESSION_EXPIRED]: 'Session expired',
    [ErrorCode.VALIDATION_ERROR]: 'Validation error',
    [ErrorCode.INVALID_INPUT]: 'Invalid input',
    [ErrorCode.MISSING_FIELD]: 'Required field missing',
    [ErrorCode.INVALID_FORMAT]: 'Invalid format',
    [ErrorCode.NOT_FOUND]: 'Resource not found',
    [ErrorCode.ALREADY_EXISTS]: 'Already exists',
    [ErrorCode.RESOURCE_LOCKED]: 'Resource locked',
    [ErrorCode.RESOURCE_DELETED]: 'Resource deleted',
    [ErrorCode.INTERNAL_ERROR]: 'Internal server error',
    [ErrorCode.DATABASE_ERROR]: 'Database error',
    [ErrorCode.SERVICE_UNAVAILABLE]: 'Service unavailable',
    [ErrorCode.RATE_LIMITED]: 'Rate limit exceeded',
    [ErrorCode.INSUFFICIENT_FUNDS]: 'Insufficient funds',
    [ErrorCode.AUCTION_ENDED]: 'Auction ended',
    [ErrorCode.BID_TOO_LOW]: 'Bid too low',
    [ErrorCode.OPERATION_NOT_ALLOWED]: 'Operation not allowed',
    [ErrorCode.UNKNOWN]: 'Unknown error'
};

// ============================================
// 3. Recovery Strategies
// ============================================

export const RecoveryStrategies: Record<ErrorCode, RecoveryAction> = {
    [ErrorCode.NETWORK_ERROR]: { type: 'retry', delay: 2000, maxAttempts: 3 },
    [ErrorCode.TIMEOUT_ERROR]: { type: 'retry', delay: 3000, maxAttempts: 2 },
    [ErrorCode.CONNECTION_REFUSED]: { type: 'notify', message: 'الخادم غير متاح حالياً' },
    [ErrorCode.UNAUTHORIZED]: { type: 'redirect', targetUrl: '/login' },
    [ErrorCode.FORBIDDEN]: { type: 'notify', message: 'ليس لديك صلاحية' },
    [ErrorCode.TOKEN_EXPIRED]: { type: 'refresh' },
    [ErrorCode.INVALID_CREDENTIALS]: { type: 'notify', message: 'بيانات خاطئة' },
    [ErrorCode.SESSION_EXPIRED]: { type: 'logout' },
    [ErrorCode.VALIDATION_ERROR]: { type: 'notify' },
    [ErrorCode.INVALID_INPUT]: { type: 'notify' },
    [ErrorCode.MISSING_FIELD]: { type: 'notify' },
    [ErrorCode.INVALID_FORMAT]: { type: 'notify' },
    [ErrorCode.NOT_FOUND]: { type: 'redirect', targetUrl: '/404' },
    [ErrorCode.ALREADY_EXISTS]: { type: 'notify' },
    [ErrorCode.RESOURCE_LOCKED]: { type: 'retry', delay: 5000, maxAttempts: 2 },
    [ErrorCode.RESOURCE_DELETED]: { type: 'redirect', targetUrl: '/' },
    [ErrorCode.INTERNAL_ERROR]: { type: 'retry', delay: 2000, maxAttempts: 2 },
    [ErrorCode.DATABASE_ERROR]: { type: 'retry', delay: 3000, maxAttempts: 2 },
    [ErrorCode.SERVICE_UNAVAILABLE]: { type: 'retry', delay: 5000, maxAttempts: 3 },
    [ErrorCode.RATE_LIMITED]: { type: 'retry', delay: 10000, maxAttempts: 1 },
    [ErrorCode.INSUFFICIENT_FUNDS]: { type: 'notify' },
    [ErrorCode.AUCTION_ENDED]: { type: 'notify' },
    [ErrorCode.BID_TOO_LOW]: { type: 'notify' },
    [ErrorCode.OPERATION_NOT_ALLOWED]: { type: 'notify' },
    [ErrorCode.UNKNOWN]: { type: 'notify' }
};

// ============================================
// 4. Unified Logger Class
// ============================================

class UnifiedLogger {
    private static instance: UnifiedLogger;
    private logs: LogEntry[] = [];
    private maxLogs = 1000;
    private isProduction = (process as any).env.NODE_ENV === 'production';
    private minLevel: LogLevel;
    private context: { userId?: string; sessionId?: string; requestId?: string; } = {};

    private constructor() {
        this.minLevel = this.isProduction ? LogLevel.INFO : LogLevel.DEBUG;
    }

    static getInstance(): UnifiedLogger {
        if (!UnifiedLogger.instance) {
            UnifiedLogger.instance = new UnifiedLogger();
        }
        return UnifiedLogger.instance;
    }

    setContext(ctx: { userId?: string; sessionId?: string; requestId?: string; }) {
        this.context = { ...this.context, ...ctx };
    }

    clearContext() {
        this.context = {};
    }

    private shouldLog(level: LogLevel): boolean {
        return level >= this.minLevel;
    }

    private createEntry(level: LogLevel, message: string, context?: Record<string, unknown>, error?: AppError): LogEntry {
        return {
            level,
            message,
            timestamp: new Date(),
            context,
            error,
            ...this.context
        };
    }

    private formatForConsole(entry: LogEntry): string {
        const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'];
        const timestamp = entry.timestamp.toISOString();
        const level = levelNames[entry.level];
        const ctx = entry.context ? ` | ${JSON.stringify(entry.context)}` : '';
        return `[${timestamp}] [${level}] ${entry.message}${ctx}`;
    }

    private addToHistory(entry: LogEntry) {
        this.logs.push(entry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
    }

    private output(entry: LogEntry) {
        if (!this.shouldLog(entry.level)) return;

        this.addToHistory(entry);
        const formatted = this.formatForConsole(entry);

        switch (entry.level) {
            case LogLevel.DEBUG:
                console.debug(formatted);
                break;
            case LogLevel.INFO:
                console.info(formatted);
                break;
            case LogLevel.WARN:
                console.warn(formatted);
                break;
            case LogLevel.ERROR:
            case LogLevel.FATAL:
                console.error(formatted);
                if (entry.error?.stack) {
                    console.error(entry.error.stack);
                }
                break;
        }
    }

    debug(message: string, context?: Record<string, unknown>) {
        this.output(this.createEntry(LogLevel.DEBUG, message, context));
    }

    info(message: string, context?: Record<string, unknown>) {
        this.output(this.createEntry(LogLevel.INFO, message, context));
    }

    warn(message: string, context?: Record<string, unknown>) {
        this.output(this.createEntry(LogLevel.WARN, message, context));
    }

    error(message: string, error?: Error | AppError | unknown, context?: Record<string, unknown>) {
        const appError = this.normalizeError(error);
        this.output(this.createEntry(LogLevel.ERROR, message, context, appError));
    }

    fatal(message: string, error?: Error | AppError | unknown, context?: Record<string, unknown>) {
        const appError = this.normalizeError(error);
        this.output(this.createEntry(LogLevel.FATAL, message, context, appError));
    }

    private normalizeError(error?: Error | AppError | unknown): AppError | undefined {
        if (!error) return undefined;

        if ((error as AppError).code) {
            return error as AppError;
        }

        if (error instanceof Error) {
            return {
                code: ErrorCode.UNKNOWN,
                message: error.message,
                messageAr: ErrorMessagesAr[ErrorCode.UNKNOWN],
                stack: error.stack,
                timestamp: new Date(),
                recoverable: true
            };
        }

        return {
            code: ErrorCode.UNKNOWN,
            message: String(error),
            messageAr: ErrorMessagesAr[ErrorCode.UNKNOWN],
            timestamp: new Date(),
            recoverable: true
        };
    }

    getLogs(level?: LogLevel, limit = 100): LogEntry[] {
        let filtered = this.logs;
        if (level !== undefined) {
            filtered = filtered.filter(l => l.level >= level);
        }
        return filtered.slice(-limit);
    }

    clearLogs() {
        this.logs = [];
    }

    // Shortcuts
    api(action: string, details?: Record<string, unknown>) {
        this.info(`[API] ${action}`, details);
    }

    db(action: string, details?: Record<string, unknown>) {
        this.debug(`[DB] ${action}`, details);
    }

    auth(action: string, details?: Record<string, unknown>) {
        this.info(`[AUTH] ${action}`, details);
    }

    perf(action: string, durationMs: number, details?: Record<string, unknown>) {
        this.debug(`[PERF] ${action}`, { ...details, durationMs });
    }
}

// ============================================
// 5. Error Handler Class
// ============================================

class UnifiedErrorHandler {
    private static instance: UnifiedErrorHandler;
    private logger = UnifiedLogger.getInstance();
    private errorHistory: AppError[] = [];
    private maxHistory = 100;
    private retryCounters = new Map<string, number>();

    private constructor() { }

    static getInstance(): UnifiedErrorHandler {
        if (!UnifiedErrorHandler.instance) {
            UnifiedErrorHandler.instance = new UnifiedErrorHandler();
        }
        return UnifiedErrorHandler.instance;
    }

    /**
     * Create standardized AppError
     */
    createError(
        code: ErrorCode,
        details?: string,
        context?: Record<string, unknown>
    ): AppError {
        return {
            code,
            message: ErrorMessagesEn[code],
            messageAr: ErrorMessagesAr[code],
            details,
            timestamp: new Date(),
            context,
            recoverable: this.isRecoverable(code),
            httpStatus: this.getHttpStatus(code)
        };
    }

    /**
     * Parse error from various sources
     */
    parseError(error: unknown): AppError {
        // Already AppError
        if ((error as AppError).code && (error as AppError).messageAr) {
            return error as AppError;
        }

        // HTTP Response error
        if ((error as any)?.response?.status) {
            return this.fromHttpStatus((error as any).response.status, (error as any).response.data?.message);
        }

        // Fetch error
        if (error instanceof TypeError && error.message.includes('fetch')) {
            return this.createError(ErrorCode.NETWORK_ERROR, error.message);
        }

        // Standard Error
        if (error instanceof Error) {
            // Check for known patterns
            if (error.message.includes('401') || error.message.toLowerCase().includes('unauthorized')) {
                return this.createError(ErrorCode.UNAUTHORIZED, error.message);
            }
            if (error.message.includes('403') || error.message.toLowerCase().includes('forbidden')) {
                return this.createError(ErrorCode.FORBIDDEN, error.message);
            }
            if (error.message.includes('404') || error.message.toLowerCase().includes('not found')) {
                return this.createError(ErrorCode.NOT_FOUND, error.message);
            }
            if (error.message.includes('500')) {
                return this.createError(ErrorCode.INTERNAL_ERROR, error.message);
            }
            if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
                return this.createError(ErrorCode.TIMEOUT_ERROR, error.message);
            }

            return {
                code: ErrorCode.UNKNOWN,
                message: error.message,
                messageAr: ErrorMessagesAr[ErrorCode.UNKNOWN],
                stack: error.stack,
                timestamp: new Date(),
                recoverable: true
            };
        }

        // Unknown
        return this.createError(ErrorCode.UNKNOWN, String(error));
    }

    /**
     * Convert HTTP status to ErrorCode
     */
    fromHttpStatus(status: number, details?: string): AppError {
        const codeMap: Record<number, ErrorCode> = {
            400: ErrorCode.VALIDATION_ERROR,
            401: ErrorCode.UNAUTHORIZED,
            403: ErrorCode.FORBIDDEN,
            404: ErrorCode.NOT_FOUND,
            409: ErrorCode.ALREADY_EXISTS,
            422: ErrorCode.INVALID_INPUT,
            429: ErrorCode.RATE_LIMITED,
            500: ErrorCode.INTERNAL_ERROR,
            502: ErrorCode.SERVICE_UNAVAILABLE,
            503: ErrorCode.SERVICE_UNAVAILABLE,
            504: ErrorCode.TIMEOUT_ERROR
        };

        const code = codeMap[status] || ErrorCode.UNKNOWN;
        return this.createError(code, details);
    }

    /**
     * Get HTTP status from ErrorCode
     */
    getHttpStatus(code: ErrorCode): number {
        const statusMap: Record<ErrorCode, number> = {
            [ErrorCode.NETWORK_ERROR]: 0,
            [ErrorCode.TIMEOUT_ERROR]: 504,
            [ErrorCode.CONNECTION_REFUSED]: 502,
            [ErrorCode.UNAUTHORIZED]: 401,
            [ErrorCode.FORBIDDEN]: 403,
            [ErrorCode.TOKEN_EXPIRED]: 401,
            [ErrorCode.INVALID_CREDENTIALS]: 401,
            [ErrorCode.SESSION_EXPIRED]: 401,
            [ErrorCode.VALIDATION_ERROR]: 400,
            [ErrorCode.INVALID_INPUT]: 422,
            [ErrorCode.MISSING_FIELD]: 400,
            [ErrorCode.INVALID_FORMAT]: 400,
            [ErrorCode.NOT_FOUND]: 404,
            [ErrorCode.ALREADY_EXISTS]: 409,
            [ErrorCode.RESOURCE_LOCKED]: 423,
            [ErrorCode.RESOURCE_DELETED]: 410,
            [ErrorCode.INTERNAL_ERROR]: 500,
            [ErrorCode.DATABASE_ERROR]: 500,
            [ErrorCode.SERVICE_UNAVAILABLE]: 503,
            [ErrorCode.RATE_LIMITED]: 429,
            [ErrorCode.INSUFFICIENT_FUNDS]: 402,
            [ErrorCode.AUCTION_ENDED]: 400,
            [ErrorCode.BID_TOO_LOW]: 400,
            [ErrorCode.OPERATION_NOT_ALLOWED]: 403,
            [ErrorCode.UNKNOWN]: 500
        };

        return statusMap[code] || 500;
    }

    /**
     * Check if error is recoverable
     */
    isRecoverable(code: ErrorCode): boolean {
        const nonRecoverable = [
            ErrorCode.FORBIDDEN,
            ErrorCode.NOT_FOUND,
            ErrorCode.RESOURCE_DELETED,
            ErrorCode.OPERATION_NOT_ALLOWED
        ];
        return !nonRecoverable.includes(code);
    }

    /**
     * Get recovery action for error
     */
    getRecoveryAction(code: ErrorCode): RecoveryAction {
        return RecoveryStrategies[code] || { type: 'notify' };
    }

    /**
     * Handle error with logging and recovery
     */
    handle(
        error: unknown,
        source: string,
        context?: Record<string, unknown>
    ): { error: AppError; recovery: RecoveryAction; } {
        const appError = this.parseError(error);
        appError.context = { ...appError.context, ...context, source };

        // Log
        this.logger.error(`[${source}] ${appError.messageAr}`, appError, context);

        // Add to history
        this.errorHistory.push(appError);
        if (this.errorHistory.length > this.maxHistory) {
            this.errorHistory.shift();
        }

        // Get recovery
        const recovery = this.getRecoveryAction(appError.code);

        return { error: appError, recovery };
    }

    /**
     * Handle with automatic retry
     */
    async handleWithRetry<T>(
        operation: () => Promise<T>,
        operationId: string,
        maxAttempts = 3,
        delayMs = 1000
    ): Promise<T> {
        const currentCount = this.retryCounters.get(operationId) || 0;

        try {
            const result = await operation();
            this.retryCounters.delete(operationId);
            return result;
        } catch (error) {
            const appError = this.parseError(error);

            if (currentCount < maxAttempts && appError.recoverable) {
                this.retryCounters.set(operationId, currentCount + 1);
                this.logger.warn(`Retry ${currentCount + 1}/${maxAttempts} for ${operationId}`, { error: appError.message });

                await new Promise(resolve => setTimeout(resolve, delayMs * (currentCount + 1)));
                return this.handleWithRetry(operation, operationId, maxAttempts, delayMs);
            }

            this.retryCounters.delete(operationId);
            throw appError;
        }
    }

    /**
     * Get error statistics
     */
    getStats(): { total: number; byCode: Record<string, number>; recent: AppError[]; } {
        const byCode: Record<string, number> = {};

        this.errorHistory.forEach(err => {
            byCode[err.code] = (byCode[err.code] || 0) + 1;
        });

        return {
            total: this.errorHistory.length,
            byCode,
            recent: this.errorHistory.slice(-10)
        };
    }

    clearHistory() {
        this.errorHistory = [];
    }
}

// ============================================
// 6. API Response Helper
// ============================================

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: {
        code: ErrorCode;
        message: string;
        messageAr: string;
        details?: string;
    };
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        timestamp: string;
    };
}

export function createSuccessResponse<T>(data: T, meta?: Partial<ApiResponse['meta']>): ApiResponse<T> {
    return {
        success: true,
        data,
        meta: {
            ...meta,
            timestamp: new Date().toISOString()
        }
    };
}

export function createErrorResponse(error: AppError): ApiResponse {
    return {
        success: false,
        error: {
            code: error.code,
            message: error.message,
            messageAr: error.messageAr,
            details: (process as any).env.NODE_ENV === 'development' ? error.details : undefined
        },
        meta: {
            timestamp: new Date().toISOString()
        }
    };
}

// ============================================
// 7. Singleton Exports
// ============================================

export const logger = UnifiedLogger.getInstance();
export const errorHandler = UnifiedErrorHandler.getInstance();

// ============================================
// 8. Convenience Functions
// ============================================

export function logError(message: string, error?: unknown, context?: Record<string, unknown>) {
    logger.error(message, error, context);
}

export function logInfo(message: string, context?: Record<string, unknown>) {
    logger.info(message, context);
}

export function logWarn(message: string, context?: Record<string, unknown>) {
    logger.warn(message, context);
}

export function logDebug(message: string, context?: Record<string, unknown>) {
    logger.debug(message, context);
}

export function handleError(error: unknown, source: string, context?: Record<string, unknown>) {
    return errorHandler.handle(error, source, context);
}

export function createAppError(code: ErrorCode, details?: string, context?: Record<string, unknown>) {
    return errorHandler.createError(code, details, context);
}

// ============================================
// 9. React Error Boundary Helper
// ============================================

export function captureException(error: Error, componentStack?: string) {
    logger.fatal('React Error Boundary', error, { componentStack });

    // In production, you might send to external service
    if ((process as any).env.NODE_ENV === 'production') {
        // sendToSentry(error, componentStack);
    }
}

// ============================================
// 10. Default Export
// ============================================

// ============================================
// 11. Re-exports from submodules
// ============================================

// API Middleware (lazy import to avoid circular deps)
export const getApiMiddleware = () => import('./api-middleware');

// React Error Boundary (lazy import)
export const getErrorBoundary = () => import('./react-error-boundary');

// ============================================
// 12. Default Export
// ============================================

export default {
    logger,
    errorHandler,
    LogLevel,
    ErrorCode,
    ErrorMessagesAr,
    ErrorMessagesEn,
    RecoveryStrategies,
    createSuccessResponse,
    createErrorResponse,
    logError,
    logInfo,
    logWarn,
    logDebug,
    handleError,
    createAppError,
    captureException
};

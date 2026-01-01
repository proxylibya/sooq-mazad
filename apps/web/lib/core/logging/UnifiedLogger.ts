/**
 * نظام التسجيل الموحد
 * Unified Logging System
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
    service?: string;
    action?: string;
    userId?: string;
    requestId?: string;
    [key: string]: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

class UnifiedLoggerClass {
    private level: LogLevel = 'info';
    private defaultContext: LogContext = {};

    constructor() {
        this.level = (process.env.LOG_LEVEL as LogLevel) || 'info';
    }

    setLevel(level: LogLevel): void {
        this.level = level;
    }

    setDefaultContext(context: LogContext): void {
        this.defaultContext = context;
    }

    private shouldLog(level: LogLevel): boolean {
        return LOG_LEVELS[level] >= LOG_LEVELS[this.level];
    }

    private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
        const timestamp = new Date().toISOString();
        const ctx = { ...this.defaultContext, ...context };
        const ctxStr = Object.keys(ctx).length > 0 ? ` | ${JSON.stringify(ctx)}` : '';
        return `[${timestamp}] [${level.toUpperCase()}] ${message}${ctxStr}`;
    }

    debug(message: string, context?: LogContext): void {
        if (this.shouldLog('debug')) {
            console.debug(this.formatMessage('debug', message, context));
        }
    }

    info(message: string, context?: LogContext): void {
        if (this.shouldLog('info')) {
            console.info(this.formatMessage('info', message, context));
        }
    }

    warn(message: string, context?: LogContext): void {
        if (this.shouldLog('warn')) {
            console.warn(this.formatMessage('warn', message, context));
        }
    }

    error(message: string, error?: Error | unknown, context?: LogContext): void {
        if (this.shouldLog('error')) {
            const errorDetails = error instanceof Error
                ? { errorMessage: error.message, stack: error.stack }
                : { error };
            console.error(this.formatMessage('error', message, { ...context, ...errorDetails }));
        }
    }

    // للتوافق مع الكود القديم
    log(level: LogLevel, message: string, context?: LogContext): void {
        this[level](message, context);
    }

    // إنشاء logger جديد مع context محدد
    child(context: LogContext): UnifiedLoggerClass {
        const childLogger = new UnifiedLoggerClass();
        childLogger.setDefaultContext({ ...this.defaultContext, ...context });
        childLogger.setLevel(this.level);
        return childLogger;
    }
}

// مثيل موحد
export const UnifiedLogger = new UnifiedLoggerClass();

// تصدير الفئة للاستخدام المباشر
export { UnifiedLoggerClass };

// Alias for compatibility
export const logger = UnifiedLogger;

// تصدير افتراضي
export default UnifiedLogger;

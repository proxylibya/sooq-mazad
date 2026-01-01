/**
 * Advanced Logger
 */

// Log Levels for compatibility
export enum LogLevel {
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
}

export const advancedLogger = {
    debug(...args: unknown[]): void {
        if (process.env.NODE_ENV !== 'production') {
            console.debug('[DEBUG]', new Date().toISOString(), ...args);
        }
    },

    info(...args: unknown[]): void {
        console.info('[INFO]', new Date().toISOString(), ...args);
    },

    warn(...args: unknown[]): void {
        console.warn('[WARN]', new Date().toISOString(), ...args);
    },

    error(...args: unknown[]): void {
        console.error('[ERROR]', new Date().toISOString(), ...args);
    },

    auction(action: string, data: unknown): void {
        this.info(`[AUCTION] ${action}`, data);
    },

    api(method: string, path: string, status: number): void {
        this.info(`[API] ${method} ${path} - ${status}`);
    },

    performance(label: string, duration: number): void {
        this.debug(`[PERF] ${label}: ${duration}ms`);
    },
};

// Alias for compatibility
export const logger = {
    logAPI: (level: LogLevel, message: string, data?: unknown) => {
        advancedLogger[level.toLowerCase() as 'debug' | 'info' | 'warn' | 'error'](message, data);
    },
    logDatabase: (level: LogLevel, message: string, data?: unknown) => {
        advancedLogger[level.toLowerCase() as 'debug' | 'info' | 'warn' | 'error'](`[DB] ${message}`, data);
    },
    logPerformance: (label: string, duration: number, data?: unknown) => {
        advancedLogger.performance(label, duration);
    },
    ...advancedLogger,
};

export default advancedLogger;

/**
 * Client-side Logger
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDev = process.env.NODE_ENV === 'development';

export const clientLogger = {
    debug(...args: unknown[]): void {
        if (isDev) console.debug('[DEBUG]', ...args);
    },

    info(...args: unknown[]): void {
        console.info('[INFO]', ...args);
    },

    warn(...args: unknown[]): void {
        console.warn('[WARN]', ...args);
    },

    error(...args: unknown[]): void {
        console.error('[ERROR]', ...args);
    },

    log(level: LogLevel, ...args: unknown[]): void {
        this[level](...args);
    },
};

// Alias for compatibility
export const log = clientLogger;

export default clientLogger;

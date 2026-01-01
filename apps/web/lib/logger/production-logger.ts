/**
 * Production Logger
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isProduction = process.env.NODE_ENV === 'production';

export const productionLogger = {
    debug(...args: unknown[]): void {
        if (!isProduction) console.debug('[DEBUG]', ...args);
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

export default productionLogger;

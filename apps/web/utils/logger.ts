/**
 * Logger Utility
 */

export const logger = {
    debug(...args: unknown[]): void {
        if (process.env.NODE_ENV !== 'production') {
            console.debug('[DEBUG]', ...args);
        }
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

    log(level: string, ...args: unknown[]): void {
        switch (level) {
            case 'debug': this.debug(...args); break;
            case 'info': this.info(...args); break;
            case 'warn': this.warn(...args); break;
            case 'error': this.error(...args); break;
            default: this.info(...args);
        }
    },
};

export default logger;

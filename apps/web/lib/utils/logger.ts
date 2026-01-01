/**
 * نظام السجلات الموحد
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: Date;
    context?: Record<string, unknown>;
}

class Logger {
    private isDev = process.env.NODE_ENV === 'development';
    private logs: LogEntry[] = [];
    private maxLogs = 1000;

    private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
        const entry: LogEntry = {
            level,
            message,
            timestamp: new Date(),
            context,
        };

        // تخزين السجلات
        this.logs.push(entry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        // طباعة في وضع التطوير
        if (this.isDev || level === 'error' || level === 'warn') {
            const prefix = `[${level.toUpperCase()}]`;
            const contextStr = context ? JSON.stringify(context) : '';

            switch (level) {
                case 'debug':
                    console.debug(prefix, message, contextStr);
                    break;
                case 'info':
                    console.info(prefix, message, contextStr);
                    break;
                case 'warn':
                    console.warn(prefix, message, contextStr);
                    break;
                case 'error':
                    console.error(prefix, message, contextStr);
                    break;
            }
        }
    }

    debug(message: string, context?: Record<string, unknown>): void {
        this.log('debug', message, context);
    }

    info(message: string, context?: Record<string, unknown>): void {
        this.log('info', message, context);
    }

    warn(message: string, context?: Record<string, unknown>): void {
        this.log('warn', message, context);
    }

    error(message: string, context?: Record<string, unknown>): void {
        this.log('error', message, context);
    }

    getLogs(): LogEntry[] {
        return [...this.logs];
    }

    clearLogs(): void {
        this.logs = [];
    }
}

const logger = new Logger();

export default logger;
export { Logger, logger, type LogEntry, type LogLevel };


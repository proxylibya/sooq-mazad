/**
 * محسن وحدة التحكم - يقلل من السجلات في الإنتاج
 */

type LogLevel = 'log' | 'warn' | 'error' | 'info' | 'debug';

export interface ConsoleOptimizerConfig {
    enabled?: boolean;
    maxLogsPerMinute?: number;
    maxWarnsPerMinute?: number;
    maxErrorsPerMinute?: number;
    silentPatterns?: string[];
    debugMode?: boolean;
    allowedLevels?: LogLevel[];
    maxLogs?: number;
    throttleMs?: number;
}

const defaultConfig: ConsoleOptimizerConfig = {
    enabled: true,
    maxLogsPerMinute: 100,
    maxWarnsPerMinute: 50,
    maxErrorsPerMinute: 20,
    silentPatterns: [],
    debugMode: false,
    allowedLevels: ['log', 'warn', 'error', 'info', 'debug'],
    maxLogs: 1000,
    throttleMs: 100,
};

// Global state
let globalConfig = { ...defaultConfig };
let logCounts = { log: 0, warn: 0, error: 0, info: 0, debug: 0 };
let lastResetTime = Date.now();
const originalConsole: Partial<Console> = {};

/**
 * فئة محسن الكونسول
 */
export class ConsoleOptimizer {
    private config: ConsoleOptimizerConfig;
    private silentPatterns: Set<string>;
    private stats = { processed: 0, blocked: 0, ignored: 0 };

    constructor(config: ConsoleOptimizerConfig = {}) {
        this.config = { ...defaultConfig, ...config };
        this.silentPatterns = new Set(this.config.silentPatterns || []);
    }

    apply(): void {
        (['log', 'warn', 'error', 'info', 'debug'] as LogLevel[]).forEach((level) => {
            if (!originalConsole[level]) {
                originalConsole[level] = console[level];
            }

            console[level] = (...args: unknown[]) => {
                this.handleLog(level, args);
            };
        });
    }

    private handleLog(level: LogLevel, args: unknown[]): void {
        // Reset counts every minute
        const now = Date.now();
        if (now - lastResetTime > 60000) {
            logCounts = { log: 0, warn: 0, error: 0, info: 0, debug: 0 };
            lastResetTime = now;
        }

        // Check silent patterns
        const message = args.map(a => String(a)).join(' ');
        for (const pattern of this.silentPatterns) {
            if (message.includes(pattern)) {
                this.stats.ignored++;
                return;
            }
        }

        // Check rate limits
        const maxPerMinute = level === 'log' ? this.config.maxLogsPerMinute :
            level === 'warn' ? this.config.maxWarnsPerMinute :
                level === 'error' ? this.config.maxErrorsPerMinute : 100;

        if (logCounts[level] >= (maxPerMinute || 100)) {
            this.stats.blocked++;
            return;
        }

        logCounts[level]++;
        this.stats.processed++;
        originalConsole[level]?.apply(console, args);
    }

    addSilentPattern(pattern: string): void {
        this.silentPatterns.add(pattern);
    }

    removeSilentPattern(pattern: string): void {
        this.silentPatterns.delete(pattern);
    }

    getStats() {
        return { ...this.stats, logCounts: { ...logCounts } };
    }

    restore(): void {
        restoreConsole();
    }
}

/**
 * تهيئة محسن وحدة التحكم
 */
export function initConsoleOptimizer(customConfig: Partial<ConsoleOptimizerConfig> = {}): void {
    globalConfig = { ...defaultConfig, ...customConfig };
    if (!globalConfig.enabled) return;

    const optimizer = new ConsoleOptimizer(globalConfig);
    optimizer.apply();
}

/**
 * تطبيق التحسينات (alias)
 */
export function optimizeConsole(config: ConsoleOptimizerConfig = {}): void {
    const optimizer = new ConsoleOptimizer(config);
    optimizer.apply();
}

/**
 * استعادة وحدة التحكم الأصلية
 */
export function restoreConsole(): void {
    (['log', 'warn', 'error', 'info', 'debug'] as LogLevel[]).forEach((level) => {
        if (originalConsole[level]) {
            console[level] = originalConsole[level] as typeof console.log;
        }
    });
}

/**
 * إعادة تعيين عداد السجلات
 */
export function resetLogCount(): void {
    logCounts = { log: 0, warn: 0, error: 0, info: 0, debug: 0 };
}

/**
 * الحصول على عدد السجلات الحالي
 */
export function getLogCount(): number {
    return Object.values(logCounts).reduce((a, b) => a + b, 0);
}

/**
 * تسجيل آمن يتجاوز المحسن
 */
export function safeLog(level: LogLevel, ...args: unknown[]): void {
    const fn = originalConsole[level] || console[level];
    fn.apply(console, args);
}

export default {
    ConsoleOptimizer,
    initConsoleOptimizer,
    optimizeConsole,
    restoreConsole,
    resetLogCount,
    getLogCount,
    safeLog,
};
